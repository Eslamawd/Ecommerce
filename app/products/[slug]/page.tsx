import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductDetailsClient from "./product-details-client";
import type { Product } from "../../../src/types/product";

type ApiEnvelope<T> = {
  data: T;
};

type PageProps = {
  params: Promise<{ slug: string }>;
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api";
const SITE_BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const PRODUCT_REVALIDATE_SECONDS = 120;

export const revalidate = PRODUCT_REVALIDATE_SECONDS;

async function fetchProductBySlug(slug: string): Promise<Product | null> {
  const response = await fetch(
    `${API_BASE_URL}/products/${encodeURIComponent(slug)}`,
    {
      next: { revalidate: PRODUCT_REVALIDATE_SECONDS },
    },
  );

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as ApiEnvelope<Product> | Product;

  if (payload && typeof payload === "object" && "data" in payload) {
    return payload.data;
  }

  return payload as Product;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await fetchProductBySlug(slug);

  if (!product) {
    return {
      title: "Product not found",
      description: "The requested product could not be found.",
    };
  }

  const title = product.name_en ?? product.name;
  const description =
    product.description_en ??
    product.description ??
    `${title} is available now in our catalog.`;
  const canonicalUrl = `${SITE_BASE_URL}/products/${product.slug}`;
  const imageUrl = product.primary_image?.image ?? product.images?.[0]?.image;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: "website",
      title,
      description,
      url: canonicalUrl,
      images: imageUrl
        ? [
            {
              url: imageUrl,
              alt: title,
            },
          ]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: imageUrl ? [imageUrl] : [],
    },
  };
}

export default async function ProductDetailsPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await fetchProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name_en ?? product.name,
    description: product.description_en ?? product.description ?? undefined,
    sku: product.sku ?? undefined,
    image: [
      product.primary_image?.image,
      ...(product.images ?? []).map((item) => item.image),
    ].filter(Boolean),
    offers: {
      "@type": "Offer",
      priceCurrency: "USD",
      price: Number(product.price).toFixed(2),
      availability:
        (product.quantity ?? product.stock ?? 0) > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      url: `${SITE_BASE_URL}/products/${product.slug}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <ProductDetailsClient product={product} />
    </>
  );
}
