"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../lib/api-client";
import { getAccessToken } from "../lib/auth";
import { ENDPOINTS } from "../lib/endpoints";
import { toPaginatedPayload } from "../lib/normalizers";
import type {
  AppNotification,
  NotificationsUnreadPayload,
} from "../types/notification";

export function useNotifications() {
  return useNotificationsPage(1);
}

function withPage(url: string, page: number) {
  const query = new URLSearchParams({ page: String(page) });
  return `${url}?${query.toString()}`;
}

export function useNotificationsPage(page = 1) {
  return useQuery({
    queryKey: ["notifications", "list", page],
    queryFn: async () => {
      const payload = await apiRequest<unknown>(
        withPage(ENDPOINTS.notifications.list, page),
        { auth: true },
      );
      return toPaginatedPayload<AppNotification>(payload);
    },
    enabled: Boolean(getAccessToken()),
  });
}

export function useUnreadNotifications() {
  return useQuery({
    queryKey: ["notifications", "unread"],
    queryFn: () =>
      apiRequest<NotificationsUnreadPayload>(ENDPOINTS.notifications.unread, {
        auth: true,
      }),
    enabled: Boolean(getAccessToken()),
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiRequest<{ message: string }>(ENDPOINTS.notifications.read(id), {
        method: "PATCH",
        auth: true,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      apiRequest<{ message: string }>(ENDPOINTS.notifications.readAll, {
        method: "POST",
        auth: true,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useDeleteNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiRequest<{ message: string }>(ENDPOINTS.notifications.delete(id), {
        method: "DELETE",
        auth: true,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
