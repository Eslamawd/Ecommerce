"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  useAddCartItem,
  useToggleWishlist,
  useWishlist,
} from "../../../src/hooks/use-cart";
import { formatDate } from "../../../src/lib/date";
import { useProducts } from "../../../src/hooks/use-products";
import { useProductReviews } from "../../../src/hooks/use-reviews";
import { getApiErrorMessages } from "../../../src/lib/api-client";
import { useLanguage } from "../../../src/components/language-provider";
import type { Product } from "../../../src/types/product";

type ProductDetailsClientProps = {
  product: Product;
};

export default function ProductDetailsClient({
  product,
}: ProductDetailsClientProps) {
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const { language, setLanguage, t } = useLanguage();

  const productsQuery = useProducts();
  const reviewsQuery = useProductReviews(product.id);
  const reviews = reviewsQuery.data?.data ?? [];
  const addCartMutation = useAddCartItem();
  const toggleWishlistMutation = useToggleWishlist();
  const wishlistQuery = useWishlist();
  const wishlistIds = useMemo(
    () => new Set((wishlistQuery.data ?? []).map((item) => item.id)),
    [wishlistQuery.data],
  );

  const galleryImages = [
    ...(product.primary_image ? [product.primary_image] : []),
    ...(product.images ?? []),
  ].filter((item, index, self) => {
    const key = item.id;
    return self.findIndex((entry) => entry.id === key) === index;
  });

  const mediaItems = useMemo(() => {
    const images = galleryImages
      .filter((item) => Boolean(item.image))
      .map((item) => ({
        key: `img-${item.id}`,
        type: "image" as const,
        src: item.image as string,
      }));

    const videos = (product.videos ?? [])
      .filter((item) => Boolean(item.video))
      .map((item) => ({
        key: `vid-${item.id}`,
        type: "video" as const,
        src: item.video as string,
      }));

    return [...images, ...videos];
  }, [galleryImages, product.videos]);

  const activeMedia = mediaItems[activeMediaIndex] ?? null;

  useEffect(() => {
    setActiveMediaIndex(0);
  }, [product.id]);

  const productName =
    language === "en" ? (product.name_en ?? product.name) : product.name;
  const productDescription =
    language === "en"
      ? (product.description_en ?? product.description)
      : product.description;
  const categoryName =
    language === "en"
      ? (product.category?.name_en ?? product.category?.name)
      : product.category?.name;

  const relatedProducts = useMemo(() => {
    const allProducts = productsQuery.data ?? [];

    return allProducts
      .filter((item) => item.id !== product.id)
      .filter(
        (item) =>
          item.category?.id && item.category.id === product.category?.id,
      )
      .slice(0, 6);
  }, [product.id, product.category?.id, productsQuery.data]);

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl space-y-8 p-6 md:p-10">
      <section className="grid grid-cols-1 gap-6 rounded-2xl bg-card p-5 shadow-soft md:grid-cols-2 md:p-7">
        <div className="space-y-3">
          {mediaItems.length ? (
            <div className="space-y-3">
              <div className="relative overflow-hidden rounded-xl border border-slate-200/80 dark:border-slate-700/80">
                {activeMedia?.type === "video" ? (
                  <video
                    src={activeMedia.src}
                    controls
                    className="h-64 w-full object-cover md:h-80"
                  />
                ) : (
                  <img
                    src={activeMedia?.src ?? ""}
                    alt={productName ?? product.name}
                    className="h-64 w-full object-cover md:h-80"
                  />
                )}

                {mediaItems.length > 1 ? (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        setActiveMediaIndex((prev) =>
                          prev === 0 ? mediaItems.length - 1 : prev - 1,
                        )
                      }
                      className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/55 px-3 py-2 text-xs font-semibold text-white"
                    >
                      {t("slider_prev")}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setActiveMediaIndex((prev) =>
                          prev === mediaItems.length - 1 ? 0 : prev + 1,
                        )
                      }
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/55 px-3 py-2 text-xs font-semibold text-white"
                    >
                      {t("slider_next")}
                    </button>
                  </>
                ) : null}
              </div>

              <div
                dir="rtl"
                className="flex gap-3 overflow-x-auto rounded-xl border border-slate-200 p-2 dark:border-slate-700"
              >
                {mediaItems.map((item, index) => (
                  <button
                    key={item.key}
                    type="button"
                    className={`relative h-24 w-28 shrink-0 overflow-hidden rounded-lg border ${
                      index === activeMediaIndex
                        ? "border-accent ring-1 ring-accent"
                        : "border-slate-300 dark:border-slate-700"
                    }`}
                    onClick={() => setActiveMediaIndex(index)}
                  >
                    {item.type === "video" ? (
                      <>
                        <video
                          src={item.src}
                          className="h-full w-full object-cover"
                          muted
                        />
                        <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white">
                          {t("slider_video")}
                        </span>
                      </>
                    ) : (
                      <img
                        src={item.src}
                        alt={productName ?? product.name}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-52 rounded-xl bg-slate-200/40 dark:bg-slate-700/40" />
          )}
        </div>

        <div className="space-y-4">
          <div className="flex gap-3 text-sm">
            <Link href="/" className="text-accent hover:underline">
              {t("product_back")}
            </Link>
            <Link href="/cart" className="text-accent hover:underline">
              {t("product_cart")}
            </Link>
            <Link href="/wishlist" className="text-accent hover:underline">
              {t("product_wishlist")}
            </Link>
          </div>
          <div className="inline-flex gap-2 rounded-full border border-slate-300 p-1 text-xs dark:border-slate-700">
            <button
              type="button"
              onClick={() => setLanguage("ar")}
              className={`rounded-full px-3 py-1 ${language === "ar" ? "bg-accent font-semibold text-slate-950" : ""}`}
            >
              {t("lang_ar")}
            </button>
            <button
              type="button"
              onClick={() => setLanguage("en")}
              className={`rounded-full px-3 py-1 ${language === "en" ? "bg-accent font-semibold text-slate-950" : ""}`}
            >
              {t("lang_en")}
            </button>
          </div>
          <h1 className="text-3xl font-bold">{productName}</h1>
          <p className="text-sm text-muted">
            {productDescription || t("product_no_description")}
          </p>

          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="rounded-full bg-emerald-100 px-3 py-1 font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
              ${Number(product.price).toFixed(2)}
            </span>
            {product.old_price ? (
              <span className="text-muted line-through">
                ${Number(product.old_price).toFixed(2)}
              </span>
            ) : null}
            <span className="rounded-full border border-slate-300 px-3 py-1 dark:border-slate-600">
              {t("product_stock")}: {product.quantity ?? 0}
            </span>
            {product.category ? (
              <span className="rounded-full border border-slate-300 px-3 py-1 dark:border-slate-600">
                {categoryName}
              </span>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="button"
              className="rounded-xl bg-accent px-4 py-2 text-sm font-medium text-slate-950 transition hover:opacity-90 disabled:opacity-60"
              onClick={() =>
                addCartMutation.mutate({ product_id: product.id, quantity: 1 })
              }
              disabled={addCartMutation.isPending}
            >
              {addCartMutation.isPending
                ? t("product_adding")
                : t("product_add_cart")}
            </button>
            <button
              type="button"
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm transition hover:bg-slate-100 disabled:opacity-60 dark:border-slate-700 dark:hover:bg-slate-800"
              onClick={() => toggleWishlistMutation.mutate(product.id)}
              disabled={toggleWishlistMutation.isPending}
            >
              {wishlistIds.has(product.id)
                ? t("product_remove_wishlist")
                : t("product_add_wishlist")}
            </button>
          </div>

          {addCartMutation.isError ? (
            <div className="rounded-xl bg-rose-100 px-3 py-2 text-sm text-rose-700 dark:bg-rose-900/40 dark:text-rose-300">
              {getApiErrorMessages(addCartMutation.error).map(
                (message, index) => (
                  <p key={`${message}-${index}`}>{message}</p>
                ),
              )}
            </div>
          ) : null}

          {toggleWishlistMutation.isError ? (
            <div className="rounded-xl bg-rose-100 px-3 py-2 text-sm text-rose-700 dark:bg-rose-900/40 dark:text-rose-300">
              {getApiErrorMessages(toggleWishlistMutation.error).map(
                (message, index) => (
                  <p key={`${message}-${index}`}>{message}</p>
                ),
              )}
            </div>
          ) : null}
        </div>
      </section>

      <section className="rounded-2xl bg-card p-5 shadow-soft md:p-7">
        <h2 className="text-xl font-semibold">{t("product_reviews")}</h2>

        {reviewsQuery.isLoading ? (
          <p className="mt-3 text-sm text-muted">
            {t("product_loading_reviews")}
          </p>
        ) : null}

        {reviewsQuery.isError ? (
          <p className="mt-3 rounded-xl border border-rose-300/40 bg-rose-100/70 p-4 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300">
            {(reviewsQuery.error as Error)?.message ??
              t("product_failed_reviews")}
          </p>
        ) : null}

        {!reviewsQuery.isLoading && !reviewsQuery.isError ? (
          <div className="mt-4 space-y-3">
            {reviews.length === 0 ? (
              <p className="text-sm text-muted">{t("product_no_reviews")}</p>
            ) : null}

            {reviews.map((review) => (
              <article
                key={review.id}
                className="rounded-xl border border-slate-200 p-4 dark:border-slate-700"
              >
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">
                    {review.user?.name ?? t("product_anonymous")}
                  </span>
                  <span className="text-amber-500">
                    {"★".repeat(review.rating)}
                  </span>
                </div>
                <p className="mt-2 text-sm text-muted">
                  {review.comment || t("product_no_comment")}
                </p>
                <p className="mt-2 text-xs text-muted">
                  {formatDate(review.created_at)}
                </p>
              </article>
            ))}
          </div>
        ) : null}
      </section>

      <section className="rounded-2xl bg-card p-5 shadow-soft md:p-7">
        <h2 className="text-xl font-semibold">{t("product_related")}</h2>

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {relatedProducts.map((item) => {
            const itemName =
              language === "en" ? (item.name_en ?? item.name) : item.name;
            const itemDescription =
              language === "en"
                ? (item.description_en ?? item.description)
                : item.description;
            const itemImage =
              item.primary_image?.image ?? item.images?.[0]?.image ?? "";

            return (
              <Link
                key={item.id}
                href={`/products/${item.slug}`}
                className="rounded-xl border border-slate-200/80 p-3 transition hover:-translate-y-0.5 hover:shadow-soft dark:border-slate-700/80"
              >
                {itemImage ? (
                  <img
                    src={itemImage}
                    alt={itemName}
                    className="h-36 w-full rounded-lg object-cover"
                  />
                ) : (
                  <div className="h-36 w-full rounded-lg bg-slate-200/50 dark:bg-slate-700/50" />
                )}
                <h3 className="mt-2 font-semibold">{itemName}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-muted">
                  {itemDescription || t("product_no_description")}
                </p>
                <p className="mt-2 text-sm font-semibold text-accent">
                  ${Number(item.price).toFixed(2)}
                </p>
              </Link>
            );
          })}
        </div>

        {relatedProducts.length === 0 ? (
          <p className="mt-3 text-sm text-muted">{t("product_no_related")}</p>
        ) : null}
      </section>
    </main>
  );
}
