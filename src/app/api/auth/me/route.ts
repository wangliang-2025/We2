import { prisma } from "@/lib/db";
import { apiHandler, getCurrentUser, ApiError } from "@/lib/auth";

export async function GET() {
  return apiHandler(async () => {
    const me = await getCurrentUser();
    if (!me) throw new ApiError(401, "未登录");

    const partner = await prisma.user.findFirst({
      where: { coupleId: me.coupleId, NOT: { id: me.id } },
      select: {
        id: true,
        name: true,
        avatar: true,
        status: true,
        statusText: true,
        statusUpdatedAt: true,
        role: true,
      },
    });

    return {
      me: {
        id: me.id,
        email: me.email,
        name: me.name,
        avatar: me.avatar,
        status: me.status,
        statusText: me.statusText,
        statusUpdatedAt: me.statusUpdatedAt,
        role: me.role,
        serverChanKey: me.serverChanKey,
        enabledNotifs: me.enabledNotifs,
      },
      partner,
      couple: {
        id: me.couple.id,
        inviteCode: me.couple.inviteCode,
        startDate: me.couple.startDate,
        cityA: me.couple.cityA,
        cityB: me.couple.cityB,
        secret: me.couple.secret,
      },
    };
  });
}
