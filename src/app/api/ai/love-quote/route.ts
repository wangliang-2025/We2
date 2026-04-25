import { NextRequest } from "next/server";
import { apiHandler, requireUser } from "@/lib/auth";
import { generateAILoveQuote } from "@/lib/ai";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  return apiHandler(async () => {
    const me = await requireUser();
    const partner = await prisma.user.findFirst({
      where: { coupleId: me.coupleId, NOT: { id: me.id } },
    });
    const locale = (req.nextUrl.searchParams.get("locale") || "zh") as "zh" | "en";
    const result = await generateAILoveQuote(
      me.name,
      partner?.name || me.name,
      locale
    );
    return result;
  });
}
