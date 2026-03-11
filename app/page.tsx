"use client";

import { Playfair_Display, Manrope } from "next/font/google";
import { Star } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useCategories } from "../src/hooks/use-categories";
import { useInfiniteProducts } from "../src/hooks/use-products";
import { useSearchSuggestions } from "../src/hooks/use-search";
import { useLanguage } from "../src/components/language-provider";

const headingFont = Playfair_Display({
  subsets: ["latin"],
  weight: ["600", "700"],
});
const bodyFont = Manrope({ subsets: ["latin"], weight: ["400", "500", "700"] });

export default function Home() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [productType, setProductType] = useState("");
  const [color, setColor] = useState("");
  const [size, setSize] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const searchBoxRef = useRef<HTMLDivElement | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 220);

    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (!searchBoxRef.current) {
        return;
      }

      if (!searchBoxRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);

    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const suggestionsQuery = useSearchSuggestions(debouncedQuery, 8);
  const suggestionItems = suggestionsQuery.data?.items ?? [];
  const {
    data,
    isLoading,
    isError,
    error,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteProducts({
    search: query,
    product_type: productType,
    color,
    size,
    make,
    model,
    per_page: "15",
  });

  useEffect(() => {
    const node = loadMoreRef.current;
    if (!node) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (!first?.isIntersecting) {
          return;
        }

        if (hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      {
        root: null,
        rootMargin: "200px",
        threshold: 0.1,
      },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const categoriesQuery = useCategories();
  const products = useMemo(() => {
    const all = (data?.pages ?? []).flatMap((page) => page.data ?? []);
    const uniqueById = new Map<number, (typeof all)[number]>();

    all.forEach((product) => {
      if (!uniqueById.has(product.id)) {
        uniqueById.set(product.id, product);
      }
    });

    return Array.from(uniqueById.values());
  }, [data]);
  const categories = categoriesQuery.data ?? [];
  const { t, language } = useLanguage();

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
                {t("home_hero_tag")}
              </p>
              <h1
                className={`${headingFont.className} mt-3 text-3xl font-bold md:text-5xl`}
              >
                {t("home_hero_title")}
              </h1>
              <p className="mt-4 max-w-2xl text-sm text-white/90 md:text-base">
                {t("home_hero_desc")}
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href="/categories"
                  className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
                >
                  {t("home_shop_now")}
                </Link>
                <Link
                  href="/register"
                  className="rounded-full border border-white/40 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/15"
                >
                  {t("home_create_account")}
                </Link>
              </div>
            </div>
            <div className="rounded-2xl bg-white/20 px-4 py-3 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.2em] text-white/80">
                {t("home_live_catalog")}
              </p>
              <p className="mt-2 text-3xl font-bold">{products.length}</p>
              <p className="text-sm text-white/90">
                {t("home_products_available")}
              </p>
            </div>
          </div>
        </header>

        <section className="rounded-2xl bg-card p-5 shadow-soft md:p-7">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-semibold">{t("home_products")}</h2>
            <div ref={searchBoxRef} className="relative w-full max-w-xs">
              <input
                type="search"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setIsSearchOpen(true);
                }}
                onFocus={() => setIsSearchOpen(true)}
                placeholder={t("home_search_products")}
                className="w-full rounded-full border border-slate-300 bg-transparent px-4 py-2 text-sm outline-none ring-emerald-400/40 focus:ring dark:border-slate-700"
              />

              {isSearchOpen && debouncedQuery.length > 0 ? (
                <div className="absolute right-0 z-30 mt-2 max-h-80 w-full overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-soft dark:border-slate-700 dark:bg-slate-900">
                  {suggestionsQuery.isLoading ? (
                    <p className="px-2 py-2 text-xs text-muted">
                      {language === "en" ? "Searching..." : "جاري البحث..."}
                    </p>
                  ) : null}

                  {!suggestionsQuery.isLoading &&
                  suggestionItems.length === 0 ? (
                    <p className="px-2 py-2 text-xs text-muted">
                      {language === "en"
                        ? "No matching products or categories"
                        : "لا توجد نتائج مطابقة في المنتجات أو الأقسام"}
                    </p>
                  ) : null}

                  {!suggestionsQuery.isLoading
                    ? suggestionItems.map((item) => {
                        const itemLabel =
                          language === "en"
                            ? (item.label_en ?? item.label)
                            : item.label;

                        return (
                          <Link
                            key={`${item.type}-${item.id}`}
                            href={
                              item.type === "category"
                                ? `/categories/${item.slug}`
                                : `/products/${item.slug}`
                            }
                            onClick={() => setIsSearchOpen(false)}
                            className="flex items-center justify-between rounded-xl px-3 py-2 text-sm transition hover:bg-slate-100 dark:hover:bg-slate-800"
                          >
                            <span className="line-clamp-1">{itemLabel}</span>
                            <span className="ml-3 text-[10px] font-semibold uppercase tracking-wide text-muted">
                              {item.type === "category"
                                ? language === "en"
                                  ? "Category"
                                  : "قسم"
                                : language === "en"
                                  ? "Product"
                                  : "منتج"}
                            </span>
                          </Link>
                        );
                      })
                    : null}
                </div>
              ) : null}
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-2 md:gap-4 lg:grid-cols-3">
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
              {(error as Error)?.message ?? t("home_failed_products")}
            </p>
          ) : null}

          {!isLoading && !isError ? (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-2 md:gap-4 lg:grid-cols-3">
              {products.map((product) =>
                (() => {
                  const productName =
                    language === "en"
                      ? (product.name_en ?? product.name)
                      : product.name;
                  const productDescription =
                    language === "en"
                      ? (product.description_en ?? product.description)
                      : product.description;
                  const categoryName =
                    language === "en"
                      ? (product.category?.name_en ?? product.category?.name)
                      : product.category?.name;
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
                      key={`${product.id}-${product.slug}`}
                      href={`/products/${product.slug}`}
                      className="group overflow-hidden rounded-2xl border border-slate-200/70 bg-white transition hover:-translate-y-1 hover:shadow-soft dark:border-slate-700 dark:bg-slate-900"
                    >
                      <div className="relative aspect-square w-full overflow-hidden bg-slate-100 sm:aspect-auto sm:h-44 dark:bg-slate-800">
                        {productImage ? (
                          <img
                            src={productImage}
                            alt={productName}
                            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-sm text-muted">
                            {t("home_no_image")}
                          </div>
                        )}

                        {product.category ? (
                          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-900 backdrop-blur dark:bg-slate-900/80 dark:text-slate-100">
                            {categoryName}
                          </span>
                        ) : null}
                      </div>

                      <div className="p-4">
                        <h3 className="line-clamp-1 text-base font-semibold">
                          {productName}
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
                          <span>
                            {reviewsCount} {t("home_reviews")}
                          </span>
                        </div>

                        <p className="mt-3 line-clamp-2 text-sm text-muted">
                          {productDescription}
                        </p>

                        <div className="mt-4 flex items-center justify-between text-sm">
                          <span className="font-semibold text-accent">
                            ${Number(product.price).toFixed(2)}
                          </span>
                          <span>
                            {t("home_stock")}:{" "}
                            {product.stock ?? product.quantity ?? 0}
                          </span>
                        </div>

                        <p className="mt-3 text-xs text-emerald-600 opacity-0 transition group-hover:opacity-100 dark:text-emerald-400">
                          {t("home_view_details")}
                        </p>
                      </div>
                    </Link>
                  );
                })(),
              )}
            </div>
          ) : null}

          {!isLoading && !isError ? (
            <div ref={loadMoreRef} className="h-2 w-full" />
          ) : null}

          {isFetchingNextPage ? (
            <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-2 md:gap-4 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={`next-${i}`}
                  className="h-24 animate-pulse rounded-xl bg-slate-200/50 dark:bg-slate-700/40"
                />
              ))}
            </div>
          ) : null}

          {!isLoading && !isError && products.length === 0 ? (
            <p className="rounded-xl border border-slate-300/60 p-4 text-sm text-muted dark:border-slate-700">
              {t("home_no_products_match")}
            </p>
          ) : null}
        </section>

        <section className="rounded-2xl bg-card p-5 shadow-soft md:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-semibold">
              {t("home_browse_by_category")}
            </h2>
            <Link
              href="/categories"
              className="text-sm font-medium text-accent hover:underline"
            >
              {t("home_view_all_categories")}
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
              {featuredCategories.map((category) =>
                (() => {
                  const categoryName =
                    language === "en"
                      ? (category.name_en ?? category.name)
                      : category.name;

                  return (
                    <Link
                      key={category.id}
                      href={`/categories/${category.slug}`}
                      className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-3 py-2 text-sm transition hover:border-emerald-500 hover:text-emerald-600 dark:border-slate-700 dark:hover:border-emerald-400 dark:hover:text-emerald-400"
                    >
                      {category.image ? (
                        <img
                          src={category.image}
                          alt={categoryName}
                          className="h-6 w-6 rounded-full object-cover"
                        />
                      ) : (
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-[10px] font-semibold uppercase text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                          {categoryName.slice(0, 1)}
                        </span>
                      )}
                      {categoryName}
                      <span className="ml-2 text-xs text-muted">
                        ({category.products_count ?? 0})
                      </span>
                    </Link>
                  );
                })(),
              )}
            </div>
          ) : null}
        </section>
      </section>
    </main>
  );
}
