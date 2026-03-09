"use client";

import { useState } from "react";
import { PaginationControls } from "../../../src/components/pagination-controls";
import { useVendorOrders } from "../../../src/hooks/use-vendor";

export default function VendorOrdersPage() {
  const [page, setPage] = useState(1);
  const ordersQuery = useVendorOrders(page);
  const orders = ordersQuery.data?.data ?? [];
  const paginationMeta = ordersQuery.data?.meta;

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl p-6 md:p-10">
      <h1 className="mb-6 text-3xl font-bold">Vendor Orders</h1>

      {ordersQuery.isLoading ? (
        <p className="text-sm text-muted">Loading vendor orders...</p>
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
                <p className="text-sm text-muted">Status: {order.status}</p>
                <p className="text-sm text-muted">
                  Customer: {order.user?.name || "-"}
                </p>
              </div>
              <p className="font-semibold text-accent">
                ${Number(order.total).toFixed(2)}
              </p>
            </div>
          </article>
        ))}

        {!ordersQuery.isLoading && orders.length === 0 ? (
          <p className="text-sm text-muted">No vendor orders found.</p>
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
