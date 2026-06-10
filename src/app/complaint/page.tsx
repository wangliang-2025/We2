"use client";

import { useEffect, useRef, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { GlassCard } from "@/components/ui/glass-card";
import { useI18n } from "@/i18n";
import { store, type Complaint, type Profile } from "@/lib/storage";
import { api } from "@/lib/api-client";
import { formatDate, cn } from "@/lib/utils";
import {
  Megaphone,
  Plus,
  Trash2,
  X,
  Heart,
  HandHeart,
  Hammer,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Category = "small" | "big" | "cute";

const categories: {
  id: Category;
  zh: string;
  en: string;
  emoji: string;
  color: string;
  bg: string;
}[] = [
  { id: "small", zh: "小事吐槽", en: "Tiny gripe", emoji: "🥱", color: "text-amber-600", bg: "from-amber-100 to-yellow-200 dark:from-amber-900/40 dark:to-yellow-900/30" },
  { id: "big", zh: "认真投诉", en: "Real concern", emoji: "😤", color: "text-rose-600", bg: "from-rose-100 to-pink-200 dark:from-rose-900/40 dark:to-pink-900/30" },
  { id: "cute", zh: "撒娇控诉", en: "Cutie protest", emoji: "🥺", color: "text-purple-600", bg: "from-purple-100 to-pink-200 dark:from-purple-900/40 dark:to-pink-900/30" },
];

export default function ComplaintPage() {
  const { t, locale } = useI18n();
  const [items, setItems] = useState<Complaint[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [tab, setTab] = useState<"all" | "open" | "resolved">("all");
  const [hammerEvent, setHammerEvent] = useState<{ id: string; rect: DOMRect } | null>(null);
  const hammerTimerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const refresh = () => {
      setItems(store.complaints.list());
      setProfile(store.profile.get());
    };
    refresh();
    window.addEventListener("ld:storage", refresh);
    return () => {
      window.removeEventListener("ld:storage", refresh);
      if (hammerTimerRef.current) clearTimeout(hammerTimerRef.current);
    };
  }, []);

  const filtered =
    tab === "all"
      ? items
      : tab === "open"
        ? items.filter((c) => !c.apologized)
        : items.filter((c) => c.apologized);

  const totalHammers = items.reduce((sum, c) => sum + c.hammered, 0);
  const resolved = items.filter((c) => c.apologized).length;

  const triggerHammer = (id: string, target: HTMLElement) => {
    setHammerEvent({ id, rect: target.getBoundingClientRect() });
    store.complaints.hammer(id);
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate?.([50, 30, 80]);
    }
    if (hammerTimerRef.current) clearTimeout(hammerTimerRef.current);
    hammerTimerRef.current = setTimeout(() => setHammerEvent(null), 1100);
  };

  return (
    <div className="space-y-5 animate-fade-up">
      <PageHeader
        title={t("complaint.title")}
        subtitle={t("complaint.subtitle")}
        icon={<Megaphone className="text-rose-500" size={24} />}
        actions={
          <button
            onClick={() => setShowNew(true)}
            className="btn-macaron text-sm flex items-center gap-1.5"
          >
            <Plus size={16} /> {t("complaint.add")}
          </button>
        }
      />

      <div className="grid grid-cols-3 gap-3">
        <StatCard
          icon={<Megaphone className="text-rose-500" size={18} />}
          label={t("complaint.statTotal")}
          value={items.length}
          gradient="from-rose-100/60 to-pink-100/60"
        />
        <StatCard
          icon={<Hammer className="text-amber-600" size={18} />}
          label={t("complaint.statHammers")}
          value={totalHammers}
          gradient="from-amber-100/60 to-orange-100/60"
        />
        <StatCard
          icon={<HandHeart className="text-emerald-500" size={18} />}
          label={t("complaint.statResolved")}
          value={`${resolved}/${items.length || 0}`}
          gradient="from-emerald-100/60 to-mint-100/60"
        />
      </div>

      <div className="glass glass-highlight rounded-2xl p-1.5 inline-flex gap-1">
        {(["all", "open", "resolved"] as const).map((k) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={cn(
              "px-4 py-1.5 rounded-xl text-xs font-medium transition-all",
              tab === k
                ? "bg-gradient-to-r from-rose-400 to-purple-400 text-white shadow-md"
                : "hover:bg-white/40"
            )}
          >
            {t(`complaint.tab_${k}`)}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <Megaphone className="mx-auto opacity-40 mb-3" size={48} />
          <p className="text-sm opacity-70">{t("complaint.empty")}</p>
        </GlassCard>
      ) : (
        <div className="space-y-3">
          {filtered.map((c, i) => (
            <ComplaintCard
              key={c.id}
              c={c}
              index={i}
              profile={profile}
              locale={locale}
              onHammer={triggerHammer}
            />
          ))}
        </div>
      )}

      <AnimatePresence>
        {showNew && <NewComplaintModal onClose={() => setShowNew(false)} />}
        {hammerEvent && <HammerEffect rect={hammerEvent.rect} />}
      </AnimatePresence>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  gradient,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  gradient: string;
}) {
  return (
    <GlassCard
      variant="strong"
      className={cn(
        "p-4 bg-gradient-to-br",
        `dark:opacity-90 dark:from-zinc-800/40 dark:to-zinc-800/20`,
        gradient
      )}
    >
      <div className="flex items-center gap-1.5 text-xs opacity-80 mb-1">
        {icon}
        <span className="font-medium truncate">{label}</span>
      </div>
      <div className="text-2xl font-bold tabular-nums text-gradient-warm">{value}</div>
    </GlassCard>
  );
}

