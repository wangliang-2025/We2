import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { apiHandler, requireUser, ApiError } from "@/lib/auth";
import { publish } from "@/lib/event-bus";
import { sendNotificationToPartner } from "@/lib/notify";

export async function GET(req: NextRequest) {
  return apiHandler(async () => {
    const me = await requireUser();
    const since = req.nextUrl.searchParams.get("since");
    const where: { coupleId: string; createdAt?: { gt: Date } } = { coupleId: me.coupleId };
    if (since) where.createdAt = { gt: new Date(since) };
    const list = await prisma.message.findMany({
      where,
      orderBy: { createdAt: "asc" },
      take: 500,
    });
    return list;
  });
}

export async function POST(req: NextRequest) {
  return apiHandler(async () => {
    const me = await requireUser();
    const body = await req.json();
    if (!body.text) throw new ApiError(400, "消息内容不能为空");
    const msg = await prisma.message.create({
      data: {
        coupleId: me.coupleId,
        authorId: me.id,
        text: body.text,
        type: body.type || "text",
        interactionType: body.interactionType || null,
      },
    });
    publish(me.coupleId, {
      type: "message",
      actorId: me.id,
      payload: { id: msg.id, preview: msg.text.slice(0, 50) },
    });
    // 异步通知对方（不阻塞响应）
    sendNotificationToPartner(me.id, "message", {
      title: `${me.name} 发消息了`,
      body: msg.text.slice(0, 80),
      tag: "message",
    }).catch(() => {});
    return msg;
  });
}
