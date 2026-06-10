"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GlassCard } from "@/components/ui/glass-card";
import { api } from "@/lib/api-client";
import { hydrateFromServer } from "@/lib/storage";
import { Heart, LogIn, Mail, Lock } from "lucide-react";
import { motion } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await api.login(email.trim(), password);
      try { await hydrateFromServer(); } catch {}
      router.replace("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "登录失败");
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
          <h1 className="text-3xl font-bold text-gradient-warm">我们的小屋</h1>
          <Heart className="text-rose-400 animate-heart-beat" size={28} />
        </div>
        <p className="text-sm opacity-70">欢迎回家 · Welcome back</p>
      </div>

      <GlassCard variant="strong" className="p-6 sm:p-8">
        <form onSubmit={submit} className="space-y-4">
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
              placeholder="密码"
              className="input-glass pl-9"
            />
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="text-sm text-rose-500 font-medium text-center"
            >
              {error}
            </motion.div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-macaron w-full flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? (
              <span className="animate-pulse-soft">登录中...</span>
            ) : (
              <>
                <LogIn size={16} /> 进入小屋
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-white/30 dark:border-white/10 text-center text-sm space-y-2">
          <div>
            还没有小屋？
            <Link href="/register" className="ml-1 text-rose-500 font-bold hover:underline">
              创建一个 →
            </Link>
          </div>
          <div className="opacity-70">
            被邀请加入？
            <Link href="/join" className="ml-1 text-purple-500 font-bold hover:underline">
              用邀请码加入 →
            </Link>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
