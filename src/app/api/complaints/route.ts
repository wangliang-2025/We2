import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { apiHandler, requireUser, ApiError } from "@/lib/auth";
import { publish } from "@/lib/event-bus";
import { sendNotificationToPartner } from "@/lib/notify";

export async function GET() {
  return apiHandler(async () => {
    const me = await requireUser();
    return prisma.complaint.findMany({
      where: { coupleId: me.coupleId },
      orderBy: { createdAt: "desc" },
    });
  });
}

export async function POST(req: NextRequest) {
  return apiHandler(async () => {
    const me = await requireUser();
    const body = await req.json();
    if (!body.content) throw new ApiError(400, "吐槽内容不能为空");
    const created = await prisma.complaint.create({
      data: {
        coupleId: me.coupleId,
        authorId: me.id,
        content: body.content,
        category: body.category || "small",
      },
    });
    publish(me.coupleId, {
      type: "complaint",
      actorId: me.id,
      payload: { id: created.id },
    });
    sendNotificationToPartner(me.id, "complaint", {
      title: `${me.name} 发了一条吐槽 😤`,
      body: created.content.slice(0, 100),
      tag: "complaint",
    }).catch(() => {});
    return created;
  });
}
