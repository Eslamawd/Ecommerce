import { NextRequest } from "next/server";

const DEFAULT_API_BASE = "http://localhost:8000/api";

export function getLaravelApiBase(): string {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE;
  return base.endsWith("/") ? base.slice(0, -1) : base;
}

export function resolveLaravelUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${getLaravelApiBase()}${normalizedPath}`;
}

export async function readRequestBody(
  request: NextRequest,
): Promise<BodyInit | undefined> {
  if (request.method === "GET" || request.method === "HEAD") {
    return undefined;
  }

  const contentType = request.headers.get("content-type")?.toLowerCase() ?? "";

  if (
    contentType.includes("application/json") ||
    contentType.startsWith("text/")
  ) {
    const text = await request.text();
    return text.length > 0 ? text : undefined;
  }

  const buffer = await request.arrayBuffer();
  return buffer.byteLength > 0 ? new Uint8Array(buffer) : undefined;
}

export function getRoleFromUser(
  user: { roles?: string[] } | null | undefined,
): string {
  const roles = user?.roles ?? [];

  if (roles.includes("admin")) {
    return "admin";
  }

  if (roles.includes("vendor")) {
    return "vendor";
  }

  return "customer";
}
