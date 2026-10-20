import { useQuery } from "@tanstack/react-query";
import api from "../services/api";

export interface OrderMilestone {
  key: "PLACED" | "PACKAGED" | "ON_DELIVERY" | "BEING_DELIVERED" | "DELIVERED";
  title: string;
  description: string;
  completed: boolean;
  current: boolean;
  timestamp?: string;
}

export interface OrderItemSummary {
  id: string;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
}

export interface OrderTrackingDetails {
  id: string;
  status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  total: number;
  createdAt: string;
  updatedAt: string;
  milestones: OrderMilestone[];
  isCancelled: boolean;
  items: OrderItemSummary[];
  customerName: string;
  carrier: string;
  estimatedDelivery: string;
}

export interface CustomerOrderSummary {
  id: string;
  total: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
  items: {
    id: string;
    quantity: number;
    price: number;
    product: {
      id: string;
      name: string;
      image: string;
    };
  }[];
}

/**
 * Hook to retrieve all orders placed by the currently authenticated customer.
 */
export function useCustomerOrders(enabled: boolean = true) {
  const { data, isLoading, isError, error, refetch } = useQuery<CustomerOrderSummary[]>({
    queryKey: ["customer", "orders"],
    queryFn: async () => {
      const res = await api.get("/orders");
      return res.data?.data || [];
    },
    enabled,
    staleTime: 60 * 1000,
  });

  return {
    orders: data || [],
    isLoading,
    isError,
    error,
    refetch,
  };
}

/**
 * Hook to track a specific customer order with real-time fulfillment milestones.
 */
export function useOrderTracking(orderId: string | null) {
  const { data, isLoading, isError, error, refetch } = useQuery<OrderTrackingDetails, Error>({
    queryKey: ["order", "tracking", orderId],
    queryFn: async () => {
      if (!orderId) throw new Error("Order ID is required");
      const res = await api.get(`/orders/${orderId}/track`);
      return res.data?.data;
    },
    enabled: Boolean(orderId && orderId.trim().length > 0),
    staleTime: 30 * 1000, // 30 seconds
    retry: 1,
  });

  return {
    tracking: data || null,
    isLoading,
    isError,
    errorMessage: error?.message || null,
    refetch,
  };
}
