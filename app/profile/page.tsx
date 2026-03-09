"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ThemeToggle } from "../../src/components/theme-toggle";
import { isAuthenticated } from "../../src/lib/auth";
import { useLogout, useMe } from "../../src/hooks/use-auth";

export default function ProfilePage() {
  const router = useRouter();
  const meQuery = useMe();
  const logoutMutation = useLogout();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login?next=/profile");
    }
  }, [router]);

  const onLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
    } finally {
      router.replace("/login");
    }
  };

  const user = meQuery.data?.user;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl items-center justify-center p-6">
      <section className="w-full rounded-2xl bg-card p-6 shadow-soft md:p-8">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-semibold">My Profile</h1>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              type="button"
              onClick={onLogout}
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm transition hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
              disabled={logoutMutation.isPending}
            >
              {logoutMutation.isPending ? "Logging out..." : "Logout"}
            </button>
          </div>
        </div>

        {meQuery.isLoading ? (
          <p className="text-sm text-muted">Loading profile...</p>
        ) : null}

        {meQuery.isError ? (
          <div className="space-y-3 rounded-xl bg-rose-100 p-4 text-sm text-rose-700 dark:bg-rose-900/40 dark:text-rose-300">
            <p>
              {(meQuery.error as Error)?.message ?? "Failed to load profile."}
            </p>
            <Link
              href="/login"
              className="font-medium text-accent hover:underline"
            >
              Go to login
            </Link>
          </div>
        ) : null}

        {user ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <InfoItem label="Name" value={user.name} />
            <InfoItem label="Email" value={user.email} />
            <InfoItem label="Phone" value={user.phone || "-"} />
            <InfoItem
              label="Status"
              value={user.is_active ? "Active" : "Inactive"}
            />
            <InfoItem label="Roles" value={user.roles.join(", ")} />
            <InfoItem
              label="Created"
              value={new Date(user.created_at).toLocaleString()}
            />
          </div>
        ) : null}
      </section>
    </main>
  );
}

type InfoItemProps = {
  label: string;
  value: string;
};

function InfoItem({ label, value }: InfoItemProps) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
      <p className="text-xs uppercase tracking-[0.18em] text-muted">{label}</p>
      <p className="mt-2 text-base font-medium">{value}</p>
    </article>
  );
}
