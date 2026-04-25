import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { apiHandler, requireUser, ApiError } from "@/lib/auth";
import { publish } from "@/lib/event-bus";
import { sendNotificationToPartner } from "@/lib/notify";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  return apiHandler(async () => {
    const me = await requireUser();
    const c = await prisma.complaint.findUnique({ where: { id: params.id } });
    if (!c || c.coupleId !== me.coupleId) throw new ApiError(404, "找不到");

    const body = await req.json();
    if (body.action === "hammer") {
      const updated = await prisma.complaint.update({
        where: { id: params.id },
        data: { hammered: { increment: 1 } },
      });
      publish(me.coupleId, {
        type: "hammer",
        actorId: me.id,
        payload: { id: updated.id },
      });
      // 锤的是对方创建的吐槽 → 通知吐槽的作者
      if (c.authorId !== me.id) {
        sendNotificationToPartner(me.id, "hammer", {
          title: `${me.name} 拿小锤锤砸了你 🔨`,
          body: "回去看看发生了什么～",
          tag: "hammer",
        }).catch(() => {});
      }
      return updated;
    }
    if (body.action === "apologize") {
      const updated = await prisma.complaint.update({
        where: { id: params.id },
        data: {
          apologized: true,
          apology: body.apology || "",
          apologizedAt: new Date(),
        },
      });
      publish(me.coupleId, {
        type: "apology",
        actorId: me.id,
        payload: { id: updated.id },
      });
      sendNotificationToPartner(me.id, "apology", {
        title: `${me.name} 道歉啦 🥺`,
        body: updated.apology || "",
        tag: "apology",
      }).catch(() => {});
      return updated;
    }
    throw new ApiError(400, "未知操作");
  });
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  return apiHandler(async () => {
    const me = await requireUser();
    const c = await prisma.complaint.findUnique({ where: { id: params.id } });
    if (!c || c.coupleId !== me.coupleId) throw new ApiError(404, "找不到");
    await prisma.complaint.delete({ where: { id: params.id } });
    return { ok: true };
  });
}
