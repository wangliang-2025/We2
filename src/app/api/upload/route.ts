import { NextRequest } from "next/server";
import { apiHandler, requireUser, ApiError } from "@/lib/auth";
import { saveImage } from "@/lib/upload";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  return apiHandler(async () => {
    const me = await requireUser();
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) throw new ApiError(400, "缺少文件");
    if (!file.type.startsWith("image/")) throw new ApiError(400, "只支持图片");
    if (file.size > 20 * 1024 * 1024) throw new ApiError(413, "图片不能超过 20MB");

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await saveImage(buffer, me.coupleId);
    return result;
  });
}
