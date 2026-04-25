import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { apiHandler, requireUser, ApiError } from "@/lib/auth";

export async function GET() {
  return apiHandler(async () => {
    const me = await requireUser();
    return prisma.place.findMany({ where: { coupleId: me.coupleId } });
  });
}

export async function POST(req: NextRequest) {
  return apiHandler(async () => {
    const me = await requireUser();
    const body = await req.json();
    if (!body.name) throw new ApiError(400, "地点名称必填");
    return prisma.place.create({
      data: {
        coupleId: me.coupleId,
        name: body.name,
        type: body.type || "visited",
        notes: body.notes || null,
        visitDate: body.visitDate || null,
        emoji: body.emoji || null,
      },
    });
  });
}
