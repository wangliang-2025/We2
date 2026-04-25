"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { hydrateFromServer, store } from "@/lib/storage";

const PUBLIC_PATHS = ["/login", "/register", "/join"];
const FALLBACK_INTERVAL = 30000; // SSE 掉线时的轮询兜底（30 秒）
const SSE_DEBOUNCE_MS = 400;     // SSE 事件去抖，避免批量事件频繁刷

export function SyncProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const isPublic = PUBLIC_PATHS.includes(pathname);
  const myIdRef = useRef<string | null>(null);

  useEffect(() => {
    let alive = true;
    let es: EventSource | null = null;
    let pollTimer: ReturnType<typeof setInterval> | null = null;
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;

    const scheduleHydrate = () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        hydrateFromServer().catch(() => {});
      }, SSE_DEBOUNCE_MS);
    };

    const connectSSE = () => {
      if (!alive) return;
      try {
        es = new EventSource("/api/events");
        es.addEventListener("hello", () => {
          // 连接成功
        });
        es.onmessage = (ev) => {
          try {
            const event = JSON.parse(ev.data);
            if (event.type === "ping") return;

            // 有事件到达 → 刷新本地缓存
            scheduleHydrate();

            // 收到给自己的通知 → 弹浏览器通知
            const notify = event?.payload?.notify;
            const notifyTo = event?.payload?.notifyTo;
            if (
              notify &&
              notifyTo &&
              myIdRef.current &&
              notifyTo === myIdRef.current &&
              typeof window !== "undefined" &&
              "Notification" in window &&
              Notification.permission === "granted" &&
              document.visibilityState !== "visible"
            ) {
              try {
                const n = new Notification(notify.title, {
                  body: notify.body,
                  tag: notify.tag,
                  icon: "/icon.png",
                  badge: "/icon.png",
                });
                n.onclick = () => {
                  window.focus();
                  if (notify.url) window.location.href = notify.url;
                  n.close();
                };
              } catch {}
            }
          } catch {}
        };
        es.onerror = () => {
          // 出错会自动重连（EventSource 自带）
        };
      } catch (e) {
        console.warn("SSE connect failed, fallback to polling", e);
      }
    };

    const init = async () => {
      try {
        await hydrateFromServer();
        if (!alive) return;
        myIdRef.current = store.myId();
        setReady(true);

        connectSSE();

        // 兜底：SSE 可能被代理掐，每 30 秒也轮询一下
        pollTimer = setInterval(() => {
          if (store.isLoggedIn() && document.visibilityState === "visible") {
            hydrateFromServer().catch(() => {});
          }
        }, FALLBACK_INTERVAL);
      } catch {
        if (!isPublic) {
          router.replace("/login");
        }
        if (alive) setReady(true);
      }
    };

    init();

    const onVis = () => {
      if (document.visibilityState === "visible" && store.isLoggedIn()) {
        hydrateFromServer().catch(() => {});
      }
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      alive = false;
      if (debounceTimer) clearTimeout(debounceTimer);
      if (pollTimer) clearInterval(pollTimer);
      if (es) es.close();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [isPublic, router]);

  if (!ready && !isPublic) {
    return (
      <div className="fixed inset-0 grid place-items-center">
        <div className="glass glass-highlight rounded-3xl px-8 py-6 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-rose-400 animate-pulse-soft" />
          <span className="text-sm opacity-70">正在打开你们的小屋...</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
