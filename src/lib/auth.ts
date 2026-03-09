const AUTH_STATE_KEY = "ecom_auth_state";
const AUTH_STATE_COOKIE = "auth_state";
const ROLE_COOKIE = "role";

type RoleLike = "customer" | "vendor" | "admin";

type UserLike = {
  roles?: RoleLike[];
};

function setCookie(
  name: string,
  value: string,
  maxAgeSeconds = 60 * 60 * 24 * 7,
): void {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax`;
}

function clearCookie(name: string): void {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax`;
}

export function extractPrimaryRole(user?: UserLike | null): RoleLike {
  const roles = user?.roles ?? [];

  if (roles.includes("admin")) {
    return "admin";
  }

  if (roles.includes("vendor")) {
    return "vendor";
  }

  return "customer";
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  const hasAuthState = document.cookie
    .split(";")
    .map((entry) => entry.trim())
    .some((entry) => entry.startsWith(`${AUTH_STATE_COOKIE}=`));

  if (hasAuthState) {
    return window.localStorage.getItem(AUTH_STATE_KEY) ?? "cookie-session";
  }

  return null;
}

export function setRoleCookie(role: RoleLike): void {
  setCookie(ROLE_COOKIE, role);
}

export function clearAccessToken(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(AUTH_STATE_KEY);
  clearCookie(AUTH_STATE_COOKIE);
  clearCookie(ROLE_COOKIE);
}

export function isAuthenticated(): boolean {
  return Boolean(getAccessToken());
}

export function saveAuthSession(user?: UserLike | null): void {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(AUTH_STATE_KEY, "1");
  }

  setCookie(AUTH_STATE_COOKIE, "1");
  setRoleCookie(extractPrimaryRole(user));
}
