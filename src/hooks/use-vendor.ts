"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../lib/api-client";
import { getAccessToken } from "../lib/auth";
import { ENDPOINTS } from "../lib/endpoints";
import { type PaginatedResponse, toPaginatedPayload } from "../lib/normalizers";
import type { Order } from "../types/order";
import type { Product, ProductImage, ProductVideo } from "../types/product";

type VendorProductsPage = PaginatedResponse<Product>;
type VendorProductsCacheSnapshot = Array<
  readonly [readonly unknown[], VendorProductsPage | undefined]
>;

const VENDOR_PRODUCTS_QUERY_KEY = ["vendor", "products"] as const;

function snapshotVendorProductsCache(
  queryClient: ReturnType<typeof useQueryClient>,
): VendorProductsCacheSnapshot {
  return queryClient.getQueriesData<VendorProductsPage>({
    queryKey: VENDOR_PRODUCTS_QUERY_KEY,
  });
}

function restoreVendorProductsCache(
  queryClient: ReturnType<typeof useQueryClient>,
  snapshot: VendorProductsCacheSnapshot,
) {
  for (const [queryKey, value] of snapshot) {
    queryClient.setQueryData(queryKey, value);
  }
}

function updateVendorProductsCache(
  queryClient: ReturnType<typeof useQueryClient>,
  updater: (oldPage: VendorProductsPage) => VendorProductsPage,
) {
  const snapshots = snapshotVendorProductsCache(queryClient);

  for (const [queryKey, oldPage] of snapshots) {
    if (!oldPage) {
      continue;
    }

    queryClient.setQueryData<VendorProductsPage>(queryKey, updater(oldPage));
  }

  return snapshots;
}

export function useVendorOrders(page = 1) {
  return useVendorOrdersPage(page);
}

function withPage(url: string, page: number) {
  const query = new URLSearchParams({ page: String(page) });
  return `${url}?${query.toString()}`;
}

export function useVendorOrdersPage(page = 1) {
  return useQuery({
    queryKey: ["vendor", "orders", page],
    queryFn: async () => {
      const payload = await apiRequest<unknown>(
        withPage(ENDPOINTS.vendor.orders, page),
        { auth: true },
      );
      return toPaginatedPayload<Order>(payload);
    },
    enabled: Boolean(getAccessToken()),
  });
}

export type VendorProductPayload = {
  name?: string;
  name_en?: string;
  description?: string;
  description_en?: string;
  price?: number;
  old_price?: number | null;
  cost_price?: number | null;
  sku?: string | null;
  quantity?: number;
  category_id?: number;
  is_active?: boolean;
  is_featured?: boolean;
};

function buildProductFormData(
  payload: VendorProductPayload,
  files?: { images?: File[]; videos?: File[] },
) {
  const formData = new FormData();

  const append = (key: string, value: unknown) => {
    if (value === undefined || value === null) {
      return;
    }

    if (typeof value === "boolean") {
      formData.append(key, value ? "1" : "0");
      return;
    }

    formData.append(key, String(value));
  };

  append("name", payload.name);
  append("name_en", payload.name_en);
  append("description", payload.description);
  append("description_en", payload.description_en);
  append("price", payload.price);
  append("old_price", payload.old_price);
  append("cost_price", payload.cost_price);
  append("sku", payload.sku);
  append("quantity", payload.quantity);
  append("category_id", payload.category_id);
  append("is_active", payload.is_active);
  append("is_featured", payload.is_featured);

  for (const file of files?.images ?? []) {
    formData.append("images[]", file);
  }

  for (const file of files?.videos ?? []) {
    formData.append("videos[]", file);
  }

  return formData;
}

export function useVendorProducts(page = 1) {
  return useQuery({
    queryKey: ["vendor", "products", page],
    queryFn: async () => {
      const payload = await apiRequest<unknown>(
        withPage(ENDPOINTS.vendor.products, page),
        {
          auth: true,
        },
      );
      return toPaginatedPayload<Product>(payload);
    },
    enabled: Boolean(getAccessToken()),
  });
}

export function useCreateVendorProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      payload,
      images,
      videos,
    }: {
      payload: VendorProductPayload;
      images?: File[];
      videos?: File[];
    }) =>
      apiRequest<Product>(ENDPOINTS.vendor.productCreate, {
        method: "POST",
        auth: true,
        body: buildProductFormData(payload, { images, videos }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VENDOR_PRODUCTS_QUERY_KEY });
    },
  });
}

export function useUpdateVendorProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      payload,
      images,
      videos,
    }: {
      productId: number;
      payload: VendorProductPayload;
      images?: File[];
      videos?: File[];
    }) =>
      apiRequest<Product>(ENDPOINTS.vendor.productUpdate(productId), {
        method: "PUT",
        auth: true,
        body: buildProductFormData(payload, { images, videos }),
      }),
    onMutate: async ({ productId, payload }) => {
      await queryClient.cancelQueries({ queryKey: VENDOR_PRODUCTS_QUERY_KEY });
      const snapshots = updateVendorProductsCache(queryClient, (oldPage) => ({
        ...oldPage,
        data: oldPage.data.map((product) => {
          if (product.id !== productId) {
            return product;
          }

          return {
            ...product,
            ...payload,
            category:
              payload.category_id !== undefined
                ? {
                    ...(product.category ?? {
                      id: payload.category_id,
                      name: "",
                      name_en: "",
                      slug: "",
                    }),
                    id: payload.category_id,
                  }
                : product.category,
          } as Product;
        }),
      }));

      return { snapshots };
    },
    onError: (_error, _vars, context) => {
      if (context?.snapshots) {
        restoreVendorProductsCache(queryClient, context.snapshots);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: VENDOR_PRODUCTS_QUERY_KEY });
    },
  });
}

