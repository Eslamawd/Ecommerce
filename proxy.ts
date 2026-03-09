import { NextRequest, NextResponse } from "next/server";

const ADMIN_PREFIX = "/admin";
const VENDOR_PREFIX = "/vendor";

export function proxy(request: NextRequest) {
  const token = request.cookies.get("access_token")?.value;
  const role = request.cookies.get("role")?.value;
  const { pathname } = request.nextUrl;

  if (
    (pathname.startsWith(ADMIN_PREFIX) || pathname.startsWith(VENDOR_PREFIX)) &&
    !token
  ) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);

    return NextResponse.redirect(loginUrl);
  }

  if (pathname.startsWith(ADMIN_PREFIX) && role !== "admin") {
    return NextResponse.redirect(new URL("/403", request.url));
  }

  if (
    pathname.startsWith(VENDOR_PREFIX) &&
    role !== "vendor" &&
    role !== "admin"
  ) {
    return NextResponse.redirect(new URL("/403", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/vendor/:path*"],
};
