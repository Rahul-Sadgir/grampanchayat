"use server";

import { queryOne, queryMany, dbQuery } from "@/lib/db";
import { uploadFileBuffer } from "@/lib/cloudinary";
import { FALLBACK_PROJECTS } from "@/lib/data-provider";
import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/auth";

export async function getProjectsAdmin(villageSlug?: string) {
  try {
    const session = await requireAdminSession(villageSlug);
    const targetSlug = session.role === "SUPER_ADMIN" ? villageSlug : session.villageSlug;

    const values: any[] = [];
    const whereClauses: string[] = [];

    if (targetSlug && targetSlug !== "ALL") {
      values.push(targetSlug);
      whereClauses.push(`LOWER(p.village_slug) = LOWER($${values.length})`);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";
    const sql = `
      SELECT p.*, v.name as village_name, v.slug as village_slug_resolved
      FROM projects p
      LEFT JOIN villages v ON p.village_id = v.id
      ${whereSql}
      ORDER BY p.created_at DESC
    `;

    const projects = await queryMany(sql, values);
    return projects.map((p: any) => ({
      ...p,
      _id: (p.id || p._id).toString(),
      villageId: (p.villageId || p.village_id || "").toString(),
      villageName: p.villageName || p.villageSlug || "—",
    }));
  } catch (error) {
    console.error("Error in getProjectsAdmin:", error);
    return [];
  }
}

export async function saveProject(formData: FormData) {
  try {
    const rawVillageId = formData.get("villageId") as string;
    const session = await requireAdminSession();

    const id = formData.get("id") as string | null;
    const title = formData.get("title") as string;
    const category = formData.get("category") as string;
    const description = formData.get("description") as string;
    const status = (formData.get("status") as "PLANNED" | "ONGOING" | "COMPLETED") || "PLANNED";
    const budgetStr = formData.get("budget") as string;
    const year = formData.get("year") as string;
    const agency = formData.get("agency") as string;
    const location = formData.get("location") as string;
    const imageFile = formData.get("image") as File | null;

    if (!title || !category || !description) {
      return { success: false, error: "कृपया सर्व आवश्यक माहिती भरा." };
    }

    const villageSlug = session.role === "SUPER_ADMIN" && rawVillageId ? rawVillageId : session.villageSlug;
    const village = await queryOne(
      "SELECT * FROM villages WHERE id::text = $1 OR slug = $1 LIMIT 1",
      [villageSlug]
    );
    const vId = village ? village.id : null;

    // If updating, verify project belongs to session.villageSlug (CWE-639)
    if (id) {
      const existing = await queryOne("SELECT id, village_slug FROM projects WHERE id::text = $1", [id]);
      if (!existing) {
        return { success: false, error: "प्रकल्प सापडला नाही." };
      }
      if (session.role !== "SUPER_ADMIN" && existing.villageSlug?.toLowerCase() !== session.villageSlug.toLowerCase()) {
        return { success: false, error: "प्रवेश नाकारला: हा प्रकल्प अद्यतनित करण्याचे अधिकार नाहीत." };
      }
    }

    let imageUrl = (formData.get("existingImageUrl") as string) || "";

    if (imageFile && imageFile.size > 0 && typeof imageFile.arrayBuffer === "function") {
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      const uploadRes = await uploadFileBuffer(buffer, {
        folder: "projects",
        filename: imageFile.name,
        resourceType: "image",
      });
      imageUrl = uploadRes.url;
    }

    const images = imageUrl ? [imageUrl] : [];
    const budget = budgetStr ? Number(budgetStr) : 0;

    let updatedProject: any = null;

    if (id) {
      updatedProject = await queryOne(
        `UPDATE projects
         SET title = $1, category = $2, description = $3, status = $4,
             budget = $5, year = $6, agency = $7, location = $8,
             images = $9, updated_at = NOW()
         WHERE id::text = $10
         RETURNING *`,
        [
          title.trim(),
          category.trim(),
          description.trim(),
          status,
          budget,
          year ? year.trim() : null,
          agency ? agency.trim() : null,
          location ? location.trim() : null,
          JSON.stringify(images),
          id,
        ]
      );
    }

    if (!updatedProject) {
      updatedProject = await queryOne(
        `INSERT INTO projects (
          village_id, village_slug, title, category, description, status,
          budget, year, agency, location, images, start_date
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
        RETURNING *`,
        [
          vId,
          villageSlug,
          title.trim(),
          category.trim(),
          description.trim(),
          status,
          budget,
          year ? year.trim() : null,
          agency ? agency.trim() : null,
          location ? location.trim() : null,
          JSON.stringify(images),
        ]
      );
    }

    revalidatePath("/admin/projects");
    revalidatePath("/admin/dashboard");
    if (villageSlug) {
      revalidatePath(`/${villageSlug}`);
      revalidatePath(`/${villageSlug}/development`);
    }

    return {
      success: true,
      project: updatedProject,
    };
  } catch (error: any) {
    console.error("Error in saveProject:", error);
    return { success: false, error: error.message || "विकासकाम जतन करताना त्रुटी आली." };
  }
}

export async function updateProjectStatus(
  projectId: string,
  newStatus: "PLANNED" | "ONGOING" | "COMPLETED"
) {
  try {
    const session = await requireAdminSession();

    // Verify ownership
    const existing = await queryOne("SELECT id, village_slug FROM projects WHERE id::text = $1", [projectId]);
    if (!existing) {
      return { success: false, error: "प्रकल्प सापडला नाही." };
    }
    if (session.role !== "SUPER_ADMIN" && existing.villageSlug?.toLowerCase() !== session.villageSlug.toLowerCase()) {
      return { success: false, error: "प्रवेश नाकारला: हा प्रकल्प अद्यतनित करण्याचे अधिकार नाहीत." };
    }

    const updated = await queryOne(
      `UPDATE projects
       SET status = $1,
           completion_date = CASE WHEN $1 = 'COMPLETED' THEN CURRENT_DATE ELSE completion_date END,
           updated_at = NOW()
       WHERE id::text = $2
       RETURNING *`,
      [newStatus, projectId]
    );

    revalidatePath("/admin/projects");
    revalidatePath("/admin/dashboard");
    if (updated?.villageSlug) {
      revalidatePath(`/${updated.villageSlug}`);
      revalidatePath(`/${updated.villageSlug}/development`);
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error in updateProjectStatus:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteProject(projectId: string) {
  try {
    const session = await requireAdminSession();

    // Verify ownership
    const existing = await queryOne("SELECT id, village_slug FROM projects WHERE id::text = $1", [projectId]);
    if (!existing) {
      return { success: false, error: "प्रकल्प सापडला नाही." };
    }
    if (session.role !== "SUPER_ADMIN" && existing.villageSlug?.toLowerCase() !== session.villageSlug.toLowerCase()) {
      return { success: false, error: "प्रवेश नाकारला: हा प्रकल्प हटवण्याचे अधिकार नाहीत." };
    }

    await dbQuery("DELETE FROM projects WHERE id::text = $1", [projectId]);
    revalidatePath("/admin/projects");
    revalidatePath("/admin/dashboard");
    return { success: true };
  } catch (error: any) {
    console.error("Error in deleteProject:", error);
    return { success: false, error: error.message || "विकासकाम हटवताना त्रुटी आली." };
  }
}

export async function seedDefaultProjects(villageId: string, villageSlug: string) {
  try {
    const village = await queryOne(
      "SELECT * FROM villages WHERE id::text = $1 OR slug = $2 LIMIT 1",
      [villageId, villageSlug]
    );
    const vId = village ? village.id : null;
    const vSlug = village ? village.slug : "komalwadi";

    const countRes = await queryOne(
      "SELECT COUNT(*) as count FROM projects WHERE village_slug = $1",
      [vSlug]
    );
    if (Number(countRes?.count || 0) > 0) {
      return { success: false, error: "या गावासाठी आधीच विकासकामे नोंदवलेली आहेत." };
    }

    for (const p of FALLBACK_PROJECTS) {
      await dbQuery(
        `INSERT INTO projects (
          village_id, village_slug, title, category, description, status,
          budget, start_date, completion_date, images
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, '[]'::jsonb)`,
        [vId, vSlug, p.title, p.category, p.description, p.status, p.budget, p.startDate, p.completionDate]
      );
    }

    revalidatePath("/admin/projects");
    revalidatePath("/admin/dashboard");
    revalidatePath(`/${vSlug}`);
    revalidatePath(`/${vSlug}/development`);

    return { success: true, count: FALLBACK_PROJECTS.length };
  } catch (error: any) {
    console.error("Error seeding projects:", error);
    return { success: false, error: error.message };
  }
}
