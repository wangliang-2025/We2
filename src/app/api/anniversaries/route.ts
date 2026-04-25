import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { apiHandler, requireUser, ApiError } from "@/lib/auth";

export async function GET() {
  return apiHandler(async () => {
    const me = await requireUser();
    return prisma.anniversary.findMany({ where: { coupleId: me.coupleId } });
  });
}

export async function POST(req: NextRequest) {
  return apiHandler(async () => {
    const me = await requireUser();
    const body = await req.json();
    if (!body.name || !body.date) throw new ApiError(400, "名称和日期必填");
    return prisma.anniversary.create({
      data: {
        coupleId: me.coupleId,
        name: body.name,
        date: body.date,
        repeat: body.repeat ?? true,
        emoji: body.emoji || null,
      },
    });
  });
}
