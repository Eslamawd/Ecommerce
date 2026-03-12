import { NextRequest, NextResponse } from "next/server";
import { resolveLaravelUrl } from "../../_lib/laravel";

export async function DELETE(request: NextRequest) {
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

  const backendResponse = await fetch(resolveLaravelUrl("/auth/account"), {
    method: "DELETE",
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

  const response = NextResponse.json(payload, {
    status: backendResponse.status,
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
