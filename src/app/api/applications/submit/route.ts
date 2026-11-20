import { NextRequest, NextResponse } from "next/server";
import { submitCitizenApplication } from "@/lib/actions/applications";
import { rateLimiter } from "@/lib/rate-limiter";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    // Rate limit public submissions: 15 submissions per 10 minutes per IP/client
    const clientIp =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "anonymous-client";

    const rateStatus = rateLimiter.check(
      `app-submit:${clientIp}`,
      15,
      10 * 60 * 1000,
      10 * 60 * 1000
    );

    if (!rateStatus.allowed) {
      const waitMins = Math.ceil(rateStatus.retryAfterMs / 60000);
      return NextResponse.json(
        {
          success: false,
          error: `अतिजलद अर्ज सादर केल्यामुळे मर्यादा लागू झाली आहे. कृपया ${waitMins} मिनिटांनंतर पुन्हा प्रयत्न करा.`,
        },
        { status: 429 }
      );
    }

    const formData = await req.formData();
    const villageSlug = (formData.get("villageSlug") as string) || "komalwadi";
    const serviceSlug = (formData.get("serviceSlug") as string) || "";

    if (!serviceSlug) {
      return NextResponse.json(
        { success: false, error: "सेवेचा प्रकार (Service Slug) उपलब्ध नाही." },
        { status: 400 }
      );
    }

    const result = await submitCitizenApplication(villageSlug, serviceSlug, formData);
    return NextResponse.json(result);
  } catch (err: any) {
    console.error("[API Applications Submit] Error:", err);
    return NextResponse.json(
      {
        success: false,
        error: "अर्ज सादर करताना सर्व्हर त्रुटी आली. कृपया पुन्हा प्रयत्न करा.",
      },
      { status: 500 }
    );
  }
}
