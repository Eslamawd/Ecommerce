"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../lib/api-client";
import { getAccessToken } from "../lib/auth";
import { ENDPOINTS } from "../lib/endpoints";
import { toPaginatedPayload } from "../lib/normalizers";
import type { Order, OrderStatus, PaymentStatus } from "../types/order";
import type { Product } from "../types/product";
import type { User } from "../types/user";
import type { Category } from "../types/category";

type AdminOverviewResponse = {
  stats: Record<string, number>;
};

type AdminUserRole = "admin" | "vendor" | "customer";

type AdminCategoryPayload = {
  name: string;
  name_en: string;
  description?: string;
  description_en?: string;
  parent_id?: number | null;
  is_active?: boolean;
  sort_order?: number;
  image?: File;
  video?: File;
};

type AdminProductPayload = {
  name: string;
  name_en: string;
  description: string;
  description_en: string;
  price: number;
  old_price?: number | null;
  cost_price?: number | null;
  sku?: string | null;
  quantity: number;
  category_id: number;
  is_active?: boolean;
  is_featured?: boolean;
  images?: File[];
  videos?: File[];
};

export function useAdminOverview(enabled = true) {
  return useQuery({
    queryKey: ["admin", "overview"],
    queryFn: () =>
      apiRequest<AdminOverviewResponse>(ENDPOINTS.admin.dashboardOverview, {
        auth: true,
      }),
    enabled: enabled && Boolean(getAccessToken()),
  });
}

export function useAdminUsers(page = 1) {
  return useAdminUsersPage(page);
}

function withPage(url: string, page: number) {
  const query = new URLSearchParams({ page: String(page) });
  return `${url}?${query.toString()}`;
}

export function useAdminUsersPage(page = 1) {
  return useQuery({
    queryKey: ["admin", "users", page],
    queryFn: async () => {
      const payload = await apiRequest<unknown>(
        withPage(ENDPOINTS.admin.users, page),
        { auth: true },
      );
      return toPaginatedPayload<User>(payload);
    },
    enabled: Boolean(getAccessToken()),
  });
}

export function useAdminProducts(page = 1) {
  return useAdminProductsPage(page);
}

export function useAdminProductsPage(page = 1) {
  return useQuery({
    queryKey: ["admin", "products", page],
    queryFn: async () => {
      const payload = await apiRequest<unknown>(
        withPage(ENDPOINTS.admin.products, page),
        { auth: true },
      );
      return toPaginatedPayload<Product>(payload);
    },
    enabled: Boolean(getAccessToken()),
  });
}

export function useAdminProduct(productId: number | null) {
  return useQuery({
    queryKey: ["admin", "products", "details", productId],
    queryFn: () =>
      apiRequest<Product>(ENDPOINTS.admin.productById(productId as number), {
        auth: true,
      }),
    enabled: Boolean(getAccessToken()) && Boolean(productId),
  });
}

export function useAdminOrders(page = 1) {
  return useAdminOrdersPage(page);
}

export function useAdminOrdersPage(page = 1) {
  return useQuery({
    queryKey: ["admin", "orders", page],
    queryFn: async () => {
      const payload = await apiRequest<unknown>(
        withPage(ENDPOINTS.admin.orders, page),
        { auth: true },
      );
      return toPaginatedPayload<Order>(payload);
    },
    enabled: Boolean(getAccessToken()),
  });
}

export function useToggleUserActive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: number) =>
      apiRequest<{ message: string; is_active: boolean }>(
        ENDPOINTS.admin.userToggleActive(userId),
        {
          method: "PATCH",
          auth: true,
        },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}

export function useChangeUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, role }: { userId: number; role: AdminUserRole }) =>
      apiRequest<{ message: string; roles: string[] }>(
        ENDPOINTS.admin.userRole(userId),
        {
          method: "PATCH",
          auth: true,
          body: { role },
        },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}

export function useToggleProductActive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: number) =>
      apiRequest<{ message: string; is_active: boolean }>(
        ENDPOINTS.admin.productToggleActive(productId),
        {
          method: "PATCH",
          auth: true,
        },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
    },
  });
}

export function useToggleProductFeatured() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: number) =>
      apiRequest<{ message: string; is_featured: boolean }>(
        ENDPOINTS.admin.productToggleFeatured(productId),
        {
          method: "PATCH",
          auth: true,
        },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: number) =>
      apiRequest<{ message: string }>(
        ENDPOINTS.admin.productDelete(productId),
        {
          method: "DELETE",
          auth: true,
        },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
    },
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      orderNumber,
      status,
      payment_status,
    }: {
      orderNumber: string;
      status: OrderStatus;
      payment_status?: PaymentStatus;
    }) =>
      apiRequest<Order>(ENDPOINTS.admin.orderStatus(orderNumber), {
        method: "PATCH",
        auth: true,
        body: { status, payment_status },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
    },
  });
}

