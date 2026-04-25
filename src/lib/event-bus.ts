// 简单的按 coupleId 分频道的内存事件总线
// 单实例部署足够；多实例需要 Redis pub/sub

export type RealtimeEvent = {
  type:
    | "sync"          // 通用：有变动，客户端刷新
    | "message"       // 新聊天消息
    | "complaint"     // 新吐槽
    | "hammer"        // 被锤了
    | "apology"       // 收到道歉
    | "diary"         // 新日记
    | "photo"         // 新照片
    | "status"        // 对方改了头像/心情
    | "ping";         // SSE 保活
  actorId?: string;   // 触发者 userId（自己触发的事件可过滤不推送给自己）
  payload?: Record<string, unknown>;
  ts: number;
};

type Listener = (event: RealtimeEvent) => void;

// coupleId → Set<listener>
const channels = new Map<string, Set<Listener>>();

function getChannel(coupleId: string): Set<Listener> {
  let set = channels.get(coupleId);
  if (!set) {
    set = new Set();
    channels.set(coupleId, set);
  }
  return set;
}

export function subscribe(coupleId: string, listener: Listener): () => void {
  const ch = getChannel(coupleId);
  ch.add(listener);
  return () => {
    ch.delete(listener);
    if (ch.size === 0) channels.delete(coupleId);
  };
}

export function publish(coupleId: string, event: Omit<RealtimeEvent, "ts">) {
  const ch = channels.get(coupleId);
  if (!ch) return;
  const full: RealtimeEvent = { ...event, ts: Date.now() };
  ch.forEach((l) => {
    try {
      l(full);
    } catch (e) {
      console.error("event listener error", e);
    }
  });
}

export function listenerCount(coupleId: string): number {
  return channels.get(coupleId)?.size ?? 0;
}
