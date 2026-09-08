import axios from "axios";
import type { Product } from "../../types/product.js";

export interface DummyProduct {
    id: number;
    title: string;
    description: string;
    price: number;
    category: string;
    stock: number;
    thumbnail: string;
}

export interface DummyProductsResponse {
    products: DummyProduct[];
    total: number;
    skip: number;
    limit: number;
}

const dummyJsonApi = axios.create({
    baseURL: "https://dummyjson.com",
    timeout: 5000,
});

export const getDummyProduct = async (
    id: number
): Promise<Product> => {
    const response = await dummyJsonApi.get<{
        id: number;
        title: string;
        description: string;
        price: number;
        category: string;
        stock: number;
        thumbnail: string;
    }>(`/products/${id}`);

    const product = response.data;

    return {
        id: `external-${product.id}`,
        externalId: product.id,
        name: product.title,
        description: product.description,
        price: product.price,
        image: product.thumbnail,
        category: product.category,
        stock: product.stock,
    };
};

export const searchDummyProducts = async (
    query: string
): Promise<DummyProductsResponse> => {
    const response = await dummyJsonApi.get<DummyProductsResponse>(
        `/products/search?q=${encodeURIComponent(query)}`
    );
    return response.data;
};

export default dummyJsonApi;