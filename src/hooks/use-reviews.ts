"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../lib/api-client";
import { getAccessToken } from "../lib/auth";
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

export function useCreateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      rating,
      comment,
    }: {
      productId: number;
      rating: number;
      comment?: string;
    }) =>
      apiRequest<Review>(ENDPOINTS.products.reviews(productId), {
        method: "POST",
        auth: true,
        body: { rating, comment },
      }),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({
        queryKey: ["reviews", "product", vars.productId],
      });
    },
  });
}

export function useUpdateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      reviewId,
      productId,
      rating,
      comment,
    }: {
      reviewId: number;
      productId: number;
      rating?: number;
      comment?: string;
    }) =>
      apiRequest<Review>(ENDPOINTS.reviews.byId(reviewId), {
        method: "PUT",
        auth: true,
        body: { rating, comment },
      }),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({
        queryKey: ["reviews", "product", vars.productId],
      });
    },
  });
}

export function useDeleteReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reviewId }: { reviewId: number; productId: number }) =>
      apiRequest<{ message: string }>(ENDPOINTS.reviews.byId(reviewId), {
        method: "DELETE",
        auth: true,
      }),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({
        queryKey: ["reviews", "product", vars.productId],
      });
    },
  });
}

export function useCanManageReviews() {
  return Boolean(getAccessToken());
}
