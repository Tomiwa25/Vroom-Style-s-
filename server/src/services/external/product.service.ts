import dummyJsonApi from "./dummyjson.service";
import { Product } from "../../types/product.js";

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

export const getProducts = async (
    limit = 12,
    skip = 0
): Promise<{
    products: Product[];
    total: number;
    skip: number;
    limit: number;
}> => {
    const response = await dummyJsonApi.get<DummyProductsResponse>(
        `/products?limit=${limit}&skip=${skip}`
    );

    const products: Product[] = response.data.products.map((product) => ({
        id: `external-${product.id}`,
        externalId: product.id,
        name: product.title,
        description: product.description,
        price: product.price,
        image: product.thumbnail,
        category: product.category,
        stock: product.stock
    }));

    return {
        products,
        total: response.data.total,
        skip: response.data.skip,
        limit: response.data.limit
    };
};