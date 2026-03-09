"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useRemoveWishlistItem, useWishlist } from "../../src/hooks/use-cart";
import { getApiErrorMessages } from "../../src/lib/api-client";

export default function WishlistPage() {
  const wishlistQuery = useWishlist();
  const removeMutation = useRemoveWishlistItem();

  const products = wishlistQuery.data ?? [];

  const errorMessages = useMemo(() => {
    if (!wishlistQuery.isError) return [];
    return getApiErrorMessages(wishlistQuery.error);
  }, [wishlistQuery.error, wishlistQuery.isError]);

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl p-6 md:p-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Wishlist</h1>
        <Link href="/" className="text-sm text-accent hover:underline">
          Explore products
        </Link>
      </div>

      {wishlistQuery.isLoading ? (
        <p className="text-sm text-muted">Loading wishlist...</p>
      ) : null}

      {wishlistQuery.isError ? (
        <div className="space-y-2 rounded-xl border border-rose-300/40 bg-rose-100/70 p-4 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300">
          {errorMessages.map((message, idx) => (
            <p key={`${message}-${idx}`}>{message}</p>
          ))}
          <p>
            <Link
              href="/login?next=/wishlist"
              className="font-medium text-accent hover:underline"
            >
              Login to access your wishlist
            </Link>
          </p>
        </div>
      ) : null}

      {!wishlistQuery.isError ? (
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {products.length === 0 ? (
            <p className="text-sm text-muted">No products in wishlist yet.</p>
          ) : null}

          {products.map((product) => (
            <article
              key={product.id}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-700 dark:bg-slate-900"
            >
              <h2 className="line-clamp-1 font-semibold">{product.name}</h2>
              <p className="mt-2 line-clamp-2 text-sm text-muted">
                {product.description || "No description."}
              </p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm font-medium text-accent">
                  ${Number(product.price).toFixed(2)}
                </span>
                <button
                  type="button"
                  onClick={() => removeMutation.mutate(product.id)}
                  disabled={removeMutation.isPending}
                  className="rounded-lg bg-rose-100 px-3 py-1 text-sm text-rose-700 hover:opacity-90 disabled:opacity-60 dark:bg-rose-900/40 dark:text-rose-300"
                >
                  Remove
                </button>
              </div>
              <div className="mt-3">
                <Link
                  href={`/products/${product.slug}`}
                  className="text-sm text-accent hover:underline"
                >
                  View details
                </Link>
              </div>
            </article>
          ))}
        </section>
      ) : null}
    </main>
  );
}
