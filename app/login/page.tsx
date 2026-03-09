"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { useLogin } from "../../src/hooks/use-auth";
import { ThemeToggle } from "../../src/components/theme-toggle";
import { getApiErrorMessages } from "../../src/lib/api-client";

export default function LoginPage() {
  const router = useRouter();
  const loginMutation = useLogin();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center p-6">
      <section className="w-full max-w-md rounded-2xl bg-card p-6 shadow-soft md:p-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Login</h1>
          <ThemeToggle />
        </div>

        <form className="space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="mb-1 block text-sm text-muted" htmlFor="email">
              Email
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
              Password
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

          {loginMutation.isError ? (
            <div className="rounded-lg bg-rose-100 px-3 py-2 text-sm text-rose-700 dark:bg-rose-900/40 dark:text-rose-300">
              <ul className="list-disc space-y-1 pl-5">
                {loginErrors.map((message, index) => (
                  <li key={`${message}-${index}`}>{message}</li>
                ))}
              </ul>
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full rounded-xl bg-accent px-4 py-2 font-medium text-slate-950 transition hover:opacity-90 disabled:opacity-60"
          >
            {loginMutation.isPending ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="mt-5 text-sm text-muted">
          New here?{" "}
          <Link
            href="/register"
            className="font-medium text-accent hover:underline"
          >
            Create an account
          </Link>
        </p>
      </section>
    </main>
  );
}
