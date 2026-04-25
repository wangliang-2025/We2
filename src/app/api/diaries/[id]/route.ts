import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { apiHandler, requireUser, ApiError } from "@/lib/auth";

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  return apiHandler(async () => {
    const me = await requireUser();
    const d = await prisma.diary.findUnique({ where: { id: params.id } });
    if (!d || d.coupleId !== me.coupleId) throw new ApiError(404, "找不到");
    if (d.authorId !== me.id) throw new ApiError(403, "只能删自己的日记");
    await prisma.diary.delete({ where: { id: params.id } });
    return { ok: true };
  });
}
