import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import {
  apiHandler,
  createSession,
  generateInviteCode,
  hashPassword,
  ApiError,
} from "@/lib/auth";

export async function POST(req: NextRequest) {
  return apiHandler(async () => {
    const { email, password, name, startDate, cityA, cityB } = await req.json();

    if (!email || !password || !name) {
      throw new ApiError(400, "邮箱、密码、昵称必填");
    }
    if (password.length < 6) {
      throw new ApiError(400, "密码至少 6 位");
    }

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) throw new ApiError(409, "这个邮箱已经注册过了");

    const inviteCode = generateInviteCode();
    const passwordHash = await hashPassword(password);

    const couple = await prisma.couple.create({
      data: {
        inviteCode,
        startDate: startDate || new Date().toISOString().slice(0, 10),
        cityA: cityA || "北京",
        cityB: cityB || "上海",
        users: {
          create: {
            email,
            passwordHash,
            name,
            role: "you",
            avatar: "🐰",
          },
        },
      },
      include: { users: true },
    });

    const user = couple.users[0];
    await createSession({ userId: user.id, coupleId: couple.id, role: "you" });

    return {
      user: { id: user.id, name: user.name, email: user.email },
      couple: { id: couple.id, inviteCode: couple.inviteCode },
    };
  });
}
