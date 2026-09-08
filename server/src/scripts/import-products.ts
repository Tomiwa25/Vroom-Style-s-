import dotenv from "dotenv";
import axios from "axios";
import prisma from "../config/database.js";

dotenv.config();

interface DummyProduct {
    id: number;
    title: string;
    description: string;
    price: number;
    category: string;
    stock: number;
    thumbnail: string;
}

interface DummyProductsResponse {
    products: DummyProduct[];
    total: number;
    skip: number;
    limit: number;
}

const importProducts = async () => {
    try {
        console.log("Fetching products from DummyJson...")

        const response = await axios.get<DummyProductsResponse>(
            "https://dummyjson.com/products?limit=100"
        );
        const products = response.data.products;
        console.log(`Found ${products.length} produts.`);

        for (const product of products) {
            await prisma.product.upsert({
                where: {
                    externalId: product.id,
                },
                update: {
                    name: product.title,
                    description: product.description,
                    price: product.price,
                    image: product.thumbnail,
                    category: product.category,
                    stock: product.stock,
                },
                create: {
                    externalId: product.id,
                    name: product.title,
                    description: product.description,
                    price: product.price,
                    image: product.thumbnail,
                    category: product.category,
                    stock: product.stock,
                },
            });
        }
        console.log("Products imported successfully")
    } catch (error) {
        console.error("Product import failed:", error)
    } finally {
        await prisma.$disconnect();
    }   
};

importProducts();