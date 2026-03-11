import type { MetadataRoute } from "next";

type ProductLike = {
  slug?: string | null;
  updated_at?: string | null;
  created_at?: string | null;
};

type CategoryLike = {
  slug?: string | null;
  updated_at?: string | null;
  created_at?: string | null;
  children?: CategoryLike[];
};

type PaginationMeta = {
  current_page?: number;
  last_page?: number;
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api";
const SITE_BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const SITEMAP_REVALIDATE_SECONDS = 300;

export const revalidate = 300;

function parseArrayPayload<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) {
    return payload as T[];
  }

  if (payload && typeof payload === "object") {
    const firstData = (payload as { data?: unknown }).data;

    if (Array.isArray(firstData)) {
      return firstData as T[];
    }

    if (firstData && typeof firstData === "object") {
      const secondData = (firstData as { data?: unknown }).data;
      if (Array.isArray(secondData)) {
        return secondData as T[];
      }
    }
  }

  return [];
}

function parsePaginationMeta(payload: unknown): PaginationMeta {
  if (!payload || typeof payload !== "object") {
    return {};
  }

  const topMeta = (payload as { meta?: unknown }).meta;
  if (topMeta && typeof topMeta === "object") {
    return {
      current_page:
        typeof (topMeta as { current_page?: unknown }).current_page === "number"
          ? (topMeta as { current_page: number }).current_page
          : undefined,
      last_page:
        typeof (topMeta as { last_page?: unknown }).last_page === "number"
          ? (topMeta as { last_page: number }).last_page
          : undefined,
    };
  }

  const nestedData = (payload as { data?: unknown }).data;
  if (nestedData && typeof nestedData === "object") {
    const nestedMeta = (nestedData as { meta?: unknown }).meta;
    if (nestedMeta && typeof nestedMeta === "object") {
      return {
        current_page:
          typeof (nestedMeta as { current_page?: unknown }).current_page ===
          "number"
            ? (nestedMeta as { current_page: number }).current_page
            : undefined,
        last_page:
          typeof (nestedMeta as { last_page?: unknown }).last_page === "number"
            ? (nestedMeta as { last_page: number }).last_page
            : undefined,
      };
    }
  }

  return {};
}

async function fetchJson(path: string): Promise<unknown> {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      next: { revalidate: SITEMAP_REVALIDATE_SECONDS },
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch {
    return null;
  }
}

async function fetchAllProducts(): Promise<ProductLike[]> {
  const firstPayload = await fetchJson("/products");
  const firstBatch = parseArrayPayload<ProductLike>(firstPayload);
  const firstMeta = parsePaginationMeta(firstPayload);

  const lastPage = firstMeta.last_page ?? 1;
  if (lastPage <= 1) {
    return firstBatch;
  }

  const pages = Array.from({ length: lastPage - 1 }, (_, index) => index + 2);
  const payloads = await Promise.all(
    pages.map((page) => fetchJson(`/products?page=${page}`)),
  );

  const rest = payloads.flatMap((payload) =>
    parseArrayPayload<ProductLike>(payload),
  );

  return [...firstBatch, ...rest];
}

function flattenCategoryTree(categories: CategoryLike[]): CategoryLike[] {
  const result: CategoryLike[] = [];

  const walk = (node: CategoryLike) => {
    result.push(node);
    (node.children ?? []).forEach(walk);
  };

  categories.forEach(walk);

  return result;
}

async function fetchAllCategories(): Promise<CategoryLike[]> {
  const payload = await fetchJson("/categories");
  const categories = parseArrayPayload<CategoryLike>(payload);
  return flattenCategoryTree(categories);
}

function toDate(value?: string | null): Date | undefined {
  if (!value) {
    return undefined;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories] = await Promise.all([
    fetchAllProducts(),
    fetchAllCategories(),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_BASE_URL}/`, changeFrequency: "daily", priority: 1 },
    {
      url: `${SITE_BASE_URL}/categories`,
      changeFrequency: "daily",
      priority: 0.9,
    },
    { url: `${SITE_BASE_URL}/login`, changeFrequency: "weekly", priority: 0.5 },
    {
      url: `${SITE_BASE_URL}/register`,
      changeFrequency: "weekly",
      priority: 0.5,
    },
  ];

  const productRoutes: MetadataRoute.Sitemap = Array.from(
    new Map(
      products
        .filter((product) => Boolean(product.slug))
        .map((product) => [
          product.slug as string,
          {
            url: `${SITE_BASE_URL}/products/${product.slug}`,
            lastModified: toDate(product.updated_at ?? product.created_at),
            changeFrequency: "hourly" as const,
            priority: 0.8,
          },
        ]),
    ).values(),
  );

  const categoryRoutes: MetadataRoute.Sitemap = Array.from(
    new Map(
      categories
        .filter((category) => Boolean(category.slug))
        .map((category) => [
          category.slug as string,
          {
            url: `${SITE_BASE_URL}/categories/${category.slug}`,
            lastModified: toDate(category.updated_at ?? category.created_at),
            changeFrequency: "daily" as const,
            priority: 0.7,
          },
        ]),
    ).values(),
  );

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
