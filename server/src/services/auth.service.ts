import bcrypt from "bcrypt";
import  jwt  from "jsonwebtoken";
import { createUser, findUserByEmail, findUserById } from "../repositories/user.repositories";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error("Invalid Credentials");
}

export const registerUser = async (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
}) => {
    const existingUser = await findUserByEmail(data.email);
    if (existingUser) {
        throw new Error("Email already registered")
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await createUser({
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
    });

    return {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
    };
};

export const loginUser = async (
    email: string,
    password: string,
) => {
    const user = await findUserByEmail(email);

    if (!user) {
        throw new Error("Invalid Credentials");
    }
    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
        throw new Error("Either Username or password is incorrect");
    }
    const token = jwt.sign({
        userId: user.id,
        role: user.role,
    },
    JWT_SECRET,
    {
        expiresIn: "1d",
    }
  );
  return {
    token,
    user : {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
    },
    };
};

export const getCurrentUser = async (userId: string) => {
    const user = await findUserById(userId)

    if(!user) {
        throw new Error("User not found");
    }
    return {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
    };
};
