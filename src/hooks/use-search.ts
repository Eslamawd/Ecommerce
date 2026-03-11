"use client";

import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../lib/api-client";
import { ENDPOINTS } from "../lib/endpoints";
import type { Category } from "../types/category";
import type { Product } from "../types/product";

export type SearchSuggestionsResponse = {
  query: string;
  items: SearchSuggestionItem[];
  total: number;
};

export type SearchSuggestionItem = {
  type: "category" | "product";
  id: number;
  slug: string;
  label: string;
  label_en?: string | null;
  sku?: string | null;
};

export type GlobalSearchResponse = {
  query: string;
  categories: Category[];
  products: Product[];
  total: {
    categories: number;
    products: number;
  };
};

function buildSearchUrl(path: string, query: string, limit: number): string {
  const params = new URLSearchParams({
    q: query,
    limit: String(limit),
  });

  return `${path}?${params.toString()}`;
}

export function useSearchSuggestions(query: string, limit = 8) {
  const trimmed = query.trim();

  return useQuery({
    queryKey: ["search", "suggestions", trimmed, limit],
    queryFn: () =>
      apiRequest<SearchSuggestionsResponse>(
        buildSearchUrl(ENDPOINTS.search.suggestions, trimmed, limit),
      ),
    enabled: trimmed.length > 0,
    staleTime: 20_000,
  });
}

export function useGlobalSearch(query: string, limit = 8) {
  const trimmed = query.trim();

  return useQuery({
    queryKey: ["search", "global", trimmed, limit],
    queryFn: () =>
      apiRequest<GlobalSearchResponse>(
        buildSearchUrl(ENDPOINTS.search.global, trimmed, limit),
      ),
    enabled: trimmed.length > 0,
    staleTime: 20_000,
  });
}
