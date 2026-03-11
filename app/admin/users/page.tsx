"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { PaginationControls } from "../../../src/components/pagination-controls";
import {
  useChangeUserRole,
  useDeleteAdminUser,
  useAdminUserDetails,
  useUpdateAdminUser,
  useToggleUserActive,
  useAdminUsers,
} from "../../../src/hooks/use-admin";
import { useLanguage } from "../../../src/components/language-provider";
import { getApiErrorMessages } from "../../../src/lib/api-client";

const ROLE_CYCLE: Array<"customer" | "vendor" | "admin"> = [
  "customer",
  "vendor",
  "admin",
];

export default function AdminUsersPage() {
  const [page, setPage] = useState(1);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const usersQuery = useAdminUsers(page);
  const userDetailsQuery = useAdminUserDetails(selectedUserId ?? undefined);
  const toggleActiveMutation = useToggleUserActive();
  const changeRoleMutation = useChangeUserRole();
  const updateUserMutation = useUpdateAdminUser();
  const deleteUserMutation = useDeleteAdminUser();
  const { t } = useLanguage();

  const users = usersQuery.data?.data ?? [];
  const paginationMeta = usersQuery.data?.meta;

  const toggleActive = async (userId: number) => {
    try {
      await toggleActiveMutation.mutateAsync(userId);
      toast.success(t("admin_user_status_updated"));
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
      toast.success(t("admin_user_role_updated"));
    } catch (error) {
      toast.error(getApiErrorMessages(error).join(" | "));
    }
  };

  const editUser = async (
    userId: number,
    current: { name: string; email: string; phone: string | null },
  ) => {
    const name =
      window.prompt(t("admin_prompt_user_name"), current.name) ?? current.name;
    const email =
      window.prompt(t("admin_prompt_user_email"), current.email) ??
      current.email;
    const phoneInput =
      window.prompt(t("admin_prompt_user_phone"), current.phone ?? "") ?? "";

    try {
      await updateUserMutation.mutateAsync({
        userId,
        body: {
          name,
          email,
          phone: phoneInput.trim() ? phoneInput.trim() : null,
        },
      });
      toast.success(t("admin_user_updated"));
    } catch (error) {
      toast.error(getApiErrorMessages(error).join(" | "));
    }
  };

  const deleteUser = async (userId: number) => {
    if (!window.confirm(t("admin_confirm_delete_user"))) {
      return;
    }

    try {
      await deleteUserMutation.mutateAsync(userId);
      if (selectedUserId === userId) {
        setSelectedUserId(null);
      }
      toast.success(t("admin_user_deleted"));
    } catch (error) {
      toast.error(getApiErrorMessages(error).join(" | "));
    }
  };

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl p-6 md:p-10">
      <h1 className="mb-6 text-3xl font-bold">{t("admin_users_title")}</h1>

      {usersQuery.isLoading ? (
        <p className="text-sm text-muted">{t("admin_users_loading")}</p>
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
                  <button
                    type="button"
                    onClick={() => setSelectedUserId(user.id)}
                    className="font-semibold underline-offset-2 hover:underline"
                  >
                    {user.name}
                  </button>
                  <p className="text-sm text-muted">{user.email}</p>
                  <p className="text-xs text-muted">
                    {t("admin_role")}: {user.roles?.join(", ") || "-"}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="rounded-lg border border-slate-300 px-3 py-1 text-sm dark:border-slate-700"
                    onClick={() => toggleActive(user.id)}
                  >
                    {user.is_active
                      ? t("admin_deactivate")
                      : t("admin_activate")}
                  </button>
                  <button
                    type="button"
                    className="rounded-lg border border-slate-300 px-3 py-1 text-sm dark:border-slate-700"
                    onClick={() => changeRole(user.id, nextRole)}
                  >
                    {t("admin_make")} {nextRole}
                  </button>
                  <button
                    type="button"
                    className="rounded-lg border border-slate-300 px-3 py-1 text-sm dark:border-slate-700"
                    onClick={() =>
                      editUser(user.id, {
                        name: user.name,
                        email: user.email,
                        phone: user.phone,
                      })
                    }
                  >
                    {t("admin_edit")}
                  </button>
                  <button
                    type="button"
                    className="rounded-lg border border-rose-300 px-3 py-1 text-sm text-rose-700 dark:border-rose-800 dark:text-rose-300"
                    onClick={() => deleteUser(user.id)}
                  >
                    {t("admin_delete")}
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </section>

      {selectedUserId && userDetailsQuery.data ? (
        <section className="rounded-xl bg-card p-4 shadow-soft">
          <h2 className="font-semibold">
            {t("admin_user_details")} #{selectedUserId}
          </h2>
          <p className="text-sm text-muted">
            {t("admin_orders_count")}:{" "}
            {userDetailsQuery.data.stats?.total_orders ?? 0} |{" "}
            {t("admin_spent")}: {userDetailsQuery.data.stats?.total_spent ?? 0}{" "}
            | {t("admin_reviews_count")}:{" "}
            {userDetailsQuery.data.stats?.total_reviews ?? 0}
          </p>
        </section>
      ) : null}

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
