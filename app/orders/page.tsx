"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { PaginationControls } from "../../src/components/pagination-controls";
import {
  useCancelOrder,
  useInitiatePayment,
  useOrdersPage,
  usePaymentStatus,
} from "../../src/hooks/use-orders";
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
  const paymentMutation = useInitiatePayment();

  const orders = ordersQuery.data?.data ?? [];
  const paginationMeta = ordersQuery.data?.meta;
  const latestOrderNumber = orders[0]?.order_number;
  const paymentStatusQuery = usePaymentStatus(latestOrderNumber);

  const handleCancelOrder = async (orderNumber: string) => {
    try {
      await cancelMutation.mutateAsync(orderNumber);
      toast.success("Order cancelled successfully");
    } catch (error) {
      toast.error(getApiErrorMessages(error).join(" | "));
    }
  };

  const handlePayment = async (
    orderNumber: string,
    gateway: "stripe" | "paypal" | "cod",
  ) => {
    try {
      const result = await paymentMutation.mutateAsync({
        order_number: orderNumber,
        gateway,
      });
      if (result.payment_url) {
        window.open(result.payment_url, "_blank", "noopener,noreferrer");
      }
      toast.success("Payment request sent");
    } catch (error) {
      toast.error(getApiErrorMessages(error).join(" | "));
    }
  };

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl p-6 md:p-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Orders</h1>
        <Link
          href="/checkout"
          className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-slate-950"
        >
          New order
        </Link>
      </div>

      {created ? (
        <p className="mb-4 rounded-xl bg-emerald-100 px-4 py-2 text-sm text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
          Order created successfully: {created}
        </p>
      ) : null}

      {ordersQuery.isLoading ? (
        <p className="text-sm text-muted">Loading orders...</p>
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

            <div className="mt-4 flex flex-wrap gap-2">
              {order.status === "pending" ? (
                <button
                  type="button"
                  onClick={() => handleCancelOrder(order.order_number)}
                  className="rounded-lg border border-rose-300 px-3 py-1 text-sm text-rose-700 dark:border-rose-800 dark:text-rose-300"
                >
                  Cancel order
                </button>
              ) : null}

              <button
                type="button"
                onClick={() => handlePayment(order.order_number, "stripe")}
                className="rounded-lg border border-slate-300 px-3 py-1 text-sm dark:border-slate-700"
              >
                Pay (Stripe)
              </button>
              <button
                type="button"
                onClick={() => handlePayment(order.order_number, "paypal")}
                className="rounded-lg border border-slate-300 px-3 py-1 text-sm dark:border-slate-700"
              >
                Pay (PayPal)
              </button>
              <button
                type="button"
                onClick={() => handlePayment(order.order_number, "cod")}
                className="rounded-lg border border-slate-300 px-3 py-1 text-sm dark:border-slate-700"
              >
                Set COD
              </button>
            </div>
          </article>
        ))}

        {!ordersQuery.isLoading && orders.length === 0 ? (
          <p className="text-sm text-muted">No orders yet.</p>
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

      {paymentMutation.isError ? (
        <div className="mt-4 space-y-1 rounded-xl bg-rose-100 px-4 py-2 text-sm text-rose-700 dark:bg-rose-900/40 dark:text-rose-300">
          {getApiErrorMessages(paymentMutation.error).map((message, i) => (
            <p key={`${message}-${i}`}>{message}</p>
          ))}
        </div>
      ) : null}

      {paymentStatusQuery.data ? (
        <section className="mt-6 rounded-2xl bg-card p-5 shadow-soft md:p-7">
          <h3 className="text-lg font-semibold">Latest payment status</h3>
          <p className="mt-2 text-sm text-muted">
            Order: {paymentStatusQuery.data.order_number}
          </p>
          <p className="text-sm text-muted">
            Method: {paymentStatusQuery.data.payment_method || "-"}
          </p>
          <p className="text-sm text-muted">
            Status: {paymentStatusQuery.data.payment_status}
          </p>
        </section>
      ) : null}
    </main>
  );
}
