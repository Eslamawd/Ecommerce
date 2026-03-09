"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../lib/api-client";
import { getAccessToken } from "../lib/auth";
import { ENDPOINTS } from "../lib/endpoints";
import { toArrayPayload } from "../lib/normalizers";
import type { Cart } from "../types/cart";
import type { Product } from "../types/product";

type AddOrUpdateCartInput = {
  product_id: number;
  quantity: number;
};

export function useCart() {
  return useQuery({
    queryKey: ["cart", "details"],
    queryFn: () => apiRequest<Cart>(ENDPOINTS.cart.details, { auth: true }),
    enabled: Boolean(getAccessToken()),
  });
}

export function useAddCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: AddOrUpdateCartInput) =>
      apiRequest<Cart>(ENDPOINTS.cart.addItem, {
        method: "POST",
        body,
        auth: true,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
}

export function useUpdateCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ product_id, quantity }: AddOrUpdateCartInput) =>
      apiRequest<Cart>(ENDPOINTS.cart.item(product_id), {
        method: "PUT",
        body: { quantity },
        auth: true,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
}

export function useRemoveCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: number) =>
      apiRequest<Cart>(ENDPOINTS.cart.item(productId), {
        method: "DELETE",
        auth: true,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
}

export function useClearCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      apiRequest<Cart>(ENDPOINTS.cart.clear, {
        method: "DELETE",
        auth: true,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
}

export function useWishlist() {
  return useQuery({
    queryKey: ["wishlist", "list"],
    queryFn: async () => {
      const payload = await apiRequest<unknown>(ENDPOINTS.wishlist.list, {
        auth: true,
      });
      return toArrayPayload<Product>(payload);
    },
    enabled: Boolean(getAccessToken()),
  });
}

export function useToggleWishlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: number) =>
      apiRequest<{ in_wishlist: boolean; message?: string }>(
        ENDPOINTS.wishlist.toggle,
        {
          method: "POST",
          body: { product_id: productId },
          auth: true,
        },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
    },
  });
}

export function useRemoveWishlistItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: number) =>
      apiRequest<{ message: string }>(ENDPOINTS.wishlist.remove(productId), {
        method: "DELETE",
        auth: true,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
    },
  });
}
