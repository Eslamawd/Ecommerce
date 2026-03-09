"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { PaginationControls } from "../../../src/components/pagination-controls";
import {
  useAdminOrders,
  useUpdateOrderStatus,
} from "../../../src/hooks/use-admin";
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
  const updateStatusMutation = useUpdateOrderStatus();

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
      toast.success("Order status updated");
    } catch (error) {
      toast.error(getApiErrorMessages(error).join(" | "));
    }
  };

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl p-6 md:p-10">
      <h1 className="mb-6 text-3xl font-bold">Admin Orders</h1>

      {ordersQuery.isLoading ? (
        <p className="text-sm text-muted">Loading orders...</p>
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
                  Current: {order.status} / {order.payment_status}
                </p>
                <p className="text-xs text-muted">
                  Created: {formatDate(order.created_at)}
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
          </article>
        ))}

        {!ordersQuery.isLoading && orders.length === 0 ? (
          <p className="text-sm text-muted">No orders found.</p>
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
