export interface Product {
  id: string;
  externalId?: number;
  name: string;
  description: string;
  price: number;
  image: string;
  images?: string[];
  category: string;
  stock: number;
  colors?: { name: string; hex: string }[];
  sizes?: string[];
  tag?: string;
  fitGuide?: "Runs Small" | "True to Size" | "Runs Large";
  material?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "CUSTOMER" | "ADMIN";
}
