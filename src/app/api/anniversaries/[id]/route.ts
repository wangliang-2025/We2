import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { apiHandler, requireUser, ApiError } from "@/lib/auth";

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  return apiHandler(async () => {
    const me = await requireUser();
    const a = await prisma.anniversary.findUnique({ where: { id: params.id } });
    if (!a || a.coupleId !== me.coupleId) throw new ApiError(404, "找不到");
    await prisma.anniversary.delete({ where: { id: params.id } });
    return { ok: true };
  });
}
