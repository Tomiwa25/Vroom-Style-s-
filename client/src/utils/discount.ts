/**
 * Utility functions for on-the-fly dynamic discount computation and badge formatting.
 */
export interface DiscountDetails {
  hasDiscount: boolean;
  percentage: number;
  savings: number;
  formattedBadge: string;
}

export function calculateDiscount(price: number, originalPrice?: number): DiscountDetails {
  if (!originalPrice || originalPrice <= price) {
    return {
      hasDiscount: false,
      percentage: 0,
      savings: 0,
      formattedBadge: "",
    };
  }

  const percentage = Math.round(((originalPrice - price) / originalPrice) * 100);
  const savings = originalPrice - price;

  return {
    hasDiscount: percentage > 0,
    percentage,
    savings,
    formattedBadge: `-${percentage}%`,
  };
}

