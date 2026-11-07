export interface Product {
    id: string;
    externalId: number;
    name: string;
    description: string;
    price: number;
    image: string;
    images?: string[];
    category: string;
    stock: number;
    tag?: string | null;
    sizes?: string[];
    colors?: any;
    material?: string | null;
    fitGuide?: string | null;
    sellerType?: "1P" | "3P";
    sellerName?: string;
    sellerRating?: number;
    isFulfilledByVroom?: boolean;
    warranty?: string;
    bundledIncentive?: string;
    isPodEligible?: boolean;
    podTerms?: string;
}
