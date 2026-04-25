import { apiHandler, requireUser } from "@/lib/auth";
import { sendTestNotification } from "@/lib/notify";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  return apiHandler(async () => {
    const me = await requireUser();
    const result = await sendTestNotification(me.id);
    if (!result.ok) {
      return { ok: false, error: result.error };
    }
    return { ok: true, message: "已推送到你的微信，查收一下～" };
  });
}
