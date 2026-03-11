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
import type { Review } from "../types/review";

export type AdminOverviewResponse = {
  stats: Record<string, number>;
};

export type AdminRevenueChartPoint = {
  date: string;
  revenue: number;
  orders_count: number;
};

export type AdminOrdersChartPoint = {
  date: string;
  statuses: Record<string, number>;
};

export type AdminTopProduct = {
  id: number;
  name: string;
  name_en?: string | null;
  price: number;
  total_sold: number;
  total_revenue: number;
};

export type AdminTopVendor = {
  id: number;
  name: string;
  email: string;
  total_revenue: number;
  total_orders: number;
  total_sold: number;
};

export type AdminTopCustomer = {
  id: number;
  name: string;
  email: string;
  total_orders: number;
  total_spent: number;
};

export type AdminRecentOrder = {
  id: number;
  order_number: string;
  status: OrderStatus;
  total: number;
  payment_status: PaymentStatus;
  user: {
    id?: number;
    name?: string;
  };
  items_count: number;
  created_at: string;
};

export type AdminDashboardReview = Review & {
  product?: {
    id: number;
    name: string;
  };
};

export type AdminLowStockProduct = {
  id: number;
  name: string;
  name_en?: string | null;
  sku?: string | null;
  quantity: number;
  category?: string | null;
  vendor?: string | null;
};

export type AdminOrderStatistics = {
  total: number;
  by_status: Record<string, number>;
  by_payment: Record<string, number>;
  total_revenue: number;
  average_order: number;
  today: number;
  this_week: number;
  this_month: number;
};

export type AdminExportOrder = {
  order_number: string;
  status: string;
  payment_status: string;
  payment_method: string | null;
  subtotal: number;
  discount: number;
  shipping_cost: number;
  total: number;
  customer_name?: string;
  customer_email?: string;
  shipping_city?: string;
  items_count: number;
  created_at: string;
};

export type AdminCoupon = {
  id: number;
  code: string;
  type: "fixed" | "percentage";
  value: number;
  min_order_amount?: number | null;
  max_discount?: number | null;
  usage_limit?: number | null;
  used_count?: number;
  starts_at?: string | null;
  expires_at?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
};

export type AdminSettingItem = {
  key: string;
  value: string | number | boolean | Record<string, unknown> | null;
  type?: "string" | "boolean" | "integer" | "json";
  group?: string;
};

type AdminSettingsGrouped = Record<string, Record<string, unknown>>;

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
  product_type?:
    | "general"
    | "clothing"
    | "automotive"
    | "food"
    | "electronics"
    | "other"
    | string;
  description: string;
  description_en: string;
  specifications?: Record<string, unknown> | null;
  price: number;
  old_price?: number | null;
  cost_price?: number | null;
  sku?: string | null;
  quantity: number;
  variants?: Array<{
    sku?: string | null;
    price: number;
    quantity: number;
    attributes?: Record<string, unknown>;
  }> | null;
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

function withQuery(
  url: string,
  params: Record<string, string | number | undefined>,
) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === "") {
      return;
    }

    query.set(key, String(value));
  });

  const queryString = query.toString();
  return queryString ? `${url}?${queryString}` : url;
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
  if (body.product_type) {
    formData.append("product_type", body.product_type);
  }
  formData.append("description", body.description);
  formData.append("description_en", body.description_en);
  if (body.specifications) {
    formData.append("specifications", JSON.stringify(body.specifications));
  }
  formData.append("price", String(body.price));
  formData.append("quantity", String(body.quantity));
  if (body.variants) {
    formData.append("variants", JSON.stringify(body.variants));
  }
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

export function useAdminRevenueChart(
  period: "daily" | "weekly" | "monthly" | "yearly" = "monthly",
) {
  return useQuery({
    queryKey: ["admin", "dashboard", "revenue-chart", period],
    queryFn: async () => {
      const payload = await apiRequest<{ data: AdminRevenueChartPoint[] }>(
        withQuery(ENDPOINTS.admin.dashboardRevenueChart, { period }),
        { auth: true },
      );
      return payload.data ?? [];
    },
    enabled: Boolean(getAccessToken()),
  });
}

