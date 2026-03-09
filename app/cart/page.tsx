"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  useCart,
  useClearCart,
  useRemoveCartItem,
  useUpdateCartItem,
} from "../../src/hooks/use-cart";
import { getApiErrorMessages } from "../../src/lib/api-client";

export default function CartPage() {
  const cartQuery = useCart();
  const updateItemMutation = useUpdateCartItem();
  const removeItemMutation = useRemoveCartItem();
  const clearCartMutation = useClearCart();

  const cart = cartQuery.data;

  const errorMessages = useMemo(() => {
    if (!cartQuery.isError) return [];
    return getApiErrorMessages(cartQuery.error);
  }, [cartQuery.error, cartQuery.isError]);

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl p-6 md:p-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Cart</h1>
        <Link href="/" className="text-sm text-accent hover:underline">
          Continue shopping
        </Link>
      </div>

      {cartQuery.isLoading ? (
        <p className="text-sm text-muted">Loading cart...</p>
      ) : null}

      {cartQuery.isError ? (
        <div className="space-y-2 rounded-xl border border-rose-300/40 bg-rose-100/70 p-4 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300">
          {errorMessages.map((message, idx) => (
            <p key={`${message}-${idx}`}>{message}</p>
          ))}
          <p>
            <Link
              href="/login?next=/cart"
              className="font-medium text-accent hover:underline"
            >
              Login to access your cart
            </Link>
          </p>
        </div>
      ) : null}

      {cart && !cartQuery.isError ? (
        <section className="space-y-4 rounded-2xl bg-card p-5 shadow-soft md:p-7">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted">{cart.items_count} item(s)</p>
            <button
              type="button"
              onClick={() => clearCartMutation.mutate()}
              disabled={clearCartMutation.isPending || cart.items.length === 0}
              className="rounded-xl border border-slate-300 px-3 py-2 text-sm transition hover:bg-slate-100 disabled:opacity-60 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              {clearCartMutation.isPending ? "Clearing..." : "Clear cart"}
            </button>
          </div>

          {cart.items.length === 0 ? (
            <p className="text-sm text-muted">Your cart is empty.</p>
          ) : null}

          <div className="space-y-3">
            {cart.items.map((item) => (
              <article
                key={item.id}
                className="flex flex-col gap-3 rounded-xl border border-slate-200 p-4 md:flex-row md:items-center md:justify-between dark:border-slate-700"
              >
                <div>
                  <h2 className="font-semibold">{item.product?.name}</h2>
                  <p className="text-sm text-muted">
                    ${Number(item.product?.price ?? 0).toFixed(2)}
                  </p>
                  <p className="text-sm text-muted">
                    Subtotal: ${Number(item.subtotal).toFixed(2)}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="rounded-lg border border-slate-300 px-2 py-1 text-sm dark:border-slate-700"
                    onClick={() =>
                      updateItemMutation.mutate({
                        product_id: item.product.id,
                        quantity: Math.max(1, item.quantity - 1),
                      })
                    }
                    disabled={updateItemMutation.isPending}
                  >
                    -
                  </button>
                  <span className="min-w-8 text-center text-sm">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    className="rounded-lg border border-slate-300 px-2 py-1 text-sm dark:border-slate-700"
                    onClick={() =>
                      updateItemMutation.mutate({
                        product_id: item.product.id,
                        quantity: item.quantity + 1,
                      })
                    }
                    disabled={updateItemMutation.isPending}
                  >
                    +
                  </button>
                  <button
                    type="button"
                    className="ml-2 rounded-lg bg-rose-100 px-3 py-1 text-sm text-rose-700 hover:opacity-90 dark:bg-rose-900/40 dark:text-rose-300"
                    onClick={() => removeItemMutation.mutate(item.product.id)}
                    disabled={removeItemMutation.isPending}
                  >
                    Remove
                  </button>
                </div>
              </article>
            ))}
          </div>

          <div className="border-t border-slate-200 pt-4 dark:border-slate-700">
            <p className="text-lg font-semibold">
              Total: ${Number(cart.total).toFixed(2)}
            </p>
          </div>
        </section>
      ) : null}
    </main>
  );
}
