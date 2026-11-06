import { useState, useCallback } from "react";
import type { Product } from "../types";

const RECENTLY_VIEWED_KEY = "vroom_recently_viewed";
const MAX_RECENT_ITEMS = 10;

const getInitialRecentlyViewed = (): Product[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RECENTLY_VIEWED_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

/**
 * Custom hook for client-side tracking of recently viewed products.
 * Persists browsing history to localStorage for curated recommendation rails.
 */
export function useRecentlyViewed() {
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>(getInitialRecentlyViewed);

  const recordView = useCallback((product: Product) => {
    setRecentlyViewed((prev) => {
      // Filter out existing occurrence
      const filtered = prev.filter((p) => p.id !== product.id);
      // Prepend to top
      const updated = [product, ...filtered].slice(0, MAX_RECENT_ITEMS);

      try {
        localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(updated));
      } catch (err) {
        console.warn("Could not save recently viewed item to localStorage", err);
      }

      return updated;
    });
  }, []);

  const clearHistory = useCallback(() => {
    try {
      localStorage.removeItem(RECENTLY_VIEWED_KEY);
    } catch (err) {
      console.warn("Could not clear recently viewed history", err);
    }
    setRecentlyViewed([]);
  }, []);

  return {
    recentlyViewed,
    recordView,
    clearHistory,
  };
}
