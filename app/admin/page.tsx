"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  useAdminLowStockProducts,
  useAdminOrdersChart,
  useAdminOverview,
  useAdminRecentOrders,
  useAdminRecentReviews,
  useAdminRevenueChart,
  useAdminTopCustomers,
  useAdminTopProducts,
  useAdminTopVendors,
} from "../../src/hooks/use-admin";
import { useLanguage } from "../../src/components/language-provider";
import { formatDate } from "../../src/lib/date";

export default function AdminDashboardPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const overviewQuery = useAdminOverview(mounted);
  const revenueChartQuery = useAdminRevenueChart("monthly");
  const ordersChartQuery = useAdminOrdersChart("monthly", 90);
  const topProductsQuery = useAdminTopProducts(5);
  const topVendorsQuery = useAdminTopVendors(5);
  const topCustomersQuery = useAdminTopCustomers(5);
  const recentOrdersQuery = useAdminRecentOrders();
  const recentReviewsQuery = useAdminRecentReviews();
  const lowStockQuery = useAdminLowStockProducts(10);
  const { t } = useLanguage();

  const stats = overviewQuery.data?.stats ?? {};
  const numberFormatter = useMemo(() => new Intl.NumberFormat("en-US"), []);
  const moneyFormatter = useMemo(
    () =>
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }),
    [],
  );

  const cards = [
    [t("admin_total_users"), stats.total_users ?? 0],
    [t("admin_total_vendors"), stats.total_vendors ?? 0],
    [t("admin_total_products"), stats.total_products ?? 0],
    [t("admin_total_orders"), stats.total_orders ?? 0],
    [t("admin_pending_orders"), stats.pending_orders ?? 0],
    [t("admin_total_revenue"), stats.total_revenue ?? 0],
  ] as const;

  const revenueTrend = revenueChartQuery.data ?? [];
  const ordersTrend = ordersChartQuery.data ?? [];
  const topProducts = topProductsQuery.data ?? [];
  const topVendors = topVendorsQuery.data ?? [];
  const topCustomers = topCustomersQuery.data ?? [];
  const recentOrders = recentOrdersQuery.data ?? [];
  const recentReviews = recentReviewsQuery.data ?? [];
  const lowStockProducts = lowStockQuery.data ?? [];

  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl space-y-6 p-6 md:p-10">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted">
            {t("admin_tag")}
          </p>
          <h1 className="text-3xl font-bold">{t("admin_dashboard_title")}</h1>
        </div>
        <div className="flex flex-wrap gap-2 text-sm">
          <Link
            href="/admin/users"
            className="rounded-lg border border-slate-300 px-3 py-1.5 dark:border-slate-700"
          >
            {t("admin_users_nav")}
          </Link>
          <Link
            href="/admin/products"
            className="rounded-lg border border-slate-300 px-3 py-1.5 dark:border-slate-700"
          >
            {t("admin_products_nav")}
          </Link>
          <Link
            href="/admin/categories"
            className="rounded-lg border border-slate-300 px-3 py-1.5 dark:border-slate-700"
          >
            {t("admin_categories_nav")}
          </Link>
          <Link
            href="/admin/orders"
            className="rounded-lg border border-slate-300 px-3 py-1.5 dark:border-slate-700"
          >
            {t("admin_orders_nav")}
          </Link>
          <Link
            href="/admin/coupons"
            className="rounded-lg border border-slate-300 px-3 py-1.5 dark:border-slate-700"
          >
            {t("admin_coupons_nav")}
          </Link>
          <Link
            href="/admin/reviews"
            className="rounded-lg border border-slate-300 px-3 py-1.5 dark:border-slate-700"
          >
            {t("admin_reviews_nav")}
          </Link>
          <Link
            href="/admin/settings"
            className="rounded-lg border border-slate-300 px-3 py-1.5 dark:border-slate-700"
          >
            {t("admin_settings_nav")}
          </Link>
        </div>
      </div>

      {mounted && overviewQuery.isLoading ? (
        <p className="text-sm text-muted">{t("admin_loading_overview")}</p>
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

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <article className="rounded-xl bg-card p-4 shadow-soft">
          <h2 className="text-base font-semibold">
            {t("admin_revenue_trend")}
          </h2>
          <div className="mt-3 space-y-2 text-sm">
            {revenueTrend.slice(-6).map((entry) => (
              <div
                key={entry.date}
                className="flex items-center justify-between"
              >
                <span className="text-muted">{entry.date}</span>
                <span className="font-medium">
                  {moneyFormatter.format(entry.revenue)}
                </span>
              </div>
            ))}
            {revenueChartQuery.isLoading ? (
              <p className="text-muted">{t("admin_loading_chart")}</p>
            ) : null}
          </div>
        </article>

        <article className="rounded-xl bg-card p-4 shadow-soft">
          <h2 className="text-base font-semibold">{t("admin_orders_trend")}</h2>
          <div className="mt-3 space-y-2 text-sm">
            {ordersTrend.slice(-6).map((entry) => (
              <div
                key={entry.date}
                className="rounded-lg border border-slate-200/80 p-2 dark:border-slate-700/80"
              >
                <p className="text-xs text-muted">{entry.date}</p>
                <p className="text-sm">
                  {Object.entries(entry.statuses)
                    .map(([status, count]) => `${status}: ${count}`)
                    .join(" | ")}
                </p>
              </div>
            ))}
            {ordersChartQuery.isLoading ? (
              <p className="text-muted">{t("admin_loading_chart")}</p>
            ) : null}
          </div>
        </article>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <article className="rounded-xl bg-card p-4 shadow-soft">
          <h2 className="text-base font-semibold">{t("admin_top_products")}</h2>
          <div className="mt-3 space-y-2 text-sm">
            {topProducts.map((item) => (
              <p key={item.id} className="flex items-center justify-between">
                <span>{item.name}</span>
                <span className="text-muted">
                  {item.total_sold} {t("admin_sold_suffix")}
                </span>
              </p>
            ))}
          </div>
        </article>

        <article className="rounded-xl bg-card p-4 shadow-soft">
          <h2 className="text-base font-semibold">{t("admin_top_vendors")}</h2>
          <div className="mt-3 space-y-2 text-sm">
            {topVendors.map((item) => (
              <p key={item.id} className="flex items-center justify-between">
                <span>{item.name}</span>
                <span className="text-muted">
                  {moneyFormatter.format(item.total_revenue)}
                </span>
              </p>
            ))}
          </div>
        </article>

        <article className="rounded-xl bg-card p-4 shadow-soft">
          <h2 className="text-base font-semibold">
            {t("admin_top_customers")}
          </h2>
          <div className="mt-3 space-y-2 text-sm">
            {topCustomers.map((item) => (
              <p key={item.id} className="flex items-center justify-between">
                <span>{item.name}</span>
                <span className="text-muted">
                  {item.total_orders} {t("admin_orders_count")}
                </span>
              </p>
            ))}
          </div>
        </article>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <article className="rounded-xl bg-card p-4 shadow-soft">
          <h2 className="text-base font-semibold">
            {t("admin_recent_orders")}
          </h2>
          <div className="mt-3 space-y-2 text-sm">
            {recentOrders.map((order) => (
              <p key={order.id} className="flex items-center justify-between">
                <span>{order.order_number}</span>
                <span className="text-muted">
                  {formatDate(order.created_at)}
                </span>
              </p>
            ))}
          </div>
        </article>

        <article className="rounded-xl bg-card p-4 shadow-soft">
          <h2 className="text-base font-semibold">
            {t("admin_recent_reviews")}
          </h2>
          <div className="mt-3 space-y-2 text-sm">
            {recentReviews.map((review) => (
              <p key={review.id} className="flex items-center justify-between">
                <span>
                  {review.user?.name ?? t("admin_unknown")} - {review.rating}/5
                </span>
                <span className="text-muted">
                  {formatDate(review.created_at)}
                </span>
              </p>
            ))}
          </div>
        </article>
      </section>

      <section className="rounded-xl bg-card p-4 shadow-soft">
        <h2 className="text-base font-semibold">
          {t("admin_low_stock_alerts")}
        </h2>
        <div className="mt-3 grid grid-cols-1 gap-2 text-sm md:grid-cols-2">
          {lowStockProducts.map((product) => (
            <p
              key={product.id}
              className="rounded-lg border border-amber-300/70 px-3 py-2 dark:border-amber-800/60"
            >
              {product.name} -{" "}
              <span className="font-semibold">{product.quantity}</span>
            </p>
          ))}
          {lowStockQuery.isLoading ? (
            <p className="text-muted">{t("admin_checking_stock")}</p>
          ) : null}
        </div>
      </section>
    </main>
  );
}
