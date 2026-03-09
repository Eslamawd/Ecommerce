"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo } from "react";
import {
  useAddCartItem,
  useToggleWishlist,
  useWishlist,
} from "../../../src/hooks/use-cart";
import { formatDate } from "../../../src/lib/date";
import { useProduct } from "../../../src/hooks/use-products";
import { useProductReviews } from "../../../src/hooks/use-reviews";
import { getApiErrorMessages } from "../../../src/lib/api-client";

export default function ProductDetailsPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug ?? "";

  const productQuery = useProduct(slug);
  const product = productQuery.data;
  const reviewsQuery = useProductReviews(product?.id);
  const reviews = reviewsQuery.data?.data ?? [];
  const addCartMutation = useAddCartItem();
  const toggleWishlistMutation = useToggleWishlist();
  const wishlistQuery = useWishlist();
  const wishlistIds = useMemo(
    () => new Set((wishlistQuery.data ?? []).map((item) => item.id)),
    [wishlistQuery.data],
  );

  const galleryImages = [
    ...(product?.primary_image ? [product.primary_image] : []),
    ...(product?.images ?? []),
  ].filter((item, index, self) => {
    const key = item.id;
    return self.findIndex((entry) => entry.id === key) === index;
  });
  const heroImage = galleryImages[0]?.image ?? "";

  if (productQuery.isLoading) {
    return (
      <main className="mx-auto min-h-screen w-full max-w-6xl p-6 md:p-10">
        <div className="h-80 animate-pulse rounded-2xl bg-slate-200/50 dark:bg-slate-700/40" />
      </main>
    );
  }

  if (productQuery.isError || !product) {
    return (
      <main className="mx-auto min-h-screen w-full max-w-4xl p-6 md:p-10">
        <p className="rounded-xl border border-rose-300/40 bg-rose-100/70 p-4 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300">
          {(productQuery.error as Error)?.message ?? "Product not found."}
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl space-y-8 p-6 md:p-10">
      <section className="grid grid-cols-1 gap-6 rounded-2xl bg-card p-5 shadow-soft md:grid-cols-2 md:p-7">
        <div className="space-y-3">
          {galleryImages.length ? (
            <div className="space-y-3">
              <img
                src={heroImage}
                alt={product.name}
                className="h-56 w-full rounded-xl object-cover"
              />

              <div
                dir="rtl"
                className="flex gap-3 overflow-x-auto rounded-xl border border-slate-200 p-2 dark:border-slate-700"
              >
                {galleryImages.map((image) => (
                  <img
                    key={image.id}
                    src={image.image ?? ""}
                    alt={product.name}
                    className="h-24 w-28 shrink-0 rounded-lg object-cover"
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="h-52 rounded-xl bg-slate-200/40 dark:bg-slate-700/40" />
          )}

          {product.videos?.length ? (
            <div className="space-y-2">
              <p className="text-sm font-medium">Product videos</p>
              <div className="grid grid-cols-1 gap-3">
                {product.videos.map((video) => (
                  <video
                    key={video.id}
                    src={video.video ?? ""}
                    controls
                    className="w-full rounded-xl"
                  />
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div className="space-y-4">
          <div className="flex gap-3 text-sm">
            <Link href="/" className="text-accent hover:underline">
              Back to products
            </Link>
            <Link href="/cart" className="text-accent hover:underline">
              Cart
            </Link>
            <Link href="/wishlist" className="text-accent hover:underline">
              Wishlist
            </Link>
          </div>
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <p className="text-sm text-muted">
            {product.description || "No description."}
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
              Stock: {product.quantity ?? 0}
            </span>
            {product.category ? (
              <span className="rounded-full border border-slate-300 px-3 py-1 dark:border-slate-600">
                {product.category.name}
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
              {addCartMutation.isPending ? "Adding..." : "Add to cart"}
            </button>
            <button
              type="button"
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm transition hover:bg-slate-100 disabled:opacity-60 dark:border-slate-700 dark:hover:bg-slate-800"
              onClick={() => toggleWishlistMutation.mutate(product.id)}
              disabled={toggleWishlistMutation.isPending}
            >
              {wishlistIds.has(product.id)
                ? "Remove from wishlist"
                : "Add to wishlist"}
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
        <h2 className="text-xl font-semibold">Reviews</h2>

        {reviewsQuery.isLoading ? (
          <p className="mt-3 text-sm text-muted">Loading reviews...</p>
        ) : null}

        {reviewsQuery.isError ? (
          <p className="mt-3 rounded-xl border border-rose-300/40 bg-rose-100/70 p-4 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300">
            {(reviewsQuery.error as Error)?.message ??
              "Failed to load reviews."}
          </p>
        ) : null}

        {!reviewsQuery.isLoading && !reviewsQuery.isError ? (
          <div className="mt-4 space-y-3">
            {reviews.length === 0 ? (
              <p className="text-sm text-muted">No reviews yet.</p>
            ) : null}

            {reviews.map((review) => (
              <article
                key={review.id}
                className="rounded-xl border border-slate-200 p-4 dark:border-slate-700"
              >
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">
                    {review.user?.name ?? "Anonymous"}
                  </span>
                  <span className="text-amber-500">
                    {"★".repeat(review.rating)}
                  </span>
                </div>
                <p className="mt-2 text-sm text-muted">
                  {review.comment || "No comment."}
                </p>
                <p className="mt-2 text-xs text-muted">
                  {formatDate(review.created_at)}
                </p>
              </article>
            ))}
          </div>
        ) : null}
      </section>
    </main>
  );
}
