import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { apiHandler, requireUser, ApiError } from "@/lib/auth";

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  return apiHandler(async () => {
    const me = await requireUser();
    const p = await prisma.place.findUnique({ where: { id: params.id } });
    if (!p || p.coupleId !== me.coupleId) throw new ApiError(404, "找不到");
    await prisma.place.delete({ where: { id: params.id } });
    return { ok: true };
  });
}
