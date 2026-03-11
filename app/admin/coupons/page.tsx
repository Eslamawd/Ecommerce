"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { PaginationControls } from "../../../src/components/pagination-controls";
import {
  useAdminCoupons,
  useCreateAdminCoupon,
  useDeleteAdminCoupon,
  useUpdateAdminCoupon,
} from "../../../src/hooks/use-admin";
import { useLanguage } from "../../../src/components/language-provider";
import { getApiErrorMessages } from "../../../src/lib/api-client";

type CouponForm = {
  code: string;
  type: "fixed" | "percentage";
  value: string;
  min_order_amount: string;
  max_discount: string;
  usage_limit: string;
  starts_at: string;
  expires_at: string;
  is_active: boolean;
};

const EMPTY_FORM: CouponForm = {
  code: "",
  type: "fixed",
  value: "",
  min_order_amount: "",
  max_discount: "",
  usage_limit: "",
  starts_at: "",
  expires_at: "",
  is_active: true,
};

export default function AdminCouponsPage() {
  const [page, setPage] = useState(1);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<CouponForm>(EMPTY_FORM);

  const couponsQuery = useAdminCoupons(page);
  const createMutation = useCreateAdminCoupon();
  const updateMutation = useUpdateAdminCoupon();
  const deleteMutation = useDeleteAdminCoupon();
  const { t } = useLanguage();

  const coupons = couponsQuery.data?.data ?? [];
  const meta = couponsQuery.data?.meta;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();

    const payload = {
      code: form.code,
      type: form.type,
      value: Number(form.value),
      min_order_amount: form.min_order_amount
        ? Number(form.min_order_amount)
        : null,
      max_discount: form.max_discount ? Number(form.max_discount) : null,
      usage_limit: form.usage_limit ? Number(form.usage_limit) : null,
      starts_at: form.starts_at || null,
      expires_at: form.expires_at || null,
      is_active: form.is_active,
    };

    try {
      if (editingId) {
        await updateMutation.mutateAsync({
          couponId: editingId,
          body: payload,
        });
        toast.success(t("admin_coupon_updated"));
      } else {
        await createMutation.mutateAsync(payload);
        toast.success(t("admin_coupon_created"));
      }

      setEditingId(null);
      setForm(EMPTY_FORM);
    } catch (error) {
      toast.error(getApiErrorMessages(error).join(" | "));
    }
  };

  const startEdit = (coupon: (typeof coupons)[number]) => {
    setEditingId(coupon.id);
    setForm({
      code: coupon.code,
      type: coupon.type,
      value: String(coupon.value),
      min_order_amount:
        coupon.min_order_amount == null ? "" : String(coupon.min_order_amount),
      max_discount:
        coupon.max_discount == null ? "" : String(coupon.max_discount),
      usage_limit: coupon.usage_limit == null ? "" : String(coupon.usage_limit),
      starts_at: coupon.starts_at ? String(coupon.starts_at).slice(0, 16) : "",
      expires_at: coupon.expires_at
        ? String(coupon.expires_at).slice(0, 16)
        : "",
      is_active: Boolean(coupon.is_active),
    });
  };

  const removeCoupon = async (couponId: number) => {
    try {
      await deleteMutation.mutateAsync(couponId);
      toast.success(t("admin_coupon_deleted"));
    } catch (error) {
      toast.error(getApiErrorMessages(error).join(" | "));
    }
  };

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl space-y-6 p-6 md:p-10">
      <section className="rounded-3xl border border-slate-200/80 bg-gradient-to-br from-white via-amber-50 to-orange-100 p-6 shadow-soft dark:border-slate-700/70 dark:from-slate-900 dark:via-slate-900 dark:to-amber-950">
        <p className="text-xs uppercase tracking-[0.2em] text-muted">
          {t("admin_revenue_tools")}
        </p>
        <h1 className="text-3xl font-black tracking-tight">
          {t("admin_coupons_title")}
        </h1>
      </section>

      <section className="rounded-2xl border border-slate-200/80 bg-card p-4 shadow-soft dark:border-slate-700/70">
        <h2 className="mb-3 text-lg font-semibold">
          {editingId
            ? `${t("admin_edit_coupon")} #${editingId}`
            : t("admin_create_coupon")}
        </h2>

        <form
          onSubmit={submit}
          className="grid grid-cols-1 gap-3 md:grid-cols-3"
        >
          <input
            className="rounded-lg border border-slate-300 bg-transparent px-3 py-2 text-sm dark:border-slate-700"
            placeholder={t("admin_code")}
            value={form.code}
            onChange={(e) =>
              setForm((p) => ({ ...p, code: e.target.value.toUpperCase() }))
            }
            required
          />

          <select
            className="rounded-lg border border-slate-300 bg-transparent px-3 py-2 text-sm dark:border-slate-700"
            value={form.type}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                type: e.target.value as "fixed" | "percentage",
              }))
            }
          >
            <option value="fixed">{t("admin_fixed")}</option>
            <option value="percentage">{t("admin_percentage")}</option>
          </select>

          <input
            type="number"
            min="0"
            step="0.01"
            className="rounded-lg border border-slate-300 bg-transparent px-3 py-2 text-sm dark:border-slate-700"
            placeholder={t("admin_value")}
            value={form.value}
            onChange={(e) => setForm((p) => ({ ...p, value: e.target.value }))}
            required
          />

          <input
            type="number"
            min="0"
            step="0.01"
            className="rounded-lg border border-slate-300 bg-transparent px-3 py-2 text-sm dark:border-slate-700"
            placeholder={t("admin_min_order")}
            value={form.min_order_amount}
            onChange={(e) =>
              setForm((p) => ({ ...p, min_order_amount: e.target.value }))
            }
          />

          <input
            type="number"
            min="0"
            step="0.01"
            className="rounded-lg border border-slate-300 bg-transparent px-3 py-2 text-sm dark:border-slate-700"
            placeholder={t("admin_max_discount")}
            value={form.max_discount}
            onChange={(e) =>
              setForm((p) => ({ ...p, max_discount: e.target.value }))
            }
          />

          <input
            type="number"
            min="1"
            className="rounded-lg border border-slate-300 bg-transparent px-3 py-2 text-sm dark:border-slate-700"
            placeholder={t("admin_usage_limit")}
            value={form.usage_limit}
            onChange={(e) =>
              setForm((p) => ({ ...p, usage_limit: e.target.value }))
            }
          />

          <input
            type="datetime-local"
            className="rounded-lg border border-slate-300 bg-transparent px-3 py-2 text-sm dark:border-slate-700"
            value={form.starts_at}
            onChange={(e) =>
              setForm((p) => ({ ...p, starts_at: e.target.value }))
            }
          />

          <input
            type="datetime-local"
            className="rounded-lg border border-slate-300 bg-transparent px-3 py-2 text-sm dark:border-slate-700"
            value={form.expires_at}
            onChange={(e) =>
              setForm((p) => ({ ...p, expires_at: e.target.value }))
            }
          />

          <label className="flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) =>
                setForm((p) => ({ ...p, is_active: e.target.checked }))
              }
            />
            {t("admin_active_label")}
          </label>

          <div className="md:col-span-3 flex flex-wrap gap-2">
            <button
              type="submit"
              className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-slate-950"
            >
              {editingId
                ? t("admin_update_coupon")
                : t("admin_create_coupon_btn")}
            </button>
            {editingId ? (
              <button
                type="button"
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm dark:border-slate-700"
                onClick={() => {
                  setEditingId(null);
                  setForm(EMPTY_FORM);
                }}
              >
                {t("admin_cancel_edit")}
              </button>
            ) : null}
          </div>
        </form>
      </section>

      <section className="space-y-3">
        {coupons.map((coupon) => (
          <article
            key={coupon.id}
            className="rounded-xl bg-card p-4 shadow-soft"
          >
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="font-semibold">{coupon.code}</h2>
                <p className="text-sm text-muted">
                  {coupon.type} | {coupon.value} |{" "}
                  {coupon.is_active
                    ? t("admin_status_active")
                    : t("admin_status_inactive")}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="rounded-lg border border-slate-300 px-3 py-1 text-sm dark:border-slate-700"
                  onClick={() => startEdit(coupon)}
                >
                  {t("admin_edit_btn")}
                </button>
                <button
                  type="button"
                  className="rounded-lg border border-rose-300 px-3 py-1 text-sm text-rose-700 dark:border-rose-800 dark:text-rose-300"
                  onClick={() => removeCoupon(coupon.id)}
                >
                  {t("admin_delete_btn")}
                </button>
              </div>
            </div>
          </article>
        ))}
      </section>

      {meta ? (
        <PaginationControls
          currentPage={meta.current_page}
          lastPage={meta.last_page}
          onPageChange={setPage}
          disabled={couponsQuery.isFetching}
        />
      ) : null}
    </main>
  );
}
