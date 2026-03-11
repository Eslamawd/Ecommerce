"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useCategories } from "../../src/hooks/use-categories";
import { useLanguage } from "../../src/components/language-provider";
import type { Category } from "../../src/types/category";

export default function CategoriesPage() {
  const { data, isLoading, isError, error } = useCategories();
  const categories = data ?? [];
  const { t, language } = useLanguage();

  const flatCategories = useMemo(() => {
    const result: Array<Category & { depth: number }> = [];

    const visit = (items: Category[], depth: number) => {
      items.forEach((item) => {
        result.push({ ...item, depth });
        if (item.children?.length) {
          visit(item.children, depth + 1);
        }
      });
    };

    visit(categories, 0);

    return result;
  }, [categories]);

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl p-6 md:p-10">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted">
            {t("categories_catalog")}
          </p>
          <h1 className="text-3xl font-bold">{t("categories_title")}</h1>
        </div>
        <span className="text-sm text-muted">
          {t("categories_count").replace(
            "{count}",
            String(flatCategories.length),
          )}
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
          {(error as Error)?.message ?? t("categories_failed")}
        </p>
      ) : null}

      {!isLoading && !isError ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {flatCategories.map((category) =>
            (() => {
              const categoryName =
                language === "en"
                  ? (category.name_en ?? category.name)
                  : category.name;
              const categoryDescription =
                language === "en"
                  ? (category.description_en ?? category.description)
                  : category.description;

              return (
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
                      alt={categoryName}
                    />
                  ) : (
                    <div className="h-48 w-full bg-gradient-to-r from-cyan-300/30 to-emerald-300/30" />
                  )}

                  <div className="space-y-3 p-5">
                    <h2 className="text-xl font-semibold">{categoryName}</h2>
                    {category.depth > 0 ? (
                      <p className="text-xs text-muted">
                        {language === "en"
                          ? `Level ${category.depth + 1}`
                          : `المستوى ${category.depth + 1}`}
                      </p>
                    ) : null}
                    <p className="line-clamp-2 text-sm text-muted">
                      {categoryDescription || t("categories_no_desc")}
                    </p>

                    {category.children?.length ? (
                      <div className="flex flex-wrap gap-2">
                        {category.children.map((child) => (
                          <Link
                            key={child.id}
                            href={`/categories/${child.slug}`}
                            className="rounded-full border border-slate-300 px-3 py-1 text-xs dark:border-slate-600"
                          >
                            {language === "en"
                              ? (child.name_en ?? child.name)
                              : child.name}
                          </Link>
                        ))}
                      </div>
                    ) : null}

                    <div className="pt-1">
                      <Link
                        href={`/categories/${category.slug}`}
                        className="text-sm font-medium text-accent hover:underline"
                      >
                        {t("categories_related_products")}
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })(),
          )}
        </div>
      ) : null}
    </main>
  );
}
