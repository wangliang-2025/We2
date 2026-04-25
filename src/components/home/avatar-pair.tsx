"use client";

import { useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { useI18n } from "@/i18n";
import { store, type Profile } from "@/lib/storage";
import { statusLibrary, getStatus, avatarOptions, type StatusItem } from "@/lib/status-library";
import { Heart, Pencil, X, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export function AvatarPair() {
  const { t, locale } = useI18n();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [editing, setEditing] = useState<"you" | "them" | null>(null);

  useEffect(() => {
    const refresh = () => setProfile(store.profile.get());
    refresh();
    window.addEventListener("ld:storage", refresh);
    return () => window.removeEventListener("ld:storage", refresh);
  }, []);

  if (!profile) return null;

  const yourStatus = getStatus(profile.yourStatus);
  const theirStatus = getStatus(profile.theirStatus);

  return (
    <>
      <GlassCard variant="strong" className="relative p-5 overflow-hidden">
        <div
          className="absolute inset-0 opacity-50 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 25% 50%, rgba(255,182,193,0.4) 0%, transparent 50%), radial-gradient(ellipse at 75% 50%, rgba(184,220,255,0.4) 0%, transparent 50%)",
          }}
        />

        <div className="relative flex items-center justify-between gap-2">
          <PersonCard
            avatar={profile.yourAvatar || "🐰"}
            name={profile.yourName}
            status={yourStatus}
            statusText={profile.yourStatusText}
            locale={locale}
            mine
            onClick={() => setEditing("you")}
          />

          <div className="flex flex-col items-center justify-center gap-2 px-1 sm:px-3">
            <Heart className="text-rose-400 animate-heart-beat fill-rose-400" size={24} />
            <ConnectingDots />
          </div>

          <PersonCard
            avatar={profile.theirAvatar || "🦁"}
            name={profile.theirName}
            status={theirStatus}
            statusText={profile.theirStatusText}
            locale={locale}
            onClick={() => alert("只能改自己的头像和状态哦～对方的得让 TA 自己改")}
          />
        </div>
      </GlassCard>

      <AnimatePresence>
        {editing === "you" && (
          <StatusEditor
            who="you"
            current={profile.yourStatus}
            currentText={profile.yourStatusText}
            currentAvatar={profile.yourAvatar}
            onClose={() => setEditing(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

function PersonCard({
  avatar,
  name,
  status,
  statusText,
  locale,
  mine,
  onClick,
}: {
  avatar: string;
  name: string;
  status: StatusItem;
  statusText?: string;
  locale: "zh" | "en";
  mine?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex-1 flex flex-col items-center gap-1 p-2 rounded-2xl hover:bg-white/40 dark:hover:bg-white/10 transition-colors group min-w-0"
    >
      <div className="relative">
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: -10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: "spring", duration: 0.5 }}
          className={cn(
            "absolute -top-3 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap shadow-md flex items-center gap-1 bg-gradient-to-r z-10",
            status.bgGradient
          )}
          style={{ color: status.color }}
        >
          <span className="text-xs">{status.emoji}</span>
          <span className="text-zinc-700 dark:text-zinc-100">
            {statusText || (locale === "zh" ? status.zh : status.en)}
          </span>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05, rotate: mine ? -5 : 5 }}
          whileTap={{ scale: 0.95 }}
          className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-3xl glass-light glass-highlight grid place-items-center text-5xl sm:text-6xl shadow-glass-lg group-hover:shadow-glow transition-shadow mt-3"
        >
          {avatar}
        </motion.div>

        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white/80 dark:bg-zinc-700/80 grid place-items-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md">
          <Pencil size={11} className="text-zinc-600 dark:text-zinc-200" />
        </div>
      </div>

      <div className="mt-2 text-center min-w-0 max-w-full">
        <div className="font-bold text-sm truncate">{name}</div>
        <div className="text-[10px] opacity-60 mt-0.5">{mine ? "ME" : "TA"}</div>
      </div>
    </button>
  );
}

function ConnectingDots() {
  return (
    <div className="flex gap-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
          className="w-1 h-1 rounded-full bg-rose-400"
        />
      ))}
    </div>
  );
}

