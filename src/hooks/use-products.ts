"use client";

import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../lib/api-client";
import { ENDPOINTS } from "../lib/endpoints";
import { toArrayPayload } from "../lib/normalizers";
import type { Product } from "../types/product";

export function useProducts() {
  return useQuery({
    queryKey: ["products", "list"],
    queryFn: async () => {
      const response = await apiRequest<unknown>(ENDPOINTS.products.list);
      return toArrayPayload<Product>(response);
    },
  });
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: ["products", "details", slug],
    queryFn: () => apiRequest<Product>(ENDPOINTS.products.bySlug(slug)),
    enabled: Boolean(slug),
  });
}
