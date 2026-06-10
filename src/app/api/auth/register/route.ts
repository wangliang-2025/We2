import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import {
  apiHandler,
  createSession,
  generateInviteCode,
  hashPassword,
  ApiError,
} from "@/lib/auth";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

export async function POST(req: NextRequest) {
  return apiHandler(async () => {
    const { email, password, name, startDate, cityA, cityB } = await req.json();

    if (!email || !password || !name) {
      throw new ApiError(400, "邮箱、密码、昵称必填");
    }
    if (password.length < 6) {
      throw new ApiError(400, "密码至少 6 位");
    }

    const inviteCode = generateInviteCode();
    const passwordHash = await hashPassword(password);

    try {
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
      if (!user) throw new ApiError(500, "创建用户失败");
      await createSession({ userId: user.id, coupleId: couple.id, role: "you" });

      return {
        user: { id: user.id, name: user.name, email: user.email },
        couple: { id: couple.id, inviteCode: couple.inviteCode },
      };
    } catch (err) {
      if (err instanceof PrismaClientKnownRequestError && err.code === "P2002") {
        throw new ApiError(409, "这个邮箱已经注册过了");
      }
      if (err instanceof ApiError) throw err;
      throw err;
    }
  });
}
