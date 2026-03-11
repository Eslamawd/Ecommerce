"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  BriefcaseBusiness,
  ChevronRight,
  House,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  Package,
  ShoppingBag,
  ShoppingCart,
  Store,
  User,
  UserPlus,
  X,
} from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { LanguageToggle } from "./language-toggle";
import { useLanguage } from "./language-provider";
import { useLogout, useMe } from "../hooks/use-auth";
import { isAuthenticated } from "../lib/auth";
import { useCart } from "../hooks/use-cart";
import { useUnreadNotifications } from "../hooks/use-notifications";

export function SiteNav() {
  const pathname = usePathname();
  const meQuery = useMe();
  const logoutMutation = useLogout();
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t } = useLanguage();
  const cartQuery = useCart();
  const unreadNotificationsQuery = useUnreadNotifications();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const authed = mounted ? isAuthenticated() : false;
  const roles = mounted ? (meQuery.data?.user?.roles ?? []) : [];
  const isAdmin = roles.includes("admin");
  const isVendor = roles.includes("vendor") || roles.includes("admin");

  const PUBLIC_LINKS = [
    { href: "/", label: t("nav_home"), icon: House },
    { href: "/categories", label: t("nav_shop"), icon: Store },
  ];

  const AUTH_LINKS = [
    { href: "/cart", label: t("nav_cart"), icon: ShoppingCart },
    { href: "/notifications", label: t("notifications_title"), icon: Bell },
    { href: "/orders", label: t("nav_orders"), icon: Package },
    { href: "/profile", label: t("nav_profile"), icon: User },
  ];

  const cartCount = authed ? (cartQuery.data?.items_count ?? 0) : 0;
  const unreadCount = authed ? (unreadNotificationsQuery.data?.count ?? 0) : 0;

  const getBadgeCount = (href: string): number => {
    if (href === "/cart") {
      return cartCount;
    }

    if (href === "/notifications") {
      return unreadCount;
    }

    return 0;
  };

  const links = [
    ...PUBLIC_LINKS,
    ...(authed ? AUTH_LINKS : []),
    ...(isVendor
      ? [{ href: "/vendor", label: t("nav_vendor"), icon: BriefcaseBusiness }]
      : []),
    ...(isAdmin
      ? [{ href: "/admin", label: t("nav_admin"), icon: LayoutDashboard }]
      : []),
  ];

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    window.location.href = "/login";
  };

  const isActiveLink = (href: string) =>
    href === "/"
      ? pathname === "/"
      : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/85 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3 md:px-6">
        <div className="flex items-center gap-2 overflow-x-auto md:flex-1">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
          >
            <ShoppingBag className="h-4 w-4 text-accent" />
            <span className="hidden sm:inline">Ecom</span>
          </Link>

          <div className="hidden items-center gap-2 md:flex">
            {links.map((link) => {
              const active = isActiveLink(link.href);
              const Icon = link.icon;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`inline-flex whitespace-nowrap rounded-full px-3 py-1.5 text-sm transition ${
                    active
                      ? "items-center gap-1.5 bg-accent font-semibold text-slate-950"
                      : "items-center gap-1.5 border border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                  }`}
                >
                  <span className="relative inline-flex">
                    <Icon className="h-3.5 w-3.5" />
                    {getBadgeCount(link.href) > 0 ? (
                      <span className="absolute -right-2 -top-2 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                        {Math.min(getBadgeCount(link.href), 99)}
                      </span>
                    ) : null}
                  </span>
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <LanguageToggle />
          <ThemeToggle />

          {!authed ? (
            <>
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <LogIn className="h-3.5 w-3.5" />
                {t("nav_login")}
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-accent px-3 py-1.5 text-sm font-semibold text-slate-950"
              >
                <UserPlus className="h-3.5 w-3.5" />
                {t("nav_register")}
              </Link>
            </>
          ) : (
            <button
              type="button"
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
              className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-rose-300 px-3 py-1.5 text-sm text-rose-700 disabled:opacity-60 dark:border-rose-800 dark:text-rose-300"
            >
              <LogOut className="h-3.5 w-3.5" />
              {logoutMutation.isPending
                ? t("nav_signing_out")
                : t("nav_logout")}
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <LanguageToggle />
          <ThemeToggle />
          <button
            type="button"
            aria-label={t("nav_open_mobile_menu")}
            className="inline-flex items-center rounded-full border border-slate-300 bg-white p-2 text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-4 w-4" />
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen ? (
          <>
            <motion.button
              type="button"
              aria-label={t("nav_close_mobile_menu")}
              className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-[2px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />

            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 280, damping: 30 }}
              className="fixed right-0 top-0 z-50 h-screen w-1/2 overflow-y-auto border-l border-slate-200 bg-white p-4 shadow-2xl dark:border-slate-700 dark:bg-slate-950"
            >
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
                    <ShoppingBag className="h-4 w-4 text-accent" />
                    Ecom
                  </div>
                  <p className="mt-2 text-xs uppercase tracking-[0.18em] text-muted">
                    {t("nav_navigation")}
                  </p>
                </div>
                <button
                  type="button"
                  aria-label={t("nav_close_mobile_menu")}
                  className="inline-flex items-center rounded-full border border-slate-300 bg-white p-2 text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                  onClick={() => setMobileOpen(false)}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <motion.div
                initial="hidden"
                animate="show"
                variants={{
                  hidden: {},
                  show: { transition: { staggerChildren: 0.04 } },
                }}
                className="space-y-2"
              >
                {links.map((link) => {
                  const active = isActiveLink(link.href);
                  const Icon = link.icon;

                  return (
                    <motion.div
                      key={link.href}
                      variants={{
                        hidden: { opacity: 0, y: 8 },
                        show: { opacity: 1, y: 0 },
                      }}
                    >
                      <Link
                        href={link.href}
                        className={`flex items-center justify-between rounded-2xl px-3 py-2 text-sm transition ${
                          active
                            ? "bg-accent/90 font-semibold text-slate-950"
                            : "border border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                        }`}
                      >
                        <span className="inline-flex items-center gap-2">
                          <span className="relative inline-flex">
                            <Icon className="h-4 w-4" />
                            {getBadgeCount(link.href) > 0 ? (
                              <span className="absolute -right-2 -top-2 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                                {Math.min(getBadgeCount(link.href), 99)}
                              </span>
                            ) : null}
                          </span>
                          {link.label}
                        </span>
                        <ChevronRight className="h-4 w-4 opacity-70" />
                      </Link>
                    </motion.div>
                  );
                })}
              </motion.div>

              <div className="mt-6 border-t border-slate-200 pt-4 dark:border-slate-800">
                {!authed ? (
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href="/login"
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                      <LogIn className="h-3.5 w-3.5" />
                      {t("nav_login")}
                    </Link>
                    <Link
                      href="/register"
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-accent px-3 py-2 text-sm font-semibold text-slate-950"
                    >
                      <UserPlus className="h-3.5 w-3.5" />
                      {t("nav_register")}
                    </Link>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={logoutMutation.isPending}
                    className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-rose-300 px-3 py-2 text-sm text-rose-700 disabled:opacity-60 dark:border-rose-800 dark:text-rose-300"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    {logoutMutation.isPending
                      ? t("nav_signing_out")
                      : t("nav_logout")}
                  </button>
                )}
              </div>
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
