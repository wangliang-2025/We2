"use client";

import { useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { useI18n } from "@/i18n";
import { store } from "@/lib/storage";
import { getDuration } from "@/lib/utils";
import { Image as ImageIcon, BookHeart, MessagesSquare, MapPin, ListChecks, CalendarDays, type LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

type Stat = {
  key: string;
  icon: LucideIcon;
  value: number | string;
  label: string;
  gradient: string;
};

export function StatsGrid() {
  const { t } = useI18n();
  const [stats, setStats] = useState<Stat[] | null>(null);

  useEffect(() => {
    const recalc = () => {
      const profile = store.profile.get();
      const days = getDuration(new Date(profile.startDate)).totalDays;
      setStats([
        {
          key: "photos",
          icon: ImageIcon,
          value: store.photos.list().length,
          label: t("home.stats.photos"),
          gradient: "from-pink-300 to-rose-400",
        },
        {
          key: "diaries",
          icon: BookHeart,
          value: store.diaries.list().length,
          label: t("home.stats.diaries"),
          gradient: "from-purple-300 to-pink-400",
        },
        {
          key: "messages",
          icon: MessagesSquare,
          value: store.messages.list().length,
          label: t("home.stats.messages"),
          gradient: "from-sky-300 to-purple-400",
        },
        {
          key: "places",
          icon: MapPin,
          value: store.places.list().filter((p) => p.type === "visited").length,
          label: t("home.stats.places"),
          gradient: "from-mint-300 to-sky-400",
        },
        {
          key: "wishes",
          icon: ListChecks,
          value: store.wishes.list().filter((w) => w.done).length,
          label: t("home.stats.wishes"),
          gradient: "from-amber-300 to-orange-400",
        },
        {
          key: "days",
          icon: CalendarDays,
          value: days,
          label: t("home.stats.days"),
          gradient: "from-rose-300 to-amber-300",
        },
      ]);
    };
    recalc();
    window.addEventListener("ld:storage", recalc);
    return () => window.removeEventListener("ld:storage", recalc);
  }, [t]);

  if (!stats) {
    return (
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <GlassCard key={i} className="h-24 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
      {stats.map((s, i) => {
        const Icon = s.icon;
        return (
          <motion.div
            key={s.key}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05, duration: 0.4 }}
          >
            <GlassCard className="p-3 sm:p-4 hover:scale-[1.03] transition-transform cursor-default">
              <div
                className={`w-8 h-8 rounded-xl bg-gradient-to-br ${s.gradient} grid place-items-center text-white shadow-md mb-2`}
              >
                <Icon size={16} />
              </div>
              <div className="text-xl sm:text-2xl font-bold tabular-nums">{s.value}</div>
              <div className="text-[10px] sm:text-xs opacity-70 mt-0.5">{s.label}</div>
            </GlassCard>
          </motion.div>
        );
      })}
    </div>
  );
}
