import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { apiHandler, requireUser, ApiError } from "@/lib/auth";

export async function PATCH(_: NextRequest, { params }: { params: { id: string } }) {
  return apiHandler(async () => {
    const me = await requireUser();
    const w = await prisma.wish.findUnique({ where: { id: params.id } });
    if (!w || w.coupleId !== me.coupleId) throw new ApiError(404, "找不到");
    return prisma.wish.update({
      where: { id: params.id },
      data: { done: !w.done, doneAt: w.done ? null : new Date() },
    });
  });
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  return apiHandler(async () => {
    const me = await requireUser();
    const w = await prisma.wish.findUnique({ where: { id: params.id } });
    if (!w || w.coupleId !== me.coupleId) throw new ApiError(404, "找不到");
    await prisma.wish.delete({ where: { id: params.id } });
    return { ok: true };
  });
}
