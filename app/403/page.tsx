"use client";

import Link from "next/link";
import { useLanguage } from "../../src/components/language-provider";

export default function ForbiddenPage() {
  const { t } = useLanguage();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl items-center justify-center p-6">
      <section className="w-full max-w-lg rounded-2xl bg-card p-8 text-center shadow-soft">
        <p className="text-xs uppercase tracking-[0.2em] text-muted">403</p>
        <h1 className="mt-2 text-3xl font-bold">{t("forbidden_title")}</h1>
        <p className="mt-3 text-sm text-muted">{t("forbidden_message")}</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            href="/"
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            {t("forbidden_home")}
          </Link>
          <Link
            href="/login"
            className="rounded-xl bg-accent px-4 py-2 text-sm font-medium text-slate-950 hover:opacity-90"
          >
            {t("forbidden_login")}
          </Link>
        </div>
      </section>
    </main>
  );
}
