import { NextRequest, NextResponse } from "next/server";
import { getRoleFromUser, resolveLaravelUrl } from "../../_lib/laravel";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("access_token")?.value;

  if (!token) {
    return NextResponse.json(
      {
        success: false,
        message: "Unauthenticated.",
        data: null,
      },
      { status: 401 },
    );
  }

  const backendResponse = await fetch(resolveLaravelUrl("/auth/me"), {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  const payload = await backendResponse.json().catch(() => ({}));

  if (!backendResponse.ok) {
    return NextResponse.json(payload, { status: backendResponse.status });
  }

  const user = (payload as { data?: { user?: unknown } }).data?.user as
    | { roles?: string[] }
    | undefined;

  const response = NextResponse.json(payload, { status: 200 });

  if (user) {
    response.cookies.set("role", getRoleFromUser(user), {
      httpOnly: false,
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
  }

  return response;
}
