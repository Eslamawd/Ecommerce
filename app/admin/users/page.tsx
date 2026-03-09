"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { PaginationControls } from "../../../src/components/pagination-controls";
import {
  useChangeUserRole,
  useToggleUserActive,
  useAdminUsers,
} from "../../../src/hooks/use-admin";
import { getApiErrorMessages } from "../../../src/lib/api-client";

const ROLE_CYCLE: Array<"customer" | "vendor" | "admin"> = [
  "customer",
  "vendor",
  "admin",
];

export default function AdminUsersPage() {
  const [page, setPage] = useState(1);
  const usersQuery = useAdminUsers(page);
  const toggleActiveMutation = useToggleUserActive();
  const changeRoleMutation = useChangeUserRole();

  const users = usersQuery.data?.data ?? [];
  const paginationMeta = usersQuery.data?.meta;

  const toggleActive = async (userId: number) => {
    try {
      await toggleActiveMutation.mutateAsync(userId);
      toast.success("User status updated");
    } catch (error) {
      toast.error(getApiErrorMessages(error).join(" | "));
    }
  };

  const changeRole = async (
    userId: number,
    role: "customer" | "vendor" | "admin",
  ) => {
    try {
      await changeRoleMutation.mutateAsync({ userId, role });
      toast.success("User role updated");
    } catch (error) {
      toast.error(getApiErrorMessages(error).join(" | "));
    }
  };

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl p-6 md:p-10">
      <h1 className="mb-6 text-3xl font-bold">Admin Users</h1>

      {usersQuery.isLoading ? (
        <p className="text-sm text-muted">Loading users...</p>
      ) : null}

      {usersQuery.isError ? (
        <div className="space-y-2 rounded-xl bg-rose-100 px-4 py-2 text-sm text-rose-700 dark:bg-rose-900/40 dark:text-rose-300">
          {getApiErrorMessages(usersQuery.error).map((message, i) => (
            <p key={`${message}-${i}`}>{message}</p>
          ))}
        </div>
      ) : null}

      <section className="space-y-3">
        {users.map((user) => {
          const currentRole = user.roles?.[0] as
            | "customer"
            | "vendor"
            | "admin"
            | undefined;
          const nextRole =
            ROLE_CYCLE[
              (ROLE_CYCLE.indexOf(currentRole ?? "customer") + 1) %
                ROLE_CYCLE.length
            ];

          return (
            <article
              key={user.id}
              className="rounded-xl bg-card p-4 shadow-soft"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="font-semibold">{user.name}</h2>
                  <p className="text-sm text-muted">{user.email}</p>
                  <p className="text-xs text-muted">
                    Role: {user.roles?.join(", ") || "-"}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="rounded-lg border border-slate-300 px-3 py-1 text-sm dark:border-slate-700"
                    onClick={() => toggleActive(user.id)}
                  >
                    {user.is_active ? "Deactivate" : "Activate"}
                  </button>
                  <button
                    type="button"
                    className="rounded-lg border border-slate-300 px-3 py-1 text-sm dark:border-slate-700"
                    onClick={() => changeRole(user.id, nextRole)}
                  >
                    Make {nextRole}
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </section>

      {paginationMeta ? (
        <PaginationControls
          currentPage={paginationMeta.current_page}
          lastPage={paginationMeta.last_page}
          onPageChange={setPage}
          disabled={usersQuery.isFetching}
        />
      ) : null}
    </main>
  );
}