function ComplaintCard({
  c,
  index,
  profile,
  locale,
  onHammer,
}: {
  c: Complaint;
  index: number;
  profile: Profile | null;
  locale: "zh" | "en";
  onHammer: (id: string, target: HTMLElement) => void;
}) {
  const { t } = useI18n();
  const cat = categories.find((x) => x.id === c.category)!;
  const [showApology, setShowApology] = useState(false);
  const [shaking, setShaking] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const isMine = c.authorId === store.myId();
  const accuser = isMine ? profile?.yourName || "我" : profile?.theirName || "TA";
  const accuserAvatar = isMine ? profile?.yourAvatar || "🐰" : profile?.theirAvatar || "🦁";
  const targetAvatar = isMine ? profile?.theirAvatar || "🦁" : profile?.yourAvatar || "🐰";
  const targetName = isMine ? profile?.theirName || "TA" : profile?.yourName || "我";

  const handleHammer = () => {
    if (!cardRef.current) return;
    setShaking(true);
    onHammer(c.id, cardRef.current);
    setTimeout(() => setShaking(false), 600);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
    >
      <GlassCard
        variant="strong"
        ref={cardRef}
        className={cn(
          "relative overflow-hidden bg-gradient-to-br p-5",
          cat.bg,
          c.apologized && "opacity-80"
        )}
      >
        <motion.div
          animate={shaking ? { x: [-6, 6, -6, 6, 0], rotate: [-1, 1, -1, 1, 0] } : {}}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-2xl flex-shrink-0">{accuserAvatar || "🐰"}</span>
              <div className="min-w-0">
                <div className="font-bold text-sm truncate">
                  {accuser}{" "}
                  <span className="opacity-60 text-xs font-normal">
                    {t("complaint.complains")}
                  </span>{" "}
                  <span className="text-2xl mx-1">→</span>{" "}
                  <span className="text-base">{targetAvatar || "🦁"}</span>
                </div>
                <div className="text-[10px] opacity-60 mt-0.5">
                  {formatDate(c.createdAt, true)}
                </div>
              </div>
            </div>
            <span
              className={cn(
                "flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold flex-shrink-0",
                cat.color,
                "bg-white/60 dark:bg-white/15"
              )}
            >
              <span className="text-sm">{cat.emoji}</span>
              {locale === "zh" ? cat.zh : cat.en}
            </span>
          </div>

          <p className="text-sm leading-relaxed font-medium pl-8 mb-3 whitespace-pre-wrap text-balance">
            {c.content}
          </p>

          {c.apologized && c.apology && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="ml-8 mt-3 glass-light glass-highlight rounded-2xl p-3 bg-emerald-100/50 dark:bg-emerald-900/30"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 mb-1">
                <HandHeart size={12} /> {targetName} {t("complaint.apologized")}
              </div>
              <p className="text-sm leading-relaxed">{c.apology}</p>
            </motion.div>
          )}

          <div className="flex items-center justify-between mt-3 pl-8">
            <div className="flex items-center gap-3 text-xs opacity-70">
              {c.hammered > 0 && (
                <span className="flex items-center gap-1">
                  <Hammer size={12} className="text-amber-600" /> ×{c.hammered}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              {!c.apologized && (
                <>
                  <button
                    onClick={handleHammer}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold shadow-md hover:scale-105 transition-transform active:scale-95"
                    title={t("complaint.hammer")}
                  >
                    <Hammer size={12} /> {t("complaint.hammer")}
                  </button>
                  <button
                    onClick={() => setShowApology(true)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-gradient-to-r from-emerald-400 to-mint-400 text-white text-xs font-bold shadow-md hover:scale-105 transition-transform"
                    title={t("complaint.apologize")}
                  >
                    <HandHeart size={12} /> {t("complaint.apologize")}
                  </button>
                </>
              )}
              <button
                onClick={() => store.complaints.remove(c.id)}
                className="p-1.5 rounded-full opacity-50 hover:opacity-100 hover:text-rose-500 transition-all"
              >
                <Trash2 size={12} />
              </button>
            </div>
          </div>
        </motion.div>
      </GlassCard>

      <AnimatePresence>
        {showApology && (
          <ApologyModal complaint={c} onClose={() => setShowApology(false)} />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function NewComplaintModal({ onClose }: { onClose: () => void }) {
  const { t, locale } = useI18n();
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<Category>("small");

  const save = () => {
    if (!content.trim()) return;
    store.complaints.add({ content: content.trim(), category });
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
        className="glass-strong glass-highlight rounded-t-3xl sm:rounded-3xl p-5 max-w-md w-full max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <Megaphone className="text-rose-500" size={20} />
            {t("complaint.add")}
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/40">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <div className="text-xs opacity-70 mb-2">{t("complaint.category")}</div>
            <div className="grid grid-cols-3 gap-2">
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCategory(c.id)}
                  className={cn(
                    "flex flex-col items-center gap-1 py-2.5 rounded-xl transition-all",
                    category === c.id
                      ? `bg-gradient-to-br ${c.bg} shadow-md scale-105 ring-2 ring-white`
                      : "bg-white/40 dark:bg-white/10 hover:bg-white/60"
                  )}
                >
                  <span className="text-xl">{c.emoji}</span>
                  <span className="text-[10px] font-medium">
                    {locale === "zh" ? c.zh : c.en}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={t("complaint.contentPlaceholder")}
            className="input-glass min-h-[120px] resize-none leading-relaxed"
            autoFocus
          />

          <div className="flex gap-2 justify-end pt-2">
            <button onClick={onClose} className="btn-glass text-sm">
              {t("common.cancel")}
            </button>
            <button onClick={save} className="btn-macaron text-sm" disabled={!content.trim()}>
              {t("complaint.submit")}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function ApologyModal({ complaint, onClose }: { complaint: Complaint; onClose: () => void }) {
  const { t } = useI18n();
  const [text, setText] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const presets = [
    t("complaint.preset1"),
    t("complaint.preset2"),
    t("complaint.preset3"),
    t("complaint.preset4"),
  ];
  const submit = () => {
    if (!text.trim()) return;
    store.complaints.apologize(complaint.id, text.trim());
    onClose();
  };
  const askAi = async () => {
    setAiLoading(true);
    try {
      const r = await api.aiApology(complaint.content);
      setText(r.content);
    } catch (e) {
      alert(`AI 暂时没回应：${e instanceof Error ? e.message : e}`);
    } finally {
      setAiLoading(false);
    }
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
          <h2 className="font-bold text-lg flex items-center gap-2">
            <HandHeart className="text-emerald-500" size={20} />
            {t("complaint.apologize")}
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/40">
            <X size={20} />
          </button>
        </div>
        <p className="text-sm opacity-70 mb-3 italic line-clamp-2">&ldquo;{complaint.content}&rdquo;</p>
        <div className="flex gap-1.5 flex-wrap mb-3">
          {presets.map((p) => (
            <button
              key={p}
              onClick={() => setText(p)}
              className="btn-glass text-xs"
            >
              {p}
            </button>
          ))}
          <button
            onClick={askAi}
            disabled={aiLoading}
            className="btn-glass text-xs flex items-center gap-1 disabled:opacity-50 bg-gradient-to-r from-purple-100 to-pink-100"
          >
            <Sparkles size={10} />
            {aiLoading ? "AI 想想..." : "AI 帮我写"}
          </button>
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t("complaint.apologyPlaceholder")}
          className="input-glass min-h-[100px] resize-none"
          autoFocus
        />
        <div className="flex gap-2 justify-end pt-3">
          <button onClick={onClose} className="btn-glass text-sm">
            {t("common.cancel")}
          </button>
          <button onClick={submit} className="btn-macaron text-sm" disabled={!text.trim()}>
            <Heart size={14} className="inline mr-1" /> {t("complaint.sendApology")}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function HammerEffect({ rect }: { rect: DOMRect }) {
  const targetX = rect.left + rect.width / 2;
  const targetY = rect.top + rect.height / 2;
  const stars = Array.from({ length: 8 }, (_, i) => i);

  return (
    <>
      <motion.div
        initial={{ x: -200, y: -200, rotate: -120, scale: 1.5 }}
        animate={{
          x: targetX - 50,
          y: targetY - 60,
          rotate: 30,
          scale: 1.3,
        }}
        exit={{ opacity: 0, scale: 0 }}
        transition={{ duration: 0.45, ease: [0.5, 0, 0.75, 0] }}
        className="fixed top-0 left-0 z-[100] pointer-events-none text-7xl"
        style={{ filter: "drop-shadow(0 6px 12px rgba(0,0,0,0.3))" }}
      >
        🔨
      </motion.div>

      {stars.map((i) => {
        const angle = (i / stars.length) * Math.PI * 2;
        const dist = 80 + Math.random() * 60;
        return (
          <motion.div
            key={i}
            initial={{ x: targetX, y: targetY, opacity: 0, scale: 0 }}
            animate={{
              x: targetX + Math.cos(angle) * dist,
              y: targetY + Math.sin(angle) * dist,
              opacity: [0, 1, 0],
              scale: [0, 1.2, 0.5],
              rotate: 360,
            }}
            transition={{ duration: 0.7, delay: 0.4, ease: "easeOut" }}
            className="fixed top-0 left-0 z-[100] pointer-events-none text-2xl"
          >
            {i % 3 === 0 ? "✨" : i % 3 === 1 ? "💢" : "⭐"}
          </motion.div>
        );
      })}

      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: [0, 1, 0], scale: [0, 2, 3] }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="fixed top-0 left-0 z-[99] pointer-events-none text-6xl font-black"
        style={{
          left: targetX - 40,
          top: targetY - 30,
          color: "#F59E0B",
          textShadow: "0 0 20px rgba(245, 158, 11, 0.8), 0 4px 8px rgba(0,0,0,0.3)",
          WebkitTextStroke: "2px white",
        }}
      >
        BONK!
      </motion.div>
    </>
  );
}
