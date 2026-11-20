"use server";

import { queryOne, queryMany, dbQuery } from "@/lib/db";
import { uploadFileBuffer } from "@/lib/cloudinary";
import { getVillageBySlug } from "@/lib/data-provider";
import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/auth";

export async function getRepresentativesByVillage(villageSlug?: string) {
  try {
    const values: any[] = [];
    const whereClauses: string[] = ["r.is_active = true"];

    if (villageSlug && villageSlug !== "ALL") {
      values.push(villageSlug);
      whereClauses.push(`LOWER(r.village_slug) = LOWER($${values.length})`);
    }

    const whereSql = `WHERE ${whereClauses.join(" AND ")}`;
    const sql = `
      SELECT r.*, v.name as village_name, v.slug as village_slug_resolved
      FROM representatives r
      LEFT JOIN villages v ON r.village_id = v.id
      ${whereSql}
      ORDER BY r.order_num ASC, r.created_at ASC
    `;

    const reps = await queryMany(sql, values);

    return reps.map((r: any) => ({
      ...r,
      _id: (r.id || r._id).toString(),
      villageId: (r.villageId || r.village_id || "").toString(),
      order: r.orderNum ?? r.order ?? 0,
    }));
  } catch (error) {
    console.error("[getRepresentativesByVillage] Error:", error);
    return [];
  }
}

export interface SaveRepresentativeResult {
  success: boolean;
  error?: string;
  representative?: any;
}

export async function saveRepresentative(formData: FormData): Promise<SaveRepresentativeResult> {
  try {
    const rawVillageSlug = (formData.get("villageSlug") as string) || "komalwadi";
    const session = await requireAdminSession(rawVillageSlug);
    const villageSlug = session.role === "SUPER_ADMIN" ? rawVillageSlug : session.villageSlug;

    const id = formData.get("id") as string | null;

    if (id) {
      const existing = await queryOne("SELECT id, village_slug FROM representatives WHERE id::text = $1", [id]);
      if (!existing) {
        return { success: false, error: "प्रतिनिधी सापडला नाही." };
      }
      if (session.role !== "SUPER_ADMIN" && existing.villageSlug?.toLowerCase() !== session.villageSlug.toLowerCase()) {
        return { success: false, error: "प्रवेश नाकारला: अधिकार नाहीत." };
      }
    }
    const name = (formData.get("name") as string)?.trim();
    const role = (formData.get("role") as string)?.trim();
    const phone = (formData.get("phone") as string)?.trim() || "";
    const email = (formData.get("email") as string)?.trim() || "";
    const ward = (formData.get("ward") as string)?.trim() || "";
    const order = Number(formData.get("order")) || 0;
    const isSarpanch =
      formData.get("isSarpanch") === "true" ||
      formData.get("isSarpanch") === "on" ||
      formData.get("isSarpanch") === "1" ||
      role === "सरपंच";
    const isUpasarpanch =
      formData.get("isUpasarpanch") === "true" ||
      formData.get("isUpasarpanch") === "on" ||
      formData.get("isUpasarpanch") === "1" ||
      role === "उपसरपंच";
    const photoFile = formData.get("photoFile") as File | null;
    let photoUrl = (formData.get("photoUrl") as string) || "";

    if (!name || !role) {
      return { success: false, error: "कृपया नाव आणि पद प्रविष्ट करा." };
    }

    let dbVillage = await queryOne(
      "SELECT * FROM villages WHERE LOWER(slug) = LOWER($1)",
      [villageSlug]
    );

    if (!dbVillage) {
      const vData = await getVillageBySlug(villageSlug);
      if (vData) {
        dbVillage = await queryOne(
          `INSERT INTO villages (name, slug, district, taluka, state, primary_color, secondary_color)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           RETURNING *`,
          [vData.name, vData.slug, vData.district, vData.taluka, "महाराष्ट्र", "#003625", "#9e4300"]
        );
      }
    }

    if (!dbVillage) {
      return { success: false, error: "गाव सापडले नाही." };
    }

    // Handle photo upload if provided
    if (photoFile && photoFile.size > 0 && typeof photoFile.arrayBuffer === "function") {
      const bytes = await photoFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const uploadRes = await uploadFileBuffer(buffer, {
        folder: `representatives/${villageSlug}`,
        filename: photoFile.name || `${name.replace(/\s+/g, "_")}.jpg`,
        resourceType: "image",
      });
      photoUrl = uploadRes.url;
    }

    let rep: any = null;

    if (id) {
      rep = await queryOne(
        `UPDATE representatives
         SET village_id = $1, village_slug = $2, name = $3, role = $4,
             phone = $5, email = $6, ward = $7, order_num = $8,
             is_sarpanch = $9, is_upasarpanch = $10,
             photo_url = COALESCE($11, photo_url), updated_at = NOW()
         WHERE id::text = $12
         RETURNING *`,
        [
          dbVillage.id,
          villageSlug,
          name,
          role,
          phone,
          email,
          ward,
          order,
          isSarpanch,
          isUpasarpanch,
          photoUrl || null,
          id,
        ]
      );
    }

    if (!rep) {
      rep = await queryOne(
        `INSERT INTO representatives (
          village_id, village_slug, name, role, phone, email, ward,
          order_num, is_sarpanch, is_upasarpanch, photo_url, is_active
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, true)
        RETURNING *`,
        [
          dbVillage.id,
          villageSlug,
          name,
          role,
          phone,
          email,
          ward,
          order,
          isSarpanch,
          isUpasarpanch,
          photoUrl || null,
        ]
      );
    }

    revalidatePath("/admin/representatives");
    revalidatePath(`/${villageSlug}`);
    revalidatePath(`/${villageSlug}/about`);

    return {
      success: true,
      representative: {
        ...rep,
        _id: (rep.id || rep._id).toString(),
        order: rep.orderNum ?? rep.order ?? 0,
      },
    };
  } catch (error: any) {
    console.error("[saveRepresentative] Error:", error);
    return {
      success: false,
      error: error.message || "माहिती सेव्ह करताना त्रुटी आली.",
    };
  }
}

