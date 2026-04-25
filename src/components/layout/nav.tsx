"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n, type Locale } from "@/i18n";
import { cn } from "@/lib/utils";
import {
  Home,
  Image as ImageIcon,
  BookHeart,
  MessagesSquare,
  CalendarHeart,
  ListChecks,
  MapPinned,
  Smile,
  Settings,
  Sparkles,
  Heart,
  Languages,
  Megaphone,
  type LucideIcon,
} from "lucide-react";

type Item = {
  href: string;
  icon: LucideIcon;
  label: string;
  key: string;
};

const items: Item[] = [
  { href: "/", icon: Home, label: "nav.home", key: "home" },
  { href: "/album", icon: ImageIcon, label: "nav.album", key: "album" },
  { href: "/diary", icon: BookHeart, label: "nav.diary", key: "diary" },
  { href: "/chat", icon: MessagesSquare, label: "nav.chat", key: "chat" },
  { href: "/complaint", icon: Megaphone, label: "nav.complaint", key: "complaint" },
  { href: "/anniversary", icon: CalendarHeart, label: "nav.anniversary", key: "anniversary" },
  { href: "/wishlist", icon: ListChecks, label: "nav.wishlist", key: "wishlist" },
  { href: "/map", icon: MapPinned, label: "nav.map", key: "map" },
  { href: "/mood", icon: Smile, label: "nav.mood", key: "mood" },
  { href: "/games", icon: Sparkles, label: "nav.games", key: "games" },
  { href: "/settings", icon: Settings, label: "nav.settings", key: "settings" },
];

export function SideNav() {
  const pathname = usePathname();
  const { t, locale, setLocale } = useI18n();

  return (
    <aside className="hidden lg:flex fixed top-0 left-0 bottom-0 w-64 p-4 z-30 flex-col">
      <div className="glass glass-highlight rounded-3xl p-5 flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-macaron-warm grid place-items-center shadow-glow">
          <Heart className="text-rose-400 animate-heart-beat" size={22} />
        </div>
        <div className="min-w-0">
          <div className="font-bold text-base truncate text-gradient-warm">{t("app.name")}</div>
          <div className="text-xs opacity-70 truncate">{t("app.tagline")}</div>
        </div>
      </div>

      <nav className="glass glass-highlight rounded-3xl p-3 mt-4 flex-1 overflow-y-auto no-scrollbar">
        <ul className="space-y-1">
          {items.map((it) => {
            const active = pathname === it.href || (it.href !== "/" && pathname.startsWith(it.href));
            const Icon = it.icon;
            return (
              <li key={it.key}>
                <Link
                  href={it.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all relative overflow-hidden",
                    active
                      ? "text-white shadow-glow"
                      : "hover:bg-white/40 dark:hover:bg-white/10"
                  )}
                >
                  {active && (
                    <span className="absolute inset-0 -z-10 bg-gradient-to-r from-rose-400 via-pink-400 to-purple-400 opacity-90" />
                  )}
                  <Icon size={18} strokeWidth={2.2} />
                  <span>{t(it.label)}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="glass glass-highlight rounded-3xl p-3 mt-4 flex items-center gap-2">
        <Languages size={16} className="opacity-70 ml-2" />
        <button
          onClick={() => setLocale("zh")}
          className={cn(
            "flex-1 py-2 rounded-xl text-xs font-medium transition-all",
            locale === "zh"
              ? "bg-white/70 dark:bg-white/15 shadow-sm"
              : "opacity-60 hover:opacity-100"
          )}
        >
          中文
        </button>
        <button
          onClick={() => setLocale("en" as Locale)}
          className={cn(
            "flex-1 py-2 rounded-xl text-xs font-medium transition-all",
            locale === "en"
              ? "bg-white/70 dark:bg-white/15 shadow-sm"
              : "opacity-60 hover:opacity-100"
          )}
        >
          English
        </button>
      </div>
    </aside>
  );
}

const mobileItems = items.filter((i) =>
  ["home", "album", "diary", "chat", "complaint"].includes(i.key)
);

export function MobileNav() {
  const pathname = usePathname();
  const { t } = useI18n();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 px-3 pb-3 pt-1">
      <div className="glass-strong glass-highlight rounded-3xl px-2 py-2 flex items-center justify-around">
        {mobileItems.map((it) => {
          const active = pathname === it.href || (it.href !== "/" && pathname.startsWith(it.href));
          const Icon = it.icon;
          return (
            <Link
              key={it.key}
              href={it.href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-2xl transition-all relative",
                active && "text-white"
              )}
            >
              {active && (
                <span className="absolute inset-0 -z-10 bg-gradient-to-br from-rose-400 to-purple-400 rounded-2xl shadow-glow" />
              )}
              <Icon size={20} strokeWidth={2.2} />
              <span className="text-[10px] font-medium">{t(it.label)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function MoreNavMobile() {
  const pathname = usePathname();
  const { t } = useI18n();
  const moreItems = items.filter(
    (i) => !["home", "album", "diary", "chat", "complaint"].includes(i.key)
  );

  return (
    <div className="lg:hidden mb-4">
      <div className="glass glass-highlight rounded-3xl p-3 flex gap-2 overflow-x-auto no-scrollbar">
        {moreItems.map((it) => {
          const active = pathname === it.href || (it.href !== "/" && pathname.startsWith(it.href));
          const Icon = it.icon;
          return (
            <Link
              key={it.key}
              href={it.href}
              className={cn(
                "flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-medium transition-all",
                active
                  ? "bg-gradient-to-r from-rose-400 to-purple-400 text-white shadow-glow"
                  : "bg-white/40 dark:bg-white/10 hover:bg-white/60"
              )}
            >
              <Icon size={14} strokeWidth={2.4} />
              <span>{t(it.label)}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
