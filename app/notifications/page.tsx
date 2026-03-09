"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { PaginationControls } from "../../src/components/pagination-controls";
import {
  useDeleteNotification,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotificationsPage,
  useUnreadNotifications,
} from "../../src/hooks/use-notifications";
import { getApiErrorMessages } from "../../src/lib/api-client";

export default function NotificationsPage() {
  const [page, setPage] = useState(1);
  const notificationsQuery = useNotificationsPage(page);
  const unreadQuery = useUnreadNotifications();
  const markReadMutation = useMarkNotificationRead();
  const markAllMutation = useMarkAllNotificationsRead();
  const deleteMutation = useDeleteNotification();

  const notifications = notificationsQuery.data?.data ?? [];
  const paginationMeta = notificationsQuery.data?.meta;
  const unreadCount = unreadQuery.data?.count ?? 0;

  const markAsRead = async (id: string) => {
    try {
      await markReadMutation.mutateAsync(id);
      toast.success("Notification marked as read");
    } catch (error) {
      toast.error(getApiErrorMessages(error).join(" | "));
    }
  };

  const markAllAsRead = async () => {
    try {
      await markAllMutation.mutateAsync();
      toast.success("All notifications marked as read");
    } catch (error) {
      toast.error(getApiErrorMessages(error).join(" | "));
    }
  };

  const removeNotification = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Notification deleted");
    } catch (error) {
      toast.error(getApiErrorMessages(error).join(" | "));
    }
  };

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl p-6 md:p-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-sm text-muted">Unread: {unreadCount}</p>
        </div>
        <button
          type="button"
          onClick={markAllAsRead}
          className="rounded-xl border border-slate-300 px-4 py-2 text-sm dark:border-slate-700"
        >
          Mark all as read
        </button>
      </div>

      {notificationsQuery.isLoading ? (
        <p className="text-sm text-muted">Loading notifications...</p>
      ) : null}

      {notificationsQuery.isError ? (
        <div className="space-y-2 rounded-xl bg-rose-100 px-4 py-2 text-sm text-rose-700 dark:bg-rose-900/40 dark:text-rose-300">
          {getApiErrorMessages(notificationsQuery.error).map((message, i) => (
            <p key={`${message}-${i}`}>{message}</p>
          ))}
        </div>
      ) : null}

      <section className="space-y-3">
        {notifications.map((notification) => (
          <article
            key={notification.id}
            className={`rounded-xl border p-4 ${
              notification.read_at
                ? "border-slate-200 dark:border-slate-700"
                : "border-cyan-400/50 bg-cyan-50/60 dark:border-cyan-500/40 dark:bg-cyan-900/20"
            }`}
          >
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-semibold">{notification.type}</p>
                <p className="text-xs text-muted">
                  {new Date(notification.created_at).toLocaleString()}
                </p>
                <pre className="mt-2 overflow-auto rounded bg-slate-100 p-2 text-xs dark:bg-slate-800">
                  {JSON.stringify(notification.data, null, 2)}
                </pre>
              </div>
              <div className="flex gap-2">
                {!notification.read_at ? (
                  <button
                    type="button"
                    onClick={() => markAsRead(notification.id)}
                    className="rounded-lg border border-slate-300 px-3 py-1 text-sm dark:border-slate-700"
                  >
                    Mark read
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => removeNotification(notification.id)}
                  className="rounded-lg bg-rose-100 px-3 py-1 text-sm text-rose-700 dark:bg-rose-900/40 dark:text-rose-300"
                >
                  Delete
                </button>
              </div>
            </div>
          </article>
        ))}

        {!notificationsQuery.isLoading && notifications.length === 0 ? (
          <p className="text-sm text-muted">No notifications yet.</p>
        ) : null}

        {paginationMeta ? (
          <PaginationControls
            currentPage={paginationMeta.current_page}
            lastPage={paginationMeta.last_page}
            onPageChange={setPage}
            disabled={notificationsQuery.isFetching}
          />
        ) : null}
      </section>

      {markReadMutation.isError ||
      markAllMutation.isError ||
      deleteMutation.isError ? (
        <div className="mt-4 rounded-xl bg-rose-100 px-4 py-2 text-sm text-rose-700 dark:bg-rose-900/40 dark:text-rose-300">
          {[markReadMutation.error, markAllMutation.error, deleteMutation.error]
            .filter(Boolean)
            .flatMap((err) => getApiErrorMessages(err))
            .map((message, i) => (
              <p key={`${message}-${i}`}>{message}</p>
            ))}
        </div>
      ) : null}
    </main>
  );
}
