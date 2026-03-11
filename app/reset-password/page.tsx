"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { ThemeToggle } from "../../src/components/theme-toggle";
import { useResetPassword } from "../../src/hooks/use-auth";
import { getApiErrorMessages } from "../../src/lib/api-client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const resetMutation = useResetPassword();
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");

  const token = useMemo(() => {
    if (typeof window === "undefined") {
      return "";
    }

    return new URLSearchParams(window.location.search).get("token") || "";
  }, []);

  const email = useMemo(() => {
    if (typeof window === "undefined") {
      return "";
    }

    return new URLSearchParams(window.location.search).get("email") || "";
  }, []);

  const errors = resetMutation.isError
    ? getApiErrorMessages(resetMutation.error)
    : [];

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      await resetMutation.mutateAsync({
        email,
        token,
        password,
        password_confirmation: passwordConfirmation,
      });

      router.push("/login");
    } catch {
      // handled via mutation state
    }
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center p-6">
      <section className="w-full max-w-md rounded-2xl bg-card p-6 shadow-soft md:p-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Reset Password</h1>
          <ThemeToggle />
        </div>

        {!email || !token ? (
          <div className="rounded-lg bg-rose-100 px-3 py-2 text-sm text-rose-700 dark:bg-rose-900/40 dark:text-rose-300">
            Invalid reset link. Please request a new password reset email.
          </div>
        ) : (
          <form className="space-y-4" onSubmit={onSubmit}>
            <div>
              <label className="mb-1 block text-sm text-muted" htmlFor="email">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                readOnly
                className="w-full rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 text-slate-600 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              />
            </div>

            <div>
              <label
                className="mb-1 block text-sm text-muted"
                htmlFor="password"
              >
                New password
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
                Confirm new password
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

            {errors.length > 0 ? (
              <div className="rounded-lg bg-rose-100 px-3 py-2 text-sm text-rose-700 dark:bg-rose-900/40 dark:text-rose-300">
                <ul className="list-disc space-y-1 pl-5">
                  {errors.map((message, index) => (
                    <li key={`${message}-${index}`}>{message}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            <button
              type="submit"
              disabled={resetMutation.isPending}
              className="w-full rounded-xl bg-accent px-4 py-2 font-medium text-slate-950 transition hover:opacity-90 disabled:opacity-60"
            >
              {resetMutation.isPending ? "Resetting..." : "Reset password"}
            </button>
          </form>
        )}

        <p className="mt-5 text-sm text-muted">
          <Link
            href="/login"
            className="font-medium text-accent hover:underline"
          >
            Back to sign in
          </Link>
        </p>
      </section>
    </main>
  );
}
