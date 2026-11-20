"use server";

import { queryOne, queryMany, dbQuery } from "@/lib/db";
import { uploadFileBuffer } from "@/lib/cloudinary";
import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/auth";

export async function getVillagesAdmin() {
  try {
    const villages = await queryMany("SELECT * FROM villages ORDER BY name ASC");
    return villages.map((v: any) => ({
      ...v,
      _id: (v.id || v._id).toString(),
    }));
  } catch (error) {
    console.error("Error in getVillagesAdmin:", error);
    return [];
  }
}

export async function updateVillageAction(formData: FormData) {
  try {
    const session = await requireAdminSession();
    const id = formData.get("id") as string;

    if (!id) {
      return { success: false, error: "गाव ओळखता आले नाही." };
    }

    if (session.role !== "SUPER_ADMIN" && id.toLowerCase() !== session.villageSlug.toLowerCase() && id !== session.userId) {
      const v = await queryOne("SELECT id, slug FROM villages WHERE id::text = $1 OR slug = $1", [id]);
      if (!v || v.slug.toLowerCase() !== session.villageSlug.toLowerCase()) {
        return { success: false, error: "प्रवेश नाकारला: अधिकार नाहीत." };
      }
    }
    const phone = (formData.get("phone") as string)?.trim();
    const email = (formData.get("email") as string)?.trim();
    const address = (formData.get("address") as string)?.trim();
    const description = (formData.get("description") as string)?.trim();

    // Demographics & Statistics
    const population = (formData.get("population") as string)?.trim();
    const malePopulation = (formData.get("malePopulation") as string)?.trim();
    const femalePopulation = (formData.get("femalePopulation") as string)?.trim();
    const households = (formData.get("households") as string)?.trim();
    const wards = (formData.get("wards") as string)?.trim();
    const area = (formData.get("area") as string)?.trim();
    const literacyRate = (formData.get("literacyRate") as string)?.trim();
    const femaleLiteracy = (formData.get("femaleLiteracy") as string)?.trim();
    const schools = (formData.get("schools") as string)?.trim();
    const distanceFromTaluka = (formData.get("distanceFromTaluka") as string)?.trim();
    const distanceFromDistrict = (formData.get("distanceFromDistrict") as string)?.trim();

    // Leadership, Announcements & Vision
    const sarpanchMessage = (formData.get("sarpanchMessage") as string)?.trim();
    const speciality = (formData.get("speciality") as string)?.trim();
    const highlightNotice = (formData.get("highlightNotice") as string)?.trim();

    // Vision Points (parse newline separated lines)
    const visionRaw = (formData.get("visionPoints") as string) || "";
    const visionPoints = visionRaw
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    // Pride Highlights
    let prideHighlights: any[] = [];
    const prideRaw = formData.get("prideHighlights") as string;
    if (prideRaw) {
      try {
        prideHighlights = JSON.parse(prideRaw);
      } catch {
        prideHighlights = prideRaw
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean)
          .map((line) => {
            if (line.includes("|")) {
              const parts = line.split("|").map((p) => p.trim());
              return {
                title: parts[0] || "",
                description: parts[1] || parts[0] || "",
                year: parts[2] || "",
              };
            }
            return {
              title: line,
              description: line,
            };
          });
      }
    }

    if (!id) {
      return { success: false, error: "गाव ओळखता आले नाही." };
    }

    const updated = await queryOne(
      `UPDATE villages
       SET phone = $1, email = $2, address = $3, description = $4,
           population = $5, male_population = $6, female_population = $7,
           households = $8, wards = $9, area = $10, literacy_rate = $11,
           female_literacy = $12, schools = $13, distance_from_taluka = $14,
           distance_from_district = $15, sarpanch_message = $16, speciality = $17,
           highlight_notice = $18, vision_points = $19, pride_highlights = $20,
           updated_at = NOW()
       WHERE id::text = $21 OR slug = $21
       RETURNING *`,
      [
        phone || null,
        email || null,
        address || null,
        description || null,
        population || null,
        malePopulation || null,
        femalePopulation || null,
        households || null,
        wards || null,
        area || null,
        literacyRate || null,
        femaleLiteracy || null,
        schools || null,
        distanceFromTaluka || null,
        distanceFromDistrict || null,
        sarpanchMessage || null,
        speciality || null,
        highlightNotice || null,
        JSON.stringify(visionPoints),
        JSON.stringify(prideHighlights),
        id,
      ]
    );

    if (!updated) {
      return { success: false, error: "गाव डेटाबेसमध्ये सापडले नाही." };
    }

    revalidatePath("/");
    revalidatePath("/admin/villages");
    revalidatePath("/admin/dashboard");
    revalidatePath(`/${updated.slug}`);
    revalidatePath(`/${updated.slug}/about`);

    return { success: true };
  } catch (error: any) {
    console.error("Error in updateVillageAction:", error);
    return { success: false, error: error.message || "माहिती अद्यतनित करताना त्रुटी आली." };
  }
}

