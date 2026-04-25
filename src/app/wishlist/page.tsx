"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { GlassCard } from "@/components/ui/glass-card";
import { useI18n } from "@/i18n";
import { store, type Wish } from "@/lib/storage";
import { ListChecks, Plus, Check, Trash2, X, Plane, UtensilsCrossed, Sparkles, Home as HomeIcon, Target } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const categories = [
  { id: "travel", icon: Plane, color: "from-sky-300 to-cyan-400" },
  { id: "food", icon: UtensilsCrossed, color: "from-amber-300 to-orange-400" },
  { id: "experience", icon: Sparkles, color: "from-purple-300 to-pink-400" },
  { id: "life", icon: HomeIcon, color: "from-mint-300 to-emerald-400" },
  { id: "longterm", icon: Target, color: "from-rose-300 to-pink-500" },
] as const;

type CatId = (typeof categories)[number]["id"];

export default function WishlistPage() {
  const { t } = useI18n();
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [showNew, setShowNew] = useState(false);
  const [filter, setFilter] = useState<"all" | CatId>("all");

  useEffect(() => {
    const refresh = () => setWishes(store.wishes.list());
    refresh();
    window.addEventListener("ld:storage", refresh);
    return () => window.removeEventListener("ld:storage", refresh);
  }, []);

  const filtered = filter === "all" ? wishes : wishes.filter((w) => w.category === filter);
  const completed = wishes.filter((w) => w.done).length;
  const progress = wishes.length === 0 ? 0 : Math.round((completed / wishes.length) * 100);

  return (
    <div className="space-y-5 animate-fade-up">
      <PageHeader
        title={t("wishlist.title")}
        subtitle={t("wishlist.subtitle")}
        icon={<ListChecks className="text-amber-500" size={24} />}
        actions={
          <button onClick={() => setShowNew(true)} className="btn-macaron text-sm flex items-center gap-1.5">
            <Plus size={16} /> {t("wishlist.add")}
          </button>
        }
      />

      <GlassCard variant="strong" className="p-5">
        <div className="flex items-center justify-between mb-2 text-sm">
          <span className="font-medium opacity-80">{t("wishlist.progress")}</span>
          <span className="font-bold text-gradient-warm tabular-nums">
            {completed} / {wishes.length} · {progress}%
          </span>
        </div>
        <div className="h-3 rounded-full bg-white/40 dark:bg-white/10 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-rose-400 via-pink-400 to-purple-400 rounded-full shadow-glow"
          />
        </div>
      </GlassCard>

      <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1">
        <FilterChip active={filter === "all"} onClick={() => setFilter("all")}>
          全部 / All
        </FilterChip>
        {categories.map((c) => {
          const Icon = c.icon;
          return (
            <FilterChip
              key={c.id}
              active={filter === c.id}
              onClick={() => setFilter(c.id)}
              gradient={c.color}
            >
              <Icon size={12} />
              {t(`wishlist.cat.${c.id}`)}
            </FilterChip>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <ListChecks className="mx-auto opacity-40 mb-3" size={48} />
          <p className="text-sm opacity-70">{t("wishlist.empty")}</p>
        </GlassCard>
      ) : (
        <div className="space-y-2">
          {filtered.map((w, i) => {
            const cat = categories.find((c) => c.id === w.category)!;
            const Icon = cat.icon;
            return (
              <motion.div
                key={w.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <GlassCard
                  className={cn(
                    "p-4 flex items-center gap-3 group",
                    w.done && "opacity-60"
                  )}
                >
                  <button
                    onClick={() => store.wishes.toggle(w.id)}
                    className={cn(
                      "flex-shrink-0 w-10 h-10 rounded-2xl grid place-items-center transition-all bg-gradient-to-br shadow-md",
                      w.done
                        ? "from-emerald-400 to-mint-400 text-white"
                        : `${cat.color} text-white opacity-50 hover:opacity-100`
                    )}
                  >
                    {w.done ? <Check size={18} strokeWidth={3} /> : <Icon size={16} />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={cn("font-medium text-sm", w.done && "line-through")}>
                      {w.text}
                    </p>
                    {w.doneAt && (
                      <p className="text-[10px] opacity-60 mt-0.5">
                        {t("wishlist.done")} · {w.doneAt.slice(0, 10)}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => store.wishes.remove(w.id)}
                    className="opacity-0 group-hover:opacity-100 hover:text-rose-500 transition-all p-1"
                  >
                    <Trash2 size={14} />
                  </button>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {showNew && <NewWishModal onClose={() => setShowNew(false)} />}
      </AnimatePresence>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
  gradient,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  gradient?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-medium transition-all",
        active
          ? gradient
            ? `bg-gradient-to-r ${gradient} text-white shadow-md`
            : "bg-gradient-to-r from-rose-400 to-purple-400 text-white shadow-md"
          : "glass-light glass-highlight hover:bg-white/60"
      )}
    >
      {children}
    </button>
  );
}

function NewWishModal({ onClose }: { onClose: () => void }) {
  const { t } = useI18n();
  const [text, setText] = useState("");
  const [category, setCategory] = useState<CatId>("travel");

  const save = () => {
    if (!text.trim()) return;
    store.wishes.add({ text, category });
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
          <h2 className="font-bold text-lg">{t("wishlist.add")}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/40">
            <X size={20} />
          </button>
        </div>
        <div className="space-y-3">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t("wishlist.new")}
            className="input-glass"
            autoFocus
          />
          <div className="grid grid-cols-5 gap-2">
            {categories.map((c) => {
              const Icon = c.icon;
              return (
                <button
                  key={c.id}
                  onClick={() => setCategory(c.id)}
                  className={cn(
                    "flex flex-col items-center gap-1 p-2 rounded-2xl transition-all",
                    category === c.id
                      ? `bg-gradient-to-br ${c.color} text-white shadow-md scale-105`
                      : "bg-white/40 dark:bg-white/10 hover:bg-white/60"
                  )}
                >
                  <Icon size={18} />
                  <span className="text-[10px] font-medium">{t(`wishlist.cat.${c.id}`)}</span>
                </button>
              );
            })}
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
