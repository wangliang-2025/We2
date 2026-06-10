"use client";

import { useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { useI18n } from "@/i18n";
import { api } from "@/lib/api-client";
import { generateLoveQuote } from "@/lib/love-quotes";
import { store } from "@/lib/storage";
import { Sparkles, RefreshCw, Copy, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function LoveGenerator() {
  const { t, locale } = useI18n();
  const [quote, setQuote] = useState("");
  const [source, setSource] = useState<"ai" | "local">("local");
  const [copied, setCopied] = useState(false);
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
  const copy = async () => {
    if (!navigator?.clipboard?.writeText) return;
    try {
      await navigator.clipboard.writeText(quote);
    } catch {
      return;
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <GlassCard variant="strong" className="relative p-6 overflow-hidden">
      <div
        className="absolute -top-20 -right-20 w-60 h-60 rounded-full opacity-40 pointer-events-none"
        style={{
          background: "radial-gradient(circle, #FFB6C1 0%, transparent 70%)",
          filter: "blur(20px)",
        }}
      />
      <div
        className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full opacity-40 pointer-events-none"
        style={{
          background: "radial-gradient(circle, #D8C4FF 0%, transparent 70%)",
          filter: "blur(20px)",
        }}
      />

      <div className="relative">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-300 to-pink-400 grid place-items-center text-white shadow-md">
            <Sparkles size={18} />
          </div>
          <h2 className="font-bold">{t("games.aiLove")}</h2>
          {source === "ai" && (
            <span className="inline-flex items-center gap-0.5 text-[10px] px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300 font-bold">
              <Sparkles size={10} /> AI
            </span>
          )}
        </div>
        <p className="text-xs opacity-70 mb-5 ml-11">{t("games.aiLoveDesc")}</p>

        <div className="glass-light glass-highlight rounded-2xl p-6 mb-4 min-h-[140px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={quote}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.4 }}
              className="text-lg sm:text-xl font-medium leading-relaxed text-center text-balance"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              {quote}
            </motion.p>
          </AnimatePresence>
        </div>

        <div className="flex gap-2">
          <button
            onClick={refresh}
            disabled={loading}
            className="btn-macaron text-sm flex-1 flex items-center justify-center gap-2 disabled:opacity-60"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            {loading ? "生成中..." : t("games.aiGenerate")}
          </button>
          <button
            onClick={copy}
            className="btn-glass text-sm flex items-center gap-2 min-w-[100px] justify-center"
          >
            {copied ? (
              <>
                <Heart size={14} className="text-rose-500 fill-rose-500" />
                {t("games.aiCopied")}
              </>
            ) : (
              <>
                <Copy size={14} />
                {t("games.aiCopy")}
              </>
            )}
          </button>
        </div>
      </div>
    </GlassCard>
  );
}
