import { useQuery } from "@tanstack/react-query";
import api from "../services/api";
import { initialProducts } from "../data/products";
import type { Product } from "../types";

export interface UseProductsOptions {
  limit?: number;
  category?: string;
  search?: string;
}

export interface UseProductsResult {
  products: Product[];
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
  isLive: boolean; // Indicates if data came from backend or fallback
}

/**
 * Reusable TanStack Query hook to fetch catalog products from the backend.
 * Provides caching, background revalidation, and graceful fallback to the curated collection.
 */
export function useProducts(options: UseProductsOptions = {}): UseProductsResult {
  const { limit = 12, category, search } = options;

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useQuery<Product[], Error>({
    queryKey: ["products", { limit, category, search }],
    queryFn: async () => {
      const params: Record<string, string | number> = { limit };
      if (category && category !== "All") params.category = category;
      if (search && search.trim()) params.search = search.trim();

      const res = await api.get("/products", { params });
      const rawProducts: Record<string, unknown>[] = res.data?.data?.products || [];

      if (!rawProducts || rawProducts.length === 0) {
        return initialProducts;
      }

      // Map backend products to typed Product schema with fallbacks
      return rawProducts.map((p, idx) => {
        const fallback = initialProducts[idx % initialProducts.length];
        const pImage = typeof p.image === "string" && p.image ? p.image : fallback.image;
        const pImages = Array.isArray(p.images) && p.images.length > 0
          ? (p.images as string[])
          : [pImage];

        return {
          id: (p.id as string) || `live-${idx}`,
          externalId: typeof p.externalId === "number" ? p.externalId : fallback.externalId,
          name: (p.name as string) || fallback.name,
          description: (p.description as string) || fallback.description,
          price: Number(p.price) || fallback.price,
          image: pImage,
          images: pImages,
          category: (p.category as string) || fallback.category,
          stock: typeof p.stock === "number" ? p.stock : fallback.stock,
          tag: (p.tag as string) || fallback.tag,
          colors: (p.colors as { name: string; hex: string }[]) || fallback.colors,
          sizes: (p.sizes as string[]) || fallback.sizes,
          fitGuide: (p.fitGuide as "Runs Small" | "True to Size" | "Runs Large") || fallback.fitGuide,
          material: (p.material as string) || fallback.material,
        };
      });
    },
    staleTime: 5 * 60 * 1000, // Fresh for 5 minutes
  });

  const products = data && data.length > 0 ? data : initialProducts;
  const isLive = !isError && !!data && data !== initialProducts;

  return {
    products,
    isLoading,
    isFetching,
    isError,
    error: error ?? null,
    refetch,
    isLive,
  };
}