export function useAdminOrdersChart(
  period: "daily" | "weekly" | "monthly" = "monthly",
  days = 30,
) {
  return useQuery({
    queryKey: ["admin", "dashboard", "orders-chart", period, days],
    queryFn: async () => {
      const payload = await apiRequest<{ data: AdminOrdersChartPoint[] }>(
        withQuery(ENDPOINTS.admin.dashboardOrdersChart, { period, days }),
        { auth: true },
      );
      return payload.data ?? [];
    },
    enabled: Boolean(getAccessToken()),
  });
}

export function useAdminTopProducts(limit = 5) {
  return useQuery({
    queryKey: ["admin", "dashboard", "top-products", limit],
    queryFn: async () => {
      const payload = await apiRequest<{ data: AdminTopProduct[] }>(
        withQuery(ENDPOINTS.admin.dashboardTopProducts, { limit }),
        { auth: true },
      );
      return payload.data ?? [];
    },
    enabled: Boolean(getAccessToken()),
  });
}

export function useAdminTopVendors(limit = 5) {
  return useQuery({
    queryKey: ["admin", "dashboard", "top-vendors", limit],
    queryFn: async () => {
      const payload = await apiRequest<{ data: AdminTopVendor[] }>(
        withQuery(ENDPOINTS.admin.dashboardTopVendors, { limit }),
        { auth: true },
      );
      return payload.data ?? [];
    },
    enabled: Boolean(getAccessToken()),
  });
}

export function useAdminTopCustomers(limit = 5) {
  return useQuery({
    queryKey: ["admin", "dashboard", "top-customers", limit],
    queryFn: async () => {
      const payload = await apiRequest<{ data: AdminTopCustomer[] }>(
        withQuery(ENDPOINTS.admin.dashboardTopCustomers, { limit }),
        { auth: true },
      );
      return payload.data ?? [];
    },
    enabled: Boolean(getAccessToken()),
  });
}

export function useAdminRecentOrders() {
  return useQuery({
    queryKey: ["admin", "dashboard", "recent-orders"],
    queryFn: async () => {
      const payload = await apiRequest<{ data: AdminRecentOrder[] }>(
        ENDPOINTS.admin.dashboardRecentOrders,
        { auth: true },
      );
      return payload.data ?? [];
    },
    enabled: Boolean(getAccessToken()),
  });
}

export function useAdminRecentReviews() {
  return useQuery({
    queryKey: ["admin", "dashboard", "recent-reviews"],
    queryFn: async () => {
      const payload = await apiRequest<{ data: AdminDashboardReview[] }>(
        ENDPOINTS.admin.dashboardRecentReviews,
        { auth: true },
      );
      return payload.data ?? [];
    },
    enabled: Boolean(getAccessToken()),
  });
}

export function useAdminLowStockProducts(threshold = 10) {
  return useQuery({
    queryKey: ["admin", "dashboard", "low-stock", threshold],
    queryFn: async () => {
      const payload = await apiRequest<{ data: AdminLowStockProduct[] }>(
        withQuery(ENDPOINTS.admin.dashboardLowStock, { threshold }),
        { auth: true },
      );
      return payload.data ?? [];
    },
    enabled: Boolean(getAccessToken()),
  });
}

export function useAdminUserDetails(userId?: number) {
  return useQuery({
    queryKey: ["admin", "users", "details", userId],
    queryFn: () =>
      apiRequest<User & { stats?: Record<string, number> }>(
        ENDPOINTS.admin.userById(userId as number),
        { auth: true },
      ),
    enabled: Boolean(userId) && Boolean(getAccessToken()),
  });
}