export function useDeleteVendorProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: number) =>
      apiRequest<{ message: string }>(
        ENDPOINTS.vendor.productDelete(productId),
        {
          method: "DELETE",
          auth: true,
        },
      ),
    onMutate: async (productId: number) => {
      await queryClient.cancelQueries({ queryKey: VENDOR_PRODUCTS_QUERY_KEY });
      const snapshots = updateVendorProductsCache(queryClient, (oldPage) => ({
        ...oldPage,
        data: oldPage.data.filter((product) => product.id !== productId),
      }));

      return { snapshots };
    },
    onError: (_error, _vars, context) => {
      if (context?.snapshots) {
        restoreVendorProductsCache(queryClient, context.snapshots);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: VENDOR_PRODUCTS_QUERY_KEY });
    },
  });
}

export function useUploadVendorImages() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      files,
    }: {
      productId: number;
      files: File[];
    }) => {
      const formData = new FormData();
      for (const file of files) {
        formData.append("images[]", file);
      }

      return apiRequest<ProductImage[]>(
        ENDPOINTS.vendor.productAddImages(productId),
        {
          method: "POST",
          auth: true,
          body: formData,
        },
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VENDOR_PRODUCTS_QUERY_KEY });
    },
  });
}

export function useDeleteVendorImage() {
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
    onMutate: async ({ productId, imageId }) => {
      await queryClient.cancelQueries({ queryKey: VENDOR_PRODUCTS_QUERY_KEY });
      const snapshots = updateVendorProductsCache(queryClient, (oldPage) => ({
        ...oldPage,
        data: oldPage.data.map((product) => {
          if (product.id !== productId) {
            return product;
          }

          const images = [...(product.images ?? [])];
          const deleted = images.find((image) => image.id === imageId);
          const nextImages = images.filter((image) => image.id !== imageId);

          if (
            deleted?.is_primary &&
            nextImages.length > 0 &&
            !nextImages.some((img) => img.is_primary)
          ) {
            nextImages[0] = { ...nextImages[0], is_primary: true };
          }

          return {
            ...product,
            images: nextImages,
            primary_image: nextImages.find((image) => image.is_primary) ?? null,
          };
        }),
      }));

      return { snapshots };
    },
    onError: (_error, _vars, context) => {
      if (context?.snapshots) {
        restoreVendorProductsCache(queryClient, context.snapshots);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: VENDOR_PRODUCTS_QUERY_KEY });
    },
  });
}

export function useSetVendorPrimaryImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      imageId,
    }: {
      productId: number;
      imageId: number;
    }) =>
      apiRequest<ProductImage>(
        ENDPOINTS.vendor.productSetPrimaryImage(productId, imageId),
        {
          method: "PATCH",
          auth: true,
        },
      ),
    onMutate: async ({ productId, imageId }) => {
      await queryClient.cancelQueries({ queryKey: VENDOR_PRODUCTS_QUERY_KEY });
      const snapshots = updateVendorProductsCache(queryClient, (oldPage) => ({
        ...oldPage,
        data: oldPage.data.map((product) => {
          if (product.id !== productId) {
            return product;
          }

          const nextImages = (product.images ?? []).map((image) => ({
            ...image,
            is_primary: image.id === imageId,
          }));

          return {
            ...product,
            images: nextImages,
            primary_image:
              nextImages.find((image) => image.id === imageId) ?? null,
          };
        }),
      }));

      return { snapshots };
    },
    onError: (_error, _vars, context) => {
      if (context?.snapshots) {
        restoreVendorProductsCache(queryClient, context.snapshots);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: VENDOR_PRODUCTS_QUERY_KEY });
    },
  });
}

export function useUploadVendorVideos() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      files,
    }: {
      productId: number;
      files: File[];
    }) => {
      const formData = new FormData();
      for (const file of files) {
        formData.append("videos[]", file);
      }

      return apiRequest<ProductVideo[]>(
        ENDPOINTS.vendor.productAddVideos(productId),
        {
          method: "POST",
          auth: true,
          body: formData,
        },
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VENDOR_PRODUCTS_QUERY_KEY });
    },
  });
}

export function useDeleteVendorVideo() {
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
    onMutate: async ({ productId, videoId }) => {
      await queryClient.cancelQueries({ queryKey: VENDOR_PRODUCTS_QUERY_KEY });
      const snapshots = updateVendorProductsCache(queryClient, (oldPage) => ({
        ...oldPage,
        data: oldPage.data.map((product) => {
          if (product.id !== productId) {
            return product;
          }

          return {
            ...product,
            videos: (product.videos ?? []).filter(
              (video) => video.id !== videoId,
            ),
          };
        }),
      }));

      return { snapshots };
    },
    onError: (_error, _vars, context) => {
      if (context?.snapshots) {
        restoreVendorProductsCache(queryClient, context.snapshots);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: VENDOR_PRODUCTS_QUERY_KEY });
    },
  });
}
