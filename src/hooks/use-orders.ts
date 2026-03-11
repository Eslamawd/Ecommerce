"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../lib/api-client";
import { getAccessToken } from "../lib/auth";
import { ENDPOINTS } from "../lib/endpoints";
import { toPaginatedPayload } from "../lib/normalizers";
import type {
  Order,
  PaymentGateway,
  PaymentStatusPayload,
} from "../types/order";

type CreateOrderInput = {
  shipping_name: string;
  shipping_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_email?: string;
  shipping_latitude?: number;
  shipping_longitude?: number;
  payment_method: "cash_on_delivery";
  coupon_code?: string;
  notes?: string;
};

export function useOrders() {
  return useOrdersPage(1);
}

function withPage(url: string, page: number) {
  const query = new URLSearchParams({ page: String(page) });
  return `${url}?${query.toString()}`;
}

export function useOrdersPage(page = 1) {
  return useQuery({
    queryKey: ["orders", "list", page],
    queryFn: async () => {
      const payload = await apiRequest<unknown>(
        withPage(ENDPOINTS.orders.list, page),
        { auth: true },
      );
      return toPaginatedPayload<Order>(payload);
    },
    enabled: Boolean(getAccessToken()),
  });
}

export function useOrder(orderNumber?: string) {
  return useQuery({
    queryKey: ["orders", "details", orderNumber],
    queryFn: () =>
      apiRequest<Order>(ENDPOINTS.orders.byNumber(orderNumber as string), {
        auth: true,
      }),
    enabled: Boolean(orderNumber && getAccessToken()),
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateOrderInput) =>
      apiRequest<Order>(ENDPOINTS.orders.create, {
        method: "POST",
        body,
        auth: true,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
}

export function useCancelOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderNumber: string) =>
      apiRequest<Order>(ENDPOINTS.orders.cancel(orderNumber), {
        method: "PATCH",
        auth: true,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

export function useInitiatePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      order_number,
      gateway,
    }: {
      order_number: string;
      gateway: PaymentGateway;
    }) =>
      apiRequest<{
        message?: string;
        transaction_id?: string;
        amount?: number;
        currency?: string;
        order_number?: string;
        payment_url?: string;
        payment_status?: string;
      }>(ENDPOINTS.payments.initiate, {
        method: "POST",
        body: { order_number, gateway },
        auth: true,
      }),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({
        queryKey: ["payments", "status", vars.order_number],
      });
    },
  });
}

export function usePaymentStatus(orderNumber?: string) {
  return useQuery({
    queryKey: ["payments", "status", orderNumber],
    queryFn: () =>
      apiRequest<PaymentStatusPayload>(
        ENDPOINTS.payments.status(orderNumber as string),
        { auth: true },
      ),
    enabled: Boolean(orderNumber && getAccessToken()),
  });
}

export function useRefundPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderNumber: string) =>
      apiRequest<{ message: string; order_number: string }>(
        ENDPOINTS.payments.refund(orderNumber),
        {
          method: "POST",
          auth: true,
        },
      ),
    onSuccess: (_, orderNumber) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({
        queryKey: ["payments", "status", orderNumber],
      });
    },
  });
}

export function useValidateCoupon() {
  return useMutation({
    mutationFn: ({
      code,
      order_total,
    }: {
      code: string;
      order_total?: number;
    }) =>
      apiRequest<{
        coupon: {
          id: number;
          code: string;
          type: "fixed" | "percentage";
          value: number;
        };
        discount: number;
      }>(ENDPOINTS.coupons.validate, {
        method: "POST",
        auth: true,
        body: { code, order_total },
      }),
  });
}
