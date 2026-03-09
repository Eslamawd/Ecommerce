import type { Product } from "./product";

export type Category = {
  id: number;
  name: string;
  name_en?: string | null;
  slug: string;
  description?: string | null;
  description_en?: string | null;
  image?: string | null;
  video?: string | null;
  parent_id?: number | null;
  is_active?: boolean;
  sort_order?: number;
  children?: Category[];
  products_count?: number;
  products?: Product[];
};
