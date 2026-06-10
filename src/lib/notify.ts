// 通知抽象层 - 支持 Server酱（推送到微信）、浏览器通知（通过 SSE 触发）
import { prisma } from "./db";
import { publish } from "./event-bus";

export type NotifyType =
  | "message"
  | "complaint"
  | "hammer"
  | "apology"
  | "diary"
  | "photo"
  | "anniversary";

export type NotifyPayload = {
  title: string;
  body: string;
  url?: string;
  tag?: string;
};

type EnabledMap = Partial<Record<NotifyType, boolean>>;

function parseEnabled(json: string | null | undefined): EnabledMap {
  if (!json) {
    // 默认全部开启
    return {
      message: true,
      complaint: true,
      hammer: true,
      apology: true,
      diary: true,
      photo: true,
      anniversary: true,
    };
  }
  try {
    return JSON.parse(json);
  } catch {
    return {};
  }
}

/**
 * 推送到微信（通过 Server酱）
 * 注册：https://sct.ftqq.com/
 */
export async function pushToServerChan(
  sendKey: string,
  title: string,
  desp: string
): Promise<boolean> {
  if (!sendKey || !sendKey.trim()) return false;

  const url = `https://sctapi.ftqq.com/${sendKey.trim()}.send`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        title: [...title].slice(0, 32).join(""),
        desp: desp.slice(0, 32 * 1024),
      }),
    });
    const json = await res.json().catch(() => ({}));
    return !!json && (json.code === 0 || json.code === 40001); // 40001 = 频率限制，还是视为"收到"
  } catch (e) {
    console.warn("ServerChan push failed:", e);
    return false;
  }
}

/**
 * 给对方发通知
 * 1. 触发 browser-notify SSE 事件（前端开浏览器通知权限就会弹窗）
 * 2. 根据对方的 serverChanKey 推到微信
 */
export async function sendNotificationToPartner(
  actorId: string,
  type: NotifyType,
  payload: NotifyPayload
) {
  const me = await prisma.user.findUnique({ where: { id: actorId } });
  if (!me) return;
  const partner = await prisma.user.findFirst({
    where: { coupleId: me.coupleId, NOT: { id: actorId } },
  });
  if (!partner) return;

  const enabled = parseEnabled(partner.enabledNotifs);
  if (enabled[type] === false) return;

  // 1. 通过 SSE 让对方浏览器弹通知（SSE 已推送的事件 + 一个专门的 notify 事件）
  publish(me.coupleId, {
    type: "sync",
    actorId,
    payload: {
      notifyTo: partner.id,
      notify: {
        type,
        title: payload.title,
        body: payload.body,
        url: payload.url,
        tag: payload.tag,
      },
    },
  });

  // 2. 推到微信（Server酱）
  if (partner.serverChanKey) {
    const desp = [
      `## ${payload.title}`,
      "",
      payload.body,
      "",
      payload.url ? `[前往查看](${payload.url})` : "",
      "",
      `*来自 我们的小屋 · ${new Date().toLocaleString()}*`,
    ]
      .filter(Boolean)
      .join("\n");

    await pushToServerChan(partner.serverChanKey, payload.title, desp);
  }
}

/**
 * 给自己发通知（测试用）
 */
export async function sendTestNotification(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { ok: false, error: "用户不存在" };
  if (!user.serverChanKey) {
    return { ok: false, error: "未配置 Server酱 SendKey" };
  }
  const ok = await pushToServerChan(
    user.serverChanKey,
    "我们的小屋 · 测试通知",
    `你好 ${user.name}！如果你在微信里看到这条消息，说明通知已经配置成功啦 💕\n\n时间：${new Date().toLocaleString("zh-CN")}`
  );
  return ok
    ? { ok: true as const }
    : { ok: false as const, error: "推送失败，请检查 SendKey 是否正确" };
}
