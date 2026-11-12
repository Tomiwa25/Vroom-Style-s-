import request from "supertest";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import app from "../src/app.js";
import prisma from "../src/config/database.js";
import { cleanDatabase } from "./helper/test-db.js";
import { hashOtp, verifyOtpHash } from "../src/services/auth.service.js";

// Capture dispatch instead of mocking sendOtpVerificationEmail outright, so the
// rest of the email module (subject/body builders) stays real.
const sentMail = vi.hoisted(() => ({ calls: [] as { to: string; firstName: string; code: string }[] }));

vi.mock("../src/services/email.service.js", async (importOriginal) => {
    const actual = await importOriginal<typeof import("../src/services/email.service.js")>();
    return {
        ...actual,
        sendOtpVerificationEmail: async (options: { to: string; firstName: string; code: string }) => {
            sentMail.calls.push(options);
            return true;
        },
    };
});

/**
 * The plaintext OTP only ever leaves the server inside the verification email
 * — the database stores a salted hash. Capturing the dispatch is therefore the
 * only legitimate way for a test to learn the code the user would type.
 */
const otpFor = (email: string): string => {
    const sent = sentMail.calls.filter((c) => c.to === email).at(-1);
    if (!sent) {
        throw new Error(`No OTP email was dispatched to ${email}`);
    }
    return sent.code;
};

