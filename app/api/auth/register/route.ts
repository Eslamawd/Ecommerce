import { NextRequest, NextResponse } from "next/server";
import {
  getRoleFromUser,
  readRequestBody,
  resolveLaravelUrl,
} from "../../_lib/laravel";

export async function POST(request: NextRequest) {
  const body = await readRequestBody(request);

  const backendResponse = await fetch(resolveLaravelUrl("/register"), {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body,
    cache: "no-store",
  });

  const payload = await backendResponse.json().catch(() => ({}));

  if (!backendResponse.ok) {
    return NextResponse.json(payload, { status: backendResponse.status });
  }

  const user = (payload as { data?: { user?: unknown } }).data?.user as
    | { roles?: string[] }
    | undefined;
  const token = (payload as { data?: { token?: string } }).data?.token;

  // In email-verification mode, backend intentionally returns no token.
  if (!token || !user) {
    return NextResponse.json(payload, { status: backendResponse.status });
  }

  const response = NextResponse.json({
    success: true,
    message: "Registered successfully.",
    data: { user },
  });

  response.cookies.set("access_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  response.cookies.set("auth_state", "1", {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  response.cookies.set("role", getRoleFromUser(user), {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}
