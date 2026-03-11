import { NextRequest, NextResponse } from "next/server";
import { resolveLaravelUrl } from "../../_lib/laravel";

export async function POST(request: NextRequest) {
  const token = request.cookies.get("access_token")?.value;

  if (token) {
    await fetch(resolveLaravelUrl("/logout"), {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }).catch(() => null);
  }

  const response = NextResponse.json({
    success: true,
    message: "Logged out successfully.",
    data: null,
  });

  response.cookies.set("access_token", "", {
    httpOnly: true,
    path: "/",
    maxAge: 0,
  });
  response.cookies.set("auth_state", "", {
    httpOnly: false,
    path: "/",
    maxAge: 0,
  });
  response.cookies.set("role", "", { httpOnly: false, path: "/", maxAge: 0 });

  return response;
}
