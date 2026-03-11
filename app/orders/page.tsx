"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { PaginationControls } from "../../src/components/pagination-controls";
import { useCancelOrder, useOrdersPage } from "../../src/hooks/use-orders";
import { useLanguage } from "../../src/components/language-provider";
import { getApiErrorMessages } from "../../src/lib/api-client";

export default function OrdersPage() {
  const [page, setPage] = useState(1);
  const created = useMemo(() => {
    if (typeof window === "undefined") {
      return null;
    }

    return new URLSearchParams(window.location.search).get("created");
  }, []);

  const ordersQuery = useOrdersPage(page);
  const cancelMutation = useCancelOrder();
  const { t } = useLanguage();

  const orders = ordersQuery.data?.data ?? [];
  const paginationMeta = ordersQuery.data?.meta;

  const handleCancelOrder = async (orderNumber: string) => {
    try {
      await cancelMutation.mutateAsync(orderNumber);
      toast.success(t("orders_cancel_success"));
    } catch (error) {
      toast.error(getApiErrorMessages(error).join(" | "));
    }
  };

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl p-6 md:p-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t("orders_title")}</h1>
        <Link
          href="/checkout"
          className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-slate-950"
        >
          {t("orders_new_order")}
        </Link>
      </div>

      {created ? (
        <p className="mb-4 rounded-xl bg-emerald-100 px-4 py-2 text-sm text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
          {t("orders_created_success")}: {created}
        </p>
      ) : null}

      {ordersQuery.isLoading ? (
        <p className="text-sm text-muted">{t("orders_loading")}</p>
      ) : null}

      {ordersQuery.isError ? (
        <div className="space-y-2 rounded-xl bg-rose-100 px-4 py-2 text-sm text-rose-700 dark:bg-rose-900/40 dark:text-rose-300">
          {getApiErrorMessages(ordersQuery.error).map((message, i) => (
            <p key={`${message}-${i}`}>{message}</p>
          ))}
        </div>
      ) : null}

      <div className="space-y-4">
        {orders.map((order) => (
          <article
            key={order.id}
            className="rounded-2xl bg-card p-5 shadow-soft md:p-7"
          >
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-lg font-semibold">{order.order_number}</h2>
                <p className="text-sm text-muted">
                  Status: {order.status} | Payment: {order.payment_status}
                </p>
              </div>
              <p className="text-lg font-bold text-accent">
                ${Number(order.total).toFixed(2)}
              </p>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-2 text-sm text-muted md:grid-cols-2">
              <p>
                {t("orders_shipping_name")}: {order.shipping_name || "-"}
              </p>
              <p>
                {t("orders_shipping_phone")}: {order.shipping_phone || "-"}
              </p>
              <p>
                {t("orders_shipping_city")}: {order.shipping_city || "-"}
              </p>
              <p>
                {t("orders_shipping_email")}: {order.shipping_email || "-"}
              </p>
              <p className="md:col-span-2">
                {t("orders_shipping_address")}: {order.shipping_address || "-"}
              </p>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {order.status === "pending" ? (
                <button
                  type="button"
                  onClick={() => handleCancelOrder(order.order_number)}
                  className="rounded-lg border border-rose-300 px-3 py-1 text-sm text-rose-700 dark:border-rose-800 dark:text-rose-300"
                >
                  {t("orders_cancel")}
                </button>
              ) : null}
            </div>
          </article>
        ))}

        {!ordersQuery.isLoading && orders.length === 0 ? (
          <p className="text-sm text-muted">{t("orders_no_orders")}</p>
        ) : null}

        {paginationMeta ? (
          <PaginationControls
            currentPage={paginationMeta.current_page}
            lastPage={paginationMeta.last_page}
            onPageChange={setPage}
            disabled={ordersQuery.isFetching}
          />
        ) : null}
      </div>

      <section className="mt-6 rounded-2xl border border-emerald-300/60 bg-emerald-100/60 p-4 text-sm text-emerald-800 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200">
        {t("orders_cod_only_note")}
      </section>
    </main>
  );
}
