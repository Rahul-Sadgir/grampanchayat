"use server";

import { queryOne, queryMany, dbQuery } from "@/lib/db";
import { uploadFileBuffer } from "@/lib/cloudinary";
import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/auth";

export interface RtiSpendingItem {
  id: string;
  villageId?: string;
  villageSlug: string;
  title: string;
  imageUrl: string;
  orderNum?: number;
  isActive?: boolean;
  createdAt: string;
}

export async function getRtiSpendings(villageSlug: string = "komalwadi"): Promise<RtiSpendingItem[]> {
  try {
    const rows = await queryMany(
      `SELECT * FROM rti_spendings 
       WHERE LOWER(village_slug) = LOWER($1) AND is_active = TRUE
       ORDER BY order_num ASC, created_at DESC`,
      [villageSlug]
    );

    return rows.map((r: any) => ({
      id: r.id.toString(),
      villageId: r.village_id ? r.village_id.toString() : undefined,
      villageSlug: r.village_slug,
      title: r.title,
      imageUrl: r.image_url,
      orderNum: r.order_num || 0,
      isActive: r.is_active,
      createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
    }));
  } catch (error) {
    console.error("Error in getRtiSpendings:", error);
    return [];
  }
}

export async function createRtiSpending(formData: FormData) {
  try {
    const rawVillageSlug = ((formData.get("villageSlug") as string) || "komalwadi").trim();
    const session = await requireAdminSession(rawVillageSlug);
    const villageSlug = session.role === "SUPER_ADMIN" ? rawVillageSlug : session.villageSlug;

    const title = ((formData.get("title") as string) || "").trim();
    const imageFile = formData.get("imageFile") as File | null;
    let imageUrl = ((formData.get("imageUrl") as string) || "").trim();

    if (!title) {
      return { success: false, error: "कृपया खर्चाचे शीर्षक (Title) प्रविष्ट करा." };
    }

    if (imageFile && imageFile.size > 0) {
      const arrayBuffer = await imageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const uploadRes = await uploadFileBuffer(buffer, {
        folder: `rti-spendings/${villageSlug}`,
        filename: imageFile.name || `spending_${Date.now()}`,
      });
      if (uploadRes?.url) {
        imageUrl = uploadRes.url;
      }
    }

    if (!imageUrl) {
      return { success: false, error: "कृपया खर्चाचे बिल / व्हाउचर छायाचित्र निवडा." };
    }

    // Get village ID
    const villageRow = await queryOne(
      "SELECT id FROM villages WHERE LOWER(slug) = LOWER($1)",
      [villageSlug]
    );
    const villageId = villageRow?.id || null;

    const inserted = await queryOne(
      `INSERT INTO rti_spendings (village_id, village_slug, title, image_url, order_num)
       VALUES ($1, $2, $3, $4, (SELECT COALESCE(MAX(order_num), 0) + 1 FROM rti_spendings WHERE LOWER(village_slug) = LOWER($2)))
       RETURNING *`,
      [villageId, villageSlug, title, imageUrl]
    );

    revalidatePath(`/${villageSlug}/about`);
    revalidatePath(`/${villageSlug}`);
    revalidatePath("/admin/villages");

    return {
      success: true,
      spending: {
        id: inserted.id.toString(),
        villageSlug: inserted.village_slug,
        title: inserted.title,
        imageUrl: inserted.image_url,
        orderNum: inserted.order_num,
        isActive: inserted.is_active,
        createdAt: inserted.created_at ? new Date(inserted.created_at).toISOString() : new Date().toISOString(),
      },
    };
  } catch (error: any) {
    console.error("Error in createRtiSpending:", error);
    return { success: false, error: error.message || "खर्च नोंद जोडताना त्रुटी आली." };
  }
}

