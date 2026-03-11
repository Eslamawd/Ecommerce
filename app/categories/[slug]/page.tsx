"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo } from "react";
import { useCategory } from "../../../src/hooks/use-categories";
import type { Category } from "../../../src/types/category";
import { useLanguage } from "../../../src/components/language-provider";

function flattenCategoryTree(category: Category): Category[] {
  const result: Category[] = [];

  const walk = (node: Category) => {
    result.push(node);
    (node.children ?? []).forEach(walk);
  };

  walk(category);

  return result;
}

export default function CategoryDetailsPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug ?? "";
  const { language } = useLanguage();
  const { data: category, isLoading, isError, error } = useCategory(slug);

  const categoryName =
    language === "en" ? (category?.name_en ?? category?.name) : category?.name;

  const categoryDescription =
    language === "en"
      ? (category?.description_en ?? category?.description)
      : category?.description;

  const descendants = useMemo(() => {
    if (!category) {
      return [];
    }

    return flattenCategoryTree(category).filter(
      (item) => item.id !== category.id,
    );
  }, [category]);

  if (isLoading) {
    return (
      <main className="mx-auto min-h-screen w-full max-w-6xl p-6 md:p-10">
        <div className="h-52 animate-pulse rounded-2xl bg-slate-200/50 dark:bg-slate-700/40" />
      </main>
    );
  }

  if (isError || !category) {
    return (
      <main className="mx-auto min-h-screen w-full max-w-4xl p-6 md:p-10">
        <p className="rounded-xl border border-rose-300/40 bg-rose-100/70 p-4 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300">
          {(error as Error)?.message ?? "فشل تحميل القسم"}
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl space-y-6 p-6 md:p-10">
      <section className="rounded-2xl bg-card p-6 shadow-soft">
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <Link href="/categories" className="text-accent hover:underline">
            كل الاقسام
          </Link>
          <span className="text-muted">/</span>
          <span className="text-muted">{categoryName}</span>
        </div>

        <h1 className="mt-3 text-3xl font-bold">{categoryName}</h1>
        <p className="mt-3 text-sm text-muted">
          {categoryDescription || "لا يوجد وصف لهذا القسم."}
        </p>

        {descendants.length > 0 ? (
          <div className="mt-5 flex flex-wrap gap-2">
            {descendants.map((item) => (
              <Link
                key={item.id}
                href={`/categories/${item.slug}`}
                className="rounded-full border border-slate-300 px-3 py-1 text-xs dark:border-slate-700"
              >
                {language === "en" ? (item.name_en ?? item.name) : item.name}
              </Link>
            ))}
          </div>
        ) : null}
      </section>

      <section className="rounded-2xl bg-card p-6 shadow-soft">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">المنتجات داخل القسم</h2>
          <span className="text-sm text-muted">
            {category.products?.length ?? 0} منتج
          </span>
        </div>

        {category.products && category.products.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {category.products.map((product) => {
              const productName =
                language === "en"
                  ? (product.name_en ?? product.name)
                  : product.name;
              const productDescription =
                language === "en"
                  ? (product.description_en ?? product.description)
                  : product.description;
              const image =
                product.primary_image?.image ??
                product.images?.[0]?.image ??
                "";

              return (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white transition hover:-translate-y-0.5 hover:shadow-soft dark:border-slate-700 dark:bg-slate-900"
                >
                  {image ? (
                    <img
                      src={image}
                      alt={productName}
                      className="h-40 w-full object-cover"
                    />
                  ) : (
                    <div className="h-40 w-full bg-slate-200/60 dark:bg-slate-700/60" />
                  )}
                  <div className="space-y-2 p-4">
                    <h3 className="line-clamp-1 font-semibold">
                      {productName}
                    </h3>
                    <p className="line-clamp-2 text-sm text-muted">
                      {productDescription || "لا يوجد وصف"}
                    </p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold text-accent">
                        ${Number(product.price).toFixed(2)}
                      </span>
                      <span className="text-muted">
                        مخزون: {product.quantity ?? 0}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <p className="rounded-xl border border-slate-300/60 p-4 text-sm text-muted dark:border-slate-700">
            لا توجد منتجات في هذا القسم حاليا.
          </p>
        )}
      </section>
    </main>
  );
}
