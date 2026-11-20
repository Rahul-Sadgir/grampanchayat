"use server";

import { queryOne, queryMany, dbQuery } from "@/lib/db";
import { uploadFileBuffer } from "@/lib/cloudinary";
import { FALLBACK_SCHEMES } from "@/lib/data-provider";
import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/auth";

export async function getSchemesAdmin() {
  try {
    await requireAdminSession();
    const schemes = await queryMany("SELECT * FROM schemes ORDER BY created_at DESC");
    return schemes.map((s: any) => ({
      ...s,
      _id: (s.id || s._id).toString(),
    }));
  } catch (error) {
    console.error("Error in getSchemesAdmin:", error);
    return [];
  }
}

export async function saveScheme(formData: FormData) {
  try {
    const session = await requireAdminSession();
    const id = formData.get("id") as string | null;
    let slug = (formData.get("slug") as string)?.trim().toLowerCase();
    const title = (formData.get("title") as string)?.trim();
    const category = (formData.get("category") as string)?.trim();
    const description = (formData.get("description") as string)?.trim();
    const subsidyDetails = (formData.get("subsidyDetails") as string)?.trim();
    const targetAudience = (formData.get("targetAudience") as string)?.trim();
    const eligibility = (formData.get("eligibility") as string)?.trim();
    const documentsRequired = (formData.get("documentsRequired") as string)?.trim();
    const applicationProcess = (formData.get("applicationProcess") as string)?.trim();
    const content = (formData.get("content") as string)?.trim();
    const externalLink = (formData.get("externalLink") as string)?.trim();
    const benefitsStr = (formData.get("benefitsStr") as string)?.trim();

    const imageFile = formData.get("image") as File | null;

    if (!title || !category || !description) {
      return { success: false, error: "कृपया सर्व आवश्यक माहिती भरा." };
    }

    if (!slug) {
      slug = `scheme-${Date.now()}`;
    }

    let imageUrl = (formData.get("existingImageUrl") as string) || "/images/schemes/pmay-gharkul.webp";
    if (imageUrl.startsWith("/images/")) {
      imageUrl = imageUrl.replace(/\.(png|jpg|jpeg)$/i, ".webp");
    }
    if (imageFile && imageFile.size > 0 && typeof imageFile.arrayBuffer === "function") {
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      const uploadRes = await uploadFileBuffer(buffer, {
        folder: "schemes",
        filename: imageFile.name,
        resourceType: "image",
      });
      imageUrl = uploadRes.url;
    }

    const benefits = benefitsStr
      ? benefitsStr.split("\n").map((b) => b.trim()).filter(Boolean)
      : [];

    let updatedScheme: any = null;

    if (id) {
      updatedScheme = await queryOne(
        `UPDATE schemes
         SET title = $1, slug = $2, category = $3, image_url = $4,
             description = $5, subsidy_details = $6, target_audience = $7,
             benefits = $8, eligibility = $9, documents_required = $10,
             application_process = $11, content = $12, external_link = $13,
             updated_at = NOW()
         WHERE id::text = $14
         RETURNING *`,
        [
          title,
          slug,
          category,
          imageUrl,
          description,
          subsidyDetails || null,
          targetAudience || null,
          JSON.stringify(benefits),
          eligibility || "सर्व पात्र नागरिक",
          documentsRequired || "आधार कार्ड, बँक पासबुक",
          applicationProcess || "ग्रामपंचायतीमध्ये संपर्क साधावा किंवा महाडीबीटी पोर्टलद्वारे अर्ज करावा.",
          content || description,
          externalLink || null,
          id,
        ]
      );
    }

    if (!updatedScheme) {
      // Find village
      const village = await queryOne("SELECT id, slug FROM villages LIMIT 1");
      const vId = village?.id || null;
      const vSlug = village?.slug || "komalwadi";

      updatedScheme = await queryOne(
        `INSERT INTO schemes (
          village_id, village_slug, title, slug, category, image_url,
          description, subsidy_details, target_audience, benefits,
          eligibility, documents_required, application_process, content,
          external_link, is_active
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, true)
        ON CONFLICT (village_id, slug) DO UPDATE SET
          title = EXCLUDED.title,
          category = EXCLUDED.category,
          image_url = EXCLUDED.image_url,
          description = EXCLUDED.description,
          subsidy_details = EXCLUDED.subsidy_details,
          target_audience = EXCLUDED.target_audience,
          benefits = EXCLUDED.benefits,
          eligibility = EXCLUDED.eligibility,
          documents_required = EXCLUDED.documents_required,
          application_process = EXCLUDED.application_process,
          content = EXCLUDED.content,
          external_link = EXCLUDED.external_link,
          updated_at = NOW()
        RETURNING *`,
        [
          vId,
          vSlug,
          title,
          slug,
          category,
          imageUrl,
          description,
          subsidyDetails || null,
          targetAudience || null,
          JSON.stringify(benefits),
          eligibility || "सर्व पात्र नागरिक",
          documentsRequired || "आधार कार्ड, बँक पासबुक",
          applicationProcess || "ग्रामपंचायतीमध्ये संपर्क साधावा किंवा महाडीबीटी पोर्टलद्वारे अर्ज करावा.",
          content || description,
          externalLink || null,
        ]
      );
    }

    revalidatePath("/admin/schemes");
    revalidatePath("/admin/dashboard");
    revalidatePath("/[villageSlug]", "layout");

    return {
      success: true,
      scheme: {
        ...updatedScheme,
        _id: (updatedScheme.id || updatedScheme._id).toString(),
      },
    };
  } catch (error: any) {
    console.error("Error in saveScheme:", error);
    return { success: false, error: error.message || "योजना जतन करताना त्रुटी आली." };
  }
}

