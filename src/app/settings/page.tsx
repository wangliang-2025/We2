"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { GlassCard } from "@/components/ui/glass-card";
import { useI18n } from "@/i18n";
import { store, type Profile } from "@/lib/storage";
import { api } from "@/lib/api-client";
import { Settings as SettingsIcon, User, Calendar, MapPin, Palette, Languages, Sun, Moon, Monitor, Lock, Save, Check, KeyRound, LogOut, Copy, Bell, MessageSquare, Smartphone, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function SettingsPage() {
  const router = useRouter();
  const { t, locale, setLocale } = useI18n();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [saved, setSaved] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const savedTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const copiedTimerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const refresh = () => setProfile(store.profile.get());
    refresh();
    window.addEventListener("ld:storage", refresh);
    return () => {
      window.removeEventListener("ld:storage", refresh);
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
      if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
    };
  }, []);

  const logout = async () => {
    if (!confirm("确定要退出登录吗？")) return;
    try { await api.logout(); } catch {}
    router.replace("/login");
  };

  const copyCode = async () => {
    if (!profile?.inviteCode) return;
    try { await navigator.clipboard.writeText(profile.inviteCode); } catch { return; }
    setCopiedCode(true);
    if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
    copiedTimerRef.current = setTimeout(() => setCopiedCode(false), 1500);
  };

  if (!profile) return null;

  const update = (patch: Partial<Profile>) => {
    setProfile((prev) => {
      if (!prev) return prev;
      return { ...prev, ...patch };
    });
    store.profile.set(patch);
    setSaved(true);
    if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
    savedTimerRef.current = setTimeout(() => setSaved(false), 1200);
  };

  return (
    <div className="space-y-5 animate-fade-up">
      <PageHeader
        title={t("settings.title")}
        icon={<SettingsIcon className="text-purple-500" size={24} />}
        actions={
          <AnimatePresence>
            {saved && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-1.5 text-emerald-500 text-sm font-medium"
              >
                <Check size={16} /> {t("settings.saved")}
              </motion.div>
            )}
          </AnimatePresence>
        }
      />

      <Section icon={<User className="text-rose-500" />} title={t("settings.nicknames")}>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label={t("settings.yourName")}>
            <input
              value={profile.yourName}
              onChange={(e) => update({ yourName: e.target.value })}
              className="input-glass"
            />
          </Field>
          <Field label={t("settings.theirName")}>
            <input
              value={profile.theirName}
              onChange={(e) => update({ theirName: e.target.value })}
              className="input-glass"
            />
          </Field>
        </div>
      </Section>

      <Section icon={<Calendar className="text-amber-500" />} title={t("settings.startDate")}>
        <input
          type="date"
          value={profile.startDate}
          onChange={(e) => update({ startDate: e.target.value })}
          className="input-glass"
        />
      </Section>

      <Section icon={<MapPin className="text-sky-500" />} title={`${t("settings.cityA")} / ${t("settings.cityB")}`}>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label={t("settings.cityA")}>
            <input
              value={profile.cityA}
              onChange={(e) => update({ cityA: e.target.value })}
              className="input-glass"
            />
          </Field>
          <Field label={t("settings.cityB")}>
            <input
              value={profile.cityB}
              onChange={(e) => update({ cityB: e.target.value })}
              className="input-glass"
            />
          </Field>
        </div>
      </Section>

      <Section icon={<Palette className="text-purple-500" />} title={t("settings.theme")}>
        <div className="grid grid-cols-3 gap-2">
          {(["light", "dark", "auto"] as const).map((th) => {
            const Icon = th === "light" ? Sun : th === "dark" ? Moon : Monitor;
            return (
              <button
                key={th}
                onClick={() => update({ theme: th })}
                className={cn(
                  "py-3 rounded-xl flex flex-col items-center gap-1.5 text-xs font-medium transition-all",
                  profile.theme === th
                    ? "bg-gradient-to-br from-purple-300 to-pink-300 text-white shadow-md scale-105"
                    : "bg-white/40 dark:bg-white/10 hover:bg-white/60"
                )}
              >
                <Icon size={18} />
                {t(`settings.${th}`)}
              </button>
            );
          })}
        </div>
      </Section>

      <Section icon={<Languages className="text-emerald-500" />} title={t("settings.language")}>
        <div className="grid grid-cols-2 gap-2">
          {(["zh", "en"] as const).map((l) => (
            <button
              key={l}
              onClick={() => setLocale(l)}
              className={cn(
                "py-3 rounded-xl text-sm font-medium transition-all",
                locale === l
                  ? "bg-gradient-to-r from-emerald-400 to-mint-400 text-white shadow-md"
                  : "bg-white/40 dark:bg-white/10 hover:bg-white/60"
              )}
            >
              {l === "zh" ? "中文" : "English"}
            </button>
          ))}
        </div>
      </Section>

      <Section icon={<Lock className="text-indigo-500" />} title={t("settings.secret")}>
        <p className="text-xs opacity-70 mb-2">{t("settings.secretHint")}</p>
        <input
          value={profile.secret || ""}
          onChange={(e) => update({ secret: e.target.value })}
          placeholder="❤️ 我们的暗号"
          className="input-glass"
        />
      </Section>

      <NotificationSection />

      {profile.inviteCode && (
        <Section icon={<KeyRound className="text-purple-500" />} title="邀请码（让 TA 加入）">
          <div className="flex items-center gap-2">
            <div className="flex-1 glass-light glass-highlight rounded-2xl px-4 py-3 text-center text-2xl font-bold tracking-[0.3em] text-gradient-warm font-mono">
              {profile.inviteCode}
            </div>
            <button
              onClick={copyCode}
              className="btn-glass text-sm flex items-center gap-1.5"
            >
              {copiedCode ? (
                <>
                  <Check size={14} className="text-emerald-500" /> 已复制
                </>
              ) : (
                <>
                  <Copy size={14} /> 复制
                </>
              )}
            </button>
          </div>
          <p className="text-xs opacity-60 mt-2">
            把邀请码发给 TA，让 TA 在 /join 页面输入即可加入小屋
          </p>
        </Section>
      )}

      <Section icon={<LogOut className="text-rose-500" />} title="账号">
        <button
          onClick={logout}
          className="text-sm flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-rose-100/80 dark:bg-rose-900/40 text-rose-600 dark:text-rose-300 hover:bg-rose-200/80 transition-colors font-medium w-full"
        >
          <LogOut size={14} /> 退出登录
        </button>
      </Section>
    </div>
  );
}

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <GlassCard variant="strong" className="p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-9 h-9 grid place-items-center rounded-xl bg-white/50 dark:bg-white/10">
          {icon}
        </div>
        <h2 className="font-bold">{title}</h2>
      </div>
      {children}
    </GlassCard>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="text-xs opacity-70 mb-1.5">{label}</div>
      {children}
    </label>
  );
}

