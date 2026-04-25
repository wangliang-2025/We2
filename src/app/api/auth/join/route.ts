import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { apiHandler, createSession, hashPassword, ApiError } from "@/lib/auth";

export async function POST(req: NextRequest) {
  return apiHandler(async () => {
    const { inviteCode, email, password, name } = await req.json();

    if (!inviteCode || !email || !password || !name) {
      throw new ApiError(400, "邀请码、邮箱、密码、昵称都要填");
    }
    if (password.length < 6) throw new ApiError(400, "密码至少 6 位");

    const couple = await prisma.couple.findUnique({
      where: { inviteCode: inviteCode.toUpperCase().trim() },
      include: { users: true },
    });
    if (!couple) throw new ApiError(404, "邀请码无效");
    if (couple.users.length >= 2) throw new ApiError(409, "这个小屋已经满员啦");

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) throw new ApiError(409, "这个邮箱已经被注册了");

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        coupleId: couple.id,
        email,
        passwordHash,
        name,
        role: "them",
        avatar: "🦁",
      },
    });

    await createSession({ userId: user.id, coupleId: couple.id, role: "them" });

    return {
      user: { id: user.id, name: user.name, email: user.email },
      couple: { id: couple.id },
    };
  });
}
