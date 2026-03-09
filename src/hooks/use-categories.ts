"use client";

import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../lib/api-client";
import { ENDPOINTS } from "../lib/endpoints";
import { toArrayPayload } from "../lib/normalizers";
import type { Category } from "../types/category";

export function useCategories() {
  return useQuery({
    queryKey: ["categories", "list"],
    queryFn: async () => {
      const payload = await apiRequest<unknown>(ENDPOINTS.categories.list);
      return toArrayPayload<Category>(payload);
    },
  });
}

export function useCategory(slug: string) {
  return useQuery({
    queryKey: ["categories", "details", slug],
    queryFn: () => apiRequest<Category>(ENDPOINTS.categories.bySlug(slug)),
    enabled: Boolean(slug),
  });
}
