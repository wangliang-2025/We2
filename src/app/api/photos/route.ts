import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { apiHandler, requireUser, ApiError } from "@/lib/auth";
import { publish } from "@/lib/event-bus";
import { sendNotificationToPartner } from "@/lib/notify";

export async function GET() {
  return apiHandler(async () => {
    const me = await requireUser();
    const photos = await prisma.photo.findMany({
      where: { coupleId: me.coupleId },
      orderBy: { createdAt: "desc" },
    });
    return photos;
  });
}

export async function POST(req: NextRequest) {
  return apiHandler(async () => {
    const me = await requireUser();
    const { url, thumbnail, caption, location } = await req.json();
    if (!url) throw new ApiError(400, "缺少 url");
    const photo = await prisma.photo.create({
      data: {
        coupleId: me.coupleId,
        authorId: me.id,
        url,
        thumbnail: thumbnail || null,
        caption: caption || null,
        location: location || null,
      },
    });
    publish(me.coupleId, {
      type: "photo",
      actorId: me.id,
      payload: { id: photo.id },
    });
    sendNotificationToPartner(me.id, "photo", {
      title: `${me.name} 上传了新照片 📷`,
      body: photo.caption || "快去相册看看吧～",
      tag: "photo",
    }).catch(() => {});
    return photo;
  });
}
