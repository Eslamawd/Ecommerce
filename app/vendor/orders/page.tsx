"use client";

import { useState } from "react";
import { PaginationControls } from "../../../src/components/pagination-controls";
import { useLanguage } from "../../../src/components/language-provider";
import { useVendorOrders } from "../../../src/hooks/use-vendor";

export default function VendorOrdersPage() {
  const [page, setPage] = useState(1);
  const ordersQuery = useVendorOrders(page);
  const { t } = useLanguage();
  const orders = ordersQuery.data?.data ?? [];
  const paginationMeta = ordersQuery.data?.meta;

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl p-6 md:p-10">
      <h1 className="mb-6 text-3xl font-bold">{t("vendor_orders_title")}</h1>

      {ordersQuery.isLoading ? (
        <p className="text-sm text-muted">{t("vendor_orders_loading")}</p>
      ) : null}

      <section className="space-y-3">
        {orders.map((order) => (
          <article
            key={order.id}
            className="rounded-xl bg-card p-4 shadow-soft"
          >
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="font-semibold">{order.order_number}</h2>
                <p className="text-sm text-muted">
                  {t("vendor_status")}: {order.status}
                </p>
                <p className="text-sm text-muted">
                  {t("vendor_customer")}: {order.user?.name || "-"}
                </p>
                <p className="text-sm text-muted">
                  {t("vendor_phone")}: {order.shipping_phone || "-"}
                </p>
                <p className="text-sm text-muted">
                  {t("vendor_city")}: {order.shipping_city || "-"}
                </p>
              </div>
              <p className="font-semibold text-accent">
                ${Number(order.total).toFixed(2)}
              </p>
            </div>

            <div className="mt-3 rounded-lg border border-slate-200/80 p-3 text-sm dark:border-slate-700/80">
              <p className="font-medium">{t("vendor_shipping_address")}</p>
              <p className="text-muted">{order.shipping_address || "-"}</p>
            </div>

            <div className="mt-3">
              <p className="mb-2 text-sm font-medium">
                {t("vendor_order_items")}
              </p>
              <div className="space-y-1 text-sm">
                {order.items?.map((item) => (
                  <p key={item.id} className="text-muted">
                    {item.product_name || t("common_product")} x {item.quantity}{" "}
                    = ${Number(item.subtotal).toFixed(2)}
                  </p>
                ))}
              </div>
            </div>
          </article>
        ))}

        {!ordersQuery.isLoading && orders.length === 0 ? (
          <p className="text-sm text-muted">{t("vendor_no_orders")}</p>
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
