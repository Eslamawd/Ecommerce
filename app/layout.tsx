import React from "react";
import "./globals.css";
import AppProvider from "./providers";
import { SiteNav } from "../src/components/site-nav";

export const metadata = {
  title: "Stone App",
  description:
    "A modern e-commerce application built with Next.js and Tailwind CSS",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <body className="antialiased">
        <AppProvider>
          <SiteNav />
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
