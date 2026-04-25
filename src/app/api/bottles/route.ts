import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { apiHandler, requireUser, ApiError } from "@/lib/auth";

export async function POST(req: NextRequest) {
  return apiHandler(async () => {
    const me = await requireUser();
    const body = await req.json();
    if (body.action === "pick") {
      const list = await prisma.bottle.findMany({
        where: { coupleId: me.coupleId, pickedAt: null },
      });
      if (list.length === 0) return { picked: null };
      const pick = list[Math.floor(Math.random() * list.length)];
      const updated = await prisma.bottle.update({
        where: { id: pick.id },
        data: { pickedAt: new Date() },
      });
      return { picked: updated };
    }
    if (!body.text) throw new ApiError(400, "瓶子里得有话啊");
    const created = await prisma.bottle.create({
      data: { coupleId: me.coupleId, authorId: me.id, text: body.text },
    });
    return { created };
  });
}
