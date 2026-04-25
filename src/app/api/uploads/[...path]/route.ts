import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { getCurrentUser } from "@/lib/auth";

const UPLOAD_DIR = process.env.UPLOAD_DIR || "./uploads";

const TYPE_MAP: Record<string, string> = {
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
};

export async function GET(_: NextRequest, { params }: { params: { path: string[] } }) {
  const me = await getCurrentUser();
  if (!me) return new NextResponse("未登录", { status: 401 });

  const segments = params.path;
  if (!segments || segments.length < 2) return new NextResponse("参数错误", { status: 400 });

  const [coupleId, ...rest] = segments;
  if (coupleId !== me.coupleId) return new NextResponse("无权访问", { status: 403 });

  // 防御路径穿越
  const safeRel = path.posix.join(coupleId, ...rest).replace(/\\/g, "/");
  if (safeRel.includes("..")) return new NextResponse("非法路径", { status: 400 });

  const fullPath = path.join(UPLOAD_DIR, safeRel);
  try {
    const data = await readFile(fullPath);
    const ext = path.extname(fullPath).toLowerCase();
    const contentType = TYPE_MAP[ext] || "application/octet-stream";
    return new NextResponse(data, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "private, max-age=31536000",
      },
    });
  } catch {
    return new NextResponse("文件不存在", { status: 404 });
  }
}
