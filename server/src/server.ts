import "dotenv/config";
import app from "./app.js";
import prisma from "./config/database.js";
import {
    startBackgroundJobs,
    stopBackgroundJobs,
} from "./lib/jobs.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await prisma.$connect();
        console.log("Vroom Style(s) DB connected successfully");

        const jobs = startBackgroundJobs();

        const server = app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });

        const shutdown = async (signal: string) => {
            console.log(`${signal} received, shutting down gracefully...`);
            stopBackgroundJobs(jobs);
            server.close(async () => {
                await prisma.$disconnect();
                process.exit(0);
            });
        };

        process.on("SIGTERM", () => void shutdown("SIGTERM"));
        process.on("SIGINT", () => void shutdown("SIGINT"));
    } catch (error) {
        console.error("Vroom Style(s) DB connection failed:", error);
        process.exit(1);
    }
};

startServer();