export async function deleteScheme(schemeId: string) {
  try {
    await requireAdminSession();
    await dbQuery("DELETE FROM schemes WHERE id::text = $1", [schemeId]);
    revalidatePath("/admin/schemes");
    revalidatePath("/admin/dashboard");
    revalidatePath("/[villageSlug]", "layout");
    return { success: true };
  } catch (error: any) {
    console.error("Error in deleteScheme:", error);
    return { success: false, error: error.message || "हटवताना त्रुटी आली." };
  }
}

export async function toggleSchemeStatus(schemeId: string) {
  try {
    await requireAdminSession();
    const scheme = await queryOne(
      "UPDATE schemes SET is_active = NOT is_active, updated_at = NOW() WHERE id::text = $1 RETURNING *",
      [schemeId]
    );

    if (!scheme) return { success: false, error: "योजना सापडली नाही." };

    revalidatePath("/admin/schemes");
    revalidatePath("/admin/dashboard");
    revalidatePath("/[villageSlug]", "layout");
    return { success: true, isActive: scheme.isActive };
  } catch (error: any) {
    console.error("Error in toggleSchemeStatus:", error);
    return { success: false, error: error.message };
  }
}

export async function seedDefaultSchemes() {
  try {
    const countRes = await queryOne("SELECT COUNT(*) as count FROM schemes");
    if (Number(countRes?.count || 0) > 0) {
      return { success: false, error: "शासकीय योजना डेटाबेसमध्ये आधीच उपलब्ध आहेत." };
    }

    const village = await queryOne("SELECT id, slug FROM villages LIMIT 1");
    const vId = village?.id || null;
    const vSlug = village?.slug || "komalwadi";

    for (const s of FALLBACK_SCHEMES) {
      await dbQuery(
        `INSERT INTO schemes (
          village_id, village_slug, slug, title, category, image_url,
          description, subsidy_details, target_audience, benefits,
          eligibility, documents_required, application_process, content,
          external_link, is_active
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, true)
        ON CONFLICT (village_id, slug) DO NOTHING`,
        [
          vId,
          vSlug,
          s.slug,
          s.title,
          s.category,
          s.imageUrl,
          s.description,
          s.subsidyDetails || null,
          s.targetAudience || null,
          JSON.stringify(s.benefits || []),
          s.eligibility || null,
          s.documentsRequired || null,
          s.applicationProcess || null,
          s.content || null,
          s.externalLink || null,
        ]
      );
    }

    revalidatePath("/admin/schemes");
    revalidatePath("/admin/dashboard");
    revalidatePath("/[villageSlug]", "layout");

    return { success: true, count: FALLBACK_SCHEMES.length };
  } catch (error: any) {
    console.error("Error seeding schemes:", error);
    return { success: false, error: error.message };
  }
}
