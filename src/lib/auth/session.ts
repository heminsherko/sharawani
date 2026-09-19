import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { UserRole } from "@prisma/client";

export const SESSION_COOKIE_NAME = "garmian_auth_session";
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "garmian-municipal-erp-super-secret-key-2026-kurdish-gov"
);

export interface SessionUser {
  userId: string;
  fullName: string;
  phone: string;
  nationalId: string;
  role: UserRole;
  municipalityId: string;
  municipalityNameKrd: string;
  municipalityCode?: string;
  isHeadquarter: boolean;
  departmentId?: string | null;
}

/**
 * Sign an Edge-compatible JWT token for the user session
 */
export async function signSessionToken(payload: SessionUser): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("12h")
    .sign(JWT_SECRET);
}

/**
 * Verify JWT token string (can be used in Edge middleware or server actions)
 */
export async function verifySessionToken(
  token: string
): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as SessionUser;
  } catch (error) {
    return null;
  }
}

/**
 * Creates an HTTP-only secure cookie containing the signed session token
 */
export async function createSessionCookie(user: SessionUser): Promise<void> {
  const token = await signSessionToken(user);
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12, // 12 hours
  });
}

/**
 * Retrieves the current session user from the incoming request cookies
 */
export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  return await verifySessionToken(token);
}

/**
 * Destroys the current session cookie
 */
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

