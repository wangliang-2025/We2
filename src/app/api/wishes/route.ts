import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { apiHandler, requireUser, ApiError } from "@/lib/auth";

export async function GET() {
  return apiHandler(async () => {
    const me = await requireUser();
    return prisma.wish.findMany({
      where: { coupleId: me.coupleId },
      orderBy: { createdAt: "desc" },
    });
  });
}

export async function POST(req: NextRequest) {
  return apiHandler(async () => {
    const me = await requireUser();
    const body = await req.json();
    if (!body.text) throw new ApiError(400, "心愿不能为空");
    return prisma.wish.create({
      data: {
        coupleId: me.coupleId,
        text: body.text,
        category: body.category || "experience",
      },
    });
  });
}
