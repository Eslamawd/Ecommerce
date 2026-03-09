"use client";

import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../lib/api-client";
import { ENDPOINTS } from "../lib/endpoints";
import { toPaginatedPayload } from "../lib/normalizers";
import type { Review } from "../types/review";

export function useProductReviews(productId?: number) {
  return useQuery({
    queryKey: ["reviews", "product", productId],
    queryFn: async () => {
      const payload = await apiRequest<unknown>(
        ENDPOINTS.products.reviews(productId as number),
      );
      return toPaginatedPayload<Review>(payload);
    },
    enabled: Boolean(productId),
  });
}
