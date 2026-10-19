import prisma from "../config/database.js";

export const findUserByEmail = async (email: string) => {
    return prisma.user.findUnique({
        where: {
            email,
        },
    });
};

export const findUserById = async (id: string) => {
    return prisma.user.findUnique({
        where: {
            id,
        },
    });
};

export const createUser = async (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    isVerified?: boolean;
}) => {
    return prisma.user.create({
        data,
    });
};

export const markUserVerified = async (id: string) => {
    return prisma.user.update({
        where: { id },
        data: {
            isVerified: true,
            verifiedAt: new Date(),
        },
    });
};