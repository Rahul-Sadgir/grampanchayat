"use server";

import { queryOne, queryMany, dbQuery } from "@/lib/db";
import { uploadFileBuffer } from "@/lib/cloudinary";
import { getVillageBySlug } from "@/lib/data-provider";
import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/auth";

export async function getNoticesAdmin(villageSlug?: string) {
  try {
    const session = await requireAdminSession(villageSlug);
    const targetSlug = session.role === "SUPER_ADMIN" ? villageSlug : session.villageSlug;

    const values: any[] = [];
    const whereClauses: string[] = ["n.is_active = true"];

    if (targetSlug && targetSlug !== "ALL") {
      values.push(targetSlug);
      whereClauses.push(`LOWER(n.village_slug) = LOWER($${values.length})`);
    }

    const whereSql = `WHERE ${whereClauses.join(" AND ")}`;
    const sql = `
      SELECT n.*, v.name as village_name, v.slug as village_slug_resolved
      FROM notices n
      LEFT JOIN villages v ON n.village_id = v.id
      ${whereSql}
      ORDER BY n.is_important DESC, n.published_at DESC
    `;

    const notices = await queryMany(sql, values);
    return notices.map((n: any) => ({
      ...n,
      _id: (n.id || n._id).toString(),
      villageId: (n.villageId || n.village_id || "").toString(),
      villageName: n.villageName || n.villageSlug || "—",
      villageSlug: n.villageSlug || "",
      publishedAt: n.publishedAt ? new Date(n.publishedAt).toISOString() : new Date().toISOString(),
      isImportant: Boolean(n.isImportant),
    }));
  } catch (error) {
    console.error("[getNoticesAdmin] Error:", error);
    return [];
  }
}

export interface SaveNoticeResult {
  success: boolean;
  error?: string;
  notice?: any;
}

export async function saveNotice(formData: FormData): Promise<SaveNoticeResult> {
  try {
    const rawVillageSlug = (formData.get("villageSlug") as string) || "komalwadi";
    const session = await requireAdminSession(rawVillageSlug);
    const villageSlug = session.role === "SUPER_ADMIN" ? rawVillageSlug : session.villageSlug;

    const id = formData.get("id") as string | null;
    const title = (formData.get("title") as string)?.trim();
    const content = (formData.get("content") as string)?.trim() || "";
    const category = (formData.get("category") as string)?.trim() || "जाहिर सूचना";
    
    // Robust parsing for boolean fields
    const isImportantRaw = formData.get("isImportant");
    const isImportant =
      isImportantRaw === "true" ||
      isImportantRaw === "on" ||
      isImportantRaw === "1";

    const publishedAtStr = formData.get("publishedAt") as string;
    const publishedAt = publishedAtStr ? new Date(publishedAtStr) : new Date();
    const docFile = formData.get("docFile") as File | null;
    let fileUrl = (formData.get("documentUrl") as string) || "";

    if (!title || !content) {
      return { success: false, error: "कृपया शीर्षक आणि मजकूर प्रविष्ट करा." };
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

    // Handle document upload if provided
    if (docFile && docFile.size > 0 && typeof docFile.arrayBuffer === "function") {
      const bytes = await docFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const uploadRes = await uploadFileBuffer(buffer, {
        folder: `notices/${villageSlug}`,
        filename: docFile.name || "notice.pdf",
        resourceType: "auto",
      });
      fileUrl = uploadRes.url;
    }

    let notice: any = null;

    if (id) {
      notice = await queryOne(
        `UPDATE notices
         SET village_id = $1, village_slug = $2, title = $3, content = $4,
             category = $5, is_important = $6, published_at = $7,
             file_url = COALESCE($8, file_url), updated_at = NOW()
         WHERE id::text = $9
         RETURNING *`,
        [dbVillage.id, villageSlug, title, content, category, isImportant, publishedAt, fileUrl || null, id]
      );
    }

    if (!notice) {
      notice = await queryOne(
        `INSERT INTO notices (village_id, village_slug, title, content, category, is_important, published_at, file_url, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true)
         RETURNING *`,
        [dbVillage.id, villageSlug, title, content, category, isImportant, publishedAt, fileUrl || null]
      );
    }

    revalidatePath("/admin/notices");
    revalidatePath("/admin/dashboard");
    revalidatePath(`/${villageSlug}`);
    revalidatePath(`/${villageSlug}/notices`);

    const formattedNotice = {
      ...notice,
      _id: (notice.id || notice._id).toString(),
      villageId: dbVillage.id.toString(),
      villageName: dbVillage.name,
      villageSlug,
      publishedAt: notice.publishedAt ? new Date(notice.publishedAt).toISOString() : new Date().toISOString(),
      isImportant: Boolean(notice.isImportant),
    };

    return {
      success: true,
      notice: formattedNotice,
    };
  } catch (error: any) {
    console.error("[saveNotice] Error:", error);
    return {
      success: false,
      error: error.message || "सूचना सेव्ह करताना त्रुटी आली.",
    };
  }
}

export async function deleteNotice(id: string) {
  try {
    const session = await requireAdminSession();

    // Enforce village isolation check (CWE-639)
    const existing = await queryOne("SELECT id, village_slug FROM notices WHERE id::text = $1", [id]);
    if (!existing) {
      return { success: false, error: "सूचना सापडली नाही." };
    }
    if (session.role !== "SUPER_ADMIN" && existing.villageSlug?.toLowerCase() !== session.villageSlug.toLowerCase()) {
      return { success: false, error: "प्रवेश नाकारला: आपल्याकडे ही सूचना हटवण्याचे अधिकार नाहीत." };
    }

    const n = await queryOne("DELETE FROM notices WHERE id::text = $1 RETURNING *", [id]);
    if (n) {
      revalidatePath("/admin/notices");
      revalidatePath("/admin/dashboard");
      revalidatePath(`/${n.villageSlug}/notices`);
      revalidatePath(`/${n.villageSlug}`);
    }
    return { success: true };
  } catch (error: any) {
    console.error("[deleteNotice] Error:", error);
    return { success: false, error: error.message };
  }
}

export async function toggleNoticeImportant(id: string, isImportant: boolean) {
  try {
    const session = await requireAdminSession();

    const existing = await queryOne("SELECT id, village_slug FROM notices WHERE id::text = $1", [id]);
    if (!existing) {
      return { success: false, error: "सूचना सापडली नाही." };
    }
    if (session.role !== "SUPER_ADMIN" && existing.villageSlug?.toLowerCase() !== session.villageSlug.toLowerCase()) {
      return { success: false, error: "प्रवेश नाकारला: आपल्याकडे ही सूचना अद्यतनित करण्याचे अधिकार नाहीत." };
    }

    const n = await queryOne(
      "UPDATE notices SET is_important = $1, updated_at = NOW() WHERE id::text = $2 RETURNING *",
      [isImportant, id]
    );

    if (!n) {
      return { success: false, error: "सूचना सापडली नाही." };
    }

    revalidatePath("/admin/notices");
    revalidatePath("/admin/dashboard");
    if (n?.villageSlug) {
      revalidatePath(`/${n.villageSlug}`);
      revalidatePath(`/${n.villageSlug}/notices`);
    }

    return {
      success: true,
      isImportant: Boolean(n?.isImportant),
      notice: n,
    };
  } catch (error: any) {
    console.error("[toggleNoticeImportant] Error:", error);
    return { success: false, error: error.message };
  }
}
