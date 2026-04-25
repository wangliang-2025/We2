import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { subscribe, type RealtimeEvent } from "@/lib/event-bus";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// 保持连接不被 Next/Vercel 优化关掉
export const fetchCache = "force-no-store";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const encoder = new TextEncoder();
  const coupleId = user.coupleId;
  const myId = user.id;

  const stream = new ReadableStream({
    start(controller) {
      let closed = false;
      const safeEnqueue = (chunk: Uint8Array) => {
        if (closed) return;
        try {
          controller.enqueue(chunk);
        } catch {
          closed = true;
        }
      };

      const send = (event: RealtimeEvent) => {
        // 不把自己触发的事件推回给自己
        if (event.actorId && event.actorId === myId && event.type !== "ping") return;
        safeEnqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      };

      // 初始连接确认
      safeEnqueue(encoder.encode("retry: 5000\n\n"));
      safeEnqueue(
        encoder.encode(
          `event: hello\ndata: ${JSON.stringify({ coupleId, ts: Date.now() })}\n\n`
        )
      );

      // 订阅频道
      const unsubscribe = subscribe(coupleId, send);

      // 每 25 秒发一个 ping 保活（防 nginx/Caddy 空闲断连）
      const pingTimer = setInterval(() => {
        send({ type: "ping", ts: Date.now() });
      }, 25000);

      // 客户端断开
      req.signal.addEventListener("abort", () => {
        closed = true;
        clearInterval(pingTimer);
        unsubscribe();
        try {
          controller.close();
        } catch {}
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no", // 禁止 nginx/Caddy 缓冲
    },
  });
}
