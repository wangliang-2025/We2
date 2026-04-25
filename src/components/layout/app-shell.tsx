"use client";

import { usePathname } from "next/navigation";
import { SideNav, MobileNav } from "@/components/layout/nav";

const PUBLIC_PATHS = ["/login", "/register", "/join"];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublic = PUBLIC_PATHS.includes(pathname);

  if (isPublic) {
    return (
      <main className="min-h-dvh grid place-items-center p-4">{children}</main>
    );
  }

  return (
    <>
      <SideNav />
      <main className="lg:pl-64 min-h-dvh">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-28 lg:pb-10">{children}</div>
      </main>
      <MobileNav />
    </>
  );
}
