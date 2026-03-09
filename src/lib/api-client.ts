const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api";
const NEXT_AUTH_BASE = "/api/auth";
const NEXT_PROXY_BASE = "/api/proxy";

export type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T;
  errors?: Record<string, string[]> | string | null;
};

export class ApiError extends Error {
  status: number;
  payload?: unknown;
  details?: Record<string, string[]> | string | null;

  constructor(
    message: string,
    status: number,
    payload?: unknown,
    details?: Record<string, string[]> | string | null,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
    this.details = details;
  }
}

function extractErrorDetails(
  payload: unknown,
): Record<string, string[]> | string | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  if ("errors" in payload) {
    const details = (payload as { errors?: unknown }).errors;

    if (typeof details === "string") {
      return details;
    }

    if (details && typeof details === "object") {
      return details as Record<string, string[]>;
    }
  }

  return null;
}

export function getApiErrorMessages(error: unknown): string[] {
  if (!(error instanceof ApiError)) {
    if (error instanceof Error) {
      return [error.message];
    }

    return ["An unexpected error occurred."];
  }

  const details = error.details;

  if (!details) {
    return [error.message];
  }

  if (typeof details === "string") {
    return [details];
  }

  const messages = Object.values(details)
    .flatMap((entry) => (Array.isArray(entry) ? entry : []))
    .filter(Boolean);

  return messages.length > 0 ? messages : [error.message];
}

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  auth?: boolean;
};

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { body, headers, auth = false, ...rest } = options;
  const isFormData =
    typeof FormData !== "undefined" && body instanceof FormData;
  const hasExplicitContentType =
    !!headers &&
    Object.keys(headers as Record<string, string>).some(
      (key) => key.toLowerCase() === "content-type",
    );

  let url = `${API_BASE_URL}${path}`;
  let credentialsMode: RequestCredentials = "omit";

  if (path.startsWith("/auth/")) {
    url = `${NEXT_AUTH_BASE}${path.replace("/auth", "")}`;
    credentialsMode = "include";
  } else if (auth) {
    url = `${NEXT_PROXY_BASE}${path}`;
    credentialsMode = "include";
  }

  const response = await fetch(url, {
    ...rest,
    headers: {
      ...(!isFormData && !hasExplicitContentType
        ? { "Content-Type": "application/json" }
        : {}),
      ...(headers ?? {}),
    },
    credentials: credentialsMode,
    body:
      body === undefined ? undefined : isFormData ? body : JSON.stringify(body),
    cache: "no-store",
  });

  let payload: ApiEnvelope<T> | T | null = null;

  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const fallbackMessage = `Request failed with status ${response.status}`;
    const apiMessage =
      payload && typeof payload === "object" && "message" in payload
        ? String((payload as { message?: string }).message ?? fallbackMessage)
        : fallbackMessage;

    throw new ApiError(
      apiMessage,
      response.status,
      payload,
      extractErrorDetails(payload),
    );
  }

  if (
    payload &&
    typeof payload === "object" &&
    "success" in payload &&
    "data" in payload
  ) {
    return (payload as ApiEnvelope<T>).data;
  }

  return payload as T;
}