// ========== 通知配置区 ==========

type NotifType =
  | "message"
  | "complaint"
  | "hammer"
  | "apology"
  | "diary"
  | "photo"
  | "anniversary";

const notifLabels: Record<NotifType, { emoji: string; label: string }> = {
  message: { emoji: "💬", label: "收到消息" },
  complaint: { emoji: "😤", label: "被吐槽" },
  hammer: { emoji: "🔨", label: "被锤子锤" },
  apology: { emoji: "🥺", label: "收到道歉" },
  diary: { emoji: "📖", label: "对方写日记" },
  photo: { emoji: "📷", label: "对方上传照片" },
  anniversary: { emoji: "🎂", label: "纪念日临近" },
};

function NotificationSection() {
  const [serverChanKey, setServerChanKey] = useState("");
  const [enabled, setEnabled] = useState<Record<NotifType, boolean>>({
    message: true,
    complaint: true,
    hammer: true,
    apology: true,
    diary: true,
    photo: true,
    anniversary: true,
  });
  const [browserPerm, setBrowserPerm] = useState<NotificationPermission>("default");
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [savedHint, setSavedHint] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const me = await api.me();
        if (cancelled) return;
        setServerChanKey(me.me.serverChanKey || "");
        if (me.me.enabledNotifs) {
          try {
            const e = JSON.parse(me.me.enabledNotifs);
            if (cancelled) return;
            setEnabled((prev) => ({ ...prev, ...e }));
          } catch {}
        }
      } catch {}
    })();
    if (typeof window !== "undefined" && "Notification" in window) {
      setBrowserPerm(Notification.permission);
    }
    return () => { cancelled = true; };
  }, []);

  const requestBrowserPerm = async () => {
    if (!("Notification" in window)) {
      alert("你的浏览器不支持桌面通知");
      return;
    }
    const p = await Notification.requestPermission();
    setBrowserPerm(p);
    if (p === "granted") {
      new Notification("我们的小屋", {
        body: "通知权限已开启 🎉 以后对方的消息会推送过来～",
        tag: "welcome",
      });
    }
  };

  const saveServerChan = async () => {
    try { await api.patchProfile({ serverChanKey: serverChanKey.trim() || null }); } catch {}
    setSavedHint(true);
    setTimeout(() => setSavedHint(false), 1500);
  };

  const toggleType = (type: NotifType, v: boolean) => {
    setEnabled((prev) => {
      const next = { ...prev, [type]: v };
      api.patchProfile({ enabledNotifs: JSON.stringify(next) }).catch(() => {});
      return next;
    });
  };

  const sendTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      // 先保存 key
      await api.patchProfile({ serverChanKey: serverChanKey.trim() || null });
      const r = await api.testNotify();
      if (r.ok) {
        setTestResult("✅ 已推送到你的微信，去看看！");
      } else {
        setTestResult(`❌ ${r.error}`);
      }
    } catch (e) {
      setTestResult(`❌ ${e instanceof Error ? e.message : e}`);
    } finally {
      setTesting(false);
    }
  };

  return (
    <GlassCard variant="strong" className="p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-9 h-9 grid place-items-center rounded-xl bg-white/50 dark:bg-white/10">
          <Bell className="text-amber-500" />
        </div>
        <h2 className="font-bold">消息提醒</h2>
      </div>

      {/* 浏览器通知 */}
      <div className="mb-4">
        <div className="text-xs opacity-70 mb-2 flex items-center gap-1.5">
          <Smartphone size={12} /> 浏览器通知（电脑/手机桌面弹窗）
        </div>
        {browserPerm === "granted" ? (
          <div className="flex items-center gap-2 text-sm text-emerald-500 font-medium">
            <Check size={14} /> 已授权，应用最小化时会自动弹通知
          </div>
        ) : browserPerm === "denied" ? (
          <div className="text-sm text-rose-500">
            已被禁用。请在浏览器地址栏的 🔒 图标里重新允许"通知"权限
          </div>
        ) : (
          <button onClick={requestBrowserPerm} className="btn-macaron text-sm flex items-center gap-2">
            <Bell size={14} /> 开启浏览器通知
          </button>
        )}
      </div>

      <div className="border-t border-white/30 dark:border-white/10 my-4" />

      {/* Server酱 微信推送 */}
      <div className="mb-4">
        <div className="text-xs opacity-70 mb-2 flex items-center gap-1.5">
          <MessageSquare size={12} /> 推送到微信（Server酱）
        </div>
        <p className="text-[11px] opacity-60 mb-2 leading-relaxed">
          去{" "}
          <a
            href="https://sct.ftqq.com/"
            target="_blank"
            rel="noreferrer"
            className="text-rose-500 underline font-medium"
          >
            Server酱官网
          </a>{" "}
          用微信扫码登录，复制 SendKey 粘贴到下面，就能把消息推送到你的微信"方糖"公众号。免费额度对 2 个人够用。
        </p>
        <div className="flex gap-2">
          <input
            type="password"
            value={serverChanKey}
            onChange={(e) => setServerChanKey(e.target.value)}
            placeholder="SCT... / SCU..."
            className="input-glass text-sm flex-1 font-mono"
          />
          <button onClick={saveServerChan} className="btn-glass text-sm flex items-center gap-1">
            {savedHint ? (
              <>
                <Check size={12} className="text-emerald-500" /> 保存
              </>
            ) : (
              <>保存</>
            )}
          </button>
        </div>
        <button
          onClick={sendTest}
          disabled={testing || !serverChanKey.trim()}
          className="mt-2 btn-glass text-xs flex items-center gap-1.5 disabled:opacity-50"
        >
          <Send size={12} />
          {testing ? "发送中..." : "发送测试通知到微信"}
        </button>
        {testResult && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs mt-2 font-medium"
          >
            {testResult}
          </motion.div>
        )}
      </div>

      <div className="border-t border-white/30 dark:border-white/10 my-4" />

      {/* 通知类型开关 */}
      <div>
        <div className="text-xs opacity-70 mb-3">接收哪些通知</div>
        <div className="grid sm:grid-cols-2 gap-2">
          {(Object.keys(notifLabels) as NotifType[]).map((type) => {
            const info = notifLabels[type];
            const on = enabled[type] ?? true;
            return (
              <label
                key={type}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer transition-all",
                  on
                    ? "bg-gradient-to-r from-rose-100/60 to-pink-100/60 dark:from-rose-900/30 dark:to-pink-900/30"
                    : "bg-white/30 dark:bg-white/5 opacity-60"
                )}
              >
                <input
                  type="checkbox"
                  checked={on}
                  onChange={(e) => toggleType(type, e.target.checked)}
                  className="accent-rose-400 w-4 h-4"
                />
                <span className="text-xl">{info.emoji}</span>
                <span className="text-sm font-medium">{info.label}</span>
              </label>
            );
          })}
        </div>
      </div>
    </GlassCard>
  );
}
