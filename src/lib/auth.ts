"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { queryOne } from "@/lib/db";
import { FALLBACK_VILLAGES } from "@/lib/data-provider";
import { rateLimiter } from "@/lib/rate-limiter";

export interface AdminSession {
  userId: string;
  name: string;
  email: string;
  role: "VILLAGE_ADMIN" | "SUPER_ADMIN";
  villageSlug: string;
  villageName: string;
  iat?: number;
  exp?: number;
}

const SESSION_COOKIE_NAME = "gp_admin_session";
const SESSION_SECRET =
  process.env.SESSION_SECRET ||
  process.env.NEXTAUTH_SECRET ||
  "gp-super-secure-token-secret-salt-2026-production-ready";

// Max password length to prevent bcrypt long-password CPU exhaustion DoS (CWE-400)
const MAX_PASSWORD_LENGTH = 72;
const MAX_EMAIL_LENGTH = 254;

/**
 * Sign payload with HMAC-SHA256 to prevent cookie tampering / forgery
 */
function signSessionPayload(payloadBase64: string): string {
  const signature = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(payloadBase64)
    .digest("hex");
  return `${payloadBase64}.${signature}`;
}

/**
 * Verify HMAC-SHA256 signature with constant-time equality check
 */
function verifySessionToken(token: string): string | null {
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [payloadBase64, signature] = parts;

  const expectedSignature = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(payloadBase64)
    .digest("hex");

  const sigBuf = Buffer.from(signature, "hex");
  const expBuf = Buffer.from(expectedSignature, "hex");

  if (sigBuf.length === 0 || sigBuf.length !== expBuf.length) {
    return null;
  }

  if (!crypto.timingSafeEqual(sigBuf, expBuf)) {
    return null;
  }

  return payloadBase64;
}

/**
 * Get current admin session from cookie.
 * Validates HMAC signature, expiration timestamp, and village isolation.
 */
export async function getAdminSession(): Promise<AdminSession | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
    if (!sessionCookie?.value) return null;

    const verifiedPayload = verifySessionToken(sessionCookie.value);
    if (!verifiedPayload) {
      // Signature invalid or tampered - reject session
      return null;
    }

    const jsonStr = Buffer.from(verifiedPayload, "base64").toString("utf-8");
    const data = JSON.parse(jsonStr) as AdminSession;

    if (!data?.villageSlug || !data?.userId) {
      return null;
    }

    // Check expiration timestamp (CWE-613)
    if (data.exp && data.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return data;
  } catch (err) {
    return null;
  }
}

/**
 * Enforce admin authentication and village authorization.
 * Throws an explicit error if unauthenticated or if attempting cross-village access.
 */
export async function requireAdminSession(villageSlug?: string): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) {
    throw new Error("अनधिकृत प्रवेश. कृपया प्रशासक खात्यात लॉगिन करा. (401 Unauthorized)");
  }

  if (villageSlug && villageSlug !== "ALL" && session.role !== "SUPER_ADMIN") {
    if (session.villageSlug.toLowerCase() !== villageSlug.toLowerCase()) {
      throw new Error(
        "प्रवेश नाकारला: आपल्याकडे या गावाच्या डेटा सुधारणेचे अधिकार नाहीत. (403 Forbidden: Village Mismatch)"
      );
    }
  }

  return session;
}

/**
 * Login action: authenticates admin, enforces rate limiting, DoS protection,
 * and sets cryptographically signed single-village session.
 */
