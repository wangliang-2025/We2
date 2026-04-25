import { NextRequest } from "next/server";
import { apiHandler, requireUser, ApiError } from "@/lib/auth";
import { chatComplete } from "@/lib/ai";

export async function POST(req: NextRequest) {
  return apiHandler(async () => {
    await requireUser();
    const { complaint } = await req.json();
    if (!complaint) throw new ApiError(400, "缺少要道歉的吐槽内容");

    const sys = `你是一个真诚、可爱的恋爱道歉助手。基于另一半对你的吐槽，写一段 30-60 字的道歉话，要求：
- 真诚不油腻
- 表达爱意但不过度
- 可以幽默但不甩锅
- 直接输出道歉内容，不要加任何前缀`;

    const result = await chatComplete(
      [
        { role: "system", content: sys },
        { role: "user", content: `TA 对你的吐槽：${complaint}` },
      ],
      { temperature: 0.9, maxTokens: 150 }
    );

    if (!result.ok) {
      return { source: "fallback", content: "对不起，我错了，下次一定改正 🥺" };
    }
    return { source: "ai", content: result.content };
  });
}
