"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { PaginationControls } from "../../../src/components/pagination-controls";
import {
  useAdminOrderStatistics,
  useAdminOrdersExport,
  useAdminOrders,
  useUpdateOrderStatus,
} from "../../../src/hooks/use-admin";
import { useLanguage } from "../../../src/components/language-provider";
import { getApiErrorMessages } from "../../../src/lib/api-client";
import { formatDate } from "../../../src/lib/date";
import type { OrderStatus, PaymentStatus } from "../../../src/types/order";

const ORDER_STATUSES: OrderStatus[] = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
];

const PAYMENT_STATUSES: PaymentStatus[] = [
  "pending",
  "paid",
  "failed",
  "refunded",
];

export default function AdminOrdersPage() {
  const [page, setPage] = useState(1);
  const ordersQuery = useAdminOrders(page);
  const statsQuery = useAdminOrderStatistics();
  const exportMutation = useAdminOrdersExport();
  const updateStatusMutation = useUpdateOrderStatus();
  const { t } = useLanguage();

  const orders = ordersQuery.data?.data ?? [];
  const paginationMeta = ordersQuery.data?.meta;

  const updateStatus = async ({
    orderNumber,
    status,
    payment_status,
  }: {
    orderNumber: string;
    status: OrderStatus;
    payment_status?: PaymentStatus;
  }) => {
    try {
      await updateStatusMutation.mutateAsync({
        orderNumber,
        status,
        payment_status,
      });
      toast.success(t("admin_order_status_updated"));
    } catch (error) {
      toast.error(getApiErrorMessages(error).join(" | "));
    }
  };

  const exportOrders = async () => {
    try {
      const payload = await exportMutation.mutateAsync();
      toast.success(
        t("admin_export_loaded").replace("{total}", String(payload.total)),
      );
      // Keep it simple for now: make data available quickly to ops users.
      console.table(payload.orders.slice(0, 25));
    } catch (error) {
      toast.error(getApiErrorMessages(error).join(" | "));
    }
  };

  const stats = statsQuery.data?.statistics;

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl p-6 md:p-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold">{t("admin_orders_title")}</h1>
        <button
          type="button"
          onClick={exportOrders}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm dark:border-slate-700"
        >
          {t("admin_export_orders")}
        </button>
      </div>

      {stats ? (
        <section className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          <article className="rounded-xl bg-card p-3 shadow-soft">
            <p className="text-xs text-muted">{t("admin_total_orders")}</p>
            <p className="text-xl font-bold">{stats.total}</p>
          </article>
          <article className="rounded-xl bg-card p-3 shadow-soft">
            <p className="text-xs text-muted">{t("admin_revenue")}</p>
            <p className="text-xl font-bold">
              ${Number(stats.total_revenue).toFixed(0)}
            </p>
          </article>
          <article className="rounded-xl bg-card p-3 shadow-soft">
            <p className="text-xs text-muted">{t("admin_today")}</p>
            <p className="text-xl font-bold">{stats.today}</p>
          </article>
          <article className="rounded-xl bg-card p-3 shadow-soft">
            <p className="text-xs text-muted">{t("admin_this_month")}</p>
            <p className="text-xl font-bold">{stats.this_month}</p>
          </article>
        </section>
      ) : null}

      {ordersQuery.isLoading ? (
        <p className="text-sm text-muted">{t("admin_loading_orders")}</p>
      ) : null}

      <section className="space-y-3">
        {orders.map((order) => (
          <article
            key={order.id}
            className="rounded-xl bg-card p-4 shadow-soft"
          >
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="font-semibold">{order.order_number}</h2>
                <p className="text-sm text-muted">
                  {t("admin_current")}: {order.status} / {order.payment_status}
                </p>
                <p className="text-xs text-muted">
                  {t("admin_created")}: {formatDate(order.created_at)}
                </p>
                <p className="text-xs text-muted">
                  {t("admin_customer")}: {order.user?.name || "-"}
                </p>
                <p className="text-xs text-muted">
                  {t("admin_phone")}: {order.shipping_phone || "-"} |{" "}
                  {t("admin_city")}: {order.shipping_city || "-"}
                </p>
                <p className="text-xs text-muted">
                  {t("admin_address")}: {order.shipping_address || "-"}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <select
                  className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-900"
                  defaultValue={order.status}
                  onChange={(e) =>
                    updateStatus({
                      orderNumber: order.order_number,
                      status: e.target.value as OrderStatus,
                      payment_status: order.payment_status,
                    })
                  }
                >
                  {ORDER_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>

                <select
                  className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-900"
                  defaultValue={order.payment_status}
                  onChange={(e) =>
                    updateStatus({
                      orderNumber: order.order_number,
                      status: order.status,
                      payment_status: e.target.value as PaymentStatus,
                    })
                  }
                >
                  {PAYMENT_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-3 rounded-lg border border-slate-200/80 p-3 text-sm dark:border-slate-700/80">
              <p className="mb-1 font-medium">{t("admin_order_items")}</p>
              <div className="space-y-1 text-muted">
                {order.items?.map((item) => (
                  <p key={item.id}>
                    {item.product_name || t("common_product")} x {item.quantity}{" "}
                    = ${Number(item.subtotal).toFixed(2)}
                  </p>
                ))}
              </div>
            </div>
          </article>
        ))}

        {!ordersQuery.isLoading && orders.length === 0 ? (
          <p className="text-sm text-muted">{t("admin_no_orders_found")}</p>
        ) : null}
      </section>

      {paginationMeta ? (
        <PaginationControls
          currentPage={paginationMeta.current_page}
          lastPage={paginationMeta.last_page}
          onPageChange={setPage}
          disabled={ordersQuery.isFetching}
        />
      ) : null}
    </main>
  );
}
