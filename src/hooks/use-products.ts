"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { apiRequest } from "../lib/api-client";
import { ENDPOINTS } from "../lib/endpoints";
import { toArrayPayload, toPaginatedPayload } from "../lib/normalizers";
import type { Product } from "../types/product";

export type ProductFilterParams = {
  search?: string;
  product_type?: string;
  color?: string;
  size?: string;
  make?: string;
  model?: string;
  per_page?: string;
};

function buildProductsUrl(
  filters?: ProductFilterParams,
  options?: { page?: number },
) {
  if (!filters) {
    return options?.page
      ? `${ENDPOINTS.products.list}?page=${options.page}`
      : ENDPOINTS.products.list;
  }

  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    const normalized = value?.trim();
    if (!normalized) {
      return;
    }

    params.set(key, normalized);
  });

  if (options?.page) {
    params.set("page", String(options.page));
  }

  const query = params.toString();

  return query
    ? `${ENDPOINTS.products.list}?${query}`
    : ENDPOINTS.products.list;
}

export function useProducts(filters?: ProductFilterParams) {
  const url = buildProductsUrl(filters);

  return useQuery({
    queryKey: ["products", "list", filters ?? {}],
    queryFn: async () => {
      const response = await apiRequest<unknown>(url);
      return toArrayPayload<Product>(response);
    },
  });
}

export function useInfiniteProducts(filters?: ProductFilterParams) {
  return useInfiniteQuery({
    queryKey: ["products", "infinite", filters ?? {}],
    queryFn: async ({ pageParam }) => {
      const url = buildProductsUrl(filters, { page: pageParam });
      const response = await apiRequest<unknown>(url);
      return toPaginatedPayload<Product>(response);
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const currentPage = lastPage.meta?.current_page;
      const lastPageNumber = lastPage.meta?.last_page;

      if (!currentPage || !lastPageNumber || currentPage >= lastPageNumber) {
        return undefined;
      }

      return currentPage + 1;
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
