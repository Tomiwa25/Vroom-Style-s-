import { useQuery } from "@tanstack/react-query";
import api from "../services/api";
import type { Product } from "../types";

export interface UseProductsOptions {
  limit?: number;
  category?: string;
  search?: string;
  skip?: number;
}

export interface UseProductsResult {
  products: Product[];
  total: number;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

interface ProductListResponse {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
}

/**
 * Reusable TanStack Query hook to fetch catalog products from the backend.
 *
 * Note: we do NOT fabricate missing fields. In the previous version this hook
 * filled gaps from `initialProducts`, which meant real products displayed
 * invented ratings, prices, and promos. We show what the server returned,
 * or an honest error state.
 */
export function useProducts(options: UseProductsOptions = {}): UseProductsResult {
  const { limit = 60, category, search, skip = 0 } = options;

  const { data, isLoading, isFetching, isError, error, refetch } = useQuery<
    ProductListResponse,
    Error
  >({
    queryKey: ["products", { limit, category, search, skip }],
    queryFn: async () => {
      const params: Record<string, string | number> = { limit, skip };

      if (category && category !== "All") params.category = category;
      if (search && search.trim()) params.q = search.trim();

      const res = await api.get("/products", { params });

      const payload = res.data?.data;
      return {
        products: Array.isArray(payload?.products) ? payload.products : [],
        total: typeof payload?.total === "number" ? payload.total : 0,
        skip: typeof payload?.skip === "number" ? payload.skip : skip,
        limit: typeof payload?.limit === "number" ? payload.limit : limit,
      };
    },
    staleTime: 5 * 60 * 1000,
  });

  const products = data?.products ?? [];
  const total = data?.total ?? 0;

  return {
    products,
    total,
    isLoading,
    isFetching,
    isError,
    error: error ?? null,
    refetch,
  };
}
