import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";

export const ADMIN_SESSION_COOKIE_NAME = "madrasa_admin_session";
export const STUDENT_SESSION_COOKIE_NAME = "madrasa_student_session";
export const SESSION_COOKIE_NAME = "madrasa_admin_session";

// Fallback secret for local development
const JWT_SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || "madrasa-management-secure-jwt-secret-key-2026-key"
);

export type UserRole = "super_admin" | "admin" | "student";

export interface JWTPayload {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  studentId?: string;
  [key: string]: unknown;
}

// Password Hashing using bcryptjs
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  if (!password || !hash) return false;
  return bcrypt.compare(password, hash);
}

// JWT Token Operations using jose (Edge-runtime compatible)
export async function createSessionToken(payload: JWTPayload): Promise<string> {
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(JWT_SECRET_KEY);

  return token;
}

export async function verifySessionToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET_KEY);
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

// Rate Limiting helper for failed login attempts
interface RateLimitRecord {
  attempts: number;
  lockoutUntil: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

export function checkRateLimit(identifier: string): { allowed: boolean; retryAfterMinutes?: number } {
  const key = identifier.toLowerCase().trim();
  const record = rateLimitMap.get(key);

  if (!record) {
    return { allowed: true };
  }

  const now = Date.now();
  if (record.attempts >= MAX_ATTEMPTS) {
    if (now < record.lockoutUntil) {
      const remainingSeconds = Math.ceil((record.lockoutUntil - now) / 1000);
      const remainingMinutes = Math.ceil(remainingSeconds / 60);
      return { allowed: false, retryAfterMinutes: remainingMinutes };
    } else {
      // Lockout expired
      rateLimitMap.delete(key);
      return { allowed: true };
    }
  }

  return { allowed: true };
}

export function recordFailedAttempt(identifier: string): void {
  const key = identifier.toLowerCase().trim();
  const now = Date.now();
  const record = rateLimitMap.get(key) || { attempts: 0, lockoutUntil: 0 };

  record.attempts += 1;
  if (record.attempts >= MAX_ATTEMPTS) {
    record.lockoutUntil = now + LOCKOUT_DURATION_MS;
  }
  rateLimitMap.set(key, record);
}

export function resetFailedAttempts(identifier: string): void {
  const key = identifier.toLowerCase().trim();
  rateLimitMap.delete(key);
}
