import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { apiHandler, requireUser, ApiError } from "@/lib/auth";
import { publish } from "@/lib/event-bus";
import { sendNotificationToPartner } from "@/lib/notify";

const PAGE_SIZE = 50;

export async function GET(req: NextRequest) {
  return apiHandler(async () => {
    const me = await requireUser();
    const cursor = req.nextUrl.searchParams.get("cursor");
    const take = parseInt(req.nextUrl.searchParams.get("take") || String(PAGE_SIZE), 10);
    const where: Record<string, unknown> = {
      coupleId: me.coupleId,
      OR: [{ privacy: { not: "private" } }, { authorId: me.id }] };
    if (cursor) where.createdAt = { lt: new Date(cursor) };
    const all = await prisma.diary.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: Math.min(take, 200),
    });
    return all;
  });
}

export async function POST(req: NextRequest) {
  return apiHandler(async () => {
    const me = await requireUser();
    const body = await req.json();
    const content = String(body.content || "").trim();
    if (!content) throw new ApiError(400, "CONTENT_REQUIRED");
    if (content.length > 10000) throw new ApiError(400, "CONTENT_TOO_LONG");
    if (body.privacy && !["public", "private", "capsule"].includes(body.privacy)) {
      throw new ApiError(400, "INVALID_PRIVACY");
    }
    const created = await prisma.diary.create({
      data: {
        coupleId: me.coupleId,
        authorId: me.id,
        title: (body.title || "").slice(0, 200),
        content,
        mood: body.mood ?? 3,
        weather: body.weather || null,
        privacy: body.privacy || "public",
        unlockAt: body.privacy === "capsule" ? body.unlockAt || null : null,
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
