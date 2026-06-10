"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GlassCard } from "@/components/ui/glass-card";
import { api } from "@/lib/api-client";
import { hydrateFromServer } from "@/lib/storage";
import { Heart, KeyRound, Mail, Lock, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function JoinPage() {
  const router = useRouter();
  const [inviteCode, setInviteCode] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await api.join({
        inviteCode: inviteCode.trim().toUpperCase(),
        email: email.trim(),
        password,
        name: name.trim(),
      });
      try { await hydrateFromServer(); } catch {}
      router.replace("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "加入失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-md"
    >
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 mb-3">
          <Heart className="text-rose-400 animate-heart-beat" size={28} />
          <h1 className="text-3xl font-bold text-gradient-warm">加入 TA 的小屋</h1>
        </div>
        <p className="text-sm opacity-70">用 TA 给你的邀请码进入你们的小屋</p>
      </div>

      <GlassCard variant="strong" className="p-6 sm:p-8">
        <form onSubmit={submit} className="space-y-3">
          <div className="relative">
            <KeyRound size={16} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
            <input
              required
              maxLength={6}
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              placeholder="邀请码（6 位）"
              className="input-glass pl-9 font-mono tracking-widest text-center font-bold uppercase"
            />
          </div>
          <div className="relative">
            <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="你的昵称"
              className="input-glass pl-9"
            />
          </div>
          <div className="relative">
            <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="邮箱"
              className="input-glass pl-9"
            />
          </div>
          <div className="relative">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="密码（至少 6 位）"
              className="input-glass pl-9"
            />
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="text-sm text-rose-500 font-medium text-center"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={loading}
            className="btn-macaron w-full flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? "进入中..." : "💕 进入我们的小屋"}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-white/30 dark:border-white/10 text-center text-sm">
          已经在小屋里？
          <Link href="/login" className="ml-1 text-rose-500 font-bold hover:underline">
            去登录 →
          </Link>
        </div>
      </GlassCard>
    </motion.div>
  );
}
