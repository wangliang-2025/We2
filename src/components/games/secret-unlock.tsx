"use client";

import { useEffect, useRef, useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { useI18n } from "@/i18n";
import { store } from "@/lib/storage";
import { Lock, Unlock, KeyRound } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export function SecretUnlock() {
  const { t } = useI18n();
  const [secret, setSecret] = useState("");
  const [input, setInput] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [shake, setShake] = useState(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    setSecret(store.profile.get().secret || "");
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const tryUnlock = () => {
    if (!secret) return;
    if (input.trim() === secret.trim()) {
      setUnlocked(true);
      burstHearts(timersRef.current);
    } else {
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  return (
    <GlassCard variant="strong" className="relative p-6 overflow-hidden">
      <div
        className="absolute -top-16 -right-16 w-48 h-48 rounded-full opacity-30 pointer-events-none"
        style={{
          background: "radial-gradient(circle, #B8DCFF 0%, transparent 70%)",
          filter: "blur(20px)",
        }}
      />
      <div className="flex items-center gap-2 mb-1 relative">
        <div
          className={cn(
            "w-9 h-9 rounded-xl grid place-items-center text-white shadow-md transition-all bg-gradient-to-br",
            unlocked ? "from-emerald-400 to-mint-400" : "from-indigo-400 to-purple-500"
          )}
        >
          {unlocked ? <Unlock size={18} /> : <Lock size={18} />}
        </div>
        <h2 className="font-bold">{t("games.secret")}</h2>
      </div>
      <p className="text-xs opacity-70 mb-4 ml-11">{t("games.secretDesc")}</p>

      <AnimatePresence mode="wait">
        {unlocked ? (
          <motion.div
            key="unlocked"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", duration: 0.6 }}
            className="text-center py-8"
          >
            <div className="text-6xl mb-4 animate-heart-beat">💖</div>
            <p className="font-bold text-lg text-gradient-warm">{t("games.secretRight")}</p>
            <p className="text-sm opacity-70 mt-2">{t("games.secretOpen")}</p>
          </motion.div>
        ) : !secret ? (
          <motion.div key="no-secret" className="text-sm opacity-60 py-4 text-center">
            {t("games.secretNoSecret")}
          </motion.div>
        ) : (
          <motion.div
            key="locked"
            animate={shake ? { x: [-8, 8, -8, 8, 0] } : {}}
            transition={{ duration: 0.4 }}
            className="space-y-3"
          >
            <div className="relative">
              <KeyRound size={16} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && tryUnlock()}
                placeholder={t("games.secretInput")}
                className="input-glass pl-9"
              />
            </div>
            {shake && (
              <p className="text-xs text-rose-500 font-medium">{t("games.secretWrong")}</p>
            )}
            <button onClick={tryUnlock} className="btn-macaron text-sm w-full">
              {t("common.confirm")}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  );
}

function burstHearts(timers: ReturnType<typeof setTimeout>[]) {
  const colors = ["#FF8FA3", "#FFB6C1", "#D8C4FF", "#B8DCFF", "#FFD4B8"];
  for (let i = 0; i < 24; i++) {
    const timer = setTimeout(() => {
      const el = document.createElement("div");
      el.textContent = "♥";
      el.style.cssText = `
        position: fixed;
        left: ${50 + (Math.random() - 0.5) * 30}%;
        top: ${60 + (Math.random() - 0.5) * 20}%;
        color: ${colors[i % colors.length]};
        font-size: ${24 + Math.random() * 24}px;
        z-index: 9999;
        pointer-events: none;
        text-shadow: 0 2px 8px rgba(0,0,0,0.15);
        transition: all 2.4s cubic-bezier(0.2, 0.8, 0.4, 1);
      `;
      document.body.appendChild(el);
      requestAnimationFrame(() => {
        el.style.transform = `translate(${(Math.random() - 0.5) * 600}px, ${
          -300 - Math.random() * 300
        }px) rotate(${(Math.random() - 0.5) * 720}deg) scale(${0.5 + Math.random()})`;
        el.style.opacity = "0";
      });
      setTimeout(() => el.remove(), 2400);
    }, i * 30);
    timers.push(timer);
  }
}
