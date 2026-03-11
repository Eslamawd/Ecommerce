"use client";

import Link from "next/link";
import { useVendorOrders } from "../../src/hooks/use-vendor";
import { useLanguage } from "../../src/components/language-provider";

export default function VendorDashboardPage() {
  const ordersQuery = useVendorOrders();
  const { t } = useLanguage();
  const orders = ordersQuery.data?.data ?? [];
  const revenue = orders.reduce(
    (sum, order) => sum + Number(order.total || 0),
    0,
  );

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl p-6 md:p-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t("vendor_dashboard_title")}</h1>
        <div className="flex gap-2">
          <Link
            href="/vendor/products"
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm dark:border-slate-700"
          >
            {t("vendor_manage_products")}
          </Link>
          <Link
            href="/vendor/orders"
            className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-slate-950"
          >
            {t("vendor_view_orders")}
          </Link>
        </div>
      </div>

      {ordersQuery.isLoading ? (
        <p className="text-sm text-muted">{t("vendor_loading_stats")}</p>
      ) : null}

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <article className="rounded-xl bg-card p-4 shadow-soft">
          <p className="text-xs uppercase tracking-[0.15em] text-muted">
            {t("vendor_orders_count")}
          </p>
          <p className="mt-2 text-2xl font-bold">{orders.length}</p>
        </article>
        <article className="rounded-xl bg-card p-4 shadow-soft">
          <p className="text-xs uppercase tracking-[0.15em] text-muted">
            {t("vendor_estimated_revenue")}
          </p>
          <p className="mt-2 text-2xl font-bold">${revenue.toFixed(2)}</p>
        </article>
        <article className="rounded-xl bg-card p-4 shadow-soft">
          <p className="text-xs uppercase tracking-[0.15em] text-muted">
            {t("vendor_pending")}
          </p>
          <p className="mt-2 text-2xl font-bold">
            {orders.filter((o) => o.status === "pending").length}
          </p>
        </article>
      </section>
    </main>
  );
}