export async function updateVillageGalleryAction(
  villageId: string,
  galleryImages: Array<{ url: string; caption?: string; category?: string }>
) {
  try {
    const session = await requireAdminSession();
    if (!villageId) {
      return { success: false, error: "गाव ओळखता आले नाही." };
    }

    if (session.role !== "SUPER_ADMIN") {
      const v = await queryOne("SELECT id, slug FROM villages WHERE id::text = $1 OR slug = $1", [villageId]);
      if (!v || v.slug.toLowerCase() !== session.villageSlug.toLowerCase()) {
        return { success: false, error: "प्रवेश नाकारला: अधिकार नाहीत." };
      }
    }

    const updated = await queryOne(
      `UPDATE villages
       SET gallery_images = $1, updated_at = NOW()
       WHERE id::text = $2 OR slug = $2
       RETURNING *`,
      [JSON.stringify(galleryImages), villageId]
    );

    if (!updated) {
      return { success: false, error: "गाव डेटाबेसमध्ये सापडले नाही." };
    }

    revalidatePath("/");
    revalidatePath("/admin/villages");
    revalidatePath("/admin/dashboard");
    revalidatePath(`/${updated?.slug || "komalwadi"}`);
    revalidatePath(`/${updated?.slug || "komalwadi"}/about`);

    return { success: true };
  } catch (error: any) {
    console.error("Error in updateVillageGalleryAction:", error);
    return { success: false, error: error.message || "गॅलरी अद्यतनित करताना त्रुटी आली." };
  }
}

export async function uploadVillageBannerAction(formData: FormData) {
  try {
    const session = await requireAdminSession();
    const villageId = formData.get("villageId") as string;
    const file = formData.get("file") as File;

    if (!villageId || !file) {
      return { success: false, error: "गाव किंवा फाईल सापडली नाही." };
    }

    if (session.role !== "SUPER_ADMIN") {
      const v = await queryOne("SELECT id, slug FROM villages WHERE id::text = $1 OR slug = $1", [villageId]);
      if (!v || v.slug.toLowerCase() !== session.villageSlug.toLowerCase()) {
        return { success: false, error: "प्रवेश नाकारला: अधिकार नाहीत." };
      }
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await uploadFileBuffer(buffer, {
      folder: "village-banners",
      filename: file.name,
    });
    if (!result?.url) {
      return { success: false, error: "क्लाउडवर इमेज अपलोड अयशस्वी झाले." };
    }

    const updated = await queryOne(
      `UPDATE villages
       SET cover_image = $1, updated_at = NOW()
       WHERE id::text = $2 OR slug = $2
       RETURNING *`,
      [result.url, villageId]
    );

    if (!updated) {
      return { success: false, error: "गाव डेटाबेसमध्ये सापडले नाही." };
    }

    revalidatePath("/");
    revalidatePath("/admin/villages");
    revalidatePath("/admin/dashboard");
    revalidatePath(`/${updated?.slug || "komalwadi"}`);

    return { success: true, url: result.url };
  } catch (error: any) {
    console.error("Error in uploadVillageBannerAction:", error);
    return { success: false, error: error.message || "बॅनर अपलोड करताना त्रुटी आली." };
  }
}

export async function uploadVillageGalleryImage(formData: FormData) {
  try {
    const file = formData.get("file") as File;
    const villageSlug = (formData.get("villageSlug") as string) || "komalwadi";

    if (!file) {
      return { success: false, error: "फाईल निवडलेली नाही." };
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await uploadFileBuffer(buffer, {
      folder: `village-gallery/${villageSlug}`,
      filename: file.name,
    });

    if (!result?.url) {
      return { success: false, error: "क्लाउडवर इमेज अपलोड अयशस्वी झाले." };
    }

    return { success: true, url: result.url };
  } catch (error: any) {
    console.error("Error in uploadVillageGalleryImage:", error);
    return { success: false, error: error.message || "अपलोड करताना अडचण आली." };
  }
}
