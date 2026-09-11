import prisma from "../../src/config/database.js";

export const createTestProduct = async () => {
    return prisma.product.create({
        data: {
            name: "Test Leather Belt",
            description: "A test leather belt",
            price: 20000,
            image: "https://example.com/belt.jpg",
            category: "belts",
            stock: 10,
            isActive: true
        },
    });
};