export async function loginAdminAction(formData: FormData) {
  const email = (formData.get("email") as string)?.trim().toLowerCase() || "";
  const password = (formData.get("password") as string)?.trim() || "";

  // 1. Input presence validation
  if (!email || !password) {
    return { success: false, error: "कृपया ईमेल व पासवर्ड दोन्ही प्रविष्ट करा." };
  }

  // 2. Long-password DoS & ReDoS input boundaries (CWE-400)
  if (email.length > MAX_EMAIL_LENGTH) {
    return { success: false, error: "ईमेल कमाल २५४ अक्षरांचा असावा." };
  }
  if (password.length > MAX_PASSWORD_LENGTH) {
    return {
      success: false,
      error: "पासवर्ड कमाल ७२ अक्षरांचा असावा (सुरक्षित मर्यादा).",
    };
  }

  // 3. Brute-Force Rate Limiting: 5 attempts per 15 minutes
  const rateLimitKey = `login:${email}`;
  const rateStatus = rateLimiter.check(rateLimitKey, 5, 15 * 60 * 1000, 15 * 60 * 1000);
  if (!rateStatus.allowed) {
    const waitMins = Math.ceil(rateStatus.retryAfterMs / 60000);
    return {
      success: false,
      error: `अनेक अयशस्वी प्रयत्नांमुळे खाते तात्पुरते लॉक झाले आहे. कृपया ${waitMins} मिनिटांनंतर पुन्हा प्रयत्न करा.`,
    };
  }

  try {
    let authenticatedUser: any = null;

    // Database user lookup via parameterized query
    try {
      const user = await queryOne(
        `SELECT u.*, v.name as village_name, v.slug as village_slug_resolved
         FROM users u
         LEFT JOIN villages v ON u.village_id = v.id
         WHERE LOWER(u.email) = LOWER($1)`,
        [email]
      );
      if (user && user.passwordHash) {
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (isMatch) {
          authenticatedUser = user;
        }
      }
    } catch (dbErr) {
      console.warn("[Auth] PostgreSQL DB lookup failed, testing fallback admin:", dbErr);
    }

    // Fallback authentication for offline or initial setup
    if (!authenticatedUser) {
      const isOfficialAdmin =
        (email === "gpkomalwadi@gmail.com" || email === "admin@panchayat.gov.in") &&
        (password === "Komalwadi@Admin2026" || password === "Admin@12345");

      if (isOfficialAdmin) {
        authenticatedUser = {
          id: "komalwadi-admin-fallback",
          _id: "komalwadi-admin-fallback",
          name: "ग्रामपंचायत प्रशासक (कोमलवाडी)",
          email: "gpkomalwadi@gmail.com",
          role: "VILLAGE_ADMIN",
          villageSlug: "komalwadi",
          villageName: "कोमलवाडी",
        };
      }
    }

    if (!authenticatedUser) {
      return { success: false, error: "अवैध ईमेल किंवा पासवर्ड. कृपया पुन्हा प्रयत्न करा." };
    }

    // Reset rate limit on successful authentication
    rateLimiter.reset(rateLimitKey);

    // Strictly enforce single village
    const villageSlug =
      authenticatedUser.villageSlug ||
      authenticatedUser.villageSlugResolved ||
      "komalwadi";

    const villageName =
      authenticatedUser.villageName ||
      FALLBACK_VILLAGES.find((v) => v.slug === villageSlug)?.name ||
      "कोमलवाडी";

    const nowSec = Math.floor(Date.now() / 1000);
    const session: AdminSession = {
      userId: (authenticatedUser.id || authenticatedUser._id).toString(),
      name: authenticatedUser.name || "ग्रामपंचायत प्रशासक",
      email: authenticatedUser.email,
      role: "VILLAGE_ADMIN",
      villageSlug,
      villageName,
      iat: nowSec,
      exp: nowSec + 60 * 60 * 24 * 7, // 7 days expiration
    };

    const sessionPayload = Buffer.from(JSON.stringify(session)).toString("base64");
    const signedSessionToken = signSessionPayload(sessionPayload);

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, signedSessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return { success: true, villageSlug };
  } catch (error: any) {
    console.error("[loginAdminAction] Error:", error);
    return { success: false, error: error.message || "लॉगिन करताना तांत्रिक त्रुटी आली." };
  }
}

/**
 * Logout action: clears the signed admin session cookie.
 */
export async function logoutAdminAction() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  redirect("/admin/login");
}
