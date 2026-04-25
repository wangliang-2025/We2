"use client";

import { useEffect, useRef, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { GlassCard } from "@/components/ui/glass-card";
import { useI18n } from "@/i18n";
import { store, type Message, type Bottle } from "@/lib/storage";
import { formatDate, cn } from "@/lib/utils";
import { MessagesSquare, Send, Anchor, Heart, Sparkles, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const interactions = [
  { type: "poke", emoji: "👉", labelKey: "chat.poke", sentKey: "chat.pokeSent", color: "from-amber-300 to-orange-400" },
  { type: "hug", emoji: "🤗", labelKey: "chat.hug", sentKey: "chat.hugSent", color: "from-pink-300 to-rose-400" },
  { type: "kiss", emoji: "💋", labelKey: "chat.kiss", sentKey: "chat.kissSent", color: "from-rose-300 to-red-400" },
  { type: "pat", emoji: "🫳", labelKey: "chat.pat", sentKey: "chat.patSent", color: "from-purple-300 to-pink-400" },
] as const;

export default function ChatPage() {
  const { t } = useI18n();
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [showBottle, setShowBottle] = useState(false);
  const [pickedBottle, setPickedBottle] = useState<Bottle | null>(null);
  const [floatHeart, setFloatHeart] = useState<{ emoji: string; id: number } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const refresh = () => setMessages(store.messages.list());
    refresh();
    window.addEventListener("ld:storage", refresh);
    return () => window.removeEventListener("ld:storage", refresh);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = () => {
    if (!text.trim()) return;
    store.messages.add({ text: text.trim(), type: "text" });
    setText("");
  };

  const sendInteraction = (i: (typeof interactions)[number]) => {
    store.messages.add({
      text: `${i.emoji} ${t(i.sentKey)}`,
      type: "interaction",
      interactionType: i.type,
    });
    setFloatHeart({ emoji: i.emoji, id: Date.now() });
    setTimeout(() => setFloatHeart(null), 1500);
    if (typeof window !== "undefined" && "vibrate" in navigator) navigator.vibrate?.(50);
  };

  return (
    <div className="space-y-4 animate-fade-up flex flex-col" style={{ minHeight: "calc(100dvh - 8rem)" }}>
      <PageHeader
        title={t("chat.title")}
        icon={<MessagesSquare className="text-sky-500" size={24} />}
        actions={
          <div className="flex gap-2">
            <button
              onClick={() => setShowBottle(true)}
              className="btn-glass text-sm flex items-center gap-1.5"
              title={t("chat.bottle")}
            >
              <Anchor size={14} />
              <span className="hidden sm:inline">{t("chat.bottle")}</span>
            </button>
            <Link
              href="/games"
              className="btn-glass text-sm flex items-center gap-1.5"
              title={t("chat.drawTogether")}
            >
              <Sparkles size={14} />
              <span className="hidden sm:inline">{t("chat.drawTogether")}</span>
            </Link>
          </div>
        }
      />

      <GlassCard variant="strong" className="flex-1 flex flex-col overflow-hidden relative">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[400px]">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-60 py-12">
              <Heart className="mb-3 animate-heart-beat text-rose-400" size={40} />
              <p className="text-sm">{t("chat.placeholder")}</p>
            </div>
          )}
          {messages.map((m) => (
            <MessageBubble key={m.id} m={m} />
          ))}
        </div>

        <div className="border-t border-white/30 dark:border-white/10 p-3 space-y-3">
          <div className="grid grid-cols-4 gap-2">
            {interactions.map((i) => (
              <button
                key={i.type}
                onClick={() => sendInteraction(i)}
                className={cn(
                  "flex flex-col items-center gap-1 py-2 rounded-2xl bg-gradient-to-br text-white shadow-md hover:scale-105 transition-transform text-xs font-medium",
                  i.color
                )}
              >
                <span className="text-lg">{i.emoji}</span>
                <span>{t(i.labelKey)}</span>
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
              placeholder={t("chat.placeholder")}
              className="input-glass flex-1"
            />
            <button
              onClick={send}
              disabled={!text.trim()}
              className="btn-macaron px-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={16} />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {floatHeart && (
            <motion.div
              key={floatHeart.id}
              initial={{ opacity: 0, y: 0, scale: 0.5 }}
              animate={{ opacity: 1, y: -100, scale: 2 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2 }}
              className="absolute bottom-32 left-1/2 -translate-x-1/2 text-5xl pointer-events-none"
            >
              {floatHeart.emoji}
            </motion.div>
          )}
        </AnimatePresence>
      </GlassCard>

      <AnimatePresence>
        {showBottle && <BottleModal onClose={() => setShowBottle(false)} onPicked={setPickedBottle} />}
        {pickedBottle && <PickedBottleModal bottle={pickedBottle} onClose={() => setPickedBottle(null)} />}
      </AnimatePresence>
    </div>
  );
}

function MessageBubble({ m }: { m: Message }) {
  const mine = m.authorId === store.myId();
  const isInteraction = m.type === "interaction";
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25 }}
      className={cn("flex", mine ? "justify-end" : "justify-start")}
    >
      <div
        className={cn(
          "max-w-[75%] px-4 py-2.5 rounded-3xl text-sm shadow-sm",
          isInteraction
            ? "bg-gradient-to-br from-rose-200 to-pink-300 dark:from-rose-800/60 dark:to-pink-800/60 text-center font-medium"
            : mine
              ? "bg-gradient-to-br from-rose-400 to-pink-500 text-white rounded-br-md"
              : "glass-light glass-highlight rounded-bl-md"
        )}
      >
        <div className="whitespace-pre-wrap break-words">{m.text}</div>
        <div className={cn("text-[9px] mt-1 opacity-60", mine && !isInteraction && "text-white/80")}>
          {formatDate(m.createdAt, true).slice(5)}
        </div>
      </div>
    </motion.div>
  );
}