export async function updateRtiSpending(formData: FormData) {
  try {
    const session = await requireAdminSession();
    const id = (formData.get("id") as string)?.trim();
    if (!id) {
      return { success: false, error: "खर्च नोंद ओळखता आली नाही." };
    }

    const existing = await queryOne("SELECT id, village_slug FROM rti_spendings WHERE id::text = $1", [id]);
    if (!existing) {
      return { success: false, error: "नोंद सापडली नाही." };
    }
    if (session.role !== "SUPER_ADMIN" && existing.villageSlug?.toLowerCase() !== session.villageSlug.toLowerCase()) {
      return { success: false, error: "प्रवेश नाकारला: अधिकार नाहीत." };
    }

    const rawVillageSlug = ((formData.get("villageSlug") as string) || "komalwadi").trim();
    const villageSlug = session.role === "SUPER_ADMIN" ? rawVillageSlug : session.villageSlug;
    const title = ((formData.get("title") as string) || "").trim();
    const imageFile = formData.get("imageFile") as File | null;
    let imageUrl = ((formData.get("imageUrl") as string) || "").trim();

    if (!id) {
      return { success: false, error: "खर्च नोंद ओळखता आली नाही." };
    }
    if (!title) {
      return { success: false, error: "कृपया खर्चाचे शीर्षक (Title) प्रविष्ट करा." };
    }

    if (imageFile && imageFile.size > 0) {
      const arrayBuffer = await imageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const uploadRes = await uploadFileBuffer(buffer, {
        folder: `rti-spendings/${villageSlug}`,
        filename: imageFile.name || `spending_${Date.now()}`,
      });
      if (uploadRes?.url) {
        imageUrl = uploadRes.url;
      }
    }

    let updated;
    if (imageUrl) {
      updated = await queryOne(
        `UPDATE rti_spendings
         SET title = $1, image_url = $2, updated_at = NOW()
         WHERE id::text = $3
         RETURNING *`,
        [title, imageUrl, id]
      );
    } else {
      updated = await queryOne(
        `UPDATE rti_spendings
         SET title = $1, updated_at = NOW()
         WHERE id::text = $2
         RETURNING *`,
        [title, id]
      );
    }

    if (!updated) {
      return { success: false, error: "नोंद डेटाबेसमध्ये सापडली नाही." };
    }

    revalidatePath(`/${villageSlug}/about`);
    revalidatePath(`/${villageSlug}`);
    revalidatePath("/admin/villages");

    return {
      success: true,
      spending: {
        id: updated.id.toString(),
        villageSlug: updated.village_slug,
        title: updated.title,
        imageUrl: updated.image_url,
        orderNum: updated.order_num,
        isActive: updated.is_active,
        createdAt: updated.created_at ? new Date(updated.created_at).toISOString() : new Date().toISOString(),
      },
    };
  } catch (error: any) {
    console.error("Error in updateRtiSpending:", error);
    return { success: false, error: error.message || "खर्च नोंद अद्यतनित करताना त्रुटी आली." };
  }
}

export async function deleteRtiSpending(id: string, villageSlug: string = "komalwadi") {
  try {
    const session = await requireAdminSession();
    if (!id) {
      return { success: false, error: "नोंद ओळखता आली नाही." };
    }

    const existing = await queryOne("SELECT id, village_slug FROM rti_spendings WHERE id::text = $1", [id]);
    if (!existing) {
      return { success: false, error: "नोंद सापडली नाही." };
    }
    if (session.role !== "SUPER_ADMIN" && existing.villageSlug?.toLowerCase() !== session.villageSlug.toLowerCase()) {
      return { success: false, error: "प्रवेश नाकारला: अधिकार नाहीत." };
    }

    await dbQuery(
      "DELETE FROM rti_spendings WHERE id::text = $1",
      [id]
    );

    const targetSlug = existing.villageSlug || villageSlug;
    revalidatePath(`/${targetSlug}/about`);
    revalidatePath(`/${targetSlug}`);
    revalidatePath("/admin/villages");

    return { success: true };
  } catch (error: any) {
    console.error("Error in deleteRtiSpending:", error);
    return { success: false, error: error.message || "नोंद हटवताना त्रुटी आली." };
  }
}

