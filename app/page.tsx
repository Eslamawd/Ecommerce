"use client";

import { Playfair_Display, Manrope } from "next/font/google";
import { Star } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useCategories } from "../src/hooks/use-categories";
import { useProducts } from "../src/hooks/use-products";

const headingFont = Playfair_Display({
  subsets: ["latin"],
  weight: ["600", "700"],
});
const bodyFont = Manrope({ subsets: ["latin"], weight: ["400", "500", "700"] });

export default function Home() {
  const [query, setQuery] = useState("");
  const { data, isLoading, isError, error } = useProducts();
  const categoriesQuery = useCategories();
  const products = data ?? [];
  const categories = categoriesQuery.data ?? [];

  const filteredProducts = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) {
      return products.slice(0, 8);
    }

    return products
      .filter((product) => {
        const name = (product.name ?? "").toLowerCase();
        const description = (product.description ?? "").toLowerCase();
        return name.includes(term) || description.includes(term);
      })
      .slice(0, 8);
  }, [products, query]);

  const featuredCategories = useMemo(() => {
    return categories
      .filter((category) => (category.products_count ?? 0) > 0)
      .sort((a, b) => (b.products_count ?? 0) - (a.products_count ?? 0))
      .slice(0, 10);
  }, [categories]);

  return (
    <main
      className={`${bodyFont.className} min-h-screen bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.12),_transparent_40%),radial-gradient(circle_at_85%_20%,_rgba(6,182,212,0.12),_transparent_35%)] p-6 md:p-10`}
    >
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <header className="rounded-3xl border border-emerald-200/60 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 p-6 text-white shadow-soft md:p-10">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-white/70">
                Ecommerce Storefront
              </p>
              <h1
                className={`${headingFont.className} mt-3 text-3xl font-bold md:text-5xl`}
              >
                Discover better products for your daily life
              </h1>
              <p className="mt-4 max-w-2xl text-sm text-white/90 md:text-base">
                Clean shopping experience with fast browse, detailed product
                pages, and smooth checkout flow.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href="/categories"
                  className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
                >
                  Shop now
                </Link>
                <Link
                  href="/register"
                  className="rounded-full border border-white/40 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/15"
                >
                  Create account
                </Link>
              </div>
            </div>
            <div className="rounded-2xl bg-white/20 px-4 py-3 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.2em] text-white/80">
                Live catalog
              </p>
              <p className="mt-2 text-3xl font-bold">{products.length}</p>
              <p className="text-sm text-white/90">products available</p>
            </div>
          </div>
        </header>

        <section className="rounded-2xl bg-card p-5 shadow-soft md:p-7">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Products</h2>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full max-w-xs rounded-full border border-slate-300 bg-transparent px-4 py-2 text-sm outline-none ring-emerald-400/40 focus:ring dark:border-slate-700"
            />
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-28 animate-pulse rounded-xl bg-slate-200/50 dark:bg-slate-700/40"
                />
              ))}
            </div>
          ) : null}

          {isError ? (
            <p className="rounded-xl border border-rose-300/40 bg-rose-100/60 p-4 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300">
              {(error as Error)?.message ?? "Failed to load products."}
            </p>
          ) : null}

          {!isLoading && !isError ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredProducts.map((product) =>
                (() => {
                  const fallbackImage = product.images?.[0] ?? null;
                  const productImage =
                    product.primary_image?.image ?? fallbackImage?.image ?? "";
                  const ratingValue =
                    typeof product.average_rating === "number"
                      ? product.average_rating
                      : null;
                  const filledStars = ratingValue
                    ? Math.max(0, Math.min(5, Math.round(ratingValue)))
                    : 0;
                  const reviewsCount = product.reviews_count ?? 0;

                  return (
                    <Link
                      key={product.id}
                      href={`/products/${product.slug}`}
                      className="group overflow-hidden rounded-2xl border border-slate-200/70 bg-white transition hover:-translate-y-1 hover:shadow-soft dark:border-slate-700 dark:bg-slate-900"
                    >
                      <div className="relative h-44 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                        {productImage ? (
                          <img
                            src={productImage}
                            alt={product.name}
                            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-sm text-muted">
                            No image available
                          </div>
                        )}

                        {product.category ? (
                          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-900 backdrop-blur dark:bg-slate-900/80 dark:text-slate-100">
                            {product.category.name}
                          </span>
                        ) : null}
                      </div>

                      <div className="p-4">
                        <h3 className="line-clamp-1 text-base font-semibold">
                          {product.name}
                        </h3>

                        <div className="mt-2 flex items-center justify-between gap-3 text-xs text-muted">
                          <span
                            className="flex items-center gap-1"
                            aria-label={
                              ratingValue
                                ? `Rating ${ratingValue.toFixed(1)} out of 5`
                                : "No ratings yet"
                            }
                          >
                            {Array.from({ length: 5 }).map((_, index) => (
                              <Star
                                key={index}
                                size={13}
                                className={
                                  index < filledStars
                                    ? "fill-amber-400 text-amber-500"
                                    : "text-slate-300 dark:text-slate-600"
                                }
                              />
                            ))}
                            <span className="ml-1 text-[11px] font-medium">
                              {ratingValue ? ratingValue.toFixed(1) : "-"}
                            </span>
                          </span>
                          <span>{reviewsCount} reviews</span>
                        </div>

                        <p className="mt-3 line-clamp-2 text-sm text-muted">
                          {product.description}
                        </p>

                        <div className="mt-4 flex items-center justify-between text-sm">
                          <span className="font-semibold text-accent">
                            ${Number(product.price).toFixed(2)}
                          </span>
                          <span>
                            Stock: {product.stock ?? product.quantity ?? 0}
                          </span>
                        </div>

                        <p className="mt-3 text-xs text-emerald-600 opacity-0 transition group-hover:opacity-100 dark:text-emerald-400">
                          View details, media, and reviews
                        </p>
                      </div>
                    </Link>
                  );
                })(),
              )}
            </div>
          ) : null}

          {!isLoading && !isError && filteredProducts.length === 0 ? (
            <p className="rounded-xl border border-slate-300/60 p-4 text-sm text-muted dark:border-slate-700">
              No products match your search.
            </p>
          ) : null}
        </section>

        <section className="rounded-2xl bg-card p-5 shadow-soft md:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-semibold">Browse by category</h2>
            <Link
              href="/categories"
              className="text-sm font-medium text-accent hover:underline"
            >
              View all categories
            </Link>
          </div>

          {categoriesQuery.isLoading ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <span
                  key={i}
                  className="h-9 w-24 animate-pulse rounded-full bg-slate-200/60 dark:bg-slate-700/50"
                />
              ))}
            </div>
          ) : null}

          {!categoriesQuery.isLoading && featuredCategories.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {featuredCategories.map((category) => (
                <Link
                  key={category.id}
                  href={`/categories/${category.slug}`}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-3 py-2 text-sm transition hover:border-emerald-500 hover:text-emerald-600 dark:border-slate-700 dark:hover:border-emerald-400 dark:hover:text-emerald-400"
                >
                  {category.image ? (
                    <img
                      src={category.image}
                      alt={category.name}
                      className="h-6 w-6 rounded-full object-cover"
                    />
                  ) : (
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-[10px] font-semibold uppercase text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                      {category.name.slice(0, 1)}
                    </span>
                  )}
                  {category.name}
                  <span className="ml-2 text-xs text-muted">
                    ({category.products_count ?? 0})
                  </span>
                </Link>
              ))}
            </div>
          ) : null}
        </section>
      </section>
    </main>
  );
}