export function useUpdateAdminUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      body,
    }: {
      userId: number;
      body: Partial<Pick<User, "name" | "email" | "phone">>;
    }) =>
      apiRequest<User>(ENDPOINTS.admin.userById(userId), {
        method: "PUT",
        auth: true,
        body,
      }),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({
        queryKey: ["admin", "users", "details", vars.userId],
      });
    },
  });
}

export function useDeleteAdminUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: number) =>
      apiRequest<{ message: string }>(ENDPOINTS.admin.userById(userId), {
        method: "DELETE",
        auth: true,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}

export function useAdminOrderStatistics() {
  return useQuery({
    queryKey: ["admin", "orders", "statistics"],
    queryFn: () =>
      apiRequest<{ statistics: AdminOrderStatistics }>(
        ENDPOINTS.admin.ordersStatistics,
        { auth: true },
      ),
    enabled: Boolean(getAccessToken()),
  });
}

export function useAdminOrdersExport(params?: {
  status?: string;
  from?: string;
  to?: string;
}) {
  return useMutation({
    mutationFn: () =>
      apiRequest<{ total: number; orders: AdminExportOrder[] }>(
        withQuery(ENDPOINTS.admin.ordersExport, params ?? {}),
        { auth: true },
      ),
  });
}

type AdminCouponPayload = {
  code: string;
  type: "fixed" | "percentage";
  value: number;
  min_order_amount?: number | null;
  max_discount?: number | null;
  usage_limit?: number | null;
  starts_at?: string | null;
  expires_at?: string | null;
  is_active?: boolean;
};

export function useAdminCoupons(page = 1) {
  return useQuery({
    queryKey: ["admin", "coupons", page],
    queryFn: async () => {
      const payload = await apiRequest<unknown>(
        withPage(ENDPOINTS.admin.coupons, page),
        {
          auth: true,
        },
      );
      return toPaginatedPayload<AdminCoupon>(payload);
    },
    enabled: Boolean(getAccessToken()),
  });
}

export function useCreateAdminCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: AdminCouponPayload) =>
      apiRequest<AdminCoupon>(ENDPOINTS.admin.coupons, {
        method: "POST",
        auth: true,
        body,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "coupons"] });
    },
  });
}

export function useUpdateAdminCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      couponId,
      body,
    }: {
      couponId: number;
      body: Partial<AdminCouponPayload>;
    }) =>
      apiRequest<AdminCoupon>(ENDPOINTS.admin.couponById(couponId), {
        method: "PUT",
        auth: true,
        body,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "coupons"] });
    },
  });
}

export function useDeleteAdminCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (couponId: number) =>
      apiRequest<{ message: string }>(ENDPOINTS.admin.couponById(couponId), {
        method: "DELETE",
        auth: true,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "coupons"] });
    },
  });
}

export function useAdminReviews(page = 1) {
  return useQuery({
    queryKey: ["admin", "reviews", page],
    queryFn: async () => {
      const payload = await apiRequest<unknown>(
        withPage(ENDPOINTS.admin.reviews, page),
        {
          auth: true,
        },
      );
      return toPaginatedPayload<Review>(payload);
    },
    enabled: Boolean(getAccessToken()),
  });
}

export function useApproveAdminReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reviewId: number) =>
      apiRequest<Review>(ENDPOINTS.admin.reviewApprove(reviewId), {
        method: "PATCH",
        auth: true,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "reviews"] });
      queryClient.invalidateQueries({
        queryKey: ["admin", "dashboard", "recent-reviews"],
      });
    },
  });
}

export function useAdminSettings() {
  return useQuery({
    queryKey: ["admin", "settings"],
    queryFn: () =>
      apiRequest<{ settings: AdminSettingsGrouped }>(ENDPOINTS.admin.settings, {
        auth: true,
      }),
    enabled: Boolean(getAccessToken()),
  });
}

export function useUpdateAdminSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (settings: AdminSettingItem[]) =>
      apiRequest<{ message: string }>(ENDPOINTS.admin.settings, {
        method: "PUT",
        auth: true,
        body: { settings },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "settings"] });
    },
  });
}
