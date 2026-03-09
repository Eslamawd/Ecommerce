import { NextRequest, NextResponse } from "next/server";
import { readRequestBody, resolveLaravelUrl } from "../../_lib/laravel";

async function forward(request: NextRequest, path: string[]) {
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

  const requestPath = `/${path.join("/")}`;
  const search = request.nextUrl.search || "";
  const backendUrl = `${resolveLaravelUrl(requestPath)}${search}`;
  const body = await readRequestBody(request);

  const backendResponse = await fetch(backendUrl, {
    method: request.method,
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      ...(body
        ? {
            "Content-Type":
              request.headers.get("content-type") ?? "application/json",
          }
        : {}),
    },
    body,
    cache: "no-store",
  });

  const payload = await backendResponse.json().catch(() => null);

  if (payload !== null) {
    return NextResponse.json(payload, { status: backendResponse.status });
  }

  return new NextResponse(null, { status: backendResponse.status });
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  return forward(request, path);
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  return forward(request, path);
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  return forward(request, path);
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  return forward(request, path);
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  return forward(request, path);
}
