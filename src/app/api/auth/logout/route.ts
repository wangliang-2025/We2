import { apiHandler, clearSession } from "@/lib/auth";

export async function POST() {
  return apiHandler(async () => {
    await clearSession();
    return { ok: true };
  });
}