describe("Authentication & Email Verification", () => {
    beforeEach(async () => {
        await cleanDatabase();
        sentMail.calls.length = 0;
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    it("should register a new user and generate a 6-digit OTP", async () => {
        const response = await request(app)
            .post("/api/auth/register")
            .send({
                email: "admin@example.com",
                password: "secret123",
                firstName: "Admin",
                lastName: "User",
            });

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.data.email).toBe("admin@example.com");
        expect(response.body.data.isVerified).toBe(false);

        // The emailed code is the plaintext six digits the user will type.
        const code = otpFor("admin@example.com");
        expect(code).toMatch(/^\d{6}$/);

        // At rest it must be a salted sha256 hash, never the plaintext.
        const otpRecord = await prisma.otpVerification.findFirst({
            where: { email: "admin@example.com" },
        });

        expect(otpRecord).not.toBeNull();
        expect(otpRecord!.code).not.toBe(code);
        expect(otpRecord!.code).toMatch(/^sha256\$[0-9a-f]{32}\$[0-9a-f]{64}$/);
        expect(verifyOtpHash(code, otpRecord!.code)).toBe(true);
        expect(otpRecord?.isUsed).toBe(false);
    });

    it("should salt each OTP hash so identical codes never share a digest", () => {
        const first = hashOtp("123456");
        const second = hashOtp("123456");

        expect(first).not.toBe(second);
        expect(verifyOtpHash("123456", first)).toBe(true);
        expect(verifyOtpHash("123456", second)).toBe(true);
        expect(verifyOtpHash("654321", first)).toBe(false);
        expect(verifyOtpHash("123456", "not-a-hash")).toBe(false);
    });

    it("should hash the user password before storing it", async () => {
        await request(app)
            .post("/api/auth/register")
            .send({
                email: "hash@example.com",
                password: "secret123",
                firstName: "Hash",
                lastName: "User",
            });

        const user = await prisma.user.findUnique({
            where: {
                email: "hash@example.com",
            },
            select: {
                password: true,
            },
        });

        expect(user).not.toBeNull();
        expect(user?.password).not.toBe("secret123");
        expect(user?.password).toMatch(/^\$2[aby]\$\d{2}\$[.\/A-Za-z0-9]{53}$/);
        expect(user!.password.startsWith("$2")).toBe(true);
    });

    it("should verify email with valid 6-digit OTP and activate account", async () => {
        // Register user
        await request(app)
            .post("/api/auth/register")
            .send({
                email: "verify@example.com",
                password: "secret123",
                firstName: "Verify",
                lastName: "User",
            });

        // The code lives only in the email; the row holds its hash.
        const code = otpFor("verify@example.com");
        const otpRecord = await prisma.otpVerification.findFirst({
            where: { email: "verify@example.com" },
        });
        expect(otpRecord).not.toBeNull();
        expect(verifyOtpHash(code, otpRecord!.code)).toBe(true);

        // Submit the plaintext OTP exactly as a user would
        const verifyRes = await request(app)
            .post("/api/auth/verify-otp")
            .send({
                email: "verify@example.com",
                code,
            });

        expect(verifyRes.status).toBe(200);
        expect(verifyRes.body.success).toBe(true);
        expect(verifyRes.body.data).toHaveProperty("token");
        expect(verifyRes.body.data.user.isVerified).toBe(true);

        // Verify in DB that user is marked verified
        const userInDb = await prisma.user.findUnique({
            where: { email: "verify@example.com" },
        });
        expect(userInDb?.isVerified).toBe(true);
        expect(userInDb?.verifiedAt).not.toBeNull();
    });

    it("should reject verification with incorrect OTP code", async () => {
        await request(app)
            .post("/api/auth/register")
            .send({
                email: "wrongcode@example.com",
                password: "secret123",
                firstName: "Wrong",
                lastName: "Code",
            });

        const verifyRes = await request(app)
            .post("/api/auth/verify-otp")
            .send({
                email: "wrongcode@example.com",
                code: "000000",
            });

        expect(verifyRes.status).toBe(400);
        expect(verifyRes.body.success).toBe(false);
    });

    it("should resend a new OTP and invalidate previous code", async () => {
        await request(app)
            .post("/api/auth/register")
            .send({
                email: "resend@example.com",
                password: "secret123",
                firstName: "Resend",
                lastName: "User",
            });

        const firstOtp = await prisma.otpVerification.findFirst({
            where: { email: "resend@example.com" },
        });

        // Resend OTP
        const resendRes = await request(app)
            .post("/api/auth/resend-otp")
            .send({
                email: "resend@example.com",
            });

        expect(resendRes.status).toBe(200);
        expect(resendRes.body.success).toBe(true);

        // Previous OTP should now be marked used/invalidated
        const updatedFirstOtp = await prisma.otpVerification.findUnique({
            where: { id: firstOtp!.id },
        });
        expect(updatedFirstOtp?.isUsed).toBe(true);

        // New OTP should exist and be active, and still stored hashed
        const latestOtp = await prisma.otpVerification.findFirst({
            where: { email: "resend@example.com", isUsed: false },
        });
        expect(latestOtp).not.toBeNull();
        expect(latestOtp?.id).not.toBe(firstOtp?.id);
        expect(latestOtp!.code).toMatch(/^sha256\$/);

        // The freshly emailed code verifies; the old one no longer does.
        const code = otpFor("resend@example.com");
        expect(verifyOtpHash(code, latestOtp!.code)).toBe(true);

        const verifyRes = await request(app)
            .post("/api/auth/verify-otp")
            .send({ email: "resend@example.com", code });
        expect(verifyRes.status).toBe(200);
    });

    it("should login an existing user and return a token", async () => {
        await request(app)
            .post("/api/auth/register")
            .send({
                email: "login@example.com",
                password: "secret123",
                firstName: "Login",
                lastName: "User",
            });

        const response = await request(app)
            .post("/api/auth/login")
            .send({
                email: "login@example.com",
                password: "secret123",
            });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty("token");
        expect(response.body.data.user).toHaveProperty("email", "login@example.com");
        expect(typeof response.body.data.token).toBe("string");
    });

    it("should return the current authenticated user from the token", async () => {
        await request(app)
            .post("/api/auth/register")
            .send({
                email: "current@example.com",
                password: "secret123",
                firstName: "Current",
                lastName: "User",
            });

        const login = await request(app)
            .post("/api/auth/login")
            .send({
                email: "current@example.com",
                password: "secret123",
            });

        const token = login.body.data.token;

        const response = await request(app)
            .get("/api/auth/currentUser")
            .set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.email).toBe("current@example.com");
        expect(response.body.data.role).toBe("CUSTOMER");
    });

    it("should reject invalid login data", async () => {
        const response = await request(app)
            .post("/api/auth/login")
            .send({
                email: "admin@example.com",
                password: "",
            });

        expect(response.status).toBe(401);
    });
});