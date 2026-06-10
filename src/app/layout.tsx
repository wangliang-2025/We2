import "./globals.css";
import type { Metadata, Viewport } from "next";
import { I18nProvider } from "@/i18n";
import { ThemeProvider, BackgroundOrbs } from "@/components/theme-provider";
import { SyncProvider } from "@/components/sync-provider";
import { AppShell } from "@/components/layout/app-shell";

export const metadata: Metadata = {
  title: "我们的小屋 · Our Little Home",
  description: "一个属于我们两个人的秘密花园 · A secret garden just for two",
};

export const viewport: Viewport = {
  themeColor: "#ffd6e8",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("ld_theme");if(!t)t="auto";var d="light";if(t==="dark")d="dark";else if(t==="auto"&&window.matchMedia("(prefers-color-scheme: dark)").matches)d="dark";document.documentElement.dataset.theme=d}catch(e){}})()`,
          }}
        />
      </head>
      <body>
        <ThemeProvider>
          <I18nProvider>
            <BackgroundOrbs />
            <SyncProvider>
              <AppShell>{children}</AppShell>
            </SyncProvider>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
