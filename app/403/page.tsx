import Link from "next/link";

export default function ForbiddenPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl items-center justify-center p-6">
      <section className="w-full max-w-lg rounded-2xl bg-card p-8 text-center shadow-soft">
        <p className="text-xs uppercase tracking-[0.2em] text-muted">403</p>
        <h1 className="mt-2 text-3xl font-bold">Access denied</h1>
        <p className="mt-3 text-sm text-muted">
          You do not have permission to access this page with your current role.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            href="/"
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            Home
          </Link>
          <Link
            href="/login"
            className="rounded-xl bg-accent px-4 py-2 text-sm font-medium text-slate-950 hover:opacity-90"
          >
            Login
          </Link>
        </div>
      </section>
    </main>
  );
}