export function useAdminCategories() {
  return useQuery({
    queryKey: ["admin", "categories"],
    queryFn: async () => {
      const payload = await apiRequest<unknown>(ENDPOINTS.admin.categories, {
        auth: true,
      });
      return (
        Array.isArray(payload)
          ? payload
          : (payload as { data?: Category[] })?.data
      ) as Category[];
    },
    enabled: Boolean(getAccessToken()),
  });
}

export function useCreateAdminCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: AdminCategoryPayload) =>
      apiRequest<Category>(ENDPOINTS.admin.categories, {
        method: "POST",
        auth: true,
        body: toCategoryFormData(body),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

export function useUpdateAdminCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      categoryId,
      body,
    }: {
      categoryId: number;
      body: AdminCategoryPayload;
    }) =>
      apiRequest<Category>(ENDPOINTS.admin.categoryById(categoryId), {
        method: "PUT",
        auth: true,
        body: toCategoryFormData(body),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

export function useDeleteAdminCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (categoryId: number) =>
      apiRequest<{ message: string }>(
        ENDPOINTS.admin.categoryById(categoryId),
        {
          method: "DELETE",
          auth: true,
        },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

function toCategoryFormData(body: AdminCategoryPayload) {
  const formData = new FormData();

  formData.append("name", body.name);
  formData.append("name_en", body.name_en);

  if (body.description !== undefined) {
    formData.append("description", body.description);
  }

  if (body.description_en !== undefined) {
    formData.append("description_en", body.description_en);
  }

  if (body.parent_id !== undefined) {
    formData.append(
      "parent_id",
      body.parent_id === null ? "" : String(body.parent_id),
    );
  }

  if (body.sort_order !== undefined) {
    formData.append("sort_order", String(body.sort_order));
  }

  if (body.is_active !== undefined) {
    formData.append("is_active", body.is_active ? "1" : "0");
  }

  if (body.image) {
    formData.append("image", body.image);
  }

  if (body.video) {
    formData.append("video", body.video);
  }

  return formData;
}

function toProductFormData(body: AdminProductPayload) {
  const formData = new FormData();

  formData.append("name", body.name);
  formData.append("name_en", body.name_en);
  formData.append("description", body.description);
  formData.append("description_en", body.description_en);
  formData.append("price", String(body.price));
  formData.append("quantity", String(body.quantity));
  formData.append("category_id", String(body.category_id));

  if (body.old_price !== undefined && body.old_price !== null) {
    formData.append("old_price", String(body.old_price));
  }

  if (body.cost_price !== undefined && body.cost_price !== null) {
    formData.append("cost_price", String(body.cost_price));
  }

  if (body.sku) {
    formData.append("sku", body.sku);
  }

  if (body.is_active !== undefined) {
    formData.append("is_active", body.is_active ? "1" : "0");
  }

  if (body.is_featured !== undefined) {
    formData.append("is_featured", body.is_featured ? "1" : "0");
  }

  if (body.images?.length) {
    body.images.forEach((file) => {
      formData.append("images[]", file);
    });
  }

  if (body.videos?.length) {
    body.videos.forEach((file) => {
      formData.append("videos[]", file);
    });
  }

  return formData;
}

export function useCreateAdminProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: AdminProductPayload) =>
      apiRequest<Product>(ENDPOINTS.vendor.productCreate, {
        method: "POST",
        auth: true,
        body: toProductFormData(body),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
    },
  });
}

export function useUpdateAdminProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      body,
    }: {
      productId: number;
      body: AdminProductPayload;
    }) =>
      apiRequest<Product>(ENDPOINTS.vendor.productUpdate(productId), {
        method: "PUT",
        auth: true,
        body: toProductFormData(body),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
    },
  });
}

export function useDeleteAdminProductImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      imageId,
    }: {
      productId: number;
      imageId: number;
    }) =>
      apiRequest<{ message: string }>(
        ENDPOINTS.vendor.productDeleteImage(productId, imageId),
        {
          method: "DELETE",
          auth: true,
        },
      ),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      queryClient.invalidateQueries({
        queryKey: ["admin", "products", "details", variables.productId],
      });
    },
  });
}

export function useDeleteAdminProductVideo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      videoId,
    }: {
      productId: number;
      videoId: number;
    }) =>
      apiRequest<{ message: string }>(
        ENDPOINTS.vendor.productDeleteVideo(productId, videoId),
        {
          method: "DELETE",
          auth: true,
        },
      ),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      queryClient.invalidateQueries({
        queryKey: ["admin", "products", "details", variables.productId],
      });
    },
  });
}

export function useSetAdminProductPrimaryImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      imageId,
    }: {
      productId: number;
      imageId: number;
    }) =>
      apiRequest(ENDPOINTS.vendor.productSetPrimaryImage(productId, imageId), {
        method: "PATCH",
        auth: true,
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      queryClient.invalidateQueries({
        queryKey: ["admin", "products", "details", variables.productId],
      });
    },
  });
}
