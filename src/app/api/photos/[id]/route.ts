import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { apiHandler, requireUser, ApiError } from "@/lib/auth";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  return apiHandler(async () => {
    const me = await requireUser();
    const body = await req.json();
    const photo = await prisma.photo.findUnique({ where: { id: params.id } });
    if (!photo || photo.coupleId !== me.coupleId) throw new ApiError(404, "找不到");
    return prisma.photo.update({
      where: { id: params.id },
      data: {
        caption: body.caption ?? photo.caption,
        location: body.location ?? photo.location,
      },
    });
  });
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  return apiHandler(async () => {
    const me = await requireUser();
    const photo = await prisma.photo.findUnique({ where: { id: params.id } });
    if (!photo || photo.coupleId !== me.coupleId) throw new ApiError(404, "找不到");
    await prisma.photo.delete({ where: { id: params.id } });
    return { ok: true };
  });
}
