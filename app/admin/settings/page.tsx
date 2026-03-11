"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  useAdminSettings,
  useUpdateAdminSettings,
} from "../../../src/hooks/use-admin";
import { useLanguage } from "../../../src/components/language-provider";
import { getApiErrorMessages } from "../../../src/lib/api-client";

type FlatSetting = {
  key: string;
  value: string;
  group: string;
};

export default function AdminSettingsPage() {
  const settingsQuery = useAdminSettings();
  const updateMutation = useUpdateAdminSettings();
  const [items, setItems] = useState<FlatSetting[]>([]);
  const { t } = useLanguage();

  useEffect(() => {
    const groups = settingsQuery.data?.settings;
    if (!groups) {
      return;
    }

    const nextItems: FlatSetting[] = Object.entries(groups).flatMap(
      ([group, values]) =>
        Object.entries(values ?? {}).map(([key, value]) => ({
          key,
          group,
          value: value == null ? "" : String(value),
        })),
    );

    setItems(nextItems);
  }, [settingsQuery.data]);

  const updateValue = (index: number, value: string) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, value } : item)),
    );
  };

  const addSetting = () => {
    setItems((prev) => [...prev, { key: "", value: "", group: "general" }]);
  };

  const save = async () => {
    try {
      const payload = items
        .filter((item) => item.key.trim().length > 0)
        .map((item) => ({
          key: item.key.trim(),
          value: item.value,
          group: item.group || "general",
          type: "string" as const,
        }));

      await updateMutation.mutateAsync(payload);
      toast.success(t("admin_settings_updated"));
    } catch (error) {
      toast.error(getApiErrorMessages(error).join(" | "));
    }
  };

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl space-y-6 p-6 md:p-10">
      <section className="rounded-3xl border border-slate-200/80 bg-gradient-to-br from-white via-sky-50 to-indigo-100 p-6 shadow-soft dark:border-slate-700/70 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950">
        <p className="text-xs uppercase tracking-[0.2em] text-muted">
          {t("admin_system_control")}
        </p>
        <h1 className="text-3xl font-black tracking-tight">
          {t("admin_settings_title")}
        </h1>
      </section>

      <section className="rounded-2xl border border-slate-200/80 bg-card p-4 shadow-soft dark:border-slate-700/70">
        <div className="mb-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={addSetting}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm dark:border-slate-700"
          >
            {t("admin_add_setting")}
          </button>
          <button
            type="button"
            onClick={save}
            className="rounded-lg bg-accent px-3 py-1.5 text-sm font-semibold text-slate-950"
          >
            {t("admin_save_all")}
          </button>
        </div>

        <div className="space-y-3">
          {items.map((item, index) => (
            <div
              key={`${item.group}-${item.key}-${index}`}
              className="grid grid-cols-1 gap-2 rounded-xl border border-slate-200/80 p-3 md:grid-cols-3 dark:border-slate-700/80"
            >
              <input
                className="rounded-lg border border-slate-300 bg-transparent px-3 py-2 text-sm dark:border-slate-700"
                placeholder={t("admin_group")}
                value={item.group}
                onChange={(e) =>
                  setItems((prev) =>
                    prev.map((entry, i) =>
                      i === index ? { ...entry, group: e.target.value } : entry,
                    ),
                  )
                }
              />
              <input
                className="rounded-lg border border-slate-300 bg-transparent px-3 py-2 text-sm dark:border-slate-700"
                placeholder={t("admin_key")}
                value={item.key}
                onChange={(e) =>
                  setItems((prev) =>
                    prev.map((entry, i) =>
                      i === index ? { ...entry, key: e.target.value } : entry,
                    ),
                  )
                }
              />
              <input
                className="rounded-lg border border-slate-300 bg-transparent px-3 py-2 text-sm dark:border-slate-700"
                placeholder={t("admin_value_label")}
                value={item.value}
                onChange={(e) => updateValue(index, e.target.value)}
              />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
