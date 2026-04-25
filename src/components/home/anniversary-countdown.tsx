"use client";

import { useEffect, useMemo, useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { useI18n } from "@/i18n";
import { store, type Anniversary } from "@/lib/storage";
import { CalendarHeart, Sparkles } from "lucide-react";
import Link from "next/link";

function nextOccurrence(a: Anniversary): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const orig = new Date(a.date);
  if (!a.repeat) return orig;
  const next = new Date(today.getFullYear(), orig.getMonth(), orig.getDate());
  if (next.getTime() < today.getTime()) {
    next.setFullYear(today.getFullYear() + 1);
  }
  return next;
}

function daysBetween(target: Date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function AnniversaryCountdown() {
  const { t } = useI18n();
  const [items, setItems] = useState<Anniversary[]>([]);
  const [profileStart, setProfileStart] = useState<string>("");

  useEffect(() => {
    const refresh = () => {
      setItems(store.anniversaries.list());
      setProfileStart(store.profile.get().startDate);
    };
    refresh();
    window.addEventListener("ld:storage", refresh);
    return () => window.removeEventListener("ld:storage", refresh);
  }, []);

  const next = useMemo(() => {
    const all = [...items];
    if (profileStart) {
      all.push({
        id: "__start__",
        name: t("anniversary.presetTogether"),
        date: profileStart,
        repeat: true,
        emoji: "💝",
      });
    }
    if (all.length === 0) return null;
    const sorted = all
      .map((a) => ({ ...a, nextDate: nextOccurrence(a) }))
      .sort((a, b) => a.nextDate.getTime() - b.nextDate.getTime());
    return sorted[0];
  }, [items, profileStart, t]);

  return (
    <GlassCard variant="strong" className="relative p-5 overflow-hidden">
      <div
        className="absolute -top-12 -right-12 w-40 h-40 rounded-full pointer-events-none opacity-50"
        style={{
          background: "radial-gradient(circle, #FFF1A8 0%, transparent 70%)",
          filter: "blur(20px)",
        }}
      />
      <div className="flex items-center gap-2 text-sm font-medium opacity-80 mb-3 relative">
        <CalendarHeart size={16} className="text-amber-400" />
        {t("home.nextAnniversary")}
      </div>
      {next ? (
        <Link href="/anniversary" className="block group">
          <div className="flex items-baseline gap-3 mb-1">
            <span className="text-4xl sm:text-5xl font-bold text-gradient-warm tabular-nums">
              {daysBetween(nextOccurrence(next))}
            </span>
            <span className="text-sm opacity-70">{t("home.daysShort")}</span>
          </div>
          <div className="flex items-center gap-2 text-sm opacity-80 group-hover:opacity-100 transition-opacity">
            <span className="text-lg">{next.emoji || "🎂"}</span>
            <span className="font-medium">{next.name}</span>
          </div>
        </Link>
      ) : (
        <Link
          href="/anniversary"
          className="flex items-center gap-2 text-sm py-2 opacity-70 hover:opacity-100"
        >
          <Sparkles size={14} />
          {t("anniversary.empty")}
        </Link>
      )}
    </GlassCard>
  );
}
