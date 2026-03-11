"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { PaginationControls } from "../../../src/components/pagination-controls";
import { useCategories } from "../../../src/hooks/use-categories";
import {
  type VendorProductPayload,
  useCreateVendorProduct,
  useDeleteVendorImage,
  useDeleteVendorProduct,
  useDeleteVendorVideo,
  useSetVendorPrimaryImage,
  useUpdateVendorProduct,
  useUploadVendorImages,
  useUploadVendorVideos,
  useVendorProducts,
} from "../../../src/hooks/use-vendor";
import { useLanguage } from "../../../src/components/language-provider";
import { getApiErrorMessages } from "../../../src/lib/api-client";
import {
  createSpecificationRow,
  createVariantRow,
  fromSpecificationsObject,
  fromVariants,
  toSpecificationsObject,
  toVariantsPayload,
  type SpecificationRow,
  type VariantRow,
} from "../../../src/lib/product-form-utils";
import type { Product } from "../../../src/types/product";

type ProductFormState = {
  name: string;
  name_en: string;
  product_type:
    | "general"
    | "clothing"
    | "automotive"
    | "food"
    | "electronics"
    | "other";
  description: string;
  description_en: string;
  price: string;
  old_price: string;
  cost_price: string;
  sku: string;
  quantity: string;
  category_id: string;
  is_active: boolean;
  is_featured: boolean;
};

type TempUploadPreview = {
  id: string;
  name: string;
  url: string;
};

const INITIAL_FORM: ProductFormState = {
  name: "",
  name_en: "",
  product_type: "general",
  description: "",
  description_en: "",
  price: "",
  old_price: "",
  cost_price: "",
  sku: "",
  quantity: "",
  category_id: "",
  is_active: true,
  is_featured: false,
};

function toPayload(
  form: ProductFormState,
  specificationsRows: SpecificationRow[],
  variantRows: VariantRow[],
): VendorProductPayload {
  const specifications = toSpecificationsObject(specificationsRows);
  const variants = toVariantsPayload(variantRows);

  return {
    name: form.name,
    name_en: form.name_en,
    product_type: form.product_type,
    description: form.description,
    description_en: form.description_en,
    specifications,
    price: Number(form.price),
    old_price: form.old_price ? Number(form.old_price) : null,
    cost_price: form.cost_price ? Number(form.cost_price) : null,
    sku: form.sku || null,
    quantity: Number(form.quantity),
    variants,
    category_id: Number(form.category_id),
    is_active: form.is_active,
    is_featured: form.is_featured,
  };
}

function toEditForm(product: Product): ProductFormState {
  return {
    name: product.name || "",
    name_en: product.name_en || "",
    product_type:
      product.product_type === "clothing" ||
      product.product_type === "automotive" ||
      product.product_type === "food" ||
      product.product_type === "electronics" ||
      product.product_type === "other"
        ? product.product_type
        : "general",
    description: product.description || "",
    description_en: product.description_en || "",
    price: String(product.price ?? ""),
    old_price: product.old_price == null ? "" : String(product.old_price),
    cost_price: product.cost_price == null ? "" : String(product.cost_price),
    sku: product.sku || "",
    quantity: String(product.quantity ?? 0),
    category_id: String(product.category?.id ?? ""),
    is_active: Boolean(product.is_active),
    is_featured: Boolean(product.is_featured),
  };
}