function StatusEditor({
  who,
  current,
  currentText,
  currentAvatar,
  onClose,
}: {
  who: "you" | "them";
  current?: string;
  currentText?: string;
  currentAvatar?: string;
  onClose: () => void;
}) {
  const { t, locale } = useI18n();
  const [statusId, setStatusId] = useState(current || "sunny");
  const [text, setText] = useState(currentText || "");
  const [avatar, setAvatar] = useState(currentAvatar || (who === "you" ? "🐰" : "🦁"));
  const [tab, setTab] = useState<"status" | "avatar">("status");

  const save = () => {
    store.profile.set({
      yourStatus: statusId,
      yourStatusText: text.trim() || undefined,
      yourAvatar: avatar,
      yourStatusUpdatedAt: new Date().toISOString(),
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
        className="glass-strong glass-highlight rounded-t-3xl sm:rounded-3xl p-5 max-w-lg w-full max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <span className="text-2xl">{avatar}</span>
            {who === "you" ? t("avatar.editMine") : t("avatar.editTheirs")}
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/40">
            <X size={20} />
          </button>
        </div>

        <div className="glass glass-highlight rounded-2xl p-1.5 inline-flex gap-1 mb-4">
          <button
            onClick={() => setTab("status")}
            className={cn(
              "px-4 py-1.5 rounded-xl text-xs font-medium transition-all",
              tab === "status"
                ? "bg-gradient-to-r from-rose-400 to-purple-400 text-white shadow-md"
                : "hover:bg-white/40"
            )}
          >
            {t("avatar.statusTab")}
          </button>
          <button
            onClick={() => setTab("avatar")}
            className={cn(
              "px-4 py-1.5 rounded-xl text-xs font-medium transition-all",
              tab === "avatar"
                ? "bg-gradient-to-r from-rose-400 to-purple-400 text-white shadow-md"
                : "hover:bg-white/40"
            )}
          >
            {t("avatar.avatarTab")}
          </button>
        </div>

        {tab === "status" ? (
          <div className="space-y-3">
            <div>
              <div className="text-xs opacity-70 mb-2">{t("avatar.pickStatus")}</div>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-[280px] overflow-y-auto pr-1">
                {statusLibrary.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setStatusId(s.id)}
                    className={cn(
                      "flex flex-col items-center gap-0.5 p-2 rounded-2xl transition-all text-center",
                      statusId === s.id
                        ? `bg-gradient-to-br ${s.bgGradient} shadow-glow scale-105 ring-2 ring-white`
                        : "bg-white/40 dark:bg-white/10 hover:bg-white/60"
                    )}
                  >
                    <span className="text-2xl">{s.emoji}</span>
                    <span className="text-[10px] font-medium leading-tight">
                      {locale === "zh" ? s.zh : s.en}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="text-xs opacity-70 mb-2">{t("avatar.customText")}</div>
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={t("avatar.customTextPlaceholder")}
                maxLength={12}
                className="input-glass text-sm"
              />
              <div className="text-[10px] opacity-50 mt-1 text-right">{text.length}/12</div>
            </div>
          </div>
        ) : (
          <div>
            <div className="text-xs opacity-70 mb-2">{t("avatar.pickAvatar")}</div>
            <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 max-h-[320px] overflow-y-auto pr-1">
              {avatarOptions.map((a) => (
                <button
                  key={a}
                  onClick={() => setAvatar(a)}
                  className={cn(
                    "aspect-square rounded-2xl text-3xl grid place-items-center transition-all",
                    avatar === a
                      ? "bg-gradient-to-br from-rose-200 to-pink-300 dark:from-rose-700 dark:to-pink-700 scale-110 shadow-glow ring-2 ring-rose-400"
                      : "bg-white/40 dark:bg-white/10 hover:bg-white/60"
                  )}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2 justify-end pt-4">
          <button onClick={onClose} className="btn-glass text-sm">
            {t("common.cancel")}
          </button>
          <button onClick={save} className="btn-macaron text-sm flex items-center gap-1.5">
            <Check size={14} /> {t("common.save")}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
