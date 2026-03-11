"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Boxes,
  ImagePlus,
  PencilLine,
  ShieldCheck,
  Sparkles,
  Star,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";
import { PaginationControls } from "../../../src/components/pagination-controls";
import {
  useAdminCategories,
  useAdminProduct,
  useCreateAdminProduct,
  useDeleteAdminProductImage,
  useDeleteAdminProductVideo,
  useAdminProducts,
  useDeleteProduct,
  useSetAdminProductPrimaryImage,
  useToggleProductActive,
  useToggleProductFeatured,
  useUpdateAdminProduct,
} from "../../../src/hooks/use-admin";
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

type ProductForm = {
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

const EMPTY_FORM: ProductForm = {
  name: "",
  name_en: "",
  product_type: "general",
  description: "",
  description_en: "",
  price: "",
  old_price: "",
  cost_price: "",
  sku: "",
  quantity: "0",
  category_id: "",
  is_active: true,
  is_featured: false,
};

const sectionVariant = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0 },
};

export default function AdminProductsPage() {
  const [page, setPage] = useState(1);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ProductForm>(EMPTY_FORM);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [videoFiles, setVideoFiles] = useState<File[]>([]);
  const [specifications, setSpecifications] = useState<SpecificationRow[]>([
    createSpecificationRow(),
  ]);
  const [variants, setVariants] = useState<VariantRow[]>([createVariantRow()]);

  const productsQuery = useAdminProducts(page);
  const categoriesQuery = useAdminCategories();
  const productDetailsQuery = useAdminProduct(editingId);

  const toggleActiveMutation = useToggleProductActive();
  const toggleFeaturedMutation = useToggleProductFeatured();
  const deleteMutation = useDeleteProduct();
  const deleteImageMutation = useDeleteAdminProductImage();
  const deleteVideoMutation = useDeleteAdminProductVideo();
  const setPrimaryMutation = useSetAdminProductPrimaryImage();
  const createMutation = useCreateAdminProduct();
  const updateMutation = useUpdateAdminProduct();
  const { t } = useLanguage();

  const products = productsQuery.data?.data ?? [];
  const categories = categoriesQuery.data ?? [];
  const categoryOptions = useMemo(() => {
    const flatten = (
      nodes: typeof categories,
      depth = 0,
    ): Array<(typeof categories)[number] & { depth: number }> => {
      return nodes.flatMap((node) => {
        const current = [{ ...node, depth }];

        if (!node.children?.length) {
          return current;
        }

        return [...current, ...flatten(node.children, depth + 1)];
      });
    };

    return flatten(categories);
  }, [categories]);
  const paginationMeta = productsQuery.data?.meta;
  const existingImages = productDetailsQuery.data?.images ?? [];
  const existingVideos = productDetailsQuery.data?.videos ?? [];
  const primaryImageId = productDetailsQuery.data?.primary_image?.id;
  const activeCount = products.filter((product) => product.is_active).length;
  const featuredCount = products.filter(
    (product) => product.is_featured,
  ).length;
  const lowStockCount = products.filter(
    (product) => (product.quantity ?? 0) < 5,
  ).length;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!form.category_id) {
      toast.error(t("admin_products_select_category"));
      return;
    }

    const payload = {
      name: form.name,
      name_en: form.name_en,
      product_type: form.product_type,
      description: form.description,
      description_en: form.description_en,
      specifications: toSpecificationsObject(specifications),
      price: Number(form.price),
      old_price: form.old_price ? Number(form.old_price) : null,
      cost_price: form.cost_price ? Number(form.cost_price) : null,
      sku: form.sku || null,
      quantity: Number(form.quantity),
      variants: toVariantsPayload(variants),
      category_id: Number(form.category_id),
      is_active: form.is_active,
      is_featured: form.is_featured,
      images: imageFiles,
      videos: videoFiles,
    };

    try {
      if (editingId) {
        await updateMutation.mutateAsync({
          productId: editingId,
          body: payload,
        });
        toast.success(t("admin_products_updated"));
      } else {
        await createMutation.mutateAsync(payload);
        toast.success(t("admin_products_created"));
      }

      setEditingId(null);
      setForm(EMPTY_FORM);
      setImageFiles([]);
      setVideoFiles([]);
      setSpecifications([createSpecificationRow()]);
      setVariants([createVariantRow()]);
    } catch (error) {
      toast.error(getApiErrorMessages(error).join(" | "));
    }
  };

  const startEdit = (product: (typeof products)[number]) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      name_en: product.name_en ?? product.name,
      product_type:
        product.product_type === "clothing" ||
        product.product_type === "automotive" ||
        product.product_type === "food" ||
        product.product_type === "electronics" ||
        product.product_type === "other"
          ? product.product_type
          : "general",
      description: product.description ?? "",
      description_en: product.description_en ?? product.description ?? "",
      price: String(product.price ?? ""),
      old_price: product.old_price == null ? "" : String(product.old_price),
      cost_price: product.cost_price == null ? "" : String(product.cost_price),
      sku: product.sku ?? "",
      quantity: String(product.quantity ?? 0),
      category_id: String(product.category?.id ?? ""),
      is_active: Boolean(product.is_active),
      is_featured: Boolean(product.is_featured),
    });
    setImageFiles([]);
    setVideoFiles([]);
    setSpecifications(fromSpecificationsObject(product.specifications));
    setVariants(fromVariants(product.variants));
  };

  const removeExistingImage = async (productId: number, imageId: number) => {
    try {
      await deleteImageMutation.mutateAsync({ productId, imageId });
      toast.success(t("admin_products_image_deleted"));
    } catch (error) {
      toast.error(getApiErrorMessages(error).join(" | "));
    }
  };

  const removeExistingVideo = async (productId: number, videoId: number) => {
    try {
      await deleteVideoMutation.mutateAsync({ productId, videoId });
      toast.success(t("admin_products_video_deleted"));
    } catch (error) {
      toast.error(getApiErrorMessages(error).join(" | "));
    }
  };

  const makePrimaryImage = async (productId: number, imageId: number) => {
    try {
      await setPrimaryMutation.mutateAsync({ productId, imageId });
      toast.success(t("admin_products_primary_updated"));
    } catch (error) {
      toast.error(getApiErrorMessages(error).join(" | "));
    }
  };

  const toggleActive = async (productId: number) => {
    try {
      await toggleActiveMutation.mutateAsync(productId);
      toast.success(t("admin_products_active_updated"));
    } catch (error) {
      toast.error(getApiErrorMessages(error).join(" | "));
    }
  };

  const toggleFeatured = async (productId: number) => {
    try {
      await toggleFeaturedMutation.mutateAsync(productId);
      toast.success(t("admin_products_featured_updated"));
    } catch (error) {
      toast.error(getApiErrorMessages(error).join(" | "));
    }
  };

  const deleteProduct = async (productId: number) => {
    try {
      await deleteMutation.mutateAsync(productId);
      toast.success(t("admin_products_deleted"));
    } catch (error) {
      toast.error(getApiErrorMessages(error).join(" | "));
    }
  };

  return (
    <motion.main
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="mx-auto min-h-screen w-full max-w-6xl space-y-6 p-6 md:p-10"
    >
      <motion.section
        variants={sectionVariant}
        initial="hidden"
        animate="show"
        transition={{ duration: 0.3 }}
        className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-br from-white via-teal-50 to-cyan-100 p-6 shadow-soft dark:border-slate-700/70 dark:from-slate-900 dark:via-slate-900 dark:to-cyan-950"
      >
        <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-cyan-300/40 blur-3xl dark:bg-cyan-700/30" />
        <div className="absolute -bottom-8 left-24 h-28 w-28 rounded-full bg-teal-300/40 blur-2xl dark:bg-teal-700/20" />
        <div className="relative flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700 dark:bg-slate-800/80 dark:text-slate-200">
              <Sparkles className="h-3.5 w-3.5" />
              {t("admin_products_premium")}
            </p>
            <h1 className="text-3xl font-black tracking-tight md:text-4xl">
              {t("admin_products_command_center")}
            </h1>
            <p className="mt-1 text-sm text-muted">
              {t("admin_products_subtitle")}
            </p>
          </div>
        </div>
      </motion.section>

      <motion.section
        variants={sectionVariant}
        initial="hidden"
        animate="show"
        transition={{ delay: 0.05, duration: 0.3 }}
        className="grid grid-cols-1 gap-3 md:grid-cols-3"
      >
        {[
          {
            label: t("admin_products_total"),
            value: products.length,
            Icon: Boxes,
          },
          {
            label: t("admin_products_active"),
            value: activeCount,
            Icon: ShieldCheck,
          },
          {
            label: t("admin_products_featured"),
            value: featuredCount,
            Icon: Star,
          },
        ].map(({ label, value, Icon }) => (
          <motion.article
            key={label}
            whileHover={{ y: -2, scale: 1.01 }}
            className="rounded-2xl border border-slate-200/80 bg-card p-4 shadow-soft dark:border-slate-700/70"
          >
            <p className="mb-1 text-xs uppercase tracking-[0.2em] text-muted">
              {label}
            </p>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-black">{value}</p>
              <Icon className="h-5 w-5 text-accent" />
            </div>
          </motion.article>
        ))}
      </motion.section>

      <motion.section
        variants={sectionVariant}
        initial="hidden"
        animate="show"
        transition={{ delay: 0.1, duration: 0.3 }}
        className="rounded-2xl border border-slate-200/80 bg-card p-4 shadow-soft dark:border-slate-700/70"
      >
        <h2 className="mb-3 text-lg font-semibold">
          {editingId
            ? t("admin_products_edit_title").replace("{id}", String(editingId))
            : t("admin_products_create_title")}
        </h2>

        <form
          onSubmit={submit}
          className="grid grid-cols-1 gap-3 md:grid-cols-2"
        >
          <input
            className="rounded-lg border border-slate-300 bg-transparent px-3 py-2 text-sm dark:border-slate-700"
            placeholder={t("field_name")}
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            required
          />
          <input
            className="rounded-lg border border-slate-300 bg-transparent px-3 py-2 text-sm dark:border-slate-700"
            placeholder={t("field_name_en")}
            value={form.name_en}
            onChange={(e) =>
              setForm((p) => ({ ...p, name_en: e.target.value }))
            }
            required
          />
          <textarea
            className="rounded-lg border border-slate-300 bg-transparent px-3 py-2 text-sm dark:border-slate-700"
            placeholder={t("field_description")}
            value={form.description}
            onChange={(e) =>
              setForm((p) => ({ ...p, description: e.target.value }))
            }
            required
          />
          <textarea
            className="rounded-lg border border-slate-300 bg-transparent px-3 py-2 text-sm dark:border-slate-700"
            placeholder={t("field_description_en")}
            value={form.description_en}
            onChange={(e) =>
              setForm((p) => ({ ...p, description_en: e.target.value }))
            }
            required
          />
          <input
            type="number"
            min="0"
            step="0.01"
            className="rounded-lg border border-slate-300 bg-transparent px-3 py-2 text-sm dark:border-slate-700"
            placeholder={t("field_price")}
            value={form.price}
            onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
            required
          />

          <select
            className="rounded-lg border border-slate-300 bg-transparent px-3 py-2 text-sm dark:border-slate-700"
            value={form.product_type}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                product_type: e.target.value as ProductForm["product_type"],
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
          <input
            type="number"
            min="0"
            step="0.01"
            className="rounded-lg border border-slate-300 bg-transparent px-3 py-2 text-sm dark:border-slate-700"
            placeholder={t("field_old_price")}
            value={form.old_price}
            onChange={(e) =>
              setForm((p) => ({ ...p, old_price: e.target.value }))
            }
          />
          <input
            type="number"
            min="0"
            step="0.01"
            className="rounded-lg border border-slate-300 bg-transparent px-3 py-2 text-sm dark:border-slate-700"
            placeholder={t("field_cost_price")}
            value={form.cost_price}
            onChange={(e) =>
              setForm((p) => ({ ...p, cost_price: e.target.value }))
            }
          />
          <input
            className="rounded-lg border border-slate-300 bg-transparent px-3 py-2 text-sm dark:border-slate-700"
            placeholder={t("field_sku")}
            value={form.sku}
            onChange={(e) => setForm((p) => ({ ...p, sku: e.target.value }))}
          />
          <input
            type="number"
            min="0"
            className="rounded-lg border border-slate-300 bg-transparent px-3 py-2 text-sm dark:border-slate-700"
            placeholder={t("field_quantity")}
            value={form.quantity}
            onChange={(e) =>
              setForm((p) => ({ ...p, quantity: e.target.value }))
            }
            required
          />

          <select
            className="rounded-lg border border-slate-300 bg-transparent px-3 py-2 text-sm dark:border-slate-700"
            value={form.category_id}
            onChange={(e) =>
              setForm((p) => ({ ...p, category_id: e.target.value }))
            }
            required
          >
            <option value="">{t("admin_products_select_category")}</option>
            {categoryOptions.map((category) => (
              <option key={category.id} value={category.id}>
                {`${"  ".repeat(category.depth)}${category.name}`}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-4 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) =>
                  setForm((p) => ({ ...p, is_active: e.target.checked }))
                }
              />{" "}
              {t("admin_products_active")}
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.is_featured}
                onChange={(e) =>
                  setForm((p) => ({ ...p, is_featured: e.target.checked }))
                }
              />{" "}
              {t("admin_products_featured")}
            </label>
          </div>

          <div className="md:col-span-2 grid grid-cols-1 gap-3 md:grid-cols-2">
            <label className="space-y-1 text-sm">
              <span className="text-muted">
                {t("admin_products_upload_images")}
              </span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-slate-200 file:px-3 file:py-1 file:text-xs file:font-semibold dark:border-slate-700 dark:file:bg-slate-800"
                onChange={(e) =>
                  setImageFiles(Array.from(e.currentTarget.files ?? []))
                }
              />
            </label>

            <label className="space-y-1 text-sm">
              <span className="text-muted">
                {t("admin_products_upload_videos")}
              </span>
              <input
                type="file"
                accept="video/mp4,video/quicktime,video/x-msvideo"
                multiple
                className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-slate-200 file:px-3 file:py-1 file:text-xs file:font-semibold dark:border-slate-700 dark:file:bg-slate-800"
                onChange={(e) =>
                  setVideoFiles(Array.from(e.currentTarget.files ?? []))
                }
              />
            </label>
          </div>

          <div className="space-y-2 md:col-span-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Specifications</p>
              <button
                type="button"
                className="rounded border border-slate-300 px-2 py-1 text-xs dark:border-slate-700"
                onClick={() =>
                  setSpecifications((prev) => [
                    ...prev,
                    createSpecificationRow(),
                  ])
                }
              >
                + Add spec
              </button>
            </div>
            {specifications.map((row) => (
              <div
                key={row.id}
                className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_1fr_auto]"
              >
                <input
                  className="rounded-lg border border-slate-300 bg-transparent px-3 py-2 text-sm dark:border-slate-700"
                  placeholder="Key"
                  value={row.key}
                  onChange={(e) =>
                    setSpecifications((prev) =>
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
                    setSpecifications((prev) =>
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
                    setSpecifications((prev) =>
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
              <p className="text-sm font-semibold">Variants</p>
              <button
                type="button"
                className="rounded border border-slate-300 px-2 py-1 text-xs dark:border-slate-700"
                onClick={() =>
                  setVariants((prev) => [...prev, createVariantRow()])
                }
              >
                + Add variant
              </button>
            </div>
            {variants.map((row) => (
              <div
                key={row.id}
                className="grid grid-cols-2 gap-2 md:grid-cols-5"
              >
                <input
                  className="rounded-lg border border-slate-300 bg-transparent px-2 py-2 text-xs dark:border-slate-700"
                  placeholder="SKU"
                  value={row.sku}
                  onChange={(e) =>
                    setVariants((prev) =>
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
                    setVariants((prev) =>
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
                    setVariants((prev) =>
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
                    setVariants((prev) =>
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
                    setVariants((prev) =>
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
                    setVariants((prev) =>
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
                    setVariants((prev) =>
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
                    setVariants((prev) =>
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
                    setVariants((prev) =>
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

          {editingId ? (
            <div className="md:col-span-2 grid grid-cols-1 gap-3 lg:grid-cols-2">
              <div className="rounded-xl border border-slate-200/80 p-3 dark:border-slate-700">
                <p className="mb-2 text-sm font-semibold">
                  {t("admin_products_existing_images")}
                </p>

                {productDetailsQuery.isLoading ? (
                  <p className="text-xs text-muted">
                    {t("admin_products_loading_media")}
                  </p>
                ) : null}

                {!productDetailsQuery.isLoading &&
                existingImages.length === 0 ? (
                  <p className="text-xs text-muted">
                    {t("admin_products_no_images")}
                  </p>
                ) : null}

                <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                  {existingImages.map((image) => (
                    <div
                      key={image.id}
                      className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700"
                    >
                      <img
                        src={image.image ?? ""}
                        alt={t("common_product")}
                        className="h-24 w-full object-cover"
                      />
                      <div className="space-y-1 p-2">
                        {primaryImageId === image.id ? (
                          <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                            {t("admin_products_primary_image")}
                          </p>
                        ) : (
                          <button
                            type="button"
                            className="text-[11px] text-accent"
                            onClick={() =>
                              editingId && makePrimaryImage(editingId, image.id)
                            }
                            disabled={setPrimaryMutation.isPending}
                          >
                            {t("admin_products_set_primary")}
                          </button>
                        )}
                        <button
                          type="button"
                          className="text-[11px] text-rose-600 dark:text-rose-400"
                          onClick={() =>
                            editingId &&
                            removeExistingImage(editingId, image.id)
                          }
                          disabled={deleteImageMutation.isPending}
                        >
                          {t("admin_products_delete_image")}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-slate-200/80 p-3 dark:border-slate-700">
                <p className="mb-2 text-sm font-semibold">
                  {t("admin_products_existing_videos")}
                </p>

                {productDetailsQuery.isLoading ? (
                  <p className="text-xs text-muted">
                    {t("admin_products_loading_media")}
                  </p>
                ) : null}

                {!productDetailsQuery.isLoading &&
                existingVideos.length === 0 ? (
                  <p className="text-xs text-muted">
                    {t("admin_products_no_videos")}
                  </p>
                ) : null}

                <div className="space-y-2">
                  {existingVideos.map((video) => (
                    <div
                      key={video.id}
                      className="rounded-lg border border-slate-200 p-2 dark:border-slate-700"
                    >
                      <video
                        src={video.video ?? ""}
                        controls
                        className="h-24 w-full rounded-md object-cover"
                      />
                      <button
                        type="button"
                        className="mt-2 text-[11px] text-rose-600 dark:text-rose-400"
                        onClick={() =>
                          editingId && removeExistingVideo(editingId, video.id)
                        }
                        disabled={deleteVideoMutation.isPending}
                      >
                        {t("admin_products_delete_video")}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          <div className="md:col-span-2 flex flex-wrap gap-2">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-slate-950"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              <PencilLine className="h-4 w-4" />
              {editingId ? t("common_save") : t("common_create")}
            </button>
            {editingId ? (
              <button
                type="button"
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm dark:border-slate-700"
                onClick={() => {
                  setEditingId(null);
                  setForm(EMPTY_FORM);
                  setImageFiles([]);
                  setVideoFiles([]);
                  setSpecifications([createSpecificationRow()]);
                  setVariants([createVariantRow()]);
                }}
              >
                {t("common_cancel")}
              </button>
            ) : null}
            <span className="ml-auto inline-flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-xs text-muted dark:bg-slate-800">
              <Boxes className="h-3.5 w-3.5" />
              {t("admin_products_low_stock")}: {lowStockCount}
            </span>
          </div>
        </form>
      </motion.section>

      {productsQuery.isLoading ? (
        <p className="text-sm text-muted">{t("admin_products_loading")}</p>
      ) : null}

      {productsQuery.isError ? (
        <div className="space-y-2 rounded-xl bg-rose-100 px-4 py-2 text-sm text-rose-700 dark:bg-rose-900/40 dark:text-rose-300">
          {getApiErrorMessages(productsQuery.error).map((message, i) => (
            <p key={`${message}-${i}`}>{message}</p>
          ))}
        </div>
      ) : null}

      <section className="space-y-3">
        <AnimatePresence initial={false} mode="popLayout">
          {products.map((product, index) => (
            <motion.article
              key={product.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ delay: index * 0.02, duration: 0.2 }}
              whileHover={{ y: -2 }}
              className="rounded-2xl border border-slate-200/80 bg-card p-4 shadow-soft dark:border-slate-700/70"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="font-semibold">{product.name}</h2>
                  <p className="text-sm text-muted">
                    {t("field_sku")}: {product.sku || "-"}
                  </p>
                  <p className="text-sm text-muted">
                    {t("product_stock")}: {product.quantity ?? 0}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1 text-sm dark:border-slate-700"
                    onClick={() => startEdit(product)}
                  >
                    <PencilLine className="h-3.5 w-3.5" />
                    {t("admin_edit")}
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1 text-sm dark:border-slate-700"
                    onClick={() => toggleActive(product.id)}
                  >
                    <ShieldCheck className="h-3.5 w-3.5" />
                    {t("admin_products_toggle_active")}
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1 text-sm dark:border-slate-700"
                    onClick={() => toggleFeatured(product.id)}
                  >
                    <Star className="h-3.5 w-3.5" />
                    {t("admin_products_toggle_featured")}
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-rose-100 px-3 py-1 text-sm text-rose-700 dark:bg-rose-900/40 dark:text-rose-300"
                    onClick={() => deleteProduct(product.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    {t("admin_delete")}
                  </button>
                </div>
              </div>
            </motion.article>
          ))}
        </AnimatePresence>

        {products.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-2xl border border-dashed border-slate-300/80 bg-card/60 p-8 text-center text-sm text-muted dark:border-slate-700"
          >
            <ImagePlus className="mx-auto mb-2 h-5 w-5" />
            {t("admin_products_no_products")}
          </motion.div>
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
    </motion.main>
  );
}
