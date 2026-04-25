"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GlassCard } from "@/components/ui/glass-card";
import { api } from "@/lib/api-client";
import { hydrateFromServer } from "@/lib/storage";
import { Heart, Sparkles, Mail, Lock, User, Calendar, MapPin, Copy, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [cityA, setCityA] = useState("");
  const [cityB, setCityB] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const r = await api.register({
        email: email.trim(),
        password,
        name: name.trim(),
        startDate,
        cityA: cityA.trim() || undefined,
        cityB: cityB.trim() || undefined,
      });
      setInviteCode(r.couple.inviteCode);
    } catch (err) {
      setError(err instanceof Error ? err.message : "注册失败");
    } finally {
      setLoading(false);
    }
  };

  const enter = async () => {
    await hydrateFromServer();
    router.replace("/");
  };

  const copy = async () => {
    if (!inviteCode) return;
    await navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (inviteCode) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="w-full max-w-md"
      >
        <GlassCard variant="strong" className="p-8 text-center">
          <div className="text-6xl mb-4 animate-heart-beat">💝</div>
          <h2 className="text-2xl font-bold text-gradient-warm mb-2">小屋创建成功！</h2>
          <p className="text-sm opacity-70 mb-6">
            把下面的邀请码发给 TA，让 TA 输入这个码加入你们的小屋
          </p>

          <div className="glass-light glass-highlight rounded-2xl p-6 mb-4">
            <div className="text-xs opacity-60 mb-2">邀请码</div>
            <div className="text-4xl font-bold tracking-[0.3em] text-gradient-warm font-mono">
              {inviteCode}
            </div>
          </div>

          <button
            onClick={copy}
            className="btn-glass text-sm w-full flex items-center justify-center gap-2 mb-3"
          >
            {copied ? (
              <>
                <Check size={14} className="text-emerald-500" /> 已复制
              </>
            ) : (
              <>
                <Copy size={14} /> 复制邀请码
              </>
            )}
          </button>

          <button onClick={enter} className="btn-macaron text-sm w-full flex items-center justify-center gap-2">
            <Heart size={14} /> 进入我们的小屋
          </button>

          <p className="text-xs opacity-50 mt-4">邀请码可以在【设置】页随时查看</p>
        </GlassCard>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-md"
    >
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 mb-3">
          <Sparkles className="text-purple-400" size={24} />
          <h1 className="text-3xl font-bold text-gradient-warm">创建小屋</h1>
        </div>
        <p className="text-sm opacity-70">第一步：建立你们的私密空间</p>
      </div>

      <GlassCard variant="strong" className="p-6 sm:p-8">
        <form onSubmit={submit} className="space-y-3">
          <div className="relative">
            <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="你的昵称（如：小狮子）"
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
          <div className="relative">
            <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50 pointer-events-none" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="input-glass pl-9"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="relative">
              <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
              <input
                value={cityA}
                onChange={(e) => setCityA(e.target.value)}
                placeholder="你的城市"
                className="input-glass pl-9"
              />
            </div>
            <div className="relative">
              <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
              <input
                value={cityB}
                onChange={(e) => setCityB(e.target.value)}
                placeholder="TA 的城市"
                className="input-glass pl-9"
              />
            </div>
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
            {loading ? "创建中..." : "🏡 创建小屋"}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-white/30 dark:border-white/10 text-center text-sm">
          已经有小屋？
          <Link href="/login" className="ml-1 text-rose-500 font-bold hover:underline">
            去登录 →
          </Link>
        </div>
      </GlassCard>
    </motion.div>
  );
}
