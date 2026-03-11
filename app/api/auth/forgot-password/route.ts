import { NextRequest, NextResponse } from "next/server";
import { readRequestBody, resolveLaravelUrl } from "../../_lib/laravel";

export async function POST(request: NextRequest) {
  const body = await readRequestBody(request);

  const backendResponse = await fetch(
    resolveLaravelUrl("/auth/forgot-password"),
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body,
      cache: "no-store",
    },
  );

  const payload = await backendResponse.json().catch(() => ({}));
  return NextResponse.json(payload, { status: backendResponse.status });
}
