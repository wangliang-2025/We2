import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "./db";
import { NextResponse } from "next/server";

const COOKIE_NAME = "ld_session";
const COOKIE_DAYS = 30;

function getSecret() {
  const s = process.env.JWT_SECRET;
  if (!s || s.length < 16) {
    throw new Error("JWT_SECRET environment variable is missing or too short (>=16 chars)");
  }
  return new TextEncoder().encode(s);
}

export type SessionPayload = {
  userId: string;
  coupleId: string;
  role: "you" | "them";
};

export async function createSession(payload: SessionPayload) {
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${COOKIE_DAYS}d`)
    .sign(getSecret());

  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: COOKIE_DAYS * 24 * 60 * 60,
    path: "/",
  });
}

export async function readSession(): Promise<SessionPayload | null> {
  const c = cookies().get(COOKIE_NAME);
  if (!c) return null;
  try {
    const { payload } = await jwtVerify(c.value, getSecret());
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function clearSession() {
  cookies().delete(COOKIE_NAME);
}

export async function getCurrentUser() {
  const session = await readSession();
  if (!session) return null;
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { couple: true },
  });
  return user;
}

export async function requireUser() {
  const u = await getCurrentUser();
  if (!u) {
    throw new ApiError(401, "未登录");
  }
  return u;
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function apiHandler<T>(
  handler: () => Promise<T>
): Promise<NextResponse> {
  return handler()
    .then((data) => NextResponse.json({ ok: true, data }))
    .catch((err) => {
      if (err instanceof ApiError) {
        return NextResponse.json(
          { ok: false, error: err.message },
          { status: err.status }
        );
      }
      console.error(err);
      return NextResponse.json(
        { ok: false, error: err?.message || "Server error" },
        { status: 500 }
      );
    });
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function generateInviteCode() {
  // 6 位易读邀请码
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}
