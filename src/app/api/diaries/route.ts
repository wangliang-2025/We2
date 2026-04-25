import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { apiHandler, requireUser, ApiError } from "@/lib/auth";
import { publish } from "@/lib/event-bus";
import { sendNotificationToPartner } from "@/lib/notify";

export async function GET() {
  return apiHandler(async () => {
    const me = await requireUser();
    const all = await prisma.diary.findMany({
      where: {
        coupleId: me.coupleId,
        OR: [{ privacy: { not: "private" } }, { authorId: me.id }],
      },
      orderBy: { createdAt: "desc" },
    });
    return all;
  });
}

export async function POST(req: NextRequest) {
  return apiHandler(async () => {
    const me = await requireUser();
    const body = await req.json();
    if (!body.content) throw new ApiError(400, "内容不能为空");
    const created = await prisma.diary.create({
      data: {
        coupleId: me.coupleId,
        authorId: me.id,
        title: body.title || "",
        content: body.content,
        mood: body.mood ?? 3,
        weather: body.weather || null,
        privacy: body.privacy || "public",
        unlockAt: body.unlockAt || null,
      },
    });
    publish(me.coupleId, {
      type: "diary",
      actorId: me.id,
      payload: { id: created.id },
    });
    if (created.privacy !== "private") {
      sendNotificationToPartner(me.id, "diary", {
        title: `${me.name} 写了新日记 📖`,
        body: created.title || created.content.slice(0, 80),
        tag: "diary",
      }).catch(() => {});
    }
    return created;
  });
}
