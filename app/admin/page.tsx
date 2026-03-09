"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAdminOverview } from "../../src/hooks/use-admin";

export default function AdminDashboardPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const overviewQuery = useAdminOverview(mounted);
  const stats = overviewQuery.data?.stats ?? {};
  const numberFormatter = useMemo(() => new Intl.NumberFormat("en-US"), []);

  const cards = [
    ["Total users", stats.total_users ?? 0],
    ["Total vendors", stats.total_vendors ?? 0],
    ["Total products", stats.total_products ?? 0],
    ["Total orders", stats.total_orders ?? 0],
    ["Pending orders", stats.pending_orders ?? 0],
    ["Total revenue", stats.total_revenue ?? 0],
  ] as const;

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl p-6 md:p-10">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted">Admin</p>
          <h1 className="text-3xl font-bold">Dashboard</h1>
        </div>
        <div className="flex gap-2 text-sm">
          <Link
            href="/admin/users"
            className="rounded-lg border border-slate-300 px-3 py-1.5 dark:border-slate-700"
          >
            Users
          </Link>
          <Link
            href="/admin/products"
            className="rounded-lg border border-slate-300 px-3 py-1.5 dark:border-slate-700"
          >
            Products
          </Link>
          <Link
            href="/admin/categories"
            className="rounded-lg border border-slate-300 px-3 py-1.5 dark:border-slate-700"
          >
            Categories
          </Link>
          <Link
            href="/admin/orders"
            className="rounded-lg border border-slate-300 px-3 py-1.5 dark:border-slate-700"
          >
            Orders
          </Link>
        </div>
      </div>

      {mounted && overviewQuery.isLoading ? (
        <p className="text-sm text-muted">Loading admin overview...</p>
      ) : null}

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {cards.map(([label, value]) => (
          <article key={label} className="rounded-xl bg-card p-4 shadow-soft">
            <p className="text-xs uppercase tracking-[0.15em] text-muted">
              {label}
            </p>
            <p className="mt-2 text-2xl font-bold">
              {typeof value === "number"
                ? numberFormatter.format(value)
                : value}
            </p>
          </article>
        ))}
      </section>
    </main>
  );
}
