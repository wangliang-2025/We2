"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/i18n";
import { GlassCard } from "@/components/ui/glass-card";
import { getDuration, pad } from "@/lib/utils";
import { store } from "@/lib/storage";
import { Heart } from "lucide-react";
import { motion } from "framer-motion";

export function TimeCounter() {
  const { t } = useI18n();
  const [startDate, setStartDate] = useState<string | null>(null);
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setStartDate(store.profile.get().startDate);
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    const onStorage = () => setStartDate(store.profile.get().startDate);
    window.addEventListener("ld:storage", onStorage);
    return () => {
      clearInterval(id);
      window.removeEventListener("ld:storage", onStorage);
    };
  }, []);

  if (!startDate || !now) {
    return (
      <GlassCard variant="strong" className="p-6 sm:p-8 min-h-[260px] animate-pulse" />
    );
  }

  const start = new Date(startDate);
  const d = getDuration(start, now);

  const numbers = [
    { value: d.years, label: t("home.years") },
    { value: d.months, label: t("home.months") },
    { value: d.days, label: t("home.days") },
    { value: d.hours, label: t("home.hours") },
    { value: d.minutes, label: t("home.minutes") },
    { value: d.seconds, label: t("home.seconds") },
  ];

  return (
    <GlassCard
      variant="strong"
      className="relative p-6 sm:p-8 overflow-hidden"
    >
      <div
        className="absolute -top-20 -right-20 w-72 h-72 rounded-full opacity-60 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(255,182,193,0.7) 0%, transparent 70%)",
          filter: "blur(20px)",
        }}
      />
      <div
        className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full opacity-50 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(184,220,255,0.7) 0%, transparent 70%)",
          filter: "blur(20px)",
        }}
      />

      <div className="relative">
        <div className="flex items-center justify-center gap-2 mb-5 sm:mb-6">
          <Heart className="text-rose-400 animate-heart-beat" size={18} />
          <p className="text-sm sm:text-base opacity-80 font-medium">
            {t("home.together")}
          </p>
          <Heart className="text-rose-400 animate-heart-beat" size={18} />
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3">
          {numbers.map((n, i) => (
            <motion.div
              key={n.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-light rounded-2xl p-3 sm:p-4 text-center glass-highlight"
            >
              <div className="text-2xl sm:text-4xl font-bold tabular-nums text-gradient">
                {pad(n.value)}
              </div>
              <div className="text-[10px] sm:text-xs opacity-70 mt-1 font-medium uppercase tracking-wider">
                {n.label}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-5 text-center">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-rose-100/60 via-pink-100/60 to-purple-100/60 dark:from-rose-900/30 dark:via-pink-900/30 dark:to-purple-900/30 text-xs sm:text-sm font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse-soft" />
            {t("home.totalDays", { n: d.totalDays.toLocaleString() })}
          </span>
        </div>
      </div>
    </GlassCard>
  );
}
