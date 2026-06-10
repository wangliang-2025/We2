import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { apiHandler, requireUser, ApiError } from "@/lib/auth";
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
    if (!me.couple) throw new ApiError(400, "未加入小屋");
    const body = await req.json();

    const userPatch: Record<string, unknown> = {};
    for (const key of ["name", "avatar", "status", "statusText", "serverChanKey", "enabledNotifs"]) {
      if (key in body) userPatch[key] = body[key];
    }
    if ("status" in body || "statusText" in body) {
      userPatch.statusUpdatedAt = new Date();
    }

    const couplePatch: Record<string, unknown> = {};
    for (const key of ["startDate", "cityA", "cityB", "secret"]) {
      if (key in body) couplePatch[key] = body[key];
    }

    const ops = [];
    if (Object.keys(userPatch).length > 0) {
      ops.push(prisma.user.update({ where: { id: me.id }, data: userPatch }));
    }
    if (Object.keys(couplePatch).length > 0) {
      ops.push(prisma.couple.update({ where: { id: me.couple.id }, data: couplePatch }));
    }
    if (ops.length > 0) {
      await prisma.$transaction(ops);
    }

    if ("avatar" in userPatch || "status" in userPatch || "statusText" in userPatch) {
      publish(me.coupleId, { type: "status", actorId: me.id });
    }

    return { ok: true };
  });
}
