"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { ThemeToggle } from "../../src/components/theme-toggle";
import { useRegister } from "../../src/hooks/use-auth";
import { getApiErrorMessages } from "../../src/lib/api-client";
import { useLanguage } from "../../src/components/language-provider";

export default function RegisterPage() {
  const router = useRouter();
  const registerMutation = useRegister();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const { t } = useLanguage();

  const registerErrors = registerMutation.isError
    ? getApiErrorMessages(registerMutation.error)
    : [];

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const result = await registerMutation.mutateAsync({
        name,
        email,
        phone: phone || undefined,
        password,
        password_confirmation: passwordConfirmation,
      });

      if (result.requires_verification) {
        router.push(`/login?verify=pending&email=${encodeURIComponent(email)}`);
        return;
      }

      router.push("/profile");
    } catch {
      // Error handled via mutation state.
    }
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center p-6">
      <section className="w-full max-w-lg rounded-2xl bg-card p-6 shadow-soft md:p-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">{t("register_title")}</h1>
          <ThemeToggle />
        </div>

        <form
          className="grid grid-cols-1 gap-4 md:grid-cols-2"
          onSubmit={onSubmit}
        >
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm text-muted" htmlFor="name">
              {t("register_name")}
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none ring-cyan-300 focus:ring-2 dark:border-slate-700 dark:bg-slate-900"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-muted" htmlFor="email">
              {t("register_email")}
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none ring-cyan-300 focus:ring-2 dark:border-slate-700 dark:bg-slate-900"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-muted" htmlFor="phone">
              {t("register_phone_optional")}
            </label>
            <input
              id="phone"
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none ring-cyan-300 focus:ring-2 dark:border-slate-700 dark:bg-slate-900"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-muted" htmlFor="password">
              {t("register_password")}
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none ring-cyan-300 focus:ring-2 dark:border-slate-700 dark:bg-slate-900"
              required
            />
          </div>

          <div>
            <label
              className="mb-1 block text-sm text-muted"
              htmlFor="password_confirmation"
            >
              {t("register_confirm_password")}
            </label>
            <input
              id="password_confirmation"
              type="password"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none ring-cyan-300 focus:ring-2 dark:border-slate-700 dark:bg-slate-900"
              required
            />
          </div>

          {registerMutation.isError ? (
            <div className="md:col-span-2 rounded-lg bg-rose-100 px-3 py-2 text-sm text-rose-700 dark:bg-rose-900/40 dark:text-rose-300">
              <p className="font-medium">{t("register_review_errors")}</p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                {registerErrors.map((message, index) => (
                  <li key={`${message}-${index}`}>{message}</li>
                ))}
              </ul>
            </div>
          ) : null}

          <button
            type="submit"
            disabled={registerMutation.isPending}
            className="md:col-span-2 w-full rounded-xl bg-accent px-4 py-2 font-medium text-slate-950 transition hover:opacity-90 disabled:opacity-60"
          >
            {registerMutation.isPending
              ? t("register_creating")
              : t("register_create_account")}
          </button>
        </form>

        <p className="mt-5 text-sm text-muted">
          {t("register_have_account")}{" "}
          <Link
            href="/login"
            className="font-medium text-accent hover:underline"
          >
            {t("register_sign_in")}
          </Link>
        </p>
      </section>
    </main>
  );
}