function BottleModal({ onClose, onPicked }: { onClose: () => void; onPicked: (b: Bottle) => void }) {
  const { t } = useI18n();
  const [text, setText] = useState("");
  const throwBottle = () => {
    if (!text.trim()) return;
    store.bottles.add(text.trim());
    setText("");
    onClose();
  };
  const pick = async () => {
    const b = await store.bottles.pickRandom();
    if (b) onPicked(b);
    else alert(t("chat.noBottle"));
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        className="glass-strong glass-highlight rounded-3xl p-6 max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Anchor className="text-sky-500" size={20} />
            <h2 className="font-bold text-lg">{t("chat.bottle")}</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/40">
            <X size={20} />
          </button>
        </div>
        <p className="text-xs opacity-70 mb-3">{t("chat.bottleHint")}</p>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t("chat.placeholder")}
          className="input-glass min-h-[100px] resize-none"
        />
        <div className="flex gap-2 mt-3">
          <button onClick={pick} className="btn-glass text-sm flex-1">
            {t("chat.pickBottle")}
          </button>
          <button onClick={throwBottle} className="btn-macaron text-sm flex-1" disabled={!text.trim()}>
            {t("chat.bottle")}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function PickedBottleModal({ bottle, onClose }: { bottle: Bottle; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.5, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        exit={{ scale: 0.5, rotate: 10 }}
        transition={{ type: "spring" }}
        className="glass-strong glass-highlight rounded-3xl p-6 max-w-md w-full text-center bg-gradient-to-br from-sky-100/80 to-cyan-100/80"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-5xl mb-3">🫙</div>
        <p className="font-medium text-base mb-2 leading-relaxed">{bottle.text}</p>
        <p className="text-xs opacity-60">{formatDate(bottle.createdAt)}</p>
        <button onClick={onClose} className="btn-macaron text-sm mt-4">
          ✨
        </button>
      </motion.div>
    </motion.div>
  );
}