export async function deleteRepresentative(id: string) {
  try {
    const session = await requireAdminSession();
    const existing = await queryOne("SELECT id, village_slug FROM representatives WHERE id::text = $1", [id]);
    if (!existing) {
      return { success: false, error: "प्रतिनिधी सापडला नाही." };
    }
    if (session.role !== "SUPER_ADMIN" && existing.villageSlug?.toLowerCase() !== session.villageSlug.toLowerCase()) {
      return { success: false, error: "प्रवेश नाकारला: अधिकार नाहीत." };
    }

    const rep = await queryOne("DELETE FROM representatives WHERE id::text = $1 RETURNING *", [id]);
    if (rep) {
      revalidatePath("/admin/representatives");
      revalidatePath(`/${rep.villageSlug}`);
      revalidatePath(`/${rep.villageSlug}/about`);
    }
    return { success: true };
  } catch (error: any) {
    console.error("[deleteRepresentative] Error:", error);
    return { success: false, error: error.message };
  }
}

export async function toggleVillageAdministrativeRule(
  villageSlug: string,
  isUnderRule: boolean
) {
  try {
    const session = await requireAdminSession(villageSlug);
    const targetSlug = session.role === "SUPER_ADMIN" ? villageSlug : session.villageSlug;

    await dbQuery(
      `UPDATE public.villages 
       SET is_under_administrative_rule = $1, updated_at = NOW() 
       WHERE LOWER(slug) = LOWER($2)`,
      [isUnderRule, targetSlug || "komalwadi"]
    );

    revalidatePath(`/${targetSlug}`);
    revalidatePath(`/${targetSlug}/about`);
    revalidatePath("/admin/representatives");
    revalidatePath("/admin/dashboard");
    revalidatePath("/admin/villages");

    return { success: true, isUnderAdministrativeRule: isUnderRule };
  } catch (error: any) {
    console.error("[toggleVillageAdministrativeRule] Error:", error);
    return { success: false, error: error.message || "स्थिती बदलताना त्रुटी आली." };
  }
}

export async function updateAdministratorDetails(formData: FormData) {
  try {
    const rawVillageSlug = (formData.get("villageSlug") as string) || "komalwadi";
    const session = await requireAdminSession(rawVillageSlug);
    const villageSlug = session.role === "SUPER_ADMIN" ? rawVillageSlug : session.villageSlug;
    const name = (formData.get("name") as string)?.trim() || "शासकीय प्रशासक";
    const role = (formData.get("role") as string)?.trim() || "शासन नियुक्त प्रशासक (विस्तार अधिकारी)";
    const phone = (formData.get("phone") as string)?.trim() || "";
    const email = (formData.get("email") as string)?.trim() || "";
    const orderDetails = (formData.get("orderDetails") as string)?.trim() || "";
    const isUnderRule = formData.get("isUnderAdministrativeRule") === "true";
    const photoFile = formData.get("photoFile") as File | null;
    let photoUrl = (formData.get("photoUrl") as string) || "";

    if (photoFile && photoFile.size > 0 && typeof photoFile.arrayBuffer === "function") {
      const bytes = await photoFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const uploadRes = await uploadFileBuffer(buffer, {
        folder: `administrator/${villageSlug}`,
        filename: photoFile.name || "administrator.jpg",
        resourceType: "image",
      });
      photoUrl = uploadRes.url;
    }

    await dbQuery(
      `UPDATE public.villages
       SET is_under_administrative_rule = $1,
           administrator_name = $2,
           administrator_role = $3,
           administrator_phone = $4,
           administrator_email = $5,
           administrator_order_details = $6,
           administrator_photo_url = COALESCE($7, administrator_photo_url),
           updated_at = NOW()
       WHERE LOWER(slug) = LOWER($8)`,
      [
        isUnderRule,
        name,
        role,
        phone,
        email,
        orderDetails,
        photoUrl || null,
        villageSlug,
      ]
    );

    revalidatePath(`/${villageSlug}`);
    revalidatePath(`/${villageSlug}/about`);
    revalidatePath("/admin/representatives");
    revalidatePath("/admin/dashboard");

    return { success: true };
  } catch (error: any) {
    console.error("[updateAdministratorDetails] Error:", error);
    return { success: false, error: error.message || "प्रशासक माहिती जतन करताना त्रुटी आली." };
  }
}
