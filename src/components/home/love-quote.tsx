"use client";

import { useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { useI18n } from "@/i18n";
import { store } from "@/lib/storage";
import { api } from "@/lib/api-client";
import { generateLoveQuote } from "@/lib/love-quotes";
import { RefreshCw, Quote, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function LoveQuote() {
  const { t, locale } = useI18n();
  const [quote, setQuote] = useState<string>("");
  const [source, setSource] = useState<"ai" | "local">("local");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale]);

  const refresh = async () => {
    setLoading(true);
    try {
      const r = await api.aiLoveQuote(locale);
      setQuote(r.content);
      setSource(r.source);
    } catch {
      const p = store.profile.get();
      setQuote(generateLoveQuote(p.theirName, locale));
      setSource("local");
    } finally {
      setLoading(false);
    }
  };

  return (
    <GlassCard variant="strong" className="relative p-6 overflow-hidden">
      <div
        className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-30 pointer-events-none"
        style={{
          background: "radial-gradient(circle, #FFD4B8 0%, transparent 70%)",
          filter: "blur(20px)",
        }}
      />
      <div className="flex items-center justify-between mb-3 relative">
        <div className="flex items-center gap-2 text-sm font-medium opacity-80">
          <Quote size={16} className="text-rose-400" />
          {t("home.todayQuote")}
          {source === "ai" && (
            <span className="inline-flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300 font-bold">
              <Sparkles size={9} /> AI
            </span>
          )}
        </div>
        <button
          onClick={refresh}
          disabled={loading}
          className="p-2 rounded-full hover:bg-white/40 dark:hover:bg-white/10 transition-colors disabled:opacity-50"
          aria-label={t("home.refresh")}
        >
          <RefreshCw size={16} className={`opacity-70 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>
      <AnimatePresence mode="wait">
        <motion.p
          key={quote}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.4 }}
          className="text-lg sm:text-xl font-medium leading-relaxed text-balance"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          {quote}
        </motion.p>
      </AnimatePresence>
    </GlassCard>
  );
}
