import type { Product } from "./product";

export type CartItem = {
  id: number;
  quantity: number;
  subtotal: number;
  product: Product;
};

export type Cart = {
  id: number;
  items: CartItem[];
  items_count: number;
  total: number;
};
