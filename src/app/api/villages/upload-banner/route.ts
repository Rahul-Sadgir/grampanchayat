import { NextRequest, NextResponse } from "next/server";
import { queryOne } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { uploadFileBuffer } from "@/lib/cloudinary";
import { getAdminSession } from "@/lib/auth";

// Allowed domains for direct image URLs to prevent SSRF (CWE-918)
const ALLOWED_IMAGE_DOMAINS = ["res.cloudinary.com", "images.unsplash.com"];

function isValidSafeImageUrl(urlStr: string): boolean {
  if (urlStr.startsWith("/images/")) {
    return !urlStr.includes("..") && !urlStr.includes("\\");
  }
  try {
    const parsed = new URL(urlStr);
    if (parsed.protocol !== "https:") return false;
    const hostname = parsed.hostname.toLowerCase();
    return ALLOWED_IMAGE_DOMAINS.some(
      (allowed) => hostname === allowed || hostname.endsWith(`.${allowed}`)
    );
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    // 1. Enforce Authentication (CWE-306)
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json(
        { error: "अनधिकृत प्रवेश. कृपया प्रथम लॉगिन करा. (401 Unauthorized)" },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const villageId = formData.get("villageId") as string | null;
    const villageSlug = (formData.get("villageSlug") as string | null)?.trim() || session.villageSlug;
    const directUrl = formData.get("imageUrl") as string | null;

    // 2. Enforce Village Authorization & IDOR Protection (CWE-639)
    if (
      session.role !== "SUPER_ADMIN" &&
      session.villageSlug.toLowerCase() !== villageSlug.toLowerCase()
    ) {
      return NextResponse.json(
        { error: "प्रवेश नाकारला: आपल्याकडे या गावाचा बॅनर बदलण्याचे अधिकार नाहीत. (403 Forbidden)" },
        { status: 403 }
      );
    }

    let finalImageUrl = "";

    // 3. Handle File Upload with Strict Validation
    if (file && file.size > 0) {
      const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
      if (!validTypes.includes(file.type)) {
        return NextResponse.json(
          { error: "कृपया केवळ JPG, PNG किंवा WEBP स्वरूपातील प्रतिमा निवडा." },
          { status: 400 }
        );
      }

      // Max file size 10MB
      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json(
          { error: "प्रतिमेचा आकार १० MB पेक्षा कमी असावा." },
          { status: 400 }
        );
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Sanitize filename to prevent directory traversal
      const sanitizedFilename = (file.name || "banner.jpg").replace(/[^a-zA-Z0-9._-]/g, "_");

      const uploadRes = await uploadFileBuffer(buffer, {
        folder: `banners/${villageSlug.replace(/[^a-zA-Z0-9_-]/g, "_")}`,
        filename: sanitizedFilename,
        resourceType: "image",
      });

      finalImageUrl = uploadRes.url;
    } else if (directUrl) {
      // 4. Validate Direct URL against SSRF
      const trimmedUrl = directUrl.trim();
      if (!isValidSafeImageUrl(trimmedUrl)) {
        return NextResponse.json(
          { error: "अवैध प्रतिमा URL. केवळ सुरक्षित Cloudinary किंवा स्थानिक प्रतिमा अनुज्ञेय आहेत." },
          { status: 400 }
        );
      }
      finalImageUrl = trimmedUrl;
    }

    if (!finalImageUrl) {
      return NextResponse.json(
        { error: "कोणतीही वैध प्रतिमा किंवा URL सापडली नाही." },
        { status: 400 }
      );
    }

    // 5. Update village in PostgreSQL using parameterized query
    let updatedVillage = null;
    if (villageId || villageSlug) {
      try {
        updatedVillage = await queryOne(
          `UPDATE villages
           SET cover_image = $1, updated_at = NOW()
           WHERE (id::text = $2 OR slug = $3)
             AND LOWER(slug) = LOWER($4)
           RETURNING *`,
          [finalImageUrl, villageId || "", villageSlug || "", session.villageSlug]
        );

        if (updatedVillage) {
          revalidatePath(`/${updatedVillage.slug}`);
          revalidatePath("/admin/villages");
          revalidatePath("/admin/dashboard");
        }
      } catch (dbErr) {
        console.error("DB Update Error:", dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      url: finalImageUrl,
      village: updatedVillage,
      message: "१६:९ बॅनर प्रतिमा यशस्वीरीत्या सेव्ह झाली!",
    });
  } catch (error: any) {
    console.error("Banner upload error:", error);
    return NextResponse.json(
      { error: "प्रतिमा अपलोड करताना त्रुटी आली. कृपया पुन्हा प्रयत्न करा." },
      { status: 500 }
    );
  }
}
