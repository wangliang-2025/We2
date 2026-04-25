import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { apiHandler, requireUser } from "@/lib/auth";
import { publish } from "@/lib/event-bus";

export async function GET() {
  return apiHandler(async () => {
    const me = await requireUser();
    return { me, couple: me.couple };
  });
}

export async function PATCH(req: NextRequest) {
  return apiHandler(async () => {
    const me = await requireUser();
    const body = await req.json();

    // 我的字段
    const userPatch: Record<string, unknown> = {};
    for (const key of ["name", "avatar", "status", "statusText", "serverChanKey", "enabledNotifs"]) {
      if (key in body) userPatch[key] = body[key];
    }
    if ("status" in body || "statusText" in body) {
      userPatch.statusUpdatedAt = new Date();
    }
    if (Object.keys(userPatch).length > 0) {
      await prisma.user.update({ where: { id: me.id }, data: userPatch });
      if ("avatar" in userPatch || "status" in userPatch || "statusText" in userPatch) {
        publish(me.coupleId, { type: "status", actorId: me.id });
      }
    }

    // 共享字段（情侣空间）
    const couplePatch: Record<string, unknown> = {};
    for (const key of ["startDate", "cityA", "cityB", "secret"]) {
      if (key in body) couplePatch[key] = body[key];
    }
    if (Object.keys(couplePatch).length > 0) {
      await prisma.couple.update({ where: { id: me.couple.id }, data: couplePatch });
    }

    return { ok: true };
  });
}
