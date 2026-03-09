"use client";

import Link from "next/link";
import { useCategories } from "../../src/hooks/use-categories";

export default function CategoriesPage() {
  const { data, isLoading, isError, error } = useCategories();
  const categories = data ?? [];

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl p-6 md:p-10">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted">
            Catalog
          </p>
          <h1 className="text-3xl font-bold">Categories</h1>
        </div>
        <span className="text-sm text-muted">
          {categories.length} category(s)
        </span>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-52 animate-pulse rounded-2xl bg-slate-200/50 dark:bg-slate-700/40"
            />
          ))}
        </div>
      ) : null}

      {isError ? (
        <p className="rounded-xl border border-rose-300/40 bg-rose-100/70 p-4 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300">
          {(error as Error)?.message ?? "Failed to load categories."}
        </p>
      ) : null}

      {!isLoading && !isError ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {categories.map((category) => (
            <article
              key={category.id}
              className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-soft dark:border-slate-700 dark:bg-slate-900"
            >
              {category.video ? (
                <video
                  className="h-48 w-full object-cover"
                  src={category.video}
                  controls
                  preload="metadata"
                />
              ) : category.image ? (
                <img
                  className="h-48 w-full object-cover"
                  src={category.image}
                  alt={category.name}
                />
              ) : (
                <div className="h-48 w-full bg-gradient-to-r from-cyan-300/30 to-emerald-300/30" />
              )}

              <div className="space-y-3 p-5">
                <h2 className="text-xl font-semibold">{category.name}</h2>
                <p className="line-clamp-2 text-sm text-muted">
                  {category.description || "No description available."}
                </p>

                {category.children?.length ? (
                  <div className="flex flex-wrap gap-2">
                    {category.children.map((child) => (
                      <span
                        key={child.id}
                        className="rounded-full border border-slate-300 px-3 py-1 text-xs dark:border-slate-600"
                      >
                        {child.name}
                      </span>
                    ))}
                  </div>
                ) : null}

                <div className="pt-1">
                  <Link
                    href={`/?category=${category.slug}`}
                    className="text-sm font-medium text-accent hover:underline"
                  >
                    View related products
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </main>
  );
}
