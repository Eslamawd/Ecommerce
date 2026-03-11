"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useLogin, useResendVerification } from "../../src/hooks/use-auth";
import { ThemeToggle } from "../../src/components/theme-toggle";
import { getApiErrorMessages } from "../../src/lib/api-client";
import { useLanguage } from "../../src/components/language-provider";

export default function LoginPage() {
  const router = useRouter();
  const loginMutation = useLogin();
  const resendMutation = useResendVerification();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { t } = useLanguage();

  const emailFromQuery = useMemo(() => {
    if (typeof window === "undefined") {
      return "";
    }

    return new URLSearchParams(window.location.search).get("email") || "";
  }, []);

  useEffect(() => {
    if (emailFromQuery) {
      setEmail(emailFromQuery);
    }
  }, [emailFromQuery]);

  const verifyStatus = useMemo(() => {
    if (typeof window === "undefined") {
      return "";
    }

    return new URLSearchParams(window.location.search).get("verify") || "";
  }, []);

  const loginErrors = loginMutation.isError
    ? getApiErrorMessages(loginMutation.error)
    : [];

  const nextPath = useMemo(() => {
    if (typeof window === "undefined") {
      return "/profile";
    }

    return (
      new URLSearchParams(window.location.search).get("next") || "/profile"
    );
  }, []);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      await loginMutation.mutateAsync({ email, password });
      router.push(nextPath);
    } catch {
      // Error handled via mutation state.
    }
  };

  const onResendVerification = async () => {
    if (!email) {
      return;
    }

    try {
      await resendMutation.mutateAsync({ email });
    } catch {
      // Error handled via mutation state.
    }
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center p-6">
      <section className="w-full max-w-md rounded-2xl bg-card p-6 shadow-soft md:p-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">{t("login_title")}</h1>
          <ThemeToggle />
        </div>

        <form className="space-y-4" onSubmit={onSubmit}>
          {verifyStatus === "pending" ? (
            <div className="rounded-lg bg-amber-100 px-3 py-2 text-sm text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
              {t("login_verify_pending")}
            </div>
          ) : null}

          {verifyStatus === "success" ? (
            <div className="rounded-lg bg-emerald-100 px-3 py-2 text-sm text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200">
              {t("login_verify_success")}
            </div>
          ) : null}

          {verifyStatus === "failed" ? (
            <div className="rounded-lg bg-rose-100 px-3 py-2 text-sm text-rose-700 dark:bg-rose-900/40 dark:text-rose-300">
              {t("login_verify_failed")}
            </div>
          ) : null}

          <div>
            <label className="mb-1 block text-sm text-muted" htmlFor="email">
              {t("login_email")}
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
            <label className="mb-1 block text-sm text-muted" htmlFor="password">
              {t("login_password")}
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none ring-cyan-300 focus:ring-2 dark:border-slate-700 dark:bg-slate-900"
              required
            />
            <div className="mt-2 text-right">
              <Link
                href="/forgot-password"
                className="text-xs font-medium text-accent hover:underline"
              >
                Forgot password?
              </Link>
            </div>
          </div>

          {loginMutation.isError ? (
            <div className="rounded-lg bg-rose-100 px-3 py-2 text-sm text-rose-700 dark:bg-rose-900/40 dark:text-rose-300">
              <ul className="list-disc space-y-1 pl-5">
                {loginErrors.map((message, index) => (
                  <li key={`${message}-${index}`}>{message}</li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-800">
            <p className="mb-2 text-xs text-muted">
              {t("login_email_for_resend")}
            </p>
            <button
              type="button"
              onClick={onResendVerification}
              disabled={resendMutation.isPending || !email}
              className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium transition hover:bg-slate-100 disabled:opacity-60 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              {resendMutation.isPending
                ? t("login_resending_verification")
                : t("login_resend_verification")}
            </button>

            {resendMutation.isSuccess ? (
              <p className="mt-2 text-xs text-emerald-600 dark:text-emerald-300">
                {t("login_resend_done")}
              </p>
            ) : null}
          </div>

          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full rounded-xl bg-accent px-4 py-2 font-medium text-slate-950 transition hover:opacity-90 disabled:opacity-60"
          >
            {loginMutation.isPending
              ? t("login_signing_in")
              : t("login_sign_in")}
          </button>
        </form>

        <p className="mt-5 text-sm text-muted">
          {t("login_new_here")}{" "}
          <Link
            href="/register"
            className="font-medium text-accent hover:underline"
          >
            {t("login_create_account")}
          </Link>
        </p>
      </section>
    </main>
  );
}
