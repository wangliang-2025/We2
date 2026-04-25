"use client";

import { useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { useI18n } from "@/i18n";
import { Heart, Image as ImageIcon, BookHeart, MessagesSquare, Sparkles, Megaphone } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export function QuickActions() {
  const { t } = useI18n();
  const [missSent, setMissSent] = useState(false);

  const sendMiss = () => {
    setMissSent(true);
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate?.([30, 50, 30]);
    }
    setTimeout(() => setMissSent(false), 2000);
  };

  return (
    <GlassCard variant="strong" className="p-5">
      <div className="flex items-center gap-2 text-sm font-medium opacity-80 mb-3">
        <Sparkles size={16} className="text-purple-400" />
        {t("home.quickActions")}
      </div>
      <div className="grid grid-cols-5 gap-2">
        <button
          onClick={sendMiss}
          className="relative flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-gradient-to-br from-rose-100 to-pink-200 dark:from-rose-900/40 dark:to-pink-900/40 hover:scale-105 transition-transform"
        >
          <Heart className="text-rose-500" size={20} />
          <span className="text-[10px] font-medium">{t("home.miss")}</span>
          <AnimatePresence>
            {missSent && (
              <motion.div
                initial={{ opacity: 0, y: 0, scale: 0.5 }}
                animate={{ opacity: 1, y: -40, scale: 1.2 }}
                exit={{ opacity: 0 }}
                className="absolute -top-2 left-1/2 -translate-x-1/2 pointer-events-none"
              >
                <Heart className="text-rose-500 fill-rose-500" size={32} />
              </motion.div>
            )}
          </AnimatePresence>
        </button>
        <Link
          href="/album"
          className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-gradient-to-br from-purple-100 to-pink-200 dark:from-purple-900/40 dark:to-pink-900/40 hover:scale-105 transition-transform"
        >
          <ImageIcon className="text-purple-500" size={20} />
          <span className="text-[10px] font-medium">{t("nav.album")}</span>
        </Link>
        <Link
          href="/diary"
          className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-200 dark:from-amber-900/40 dark:to-orange-900/40 hover:scale-105 transition-transform"
        >
          <BookHeart className="text-amber-600" size={20} />
          <span className="text-[10px] font-medium">{t("nav.diary")}</span>
        </Link>
        <Link
          href="/chat"
          className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-gradient-to-br from-sky-100 to-cyan-200 dark:from-sky-900/40 dark:to-cyan-900/40 hover:scale-105 transition-transform"
        >
          <MessagesSquare className="text-sky-500" size={20} />
          <span className="text-[10px] font-medium">{t("nav.chat")}</span>
        </Link>
        <Link
          href="/complaint"
          className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-gradient-to-br from-orange-100 to-red-200 dark:from-orange-900/40 dark:to-red-900/40 hover:scale-105 transition-transform"
        >
          <Megaphone className="text-rose-500" size={20} />
          <span className="text-[10px] font-medium">{t("nav.complaint")}</span>
        </Link>
      </div>
      <AnimatePresence>
        {missSent && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-3 text-center text-xs text-rose-500 font-medium"
          >
            {t("home.missSent")} 💕
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  );
}
