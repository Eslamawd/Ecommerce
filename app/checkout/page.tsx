"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import toast from "react-hot-toast";
import { useCreateOrder, useValidateCoupon } from "../../src/hooks/use-orders";
import { useLanguage } from "../../src/components/language-provider";
import { getApiErrorMessages } from "../../src/lib/api-client";

export default function CheckoutPage() {
  const router = useRouter();
  const createOrderMutation = useCreateOrder();
  const validateCouponMutation = useValidateCoupon();
  const { t, language } = useLanguage();

  const [form, setForm] = useState({
    shipping_name: "",
    shipping_phone: "",
    shipping_address: "",
    shipping_city: "",
    shipping_email: "",
    payment_method: "cash_on_delivery" as const,
    coupon_code: "",
    notes: "",
    shipping_latitude: "",
    shipping_longitude: "",
  });

  const [isLocating, setIsLocating] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const order = await createOrderMutation.mutateAsync({
        ...form,
        coupon_code: form.coupon_code || undefined,
        shipping_email: form.shipping_email || undefined,
        notes: form.notes || undefined,
        shipping_latitude: form.shipping_latitude
          ? Number(form.shipping_latitude)
          : undefined,
        shipping_longitude: form.shipping_longitude
          ? Number(form.shipping_longitude)
          : undefined,
      });

      router.push(`/orders?created=${order.order_number}`);
    } catch {
      // handled by mutation state
    }
  };

  const validateCoupon = async () => {
    if (!form.coupon_code.trim()) {
      toast.error(t("checkout_coupon_optional"));
      return;
    }

    try {
      const result = await validateCouponMutation.mutateAsync({
        code: form.coupon_code.trim(),
      });
      toast.success(`${t("checkout_validate_coupon")}: ${result.discount}`);
    } catch (error) {
      toast.error(getApiErrorMessages(error).join(" | "));
    }
  };

  const detectLocation = () => {
    if (!navigator.geolocation) {
      toast.error(
        language === "en"
          ? "Geolocation is not supported."
          : "المتصفح لا يدعم تحديد الموقع.",
      );
      return;
    }

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setForm((prev) => ({
          ...prev,
          shipping_latitude: String(position.coords.latitude),
          shipping_longitude: String(position.coords.longitude),
        }));

        setIsLocating(false);
        toast.success(
          language === "en" ? "Location detected." : "تم تحديد الموقع بنجاح.",
        );
      },
      () => {
        setIsLocating(false);
        toast.error(
          language === "en"
            ? "Failed to get location."
            : "فشل تحديد الموقع. تأكد من الصلاحيات.",
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  };

  return (
    <main className="mx-auto min-h-screen w-full max-w-4xl p-6 md:p-10">
      <h1 className="mb-6 text-3xl font-bold">{t("checkout_title")}</h1>

      <form
        onSubmit={onSubmit}
        className="space-y-4 rounded-2xl bg-card p-5 shadow-soft md:p-7"
      >
        <Field
          label={t("checkout_shipping_name")}
          value={form.shipping_name}
          onChange={(value) =>
            setForm((prev) => ({ ...prev, shipping_name: value }))
          }
          required
        />
        <Field
          label={t("checkout_shipping_phone")}
          value={form.shipping_phone}
          onChange={(value) =>
            setForm((prev) => ({ ...prev, shipping_phone: value }))
          }
          required
        />
        <Field
          label={t("checkout_shipping_address")}
          value={form.shipping_address}
          onChange={(value) =>
            setForm((prev) => ({ ...prev, shipping_address: value }))
          }
          required
        />
        <Field
          label={t("checkout_shipping_city")}
          value={form.shipping_city}
          onChange={(value) =>
            setForm((prev) => ({ ...prev, shipping_city: value }))
          }
          required
        />
        <Field
          label={t("checkout_shipping_email_optional")}
          value={form.shipping_email}
          onChange={(value) =>
            setForm((prev) => ({ ...prev, shipping_email: value }))
          }
          type="email"
        />

        <div className="space-y-2 rounded-xl border border-slate-300/60 p-3 dark:border-slate-700">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-muted">
              {language === "en"
                ? "Delivery location (optional but recommended)"
                : "موقع التسليم (اختياري لكن مفضل)"}
            </p>
            <button
              type="button"
              onClick={detectLocation}
              disabled={isLocating}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs dark:border-slate-700"
            >
              {isLocating
                ? language === "en"
                  ? "Detecting..."
                  : "جاري التحديد..."
                : language === "en"
                  ? "Use my location"
                  : "استخدم موقعي"}
            </button>
          </div>

          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            <Field
              label={language === "en" ? "Latitude" : "خط العرض"}
              value={form.shipping_latitude}
              onChange={(value) =>
                setForm((prev) => ({ ...prev, shipping_latitude: value }))
              }
            />
            <Field
              label={language === "en" ? "Longitude" : "خط الطول"}
              value={form.shipping_longitude}
              onChange={(value) =>
                setForm((prev) => ({ ...prev, shipping_longitude: value }))
              }
            />
          </div>
        </div>

        <Field
          label={t("checkout_coupon_optional")}
          value={form.coupon_code}
          onChange={(value) =>
            setForm((prev) => ({ ...prev, coupon_code: value }))
          }
        />
        <button
          type="button"
          onClick={validateCoupon}
          className="rounded-xl border border-slate-300 px-4 py-2 text-sm dark:border-slate-700"
        >
          {t("checkout_validate_coupon")}
        </button>

        <div className="rounded-xl border border-emerald-300/70 bg-emerald-100/60 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200">
          {t("checkout_payment_cod_only")}
        </div>

        <div>
          <label className="mb-1 block text-sm text-muted">
            {t("checkout_notes_optional")}
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
          {createOrderMutation.isPending
            ? t("checkout_placing")
            : t("checkout_place_order")}
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
