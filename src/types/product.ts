import type { Category } from "./category";

export type ProductImage = {
  id: number;
  image: string | null;
  sort_order?: number;
  is_primary?: boolean;
};

export type ProductVideo = {
  id: number;
  video: string | null;
  title?: string | null;
  sort_order?: number;
};

export type Product = {
  id: number;
  name: string;
  name_en?: string | null;
  product_type?:
    | "general"
    | "clothing"
    | "automotive"
    | "food"
    | "electronics"
    | "other"
    | string;
  slug: string;
  description: string | null;
  description_en?: string | null;
  specifications?: Record<string, unknown> | null;
  price: number;
  old_price?: number | null;
  cost_price?: number | null;
  discount_percentage?: number | null;
  sku?: string | null;
  quantity?: number;
  variants?: Array<{
    sku?: string | null;
    price: number;
    quantity: number;
    attributes?: Record<string, unknown>;
  }> | null;
  stock?: number;
  is_active: boolean;
  is_featured?: boolean;
  average_rating?: number | null;
  reviews_count?: number;
  category?: Category;
  images?: ProductImage[];
  videos?: ProductVideo[];
  primary_image?: ProductImage | null;
};
