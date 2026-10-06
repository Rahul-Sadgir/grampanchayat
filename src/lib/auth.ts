"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Village } from "@/models/Village";
import { FALLBACK_VILLAGES } from "@/lib/data-provider";

export interface AdminSession {
  userId: string;
  name: string;
  email: string;
  role: "VILLAGE_ADMIN" | "SUPER_ADMIN";
  villageSlug: string;
  villageName: string;
}

const SESSION_COOKIE_NAME = "gp_admin_session";

/**
 * Get current admin session from cookie.
 * Every admin session is strictly bound to ONE single village.
 */
export async function getAdminSession(): Promise<AdminSession | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
    if (!sessionCookie?.value) return null;

    const data = JSON.parse(
      Buffer.from(sessionCookie.value, "base64").toString("utf-8")
    );
    if (!data?.villageSlug) return null;

    return data as AdminSession;
  } catch (err) {
    return null;
  }
}

/**
 * Login action: authenticates admin and sets single-village session.
 * Dual village or multi-village login is strictly prevented.
 */
export async function loginAdminAction(formData: FormData) {
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = (formData.get("password") as string)?.trim();

  if (!email || !password) {
    return { success: false, error: "कृपया ईमेल व पासवर्ड दोन्ही प्रविष्ट करा." };
  }

  try {
    const conn = await connectDB();
    let authenticatedUser: any = null;

    if (conn) {
      try {
        const user = await User.findOne({ email }).populate("villageId").lean();
        if (user && user.passwordHash) {
          const isMatch = await bcrypt.compare(password, user.passwordHash);
          if (isMatch) {
            authenticatedUser = user;
          }
        }
      } catch (dbErr) {
        console.warn("[Auth] DB lookup failed, testing fallback admin:", dbErr);
      }
    }

    // Fallback authentication for offline or initial setup
    if (!authenticatedUser) {
      if (email === "admin@panchayat.gov.in" && password === "Admin@12345") {
        authenticatedUser = {
          _id: "komalwadi-admin-fallback",
          name: "ग्रामपंचायत प्रशासक (कोमलवाडी)",
          email: "admin@panchayat.gov.in",
          role: "VILLAGE_ADMIN",
          villageSlug: "komalwadi",
          villageId: { name: "कोमलवाडी", slug: "komalwadi" },
        };
      }
    }

    if (!authenticatedUser) {
      return { success: false, error: "अवैध ईमेल किंवा पासवर्ड. कृपया पुन्हा प्रयत्न करा." };
    }

    // Strictly enforce single village
    const villageSlug =
      authenticatedUser.villageSlug ||
      (authenticatedUser.villageId as any)?.slug ||
      "komalwadi";

    const villageName =
      (authenticatedUser.villageId as any)?.name ||
      FALLBACK_VILLAGES.find((v) => v.slug === villageSlug)?.name ||
      "कोमलवाडी";

    const session: AdminSession = {
      userId: authenticatedUser._id.toString(),
      name: authenticatedUser.name || "ग्रामपंचायत प्रशासक",
      email: authenticatedUser.email,
      role: "VILLAGE_ADMIN",
      villageSlug,
      villageName,
    };

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, Buffer.from(JSON.stringify(session)).toString("base64"), {
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
 * Logout action: clears the single village admin session cookie.
 */
export async function logoutAdminAction() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  redirect("/admin/login");
}