export default function VendorProductsPage() {
  const [page, setPage] = useState(1);
  const [createForm, setCreateForm] = useState<ProductFormState>(INITIAL_FORM);
  const [createImages, setCreateImages] = useState<File[]>([]);
  const [createVideos, setCreateVideos] = useState<File[]>([]);
  const [createSpecifications, setCreateSpecifications] = useState<
    SpecificationRow[]
  >([createSpecificationRow()]);
  const [createVariants, setCreateVariants] = useState<VariantRow[]>([
    createVariantRow(),
  ]);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<ProductFormState>(INITIAL_FORM);
  const [editImages, setEditImages] = useState<File[]>([]);
  const [editVideos, setEditVideos] = useState<File[]>([]);
  const [editSpecifications, setEditSpecifications] = useState<
    SpecificationRow[]
  >([createSpecificationRow()]);
  const [editVariants, setEditVariants] = useState<VariantRow[]>([
    createVariantRow(),
  ]);
  const [busyProductIds, setBusyProductIds] = useState<number[]>([]);
  const [tempImageUploads, setTempImageUploads] = useState<
    Record<number, TempUploadPreview[]>
  >({});
  const [tempVideoUploads, setTempVideoUploads] = useState<
    Record<number, TempUploadPreview[]>
  >({});
  const tempImageUploadsRef = useRef<Record<number, TempUploadPreview[]>>({});
  const tempVideoUploadsRef = useRef<Record<number, TempUploadPreview[]>>({});

  const productsQuery = useVendorProducts(page);
  const categoriesQuery = useCategories();

  const createMutation = useCreateVendorProduct();
  const updateMutation = useUpdateVendorProduct();
  const deleteMutation = useDeleteVendorProduct();
  const uploadImagesMutation = useUploadVendorImages();
  const deleteImageMutation = useDeleteVendorImage();
  const setPrimaryImageMutation = useSetVendorPrimaryImage();
  const uploadVideosMutation = useUploadVendorVideos();
  const deleteVideoMutation = useDeleteVendorVideo();
  const { t } = useLanguage();

  const products = productsQuery.data?.data ?? [];
  const paginationMeta = productsQuery.data?.meta;

  const categories = useMemo(
    () => categoriesQuery.data ?? [],
    [categoriesQuery.data],
  );
  const isCreateBusy = createMutation.isPending || categoriesQuery.isLoading;
  const isEditBusy = updateMutation.isPending;

  const revokePreviewItems = (items: TempUploadPreview[]) => {
    for (const item of items) {
      URL.revokeObjectURL(item.url);
    }
  };

  useEffect(() => {
    tempImageUploadsRef.current = tempImageUploads;
  }, [tempImageUploads]);

  useEffect(() => {
    tempVideoUploadsRef.current = tempVideoUploads;
  }, [tempVideoUploads]);

  useEffect(() => {
    return () => {
      Object.values(tempImageUploadsRef.current).forEach(revokePreviewItems);
      Object.values(tempVideoUploadsRef.current).forEach(revokePreviewItems);
    };
  }, []);

  const buildPreviews = (files: File[]) =>
    files.map((file) => ({
      id: `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2)}`,
      name: file.name,
      url: URL.createObjectURL(file),
    }));

  const setImagePreviewsForProduct = (
    productId: number,
    next: TempUploadPreview[],
  ) => {
    setTempImageUploads((prev) => {
      revokePreviewItems(prev[productId] ?? []);

      if (next.length === 0) {
        const { [productId]: _removed, ...rest } = prev;
        return rest;
      }

      return {
        ...prev,
        [productId]: next,
      };
    });
  };

  const setVideoPreviewsForProduct = (
    productId: number,
    next: TempUploadPreview[],
  ) => {
    setTempVideoUploads((prev) => {
      revokePreviewItems(prev[productId] ?? []);

      if (next.length === 0) {
        const { [productId]: _removed, ...rest } = prev;
        return rest;
      }

      return {
        ...prev,
        [productId]: next,
      };
    });
  };

  const isProductBusy = (productId: number) =>
    busyProductIds.includes(productId);
  const setProductBusy = (productId: number, busy: boolean) => {
    setBusyProductIds((prev) => {
      if (busy) {
        return prev.includes(productId) ? prev : [...prev, productId];
      }

      return prev.filter((id) => id !== productId);
    });
  };

  const runProductAction = async (
    productId: number,
    action: () => Promise<void>,
    successMessage: string,
  ) => {
    if (isProductBusy(productId)) {
      return;
    }

    setProductBusy(productId, true);

    try {
      await action();
      toast.success(successMessage);
    } catch (error) {
      toast.error(getApiErrorMessages(error).join(" | "));
    } finally {
      setProductBusy(productId, false);
    }
  };

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!createForm.category_id) {
      toast.error(t("vendor_products_select_category"));
      return;
    }

    try {
      await createMutation.mutateAsync({
        payload: toPayload(createForm, createSpecifications, createVariants),
        images: createImages,
        videos: createVideos,
      });
      setCreateForm(INITIAL_FORM);
      setCreateImages([]);
      setCreateVideos([]);
      setCreateSpecifications([createSpecificationRow()]);
      setCreateVariants([createVariantRow()]);
      toast.success(t("vendor_products_created"));
    } catch (error) {
      toast.error(getApiErrorMessages(error).join(" | "));
    }
  };

  const startEdit = (product: Product) => {
    setEditingProductId(product.id);
    setEditForm(toEditForm(product));
    setEditImages([]);
    setEditVideos([]);
    setEditSpecifications(fromSpecificationsObject(product.specifications));
    setEditVariants(fromVariants(product.variants));
  };

  const handleUpdate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!editingProductId) {
      return;
    }

    try {
      await updateMutation.mutateAsync({
        productId: editingProductId,
        payload: toPayload(editForm, editSpecifications, editVariants),
        images: editImages,
        videos: editVideos,
      });
      toast.success(t("vendor_products_updated"));
      setEditingProductId(null);
      setEditForm(INITIAL_FORM);
      setEditImages([]);
      setEditVideos([]);
      setEditSpecifications([createSpecificationRow()]);
      setEditVariants([createVariantRow()]);
    } catch (error) {
      toast.error(getApiErrorMessages(error).join(" | "));
    }
  };

  const handleDelete = async (productId: number) => {
    if (!window.confirm(t("vendor_products_delete_confirm"))) {
      return;
    }

    await runProductAction(
      productId,
      async () => {
        await deleteMutation.mutateAsync(productId);
        if (editingProductId === productId) {
          setEditingProductId(null);
        }
      },
      t("vendor_products_deleted"),
    );
  };

  const handleUploadImages = async (productId: number, files: File[]) => {
    if (files.length === 0) {
      return;
    }

    setImagePreviewsForProduct(productId, buildPreviews(files));

    await runProductAction(
      productId,
      () =>
        uploadImagesMutation
          .mutateAsync({ productId, files })
          .then(() => undefined),
      t("vendor_products_images_uploaded"),
    );

    setImagePreviewsForProduct(productId, []);
  };

  const handleUploadVideos = async (productId: number, files: File[]) => {
    if (files.length === 0) {
      return;
    }

    setVideoPreviewsForProduct(productId, buildPreviews(files));

    await runProductAction(
      productId,
      () =>
        uploadVideosMutation
          .mutateAsync({ productId, files })
          .then(() => undefined),
      t("vendor_products_videos_uploaded"),
    );

    setVideoPreviewsForProduct(productId, []);
  };

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl p-6 md:p-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t("vendor_products_title")}</h1>
        <Link
          href="/vendor"
          className="rounded-xl border border-slate-300 px-4 py-2 text-sm dark:border-slate-700"
        >
          {t("vendor_products_back_dashboard")}
        </Link>
      </div>

      <section className="mb-8 rounded-2xl bg-card p-5 shadow-soft md:p-7">
        <h2 className="mb-4 text-xl font-semibold">
          {t("vendor_products_create_title")}
        </h2>

        <form
          onSubmit={handleCreate}
          className="grid grid-cols-1 gap-3 md:grid-cols-2"
        >
          <fieldset disabled={isCreateBusy} className="contents">
            <input
              className="rounded-lg border border-slate-300 bg-transparent px-3 py-2 text-sm dark:border-slate-700"
              placeholder={t("field_name")}
              value={createForm.name}
              onChange={(e) =>
                setCreateForm((prev) => ({ ...prev, name: e.target.value }))
              }
              required
            />
            <input
              className="rounded-lg border border-slate-300 bg-transparent px-3 py-2 text-sm dark:border-slate-700"
              placeholder={t("field_name_en")}
              value={createForm.name_en}
              onChange={(e) =>
                setCreateForm((prev) => ({ ...prev, name_en: e.target.value }))
              }
              required
            />
            <textarea
              className="rounded-lg border border-slate-300 bg-transparent px-3 py-2 text-sm dark:border-slate-700"
              placeholder={t("field_description")}
              value={createForm.description}
              onChange={(e) =>
                setCreateForm((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              required
            />
            <textarea
              className="rounded-lg border border-slate-300 bg-transparent px-3 py-2 text-sm dark:border-slate-700"
              placeholder={t("field_description_en")}
              value={createForm.description_en}
              onChange={(e) =>
                setCreateForm((prev) => ({
                  ...prev,
                  description_en: e.target.value,
                }))
              }
              required
            />
            <input
              type="number"
              min="0"
              step="0.01"
              className="rounded-lg border border-slate-300 bg-transparent px-3 py-2 text-sm dark:border-slate-700"
              placeholder={t("field_price")}
              value={createForm.price}
              onChange={(e) =>
                setCreateForm((prev) => ({ ...prev, price: e.target.value }))
              }
              required
            />
            <input
              type="number"
              min="0"
              step="0.01"
              className="rounded-lg border border-slate-300 bg-transparent px-3 py-2 text-sm dark:border-slate-700"
              placeholder={t("field_old_price")}
              value={createForm.old_price}
              onChange={(e) =>
                setCreateForm((prev) => ({
                  ...prev,
                  old_price: e.target.value,
                }))
              }
            />
            <input
              type="number"
              min="0"
              step="0.01"
              className="rounded-lg border border-slate-300 bg-transparent px-3 py-2 text-sm dark:border-slate-700"
              placeholder={t("field_cost_price")}
              value={createForm.cost_price}
              onChange={(e) =>
                setCreateForm((prev) => ({
                  ...prev,
                  cost_price: e.target.value,
                }))
              }
            />
            <input
              className="rounded-lg border border-slate-300 bg-transparent px-3 py-2 text-sm dark:border-slate-700"
              placeholder={t("field_sku")}
              value={createForm.sku}
              onChange={(e) =>
                setCreateForm((prev) => ({ ...prev, sku: e.target.value }))
              }
            />
            <input
              type="number"
              min="0"
              className="rounded-lg border border-slate-300 bg-transparent px-3 py-2 text-sm dark:border-slate-700"
              placeholder={t("field_quantity")}
              value={createForm.quantity}
              onChange={(e) =>
                setCreateForm((prev) => ({ ...prev, quantity: e.target.value }))
              }
              required
            />

            <select
              className="rounded-lg border border-slate-300 bg-transparent px-3 py-2 text-sm dark:border-slate-700"
              value={createForm.product_type}
              onChange={(e) =>
                setCreateForm((prev) => ({
                  ...prev,
                  product_type: e.target
                    .value as ProductFormState["product_type"],
                }))
              }
            >
              <option value="general">General</option>
              <option value="clothing">Clothing</option>
              <option value="automotive">Automotive</option>
              <option value="food">Food</option>
              <option value="electronics">Electronics</option>
              <option value="other">Other</option>
            </select>

            <select
              className="rounded-lg border border-slate-300 bg-transparent px-3 py-2 text-sm dark:border-slate-700"
              value={createForm.category_id}
              onChange={(e) =>
                setCreateForm((prev) => ({
                  ...prev,
                  category_id: e.target.value,
                }))
              }
              required
            >
              <option value="">{t("vendor_products_select_category")}</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            <div className="space-y-2 md:col-span-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Specifications</p>
                <button
                  type="button"
                  className="rounded border border-slate-300 px-2 py-1 text-xs dark:border-slate-700"
                  onClick={() =>
                    setCreateSpecifications((prev) => [
                      ...prev,
                      createSpecificationRow(),
                    ])
                  }
                >
                  + Add spec
                </button>
              </div>
              {createSpecifications.map((row) => (
                <div
                  key={row.id}
                  className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_1fr_auto]"
                >
                  <input
                    className="rounded-lg border border-slate-300 bg-transparent px-3 py-2 text-sm dark:border-slate-700"
                    placeholder="Key (e.g. material)"
                    value={row.key}
                    onChange={(e) =>
                      setCreateSpecifications((prev) =>
                        prev.map((item) =>
                          item.id === row.id
                            ? { ...item, key: e.target.value }
                            : item,
                        ),
                      )
                    }
                  />
                  <input
                    className="rounded-lg border border-slate-300 bg-transparent px-3 py-2 text-sm dark:border-slate-700"
                    placeholder="Value"
                    value={row.value}
                    onChange={(e) =>
                      setCreateSpecifications((prev) =>
                        prev.map((item) =>
                          item.id === row.id
                            ? { ...item, value: e.target.value }
                            : item,
                        ),
                      )
                    }
                  />
                  <button
                    type="button"
                    className="rounded border border-rose-300 px-2 py-1 text-xs text-rose-700 dark:border-rose-700 dark:text-rose-300"
                    onClick={() =>
                      setCreateSpecifications((prev) =>
                        prev.length > 1
                          ? prev.filter((item) => item.id !== row.id)
                          : [createSpecificationRow()],
                      )
                    }
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div className="space-y-2 md:col-span-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Variants</p>
                <button
                  type="button"
                  className="rounded border border-slate-300 px-2 py-1 text-xs dark:border-slate-700"
                  onClick={() =>
                    setCreateVariants((prev) => [...prev, createVariantRow()])
                  }
                >
                  + Add variant
                </button>
              </div>
              {createVariants.map((row) => (
                <div
                  key={row.id}
                  className="grid grid-cols-2 gap-2 md:grid-cols-5"
                >
                  <input
                    className="rounded-lg border border-slate-300 bg-transparent px-2 py-2 text-xs dark:border-slate-700"
                    placeholder="SKU"
                    value={row.sku}
                    onChange={(e) =>
                      setCreateVariants((prev) =>
                        prev.map((item) =>
                          item.id === row.id
                            ? { ...item, sku: e.target.value }
                            : item,
                        ),
                      )
                    }
                  />
                  <input
                    className="rounded-lg border border-slate-300 bg-transparent px-2 py-2 text-xs dark:border-slate-700"
                    placeholder="Price"
                    value={row.price}
                    onChange={(e) =>
                      setCreateVariants((prev) =>
                        prev.map((item) =>
                          item.id === row.id
                            ? { ...item, price: e.target.value }
                            : item,
                        ),
                      )
                    }
                  />
                  <input
                    className="rounded-lg border border-slate-300 bg-transparent px-2 py-2 text-xs dark:border-slate-700"
                    placeholder="Qty"
                    value={row.quantity}
                    onChange={(e) =>
                      setCreateVariants((prev) =>
                        prev.map((item) =>
                          item.id === row.id
                            ? { ...item, quantity: e.target.value }
                            : item,
                        ),
                      )
                    }
                  />
                  <input
                    className="rounded-lg border border-slate-300 bg-transparent px-2 py-2 text-xs dark:border-slate-700"
                    placeholder="Color"
                    value={row.color}
                    onChange={(e) =>
                      setCreateVariants((prev) =>
                        prev.map((item) =>
                          item.id === row.id
                            ? { ...item, color: e.target.value }
                            : item,
                        ),
                      )
                    }
                  />
                  <input
                    className="rounded-lg border border-slate-300 bg-transparent px-2 py-2 text-xs dark:border-slate-700"
                    placeholder="Size"
                    value={row.size}
                    onChange={(e) =>
                      setCreateVariants((prev) =>
                        prev.map((item) =>
                          item.id === row.id
                            ? { ...item, size: e.target.value }
                            : item,
                        ),
                      )
                    }
                  />
                  <input
                    className="rounded-lg border border-slate-300 bg-transparent px-2 py-2 text-xs dark:border-slate-700"
                    placeholder="Make"
                    value={row.make}
                    onChange={(e) =>
                      setCreateVariants((prev) =>
                        prev.map((item) =>
                          item.id === row.id
                            ? { ...item, make: e.target.value }
                            : item,
                        ),
                      )
                    }
                  />
                  <input
                    className="rounded-lg border border-slate-300 bg-transparent px-2 py-2 text-xs dark:border-slate-700"
                    placeholder="Model"
                    value={row.model}
                    onChange={(e) =>
                      setCreateVariants((prev) =>
                        prev.map((item) =>
                          item.id === row.id
                            ? { ...item, model: e.target.value }
                            : item,
                        ),
                      )
                    }
                  />
                  <input
                    className="rounded-lg border border-slate-300 bg-transparent px-2 py-2 text-xs dark:border-slate-700"
                    placeholder="Year"
                    value={row.year}
                    onChange={(e) =>
                      setCreateVariants((prev) =>
                        prev.map((item) =>
                          item.id === row.id
                            ? { ...item, year: e.target.value }
                            : item,
                        ),
                      )
                    }
                  />
                  <button
                    type="button"
                    className="rounded border border-rose-300 px-2 py-1 text-xs text-rose-700 dark:border-rose-700 dark:text-rose-300"
                    onClick={() =>
                      setCreateVariants((prev) =>
                        prev.length > 1
                          ? prev.filter((item) => item.id !== row.id)
                          : [createVariantRow()],
                      )
                    }
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-4 text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={createForm.is_active}
                  onChange={(e) =>
                    setCreateForm((prev) => ({
                      ...prev,
                      is_active: e.target.checked,
                    }))
                  }
                />{" "}
                {t("vendor_products_active")}
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={createForm.is_featured}
                  onChange={(e) =>
                    setCreateForm((prev) => ({
                      ...prev,
                      is_featured: e.target.checked,
                    }))
                  }
                />{" "}
                {t("vendor_products_featured")}
              </label>
            </div>

            <label className="text-sm md:col-span-2">
              {t("vendor_products_images")}
              <input
                type="file"
                multiple
                accept="image/*"
                className="mt-1 block w-full"
                onChange={(e) =>
                  setCreateImages(Array.from(e.target.files ?? []))
                }
              />
            </label>

            <label className="text-sm md:col-span-2">
              {t("vendor_products_videos")}
              <input
                type="file"
                multiple
                accept="video/*"
                className="mt-1 block w-full"
                onChange={(e) =>
                  setCreateVideos(Array.from(e.target.files ?? []))
                }
              />
            </label>

            <button
              type="submit"
              className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-slate-950 md:col-span-2"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending
                ? t("vendor_products_creating")
                : t("vendor_products_create_btn")}
            </button>
          </fieldset>
        </form>
      </section>

      {editingProductId ? (
        <section className="mb-8 rounded-2xl bg-card p-5 shadow-soft md:p-7">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              {t("vendor_products_edit_title").replace(
                "{id}",
                String(editingProductId),
              )}
            </h2>
            <button
              type="button"
              className="rounded-lg border border-slate-300 px-3 py-1 text-sm dark:border-slate-700"
              onClick={() => setEditingProductId(null)}
            >
              {t("common_cancel")}
            </button>
          </div>

          <form
            onSubmit={handleUpdate}
            className="grid grid-cols-1 gap-3 md:grid-cols-2"
          >
            <fieldset disabled={isEditBusy} className="contents">
              <input
                className="rounded-lg border border-slate-300 bg-transparent px-3 py-2 text-sm dark:border-slate-700"
                placeholder={t("field_name")}
                value={editForm.name}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, name: e.target.value }))
                }
                required
              />
              <input
                className="rounded-lg border border-slate-300 bg-transparent px-3 py-2 text-sm dark:border-slate-700"
                placeholder={t("field_name_en")}
                value={editForm.name_en}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, name_en: e.target.value }))
                }
                required
              />
              <textarea
                className="rounded-lg border border-slate-300 bg-transparent px-3 py-2 text-sm dark:border-slate-700"
                placeholder={t("field_description")}
                value={editForm.description}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                required
              />
              <textarea
                className="rounded-lg border border-slate-300 bg-transparent px-3 py-2 text-sm dark:border-slate-700"
                placeholder={t("field_description_en")}
                value={editForm.description_en}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    description_en: e.target.value,
                  }))
                }
                required
              />
              <input
                type="number"
                min="0"
                step="0.01"
                className="rounded-lg border border-slate-300 bg-transparent px-3 py-2 text-sm dark:border-slate-700"
                placeholder={t("field_price")}
                value={editForm.price}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, price: e.target.value }))
                }
                required
              />
              <input
                type="number"
                min="0"
                step="0.01"
                className="rounded-lg border border-slate-300 bg-transparent px-3 py-2 text-sm dark:border-slate-700"
                placeholder={t("field_old_price")}
                value={editForm.old_price}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    old_price: e.target.value,
                  }))
                }
              />
              <input
                type="number"
                min="0"
                step="0.01"
                className="rounded-lg border border-slate-300 bg-transparent px-3 py-2 text-sm dark:border-slate-700"
                placeholder={t("field_cost_price")}
                value={editForm.cost_price}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    cost_price: e.target.value,
                  }))
                }
              />
              <input
                className="rounded-lg border border-slate-300 bg-transparent px-3 py-2 text-sm dark:border-slate-700"
                placeholder={t("field_sku")}
                value={editForm.sku}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, sku: e.target.value }))
                }
              />
              <input
                type="number"
                min="0"
                className="rounded-lg border border-slate-300 bg-transparent px-3 py-2 text-sm dark:border-slate-700"
                placeholder={t("field_quantity")}
                value={editForm.quantity}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, quantity: e.target.value }))
                }
                required
              />

              <select
                className="rounded-lg border border-slate-300 bg-transparent px-3 py-2 text-sm dark:border-slate-700"
                value={editForm.product_type}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    product_type: e.target
                      .value as ProductFormState["product_type"],
                  }))
                }
              >
                <option value="general">General</option>
                <option value="clothing">Clothing</option>
                <option value="automotive">Automotive</option>
                <option value="food">Food</option>
                <option value="electronics">Electronics</option>
                <option value="other">Other</option>
              </select>

              <select
                className="rounded-lg border border-slate-300 bg-transparent px-3 py-2 text-sm dark:border-slate-700"
                value={editForm.category_id}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    category_id: e.target.value,
                  }))
                }
                required
              >
                <option value="">{t("vendor_products_select_category")}</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>

              <div className="space-y-2 md:col-span-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Specifications</p>
                  <button
                    type="button"
                    className="rounded border border-slate-300 px-2 py-1 text-xs dark:border-slate-700"
                    onClick={() =>
                      setEditSpecifications((prev) => [
                        ...prev,
                        createSpecificationRow(),
                      ])
                    }
                  >
                    + Add spec
                  </button>
                </div>
                {editSpecifications.map((row) => (
                  <div
                    key={row.id}
                    className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_1fr_auto]"
                  >
                    <input
                      className="rounded-lg border border-slate-300 bg-transparent px-3 py-2 text-sm dark:border-slate-700"
                      placeholder="Key"
                      value={row.key}
                      onChange={(e) =>
                        setEditSpecifications((prev) =>
                          prev.map((item) =>
                            item.id === row.id
                              ? { ...item, key: e.target.value }
                              : item,
                          ),
                        )
                      }
                    />
                    <input
                      className="rounded-lg border border-slate-300 bg-transparent px-3 py-2 text-sm dark:border-slate-700"
                      placeholder="Value"
                      value={row.value}
                      onChange={(e) =>
                        setEditSpecifications((prev) =>
                          prev.map((item) =>
                            item.id === row.id
                              ? { ...item, value: e.target.value }
                              : item,
                          ),
                        )
                      }
                    />
                    <button
                      type="button"
                      className="rounded border border-rose-300 px-2 py-1 text-xs text-rose-700 dark:border-rose-700 dark:text-rose-300"
                      onClick={() =>
                        setEditSpecifications((prev) =>
                          prev.length > 1
                            ? prev.filter((item) => item.id !== row.id)
                            : [createSpecificationRow()],
                        )
                      }
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              <div className="space-y-2 md:col-span-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Variants</p>
                  <button
                    type="button"
                    className="rounded border border-slate-300 px-2 py-1 text-xs dark:border-slate-700"
                    onClick={() =>
                      setEditVariants((prev) => [...prev, createVariantRow()])
                    }
                  >
                    + Add variant
                  </button>
                </div>
                {editVariants.map((row) => (
                  <div
                    key={row.id}
                    className="grid grid-cols-2 gap-2 md:grid-cols-5"
                  >
                    <input
                      className="rounded-lg border border-slate-300 bg-transparent px-2 py-2 text-xs dark:border-slate-700"
                      placeholder="SKU"
                      value={row.sku}
                      onChange={(e) =>
                        setEditVariants((prev) =>
                          prev.map((item) =>
                            item.id === row.id
                              ? { ...item, sku: e.target.value }
                              : item,
                          ),
                        )
                      }
                    />
                    <input
                      className="rounded-lg border border-slate-300 bg-transparent px-2 py-2 text-xs dark:border-slate-700"
                      placeholder="Price"
                      value={row.price}
                      onChange={(e) =>
                        setEditVariants((prev) =>
                          prev.map((item) =>
                            item.id === row.id
                              ? { ...item, price: e.target.value }
                              : item,
                          ),
                        )
                      }
                    />
                    <input
                      className="rounded-lg border border-slate-300 bg-transparent px-2 py-2 text-xs dark:border-slate-700"
                      placeholder="Qty"
                      value={row.quantity}
                      onChange={(e) =>
                        setEditVariants((prev) =>
                          prev.map((item) =>
                            item.id === row.id
                              ? { ...item, quantity: e.target.value }
                              : item,
                          ),
                        )
                      }
                    />
                    <input
                      className="rounded-lg border border-slate-300 bg-transparent px-2 py-2 text-xs dark:border-slate-700"
                      placeholder="Color"
                      value={row.color}
                      onChange={(e) =>
                        setEditVariants((prev) =>
                          prev.map((item) =>
                            item.id === row.id
                              ? { ...item, color: e.target.value }
                              : item,
                          ),
                        )
                      }
                    />
                    <input
                      className="rounded-lg border border-slate-300 bg-transparent px-2 py-2 text-xs dark:border-slate-700"
                      placeholder="Size"
                      value={row.size}
                      onChange={(e) =>
                        setEditVariants((prev) =>
                          prev.map((item) =>
                            item.id === row.id
                              ? { ...item, size: e.target.value }
                              : item,
                          ),
                        )
                      }
                    />
                    <input
                      className="rounded-lg border border-slate-300 bg-transparent px-2 py-2 text-xs dark:border-slate-700"
                      placeholder="Make"
                      value={row.make}
                      onChange={(e) =>
                        setEditVariants((prev) =>
                          prev.map((item) =>
                            item.id === row.id
                              ? { ...item, make: e.target.value }
                              : item,
                          ),
                        )
                      }
                    />
                    <input
                      className="rounded-lg border border-slate-300 bg-transparent px-2 py-2 text-xs dark:border-slate-700"
                      placeholder="Model"
                      value={row.model}
                      onChange={(e) =>
                        setEditVariants((prev) =>
                          prev.map((item) =>
                            item.id === row.id
                              ? { ...item, model: e.target.value }
                              : item,
                          ),
                        )
                      }
                    />
                    <input
                      className="rounded-lg border border-slate-300 bg-transparent px-2 py-2 text-xs dark:border-slate-700"
                      placeholder="Year"
                      value={row.year}
                      onChange={(e) =>
                        setEditVariants((prev) =>
                          prev.map((item) =>
                            item.id === row.id
                              ? { ...item, year: e.target.value }
                              : item,
                          ),
                        )
                      }
                    />
                    <button
                      type="button"
                      className="rounded border border-rose-300 px-2 py-1 text-xs text-rose-700 dark:border-rose-700 dark:text-rose-300"
                      onClick={() =>
                        setEditVariants((prev) =>
                          prev.length > 1
                            ? prev.filter((item) => item.id !== row.id)
                            : [createVariantRow()],
                        )
                      }
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-4 text-sm">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editForm.is_active}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        is_active: e.target.checked,
                      }))
                    }
                  />{" "}
                  {t("vendor_products_active")}
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editForm.is_featured}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        is_featured: e.target.checked,
                      }))
                    }
                  />{" "}
                  {t("vendor_products_featured")}
                </label>
              </div>

              <label className="text-sm md:col-span-2">
                {t("vendor_products_replace_images")}
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="mt-1 block w-full"
                  onChange={(e) =>
                    setEditImages(Array.from(e.target.files ?? []))
                  }
                />
              </label>

              <label className="text-sm md:col-span-2">
                {t("vendor_products_replace_videos")}
                <input
                  type="file"
                  multiple
                  accept="video/*"
                  className="mt-1 block w-full"
                  onChange={(e) =>
                    setEditVideos(Array.from(e.target.files ?? []))
                  }
                />
              </label>

              <button
                type="submit"
                className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-slate-950 md:col-span-2"
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending
                  ? t("vendor_products_saving")
                  : t("vendor_products_save_changes")}
              </button>
            </fieldset>
          </form>
        </section>
      ) : null}

      {productsQuery.isLoading ? (
        <p className="text-sm text-muted">{t("vendor_products_loading")}</p>
      ) : null}

      <section className="space-y-4">
        {products.map((product) => (
          <article
            key={product.id}
            className="rounded-2xl bg-card p-5 shadow-soft md:p-7"
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-lg font-semibold">{product.name}</h3>
                <p className="text-sm text-muted">
                  {t("field_sku")}: {product.sku || "-"}
                </p>
                <p className="text-sm text-muted">
                  {t("field_price")}: ${Number(product.price).toFixed(2)} |{" "}
                  {t("field_quantity")}: {product.quantity ?? 0}
                </p>
                <p className="text-sm text-muted">
                  {t("vendor_status")}:{" "}
                  {product.is_active
                    ? t("profile_active")
                    : t("profile_inactive")}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="rounded-lg border border-slate-300 px-3 py-1 text-sm disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700"
                  onClick={() => startEdit(product)}
                  disabled={isProductBusy(product.id)}
                >
                  {isProductBusy(product.id)
                    ? t("common_working")
                    : t("admin_edit")}
                </button>
                <button
                  type="button"
                  className="rounded-lg bg-rose-100 px-3 py-1 text-sm text-rose-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-rose-900/40 dark:text-rose-300"
                  onClick={() => handleDelete(product.id)}
                  disabled={isProductBusy(product.id)}
                >
                  {t("admin_delete")}
                </button>
              </div>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <section>
                <div className="mb-2 flex items-center justify-between">
                  <h4 className="font-medium">{t("vendor_products_images")}</h4>
                  <label
                    className={`cursor-pointer rounded-lg border border-slate-300 px-3 py-1 text-xs dark:border-slate-700 ${isProductBusy(product.id) ? "pointer-events-none opacity-50" : ""}`}
                  >
                    {t("common_upload")}
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      disabled={isProductBusy(product.id)}
                      onChange={(e) =>
                        handleUploadImages(
                          product.id,
                          Array.from(e.target.files ?? []),
                        )
                      }
                    />
                  </label>
                </div>

                <div className="space-y-2">
                  {(tempImageUploads[product.id] ?? []).map((image) => (
                    <div
                      key={image.id}
                      className="rounded-lg border border-dashed border-cyan-400/50 bg-cyan-50/40 p-2 dark:border-cyan-500/50 dark:bg-cyan-900/20"
                    >
                      <img
                        src={image.url}
                        alt={image.name}
                        className="mb-2 h-28 w-full rounded object-cover"
                      />
                      <p className="truncate text-xs text-muted">
                        {image.name}
                      </p>
                      <p className="text-[11px] text-cyan-700 dark:text-cyan-300">
                        {t("common_uploading")}
                      </p>
                    </div>
                  ))}

                  {(product.images ?? []).map((image) => (
                    <div
                      key={image.id}
                      className="flex items-center justify-between rounded-lg border border-slate-200 p-2 dark:border-slate-700"
                    >
                      <a
                        href={image.image || "#"}
                        target="_blank"
                        rel="noreferrer"
                        className="truncate text-xs text-accent"
                      >
                        {image.image || t("common_image")}
                      </a>
                      <div className="flex gap-2">
                        {!image.is_primary ? (
                          <button
                            type="button"
                            className="rounded border border-slate-300 px-2 py-0.5 text-xs disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700"
                            disabled={isProductBusy(product.id)}
                            onClick={async () => {
                              await runProductAction(
                                product.id,
                                () =>
                                  setPrimaryImageMutation
                                    .mutateAsync({
                                      productId: product.id,
                                      imageId: image.id,
                                    })
                                    .then(() => undefined),
                                t("vendor_products_primary_updated"),
                              );
                            }}
                          >
                            {t("vendor_products_set_primary")}
                          </button>
                        ) : (
                          <span className="rounded bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                            {t("vendor_products_primary")}
                          </span>
                        )}
                        <button
                          type="button"
                          className="rounded bg-rose-100 px-2 py-0.5 text-xs text-rose-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-rose-900/40 dark:text-rose-300"
                          disabled={isProductBusy(product.id)}
                          onClick={async () => {
                            await runProductAction(
                              product.id,
                              () =>
                                deleteImageMutation
                                  .mutateAsync({
                                    productId: product.id,
                                    imageId: image.id,
                                  })
                                  .then(() => undefined),
                              t("vendor_products_image_deleted"),
                            );
                          }}
                        >
                          {t("admin_delete")}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <div className="mb-2 flex items-center justify-between">
                  <h4 className="font-medium">{t("vendor_products_videos")}</h4>
                  <label
                    className={`cursor-pointer rounded-lg border border-slate-300 px-3 py-1 text-xs dark:border-slate-700 ${isProductBusy(product.id) ? "pointer-events-none opacity-50" : ""}`}
                  >
                    {t("common_upload")}
                    <input
                      type="file"
                      multiple
                      accept="video/*"
                      className="hidden"
                      disabled={isProductBusy(product.id)}
                      onChange={(e) =>
                        handleUploadVideos(
                          product.id,
                          Array.from(e.target.files ?? []),
                        )
                      }
                    />
                  </label>
                </div>

                <div className="space-y-2">
                  {(tempVideoUploads[product.id] ?? []).map((video) => (
                    <div
                      key={video.id}
                      className="rounded-lg border border-dashed border-cyan-400/50 bg-cyan-50/40 p-2 dark:border-cyan-500/50 dark:bg-cyan-900/20"
                    >
                      <video
                        src={video.url}
                        className="mb-2 h-28 w-full rounded object-cover"
                        muted
                        controls
                      />
                      <p className="truncate text-xs text-muted">
                        {video.name}
                      </p>
                      <p className="text-[11px] text-cyan-700 dark:text-cyan-300">
                        {t("common_uploading")}
                      </p>
                    </div>
                  ))}

                  {(product.videos ?? []).map((video) => (
                    <div
                      key={video.id}
                      className="flex items-center justify-between rounded-lg border border-slate-200 p-2 dark:border-slate-700"
                    >
                      <a
                        href={video.video || "#"}
                        target="_blank"
                        rel="noreferrer"
                        className="truncate text-xs text-accent"
                      >
                        {video.title || video.video || t("common_video")}
                      </a>
                      <button
                        type="button"
                        className="rounded bg-rose-100 px-2 py-0.5 text-xs text-rose-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-rose-900/40 dark:text-rose-300"
                        disabled={isProductBusy(product.id)}
                        onClick={async () => {
                          await runProductAction(
                            product.id,
                            () =>
                              deleteVideoMutation
                                .mutateAsync({
                                  productId: product.id,
                                  videoId: video.id,
                                })
                                .then(() => undefined),
                            t("vendor_products_video_deleted"),
                          );
                        }}
                      >
                        {t("admin_delete")}
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </article>
        ))}

        {!productsQuery.isLoading && products.length === 0 ? (
          <p className="text-sm text-muted">
            {t("vendor_products_no_products")}
          </p>
        ) : null}
      </section>

      {paginationMeta ? (
        <PaginationControls
          currentPage={paginationMeta.current_page}
          lastPage={paginationMeta.last_page}
          onPageChange={setPage}
          disabled={productsQuery.isFetching}
        />
      ) : null}
    </main>
  );
}
