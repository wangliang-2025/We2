"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { GlassCard } from "@/components/ui/glass-card";
import { useI18n } from "@/i18n";
import { store, type Anniversary } from "@/lib/storage";
import { CalendarHeart, Plus, Trash2, X, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn, formatDate } from "@/lib/utils";

const presetEmojis = ["💝", "🎂", "💍", "🌹", "🎉", "💖", "🍰", "🎁", "✨", "🌟"];

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
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export default function AnniversaryPage() {
  const { t } = useI18n();
  const [items, setItems] = useState<Anniversary[]>([]);
  const [showNew, setShowNew] = useState(false);

  useEffect(() => {
    const refresh = () => setItems(store.anniversaries.list());
    refresh();
    window.addEventListener("ld:storage", refresh);
    return () => window.removeEventListener("ld:storage", refresh);
  }, []);

  const sorted = [...items]
    .map((a) => ({ ...a, _next: nextOccurrence(a), _days: daysBetween(nextOccurrence(a)) }))
    .sort((a, b) => a._next.getTime() - b._next.getTime());

  const remove = (id: string) => store.anniversaries.remove(id);

  return (
    <div className="space-y-5 animate-fade-up">
      <PageHeader
        title={t("anniversary.title")}
        subtitle={t("anniversary.subtitle")}
        icon={<CalendarHeart className="text-amber-500" size={24} />}
        actions={
          <button onClick={() => setShowNew(true)} className="btn-macaron text-sm flex items-center gap-1.5">
            <Plus size={16} /> {t("anniversary.add")}
          </button>
        }
      />

      {items.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <CalendarHeart className="mx-auto opacity-40 mb-3" size={48} />
          <p className="text-sm opacity-70 mb-4">{t("anniversary.empty")}</p>
          <PresetButtons />
        </GlassCard>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {sorted.map((a, i) => {
            const d = a._days;
            const isToday = d === 0;
            return (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <GlassCard
                  variant="strong"
                  className={cn(
                    "relative p-5 overflow-hidden",
                    isToday && "shadow-glow"
                  )}
                >
                  <div
                    className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-30"
                    style={{
                      background: `radial-gradient(circle, ${
                        isToday ? "#FF8FA3" : "#FFD4B8"
                      } 0%, transparent 70%)`,
                      filter: "blur(20px)",
                    }}
                  />
                  <div className="flex items-start justify-between mb-2 relative">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{a.emoji || "🎂"}</span>
                      <h3 className="font-bold text-lg">{a.name}</h3>
                    </div>
                    <button
                      onClick={() => remove(a.id)}
                      className="opacity-40 hover:opacity-100 hover:text-rose-500 transition-all p-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="text-xs opacity-60 mb-3 relative">
                    {formatDate(a.date)} {a.repeat && "· 每年"}
                  </div>
                  <div className="relative">
                    {isToday ? (
                      <div className="flex items-center gap-2 text-2xl font-bold text-gradient-warm">
                        <Sparkles className="text-amber-500" />
                        {t("anniversary.today")}
                      </div>
                    ) : d > 0 ? (
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-gradient-warm tabular-nums">
                          {d}
                        </span>
                        <span className="text-sm opacity-70">{t("anniversary.daysLeft", { n: d })}</span>
                      </div>
                    ) : (
                      <div className="text-sm opacity-70">{t("anniversary.passed", { n: -d })}</div>
                    )}
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {showNew && <NewAnniversaryModal onClose={() => setShowNew(false)} />}
      </AnimatePresence>
    </div>
  );
}

function PresetButtons() {
  const { t } = useI18n();
  const presets = [
    { name: t("anniversary.presetMet"), emoji: "🌟" },
    { name: t("anniversary.presetTogether"), emoji: "💝" },
    { name: t("anniversary.presetFirstDate"), emoji: "🌹" },
    { name: t("anniversary.presetBirthdayA"), emoji: "🎂" },
    { name: t("anniversary.presetBirthdayB"), emoji: "🎁" },
  ];
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      <span className="text-xs opacity-60 w-full mb-1">{t("anniversary.presets")}：</span>
      {presets.map((p) => (
        <button
          key={p.name}
          onClick={() => {
            store.anniversaries.add({
              name: p.name,
              date: new Date().toISOString().slice(0, 10),
              repeat: true,
              emoji: p.emoji,
            });
          }}
          className="btn-glass text-xs"
        >
          {p.emoji} {p.name}
        </button>
      ))}
    </div>
  );
}

function NewAnniversaryModal({ onClose }: { onClose: () => void }) {
  const { t } = useI18n();
  const [name, setName] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [repeat, setRepeat] = useState(true);
  const [emoji, setEmoji] = useState("💝");

  const save = () => {
    if (!name.trim()) return;
    store.anniversaries.add({ name, date, repeat, emoji });
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", duration: 0.4 }}
        className="glass-strong glass-highlight rounded-t-3xl sm:rounded-3xl p-5 max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg">{t("anniversary.add")}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/40">
            <X size={20} />
          </button>
        </div>
        <div className="space-y-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("anniversary.name")}
            className="input-glass"
          />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="input-glass"
          />
          <div className="flex gap-1.5 flex-wrap">
            {presetEmojis.map((e) => (
              <button
                key={e}
                onClick={() => setEmoji(e)}
                className={cn(
                  "w-10 h-10 rounded-2xl text-xl transition-all",
                  emoji === e
                    ? "bg-gradient-to-br from-rose-200 to-pink-300 scale-110 shadow-md"
                    : "bg-white/40 dark:bg-white/10 hover:bg-white/60"
                )}
              >
                {e}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={repeat}
              onChange={(e) => setRepeat(e.target.checked)}
              className="w-4 h-4 accent-rose-400"
            />
            {t("anniversary.repeat")}
          </label>
          <div className="flex gap-2 justify-end pt-2">
            <button onClick={onClose} className="btn-glass text-sm">
              {t("common.cancel")}
            </button>
            <button onClick={save} className="btn-macaron text-sm">
              {t("common.save")}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
