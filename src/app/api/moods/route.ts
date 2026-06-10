import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { apiHandler, requireUser, ApiError } from "@/lib/auth";

export async function GET() {
  return apiHandler(async () => {
    const me = await requireUser();
    return prisma.mood.findMany({ where: { coupleId: me.coupleId } });
  });
}

export async function POST(req: NextRequest) {
  return apiHandler(async () => {
    const me = await requireUser();
    const body = await req.json();
    if (!body.date) throw new ApiError(400, "日期必填");

    const data: Record<string, unknown> = {};
    if ("mood" in body && body.mood != null) {
      data[me.role === "you" ? "yourMood" : "theirMood"] = body.mood;
    }
    if ("yourMood" in body && body.yourMood != null) {
      data.yourMood = body.yourMood;
    }
    if ("theirMood" in body && body.theirMood != null) {
      data.theirMood = body.theirMood;
    }
    if ("note" in body) data.note = body.note;

    const existing = await prisma.mood.findUnique({
      where: { coupleId_date: { coupleId: me.coupleId, date: body.date } },
    });

    if (existing) {
      return prisma.mood.update({
        where: { id: existing.id },
        data,
      });
    }
    return prisma.mood.create({
      data: { coupleId: me.coupleId, date: body.date, ...data },
    });
  });
}
