"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { GlassCard } from "@/components/ui/glass-card";
import { useI18n } from "@/i18n";
import { store, type Place } from "@/lib/storage";
import { MapPinned, Plus, Trash2, X, MapPin, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const placeEmojis = ["📍", "🏔️", "🏖️", "🏛️", "🌃", "🎡", "🌸", "🍜", "☕", "🏰", "✈️", "🚂"];

export default function MapPage() {
  const { t } = useI18n();
  const [places, setPlaces] = useState<Place[]>([]);
  const [showNew, setShowNew] = useState(false);
  const [tab, setTab] = useState<"visited" | "wishlist">("visited");

  useEffect(() => {
    const refresh = () => setPlaces(store.places.list());
    refresh();
    window.addEventListener("ld:storage", refresh);
    return () => window.removeEventListener("ld:storage", refresh);
  }, []);

  const visited = places.filter((p) => p.type === "visited");
  const wish = places.filter((p) => p.type === "wishlist");
  const filtered = tab === "visited" ? visited : wish;

  return (
    <div className="space-y-5 animate-fade-up">
      <PageHeader
        title={t("map.title")}
        subtitle={t("map.subtitle")}
        icon={<MapPinned className="text-emerald-500" size={24} />}
        actions={
          <button onClick={() => setShowNew(true)} className="btn-macaron text-sm flex items-center gap-1.5">
            <Plus size={16} /> {t("map.add")}
          </button>
        }
      />

      <div className="grid grid-cols-2 gap-3">
        <GlassCard variant="strong" className="p-5 bg-gradient-to-br from-emerald-100/60 to-mint-100/60 dark:from-emerald-900/30 dark:to-mint-900/30">
          <div className="flex items-center gap-2 text-sm opacity-80 mb-1">
            <MapPin size={16} className="text-emerald-500" />
            {t("map.visited")}
          </div>
          <div className="text-3xl font-bold text-gradient-warm tabular-nums">{visited.length}</div>
          <div className="text-xs opacity-60 mt-0.5">{t("map.visitedCount", { n: visited.length })}</div>
        </GlassCard>
        <GlassCard variant="strong" className="p-5 bg-gradient-to-br from-pink-100/60 to-rose-100/60 dark:from-pink-900/30 dark:to-rose-900/30">
          <div className="flex items-center gap-2 text-sm opacity-80 mb-1">
            <Heart size={16} className="text-rose-500" />
            {t("map.wishlist")}
          </div>
          <div className="text-3xl font-bold text-gradient-warm tabular-nums">{wish.length}</div>
          <div className="text-xs opacity-60 mt-0.5">{t("map.wishCount", { n: wish.length })}</div>
        </GlassCard>
      </div>

      <div className="glass glass-highlight rounded-2xl p-1.5 inline-flex gap-1">
        <button
          onClick={() => setTab("visited")}
          className={cn(
            "px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5",
            tab === "visited"
              ? "bg-gradient-to-r from-emerald-400 to-mint-400 text-white shadow-md"
              : "hover:bg-white/40"
          )}
        >
          <MapPin size={14} /> {t("map.visited")}
        </button>
        <button
          onClick={() => setTab("wishlist")}
          className={cn(
            "px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5",
            tab === "wishlist"
              ? "bg-gradient-to-r from-rose-400 to-pink-400 text-white shadow-md"
              : "hover:bg-white/40"
          )}
        >
          <Heart size={14} /> {t("map.wishlist")}
        </button>
      </div>

      {filtered.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <MapPinned className="mx-auto opacity-40 mb-3" size={48} />
          <p className="text-sm opacity-70">{t("map.empty")}</p>
        </GlassCard>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {filtered.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04 }}
            >
              <GlassCard
                variant="strong"
                className={cn(
                  "p-5 group relative overflow-hidden bg-gradient-to-br",
                  p.type === "visited"
                    ? "from-emerald-100/40 to-sky-100/40 dark:from-emerald-900/20 dark:to-sky-900/20"
                    : "from-rose-100/40 to-pink-100/40 dark:from-rose-900/20 dark:to-pink-900/20"
                )}
              >
                <button
                  onClick={() => store.places.remove(p.id)}
                  className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 hover:text-rose-500 transition-all p-1"
                >
                  <Trash2 size={14} />
                </button>
                <div className="flex items-start gap-3">
                  <div className="text-3xl">{p.emoji || (p.type === "visited" ? "📍" : "💖")}</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold">{p.name}</h3>
                    {p.visitDate && (
                      <p className="text-xs opacity-60 mt-0.5">{p.visitDate}</p>
                    )}
                    {p.notes && (
                      <p className="text-xs opacity-80 mt-2 line-clamp-2">{p.notes}</p>
                    )}
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>{showNew && <NewPlaceModal onClose={() => setShowNew(false)} />}</AnimatePresence>
    </div>
  );
}

function NewPlaceModal({ onClose }: { onClose: () => void }) {
  const { t } = useI18n();
  const [name, setName] = useState("");
  const [type, setType] = useState<"visited" | "wishlist">("visited");
  const [notes, setNotes] = useState("");
  const [visitDate, setVisitDate] = useState("");
  const [emoji, setEmoji] = useState("📍");

  const save = () => {
    if (!name.trim()) return;
    store.places.add({ name, type, notes, visitDate, emoji });
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
          <h2 className="font-bold text-lg">{t("map.add")}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/40">
            <X size={20} />
          </button>
        </div>
        <div className="space-y-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("map.place")}
            className="input-glass"
            autoFocus
          />
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setType("visited")}
              className={cn(
                "py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-1.5 transition-all",
                type === "visited"
                  ? "bg-gradient-to-r from-emerald-400 to-mint-400 text-white shadow-md"
                  : "bg-white/40 dark:bg-white/10 hover:bg-white/60"
              )}
            >
              <MapPin size={14} /> {t("map.visited")}
            </button>
            <button
              onClick={() => setType("wishlist")}
              className={cn(
                "py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-1.5 transition-all",
                type === "wishlist"
                  ? "bg-gradient-to-r from-rose-400 to-pink-400 text-white shadow-md"
                  : "bg-white/40 dark:bg-white/10 hover:bg-white/60"
              )}
            >
              <Heart size={14} /> {t("map.wishlist")}
            </button>
          </div>
          {type === "visited" && (
            <input
              type="date"
              value={visitDate}
              onChange={(e) => setVisitDate(e.target.value)}
              placeholder={t("map.when")}
              className="input-glass"
            />
          )}
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t("map.notes")}
            className="input-glass min-h-[80px] resize-none"
          />
          <div className="flex gap-1.5 flex-wrap">
            {placeEmojis.map((e) => (
              <button
                key={e}
                onClick={() => setEmoji(e)}
                className={cn(
                  "w-9 h-9 rounded-xl text-lg transition-all",
                  emoji === e
                    ? "bg-gradient-to-br from-rose-200 to-pink-300 scale-110 shadow-md"
                    : "bg-white/40 dark:bg-white/10 hover:bg-white/60"
                )}
              >
                {e}
              </button>
            ))}
          </div>
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
