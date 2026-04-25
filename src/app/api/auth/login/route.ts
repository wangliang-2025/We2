import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { apiHandler, createSession, verifyPassword, ApiError } from "@/lib/auth";

export async function POST(req: NextRequest) {
  return apiHandler(async () => {
    const { email, password } = await req.json();
    if (!email || !password) throw new ApiError(400, "请输入邮箱和密码");

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new ApiError(401, "邮箱或密码错误");

    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) throw new ApiError(401, "邮箱或密码错误");

    await createSession({
      userId: user.id,
      coupleId: user.coupleId,
      role: user.role as "you" | "them",
    });

    return { user: { id: user.id, name: user.name, email: user.email } };
  });
}
