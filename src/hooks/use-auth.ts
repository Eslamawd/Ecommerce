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

type RegisterResult = {
  user?: User;
  requires_verification?: boolean;
  email?: string;
};

type ResendVerificationInput = {
  email: string;
};

type ForgotPasswordInput = {
  email: string;
};

type ResetPasswordInput = {
  email: string;
  token: string;
  password: string;
  password_confirmation: string;
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
      apiRequest<RegisterResult>(ENDPOINTS.auth.register, {
        method: "POST",
        body,
      }),
    onSuccess: (payload) => {
      if (payload.user) {
        saveAuthSession(payload.user);
        queryClient.invalidateQueries({ queryKey: ["auth"] });
      }
    },
  });
}

export function useResendVerification() {
  return useMutation({
    mutationFn: (body: ResendVerificationInput) =>
      apiRequest<void>(ENDPOINTS.auth.resendVerification, {
        method: "POST",
        body,
      }),
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (body: ForgotPasswordInput) =>
      apiRequest<void>(ENDPOINTS.auth.forgotPassword, {
        method: "POST",
        body,
      }),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (body: ResetPasswordInput) =>
      apiRequest<void>(ENDPOINTS.auth.resetPassword, {
        method: "POST",
        body,
      }),
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
