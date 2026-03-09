"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useCreateOrder } from "../../src/hooks/use-orders";
import { getApiErrorMessages } from "../../src/lib/api-client";

export default function CheckoutPage() {
  const router = useRouter();
  const createOrderMutation = useCreateOrder();

  const [form, setForm] = useState({
    shipping_name: "",
    shipping_phone: "",
    shipping_address: "",
    shipping_city: "",
    shipping_email: "",
    payment_method: "cash_on_delivery" as "cash_on_delivery" | "online",
    coupon_code: "",
    notes: "",
  });

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const order = await createOrderMutation.mutateAsync({
        ...form,
        coupon_code: form.coupon_code || undefined,
        shipping_email: form.shipping_email || undefined,
        notes: form.notes || undefined,
      });

      router.push(`/orders?created=${order.order_number}`);
    } catch {
      // handled by mutation state
    }
  };

  return (
    <main className="mx-auto min-h-screen w-full max-w-4xl p-6 md:p-10">
      <h1 className="mb-6 text-3xl font-bold">Checkout</h1>

      <form
        onSubmit={onSubmit}
        className="space-y-4 rounded-2xl bg-card p-5 shadow-soft md:p-7"
      >
        <Field
          label="Shipping name"
          value={form.shipping_name}
          onChange={(value) =>
            setForm((prev) => ({ ...prev, shipping_name: value }))
          }
          required
        />
        <Field
          label="Shipping phone"
          value={form.shipping_phone}
          onChange={(value) =>
            setForm((prev) => ({ ...prev, shipping_phone: value }))
          }
          required
        />
        <Field
          label="Shipping address"
          value={form.shipping_address}
          onChange={(value) =>
            setForm((prev) => ({ ...prev, shipping_address: value }))
          }
          required
        />
        <Field
          label="Shipping city"
          value={form.shipping_city}
          onChange={(value) =>
            setForm((prev) => ({ ...prev, shipping_city: value }))
          }
          required
        />
        <Field
          label="Shipping email (optional)"
          value={form.shipping_email}
          onChange={(value) =>
            setForm((prev) => ({ ...prev, shipping_email: value }))
          }
          type="email"
        />
        <Field
          label="Coupon code (optional)"
          value={form.coupon_code}
          onChange={(value) =>
            setForm((prev) => ({ ...prev, coupon_code: value }))
          }
        />

        <div>
          <p className="mb-2 text-sm text-muted">Payment method</p>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className={`rounded-xl px-4 py-2 text-sm ${
                form.payment_method === "cash_on_delivery"
                  ? "bg-accent font-semibold text-slate-950"
                  : "border border-slate-300 dark:border-slate-700"
              }`}
              onClick={() =>
                setForm((prev) => ({
                  ...prev,
                  payment_method: "cash_on_delivery",
                }))
              }
            >
              Cash on delivery
            </button>
            <button
              type="button"
              className={`rounded-xl px-4 py-2 text-sm ${
                form.payment_method === "online"
                  ? "bg-accent font-semibold text-slate-950"
                  : "border border-slate-300 dark:border-slate-700"
              }`}
              onClick={() =>
                setForm((prev) => ({ ...prev, payment_method: "online" }))
              }
            >
              Online
            </button>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm text-muted">
            Notes (optional)
          </label>
          <textarea
            value={form.notes}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, notes: e.target.value }))
            }
            rows={3}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none ring-cyan-300 focus:ring-2 dark:border-slate-700 dark:bg-slate-900"
          />
        </div>

        {createOrderMutation.isError ? (
          <div className="rounded-xl bg-rose-100 px-3 py-2 text-sm text-rose-700 dark:bg-rose-900/40 dark:text-rose-300">
            {getApiErrorMessages(createOrderMutation.error).map(
              (message, index) => (
                <p key={`${message}-${index}`}>{message}</p>
              ),
            )}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={createOrderMutation.isPending}
          className="w-full rounded-xl bg-accent px-4 py-2 font-medium text-slate-950 transition hover:opacity-90 disabled:opacity-60"
        >
          {createOrderMutation.isPending ? "Placing order..." : "Place order"}
        </button>
      </form>
    </main>
  );
}

type FieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  type?: string;
};

function Field({
  label,
  value,
  onChange,
  required,
  type = "text",
}: FieldProps) {
  return (
    <div>
      <label className="mb-1 block text-sm text-muted">{label}</label>
      <input
        type={type}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none ring-cyan-300 focus:ring-2 dark:border-slate-700 dark:bg-slate-900"
      />
    </div>
  );
}
