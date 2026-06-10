"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { GlassCard } from "@/components/ui/glass-card";
import { useI18n } from "@/i18n";
import { store, type Diary } from "@/lib/storage";
import { formatDate, cn } from "@/lib/utils";
import { BookHeart, Plus, Lock, Globe, Hourglass, Trash2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const moodEmojis = ["😢", "🙁", "😐", "🙂", "😍"];
const moodColors = [
  "from-blue-200 to-indigo-200",
  "from-sky-200 to-blue-200",
  "from-amber-100 to-yellow-200",
  "from-pink-200 to-rose-200",
  "from-rose-300 to-pink-300",
];

export default function DiaryPage() {
  const { t } = useI18n();
  const [diaries, setDiaries] = useState<Diary[]>([]);
  const [showNew, setShowNew] = useState(false);

  useEffect(() => {
    const refresh = () => setDiaries(store.diaries.list());
    refresh();
    window.addEventListener("ld:storage", refresh);
    return () => window.removeEventListener("ld:storage", refresh);
  }, []);

  const remove = (id: string) => {
    if (confirm(t("diary.deleteConfirm"))) store.diaries.remove(id);
  };

  return (
    <div className="space-y-5 animate-fade-up">
      <PageHeader
        title={t("diary.title")}
        subtitle={t("diary.subtitle")}
        icon={<BookHeart className="text-amber-500" size={24} />}
        actions={
          <button
            onClick={() => setShowNew(true)}
            className="btn-macaron text-sm flex items-center gap-1.5"
          >
            <Plus size={16} /> {t("diary.new")}
          </button>
        }
      />

      {diaries.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <BookHeart className="mx-auto opacity-40 mb-3" size={48} />
          <p className="text-sm opacity-70">{t("diary.empty")}</p>
        </GlassCard>
      ) : (
        <div className="space-y-3">
          {diaries.map((d, i) => (
            <DiaryCard key={d.id} d={d} index={i} onDelete={() => remove(d.id)} />
          ))}
        </div>
      )}

      <AnimatePresence>
        {showNew && <NewDiaryModal onClose={() => setShowNew(false)} />}
      </AnimatePresence>
    </div>
  );
}

function DiaryCard({ d, index, onDelete }: { d: Diary; index: number; onDelete: () => void }) {
  const { t } = useI18n();
  const isCapsuleLocked =
    d.privacy === "capsule" && d.unlockAt && new Date(d.unlockAt) > new Date();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
    >
      <GlassCard
        variant="strong"
        className={cn(
          "p-5 relative overflow-hidden bg-gradient-to-br",
          d.mood >= 1 && d.mood <= 5 ? moodColors[d.mood - 1] : "from-gray-100 to-gray-200"
        )}
      >
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-20 -mt-10 -mr-10"
          style={{ background: "radial-gradient(circle, white 0%, transparent 70%)" }}
        />
        <div className="relative">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-2xl">{d.mood >= 1 && d.mood <= 5 ? moodEmojis[d.mood - 1] : "😐"}</span>
              {d.title && <h3 className="font-bold text-lg">{d.title}</h3>}
              <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-white/60 dark:bg-white/15 font-medium">
                {d.privacy === "private" ? (
                  <>
                    <Lock size={10} /> {t("diary.private").split("（")[0]}
                  </>
                ) : d.privacy === "capsule" ? (
                  <>
                    <Hourglass size={10} /> {t("diary.capsule").split("（")[0]}
                  </>
                ) : (
                  <>
                    <Globe size={10} /> {t("diary.public").split("（")[0]}
                  </>
                )}
              </span>
            </div>
            <button
              onClick={onDelete}
              className="opacity-40 hover:opacity-100 hover:text-rose-500 transition-all p-1"
            >
              <Trash2 size={14} />
            </button>
          </div>
          <div className="text-xs opacity-60 mb-3">
            {formatDate(d.createdAt, true)} {d.weather && `· ${d.weather}`}
          </div>
          {isCapsuleLocked ? (
            <div className="py-6 text-center">
              <Hourglass className="mx-auto mb-2 opacity-60 animate-spin-slow" size={32} />
              <div className="font-medium">{t("diary.locked")}</div>
              <div className="text-xs opacity-70 mt-1">
                {t("diary.unlockAt", { date: formatDate(d.unlockAt!) })}
              </div>
            </div>
          ) : (
            <p className="text-sm leading-relaxed whitespace-pre-wrap text-balance">
              {d.content}
            </p>
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
}

function NewDiaryModal({ onClose }: { onClose: () => void }) {
  const { t } = useI18n();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mood, setMood] = useState<1 | 2 | 3 | 4 | 5>(4);
  const [weather, setWeather] = useState("");
  const [privacy, setPrivacy] = useState<"public" | "private" | "capsule">("public");
  const [unlockAt, setUnlockAt] = useState("");

  const save = () => {
    if (!content.trim()) return;
    store.diaries.add({
      title,
      content,
      mood,
      weather,
      privacy,
      unlockAt: privacy === "capsule" ? unlockAt : undefined,
    });
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
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ type: "spring", duration: 0.4 }}
        className="glass-strong glass-highlight rounded-t-3xl sm:rounded-3xl p-5 max-w-xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg">{t("diary.new")}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/40">
            <X size={20} />
          </button>
        </div>
        <div className="space-y-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t("diary.title2")}
            className="input-glass font-medium"
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={t("diary.content")}
            className="input-glass min-h-[160px] resize-none leading-relaxed"
          />
          <div>
            <div className="text-xs opacity-70 mb-2">{t("diary.mood")}</div>
            <div className="flex gap-2">
              {moodEmojis.map((e, i) => (
                <button
                  key={i}
                  onClick={() => setMood((i + 1) as 1 | 2 | 3 | 4 | 5)}
                  className={cn(
                    "flex-1 py-2 text-2xl rounded-2xl transition-all",
                    mood === i + 1
                      ? "bg-gradient-to-br from-rose-200 to-pink-300 dark:from-rose-700 dark:to-pink-700 scale-110 shadow-glow"
                      : "bg-white/40 dark:bg-white/10 hover:bg-white/60 opacity-70"
                  )}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
          <input
            value={weather}
            onChange={(e) => setWeather(e.target.value)}
            placeholder={t("diary.weather") + " (optional)"}
            className="input-glass"
          />
          <div className="grid grid-cols-3 gap-2">
            {(["public", "private", "capsule"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPrivacy(p)}
                className={cn(
                  "px-3 py-2 rounded-xl text-xs font-medium flex flex-col items-center gap-1 transition-all",
                  privacy === p
                    ? "bg-gradient-to-br from-rose-300 to-purple-300 text-white shadow-md"
                    : "bg-white/40 dark:bg-white/10 hover:bg-white/60"
                )}
              >
                {p === "public" ? <Globe size={14} /> : p === "private" ? <Lock size={14} /> : <Hourglass size={14} />}
                <span className="text-[10px]">{t(`diary.${p}`).split("（")[0]}</span>
              </button>
            ))}
          </div>
          {privacy === "capsule" && (
            <input
              type="date"
              value={unlockAt}
              onChange={(e) => setUnlockAt(e.target.value)}
              className="input-glass"
            />
          )}
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
