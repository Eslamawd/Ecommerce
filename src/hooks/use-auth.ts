"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../lib/api-client";
import { clearAccessToken, getAccessToken, saveAuthSession } from "../lib/auth";
import { ENDPOINTS } from "../lib/endpoints";
import type { User } from "../types/user";

type LoginInput = {
  email: string;
  password: string;
};

type RegisterInput = {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone?: string;
};

export function useMe() {
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: () =>
      apiRequest<{ user: User }>(ENDPOINTS.auth.me, { auth: true }),
    enabled: Boolean(getAccessToken()),
  });
}

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: LoginInput) =>
      apiRequest<{ user: User }>(ENDPOINTS.auth.login, {
        method: "POST",
        body,
      }),
    onSuccess: (payload) => {
      saveAuthSession(payload.user);
      queryClient.invalidateQueries({ queryKey: ["auth"] });
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: RegisterInput) =>
      apiRequest<{ user: User }>(ENDPOINTS.auth.register, {
        method: "POST",
        body,
      }),
    onSuccess: (payload) => {
      saveAuthSession(payload.user);
      queryClient.invalidateQueries({ queryKey: ["auth"] });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      apiRequest<void>(ENDPOINTS.auth.logout, {
        method: "POST",
        auth: true,
      }),
    onSettled: () => {
      clearAccessToken();
      queryClient.clear();
    },
  });
}
