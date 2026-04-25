"use client";

import { useEffect, useState } from "react";
import { store } from "@/lib/storage";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const apply = () => {
      const profile = store.profile.get();
      const theme = profile.theme || "auto";
      let dark = false;
      if (theme === "dark") dark = true;
      else if (theme === "auto" && window.matchMedia("(prefers-color-scheme: dark)").matches) dark = true;
      document.documentElement.dataset.theme = dark ? "dark" : "light";
    };
    apply();
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", apply);
    const handler = () => apply();
    window.addEventListener("ld:storage", handler);
    return () => {
      mq.removeEventListener("change", apply);
      window.removeEventListener("ld:storage", handler);
    };
  }, []);

  return <>{children}</>;
}

export function BackgroundOrbs() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
      <div
        className="floating-orb animate-float"
        style={{
          width: 480,
          height: 480,
          background: "radial-gradient(circle, #FFB6C1 0%, transparent 70%)",
          top: "-10%",
          left: "-5%",
        }}
      />
      <div
        className="floating-orb animate-float-slow"
        style={{
          width: 520,
          height: 520,
          background: "radial-gradient(circle, #B8DCFF 0%, transparent 70%)",
          top: "30%",
          right: "-10%",
          animationDelay: "-2s",
        }}
      />
      <div
        className="floating-orb animate-float"
        style={{
          width: 420,
          height: 420,
          background: "radial-gradient(circle, #D8C4FF 0%, transparent 70%)",
          bottom: "-10%",
          left: "30%",
          animationDelay: "-4s",
        }}
      />
      <div
        className="floating-orb animate-float-slow"
        style={{
          width: 360,
          height: 360,
          background: "radial-gradient(circle, #B8F0D6 0%, transparent 70%)",
          top: "10%",
          right: "30%",
          animationDelay: "-6s",
        }}
      />
    </div>
  );
}
