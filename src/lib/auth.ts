import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const TOKEN_NAME = "doctor-tracker-token";
const TOKEN_MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds

export interface JWTPayload {
  userId: string;
  email: string;
  name: string;
  role: string;
}

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("JWT_SECRET must be configured with at least 32 characters");
  }
  return secret;
}

export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: TOKEN_MAX_AGE,
    issuer: "doctor-tracker",
    audience: "doctor-tracker-web",
  });
}

export function verifyToken(token: string): JWTPayload {
  const payload = jwt.verify(token, getJwtSecret(), {
    algorithms: ["HS256"],
    issuer: "doctor-tracker",
    audience: "doctor-tracker-web",
  });
  if (
    typeof payload === "string" ||
    typeof payload.userId !== "string" ||
    typeof payload.email !== "string" ||
    payload.role !== "admin"
  ) {
    throw new Error("Invalid session");
  }
  return payload as JWTPayload;
}

export async function getTokenFromCookies(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(TOKEN_NAME)?.value;
}

export async function setTokenCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(TOKEN_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: TOKEN_MAX_AGE,
    path: "/",
  });
}

export async function removeTokenCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(TOKEN_NAME);
}

export async function getCurrentUser(): Promise<JWTPayload | null> {
  try {
    const token = await getTokenFromCookies();
    if (!token) return null;
    return verifyToken(token);
  } catch {
    return null;
  }
}

