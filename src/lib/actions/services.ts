"use server";

import { queryOne, queryMany, dbQuery } from "@/lib/db";
import { uploadFileBuffer } from "@/lib/cloudinary";
import { getVillageBySlug } from "@/lib/data-provider";
import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/auth";

export async function getServicesAdmin(villageSlug?: string, tabCategory?: string) {
  try {
    const session = await requireAdminSession(villageSlug);
    const targetSlug = session.role === "SUPER_ADMIN" ? villageSlug : session.villageSlug;

    const values: any[] = [];
    const whereClauses: string[] = [];

    if (targetSlug && targetSlug !== "ALL") {
      values.push(targetSlug);
      whereClauses.push(`LOWER(s.village_slug) = LOWER($${values.length})`);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";
    const sql = `
      SELECT s.*, v.name as village_name, v.slug as village_slug_resolved
      FROM services s
      LEFT JOIN villages v ON s.village_id = v.id
      ${whereSql}
      ORDER BY s.created_at ASC
    `;

    const services = await queryMany(sql, values);
    return services.map((s: any) => ({
      ...s,
      _id: (s.id || s._id).toString(),
      villageId: (s.villageId || s.village_id || "").toString(),
      villageName: s.villageName || s.villageSlug || "—",
    }));
  } catch (error) {
    console.error("[getServicesAdmin] Error:", error);
    return [];
  }
}

export interface SaveServiceResult {
  success: boolean;
  error?: string;
  service?: any;
}

export async function saveServiceOrPdf(formData: FormData): Promise<SaveServiceResult> {
  try {
    const rawVillageSlug = (formData.get("villageSlug") as string) || "komalwadi";
    const session = await requireAdminSession(rawVillageSlug);
    const villageSlug = session.role === "SUPER_ADMIN" ? rawVillageSlug : session.villageSlug;

    const id = formData.get("id") as string | null;

    if (id) {
      const existing = await queryOne("SELECT id, village_slug FROM services WHERE id::text = $1", [id]);
      if (!existing) {
        return { success: false, error: "सेवा सापडली नाही." };
      }
      if (session.role !== "SUPER_ADMIN" && existing.villageSlug?.toLowerCase() !== session.villageSlug.toLowerCase()) {
        return { success: false, error: "प्रवेश नाकारला: अधिकार नाहीत." };
      }
    }
    const name = (formData.get("name") as string)?.trim();
    const description = (formData.get("description") as string)?.trim() || "";
    const category = (formData.get("category") as string)?.trim() || "दाखले व अर्ज";
    const icon = (formData.get("icon") as string) || "FileText";
    const isPdfOnlyRaw = formData.get("isPdfOnly");
    const isPdfOnly =
      isPdfOnlyRaw === "true" ||
      isPdfOnlyRaw === "on" ||
      isPdfOnlyRaw === "1";
    const order = Number(formData.get("order")) || 0;
    const pdfFile = formData.get("pdfFile") as File | null;
    let fileUrl = (formData.get("fileUrl") as string) || "";
    let fileName = (formData.get("fileName") as string) || "";

    if (!name) {
      return { success: false, error: "कृपया सेवेचे किंवा अर्जाचे नाव प्रविष्ट करा." };
    }

    // Generate safe slug
    const generatedSlug =
      (formData.get("slug") as string)?.trim() ||
      name.toLowerCase().replace(/[^a-z0-9]/gi, "-").replace(/-+/g, "-") ||
      `service-${Date.now()}`;

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

    // Handle PDF upload if provided
    if (pdfFile && pdfFile.size > 0 && typeof pdfFile.arrayBuffer === "function") {
      const bytes = await pdfFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const uploadRes = await uploadFileBuffer(buffer, {
        folder: `services/${villageSlug}`,
        filename: pdfFile.name || `${generatedSlug}.pdf`,
        resourceType: "auto",
      });
      fileUrl = uploadRes.url;
      fileName = pdfFile.name;
    }

    let svc: any = null;

    if (id) {
      svc = await queryOne(
        `UPDATE services
         SET village_id = $1, village_slug = $2, name = $3, slug = $4,
             description = $5, category = $6, icon = $7,
             is_pdf_only = $8, updated_at = NOW()
         WHERE id::text = $9
         RETURNING *`,
        [dbVillage.id, villageSlug, name, generatedSlug, description, category, icon, isPdfOnly, id]
      );
    }

    if (!svc) {
      svc = await queryOne(
        `INSERT INTO services (village_id, village_slug, name, slug, description, category, icon, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, true)
         RETURNING *`,
        [dbVillage.id, villageSlug, name, generatedSlug, description, category, icon]
      );

      // If online service form, create default base form
      if (svc && !isPdfOnly) {
        await dbQuery(
          `INSERT INTO forms (service_id, village_id, version, schema, is_active)
           VALUES ($1, $2, 1, $3, true)`,
          [
            svc.id,
            dbVillage.id,
            JSON.stringify({
              serviceName: name,
              category: "दाखले",
              fields: [
                {
                  name: "applicantName",
                  label: "अर्जदाराचे संपूर्ण नाव",
                  type: "text",
                  required: true,
                  placeholder: "उदा. नाव आडनाव",
                },
                {
                  name: "mobileNumber",
                  label: "मोबाईल क्रमांक",
                  type: "tel",
                  required: true,
                  placeholder: "१० अंकी मोबाईल",
                },
                {
                  name: "address",
                  label: "संपूर्ण पत्ता",
                  type: "textarea",
                  required: true,
                  placeholder: "घर नं, गल्ली/वार्ड, गाव",
                },
                {
                  name: "purpose",
                  label: "अर्जाचे कारण / प्रयोजन",
                  type: "text",
                  required: true,
                  placeholder: "दाखला कशासाठी हवा आहे...",
                },
              ],
            }),
          ]
        );
      }
    }

    revalidatePath("/admin/services");
    revalidatePath(`/${villageSlug}`);
    revalidatePath(`/${villageSlug}/services`);

    return {
      success: true,
      service: svc,
    };
  } catch (error: any) {
    console.error("[saveServiceOrPdf] Error:", error);
    return {
      success: false,
      error: error.message || "माहिती सेव्ह करताना त्रुटी आली.",
    };
  }
}

export async function createCustomServiceAction(formData: FormData) {
  try {
    const session = await requireAdminSession();
    const rawVillageId = formData.get("villageId") as string;
    const name = formData.get("name") as string;
    const slug = formData.get("slug") as string;
    const category = formData.get("category") as string;
    const description = formData.get("description") as string;
    const fieldsJson = formData.get("fieldsJson") as string;

    const targetVillageParam = session.role === "SUPER_ADMIN" && rawVillageId ? rawVillageId : session.villageSlug;
    const village = await queryOne("SELECT * FROM villages WHERE id::text = $1 OR slug = $1", [targetVillageParam]);
    const villageSlug = village ? village.slug : "komalwadi";
    const vId = village ? village.id : null;

    let fields = [];
    try {
      fields = JSON.parse(fieldsJson);
    } catch {
      fields = [
        { name: "applicantFullName", label: "अर्जदाराचे पूर्ण नाव", type: "text", required: true },
      ];
    }

    const svc = await queryOne(
      `INSERT INTO services (village_id, village_slug, name, slug, category, description, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, true)
       RETURNING *`,
      [vId, villageSlug, name, slug, category, description]
    );

    if (svc) {
      await dbQuery(
        `INSERT INTO forms (service_id, village_id, version, schema, is_active)
         VALUES ($1, $2, 1, $3, true)`,
        [
          svc.id,
          vId,
          JSON.stringify({
            serviceName: name,
            category,
            fields,
          }),
        ]
      );
    }

    revalidatePath("/admin/services");
    revalidatePath(`/${villageSlug}`);
    revalidatePath(`/${villageSlug}/services`);

    return { success: true };
  } catch (error: any) {
    console.error("[createCustomServiceAction] Error:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteService(id: string) {
  try {
    const session = await requireAdminSession();
    const existing = await queryOne("SELECT id, village_slug FROM services WHERE id::text = $1", [id]);
    if (!existing) {
      return { success: false, error: "सेवा सापडली नाही." };
    }
    if (session.role !== "SUPER_ADMIN" && existing.villageSlug?.toLowerCase() !== session.villageSlug.toLowerCase()) {
      return { success: false, error: "प्रवेश नाकारला: अधिकार नाहीत." };
    }

    const svc = await queryOne("DELETE FROM services WHERE id::text = $1 RETURNING *", [id]);
    if (svc) {
      revalidatePath("/admin/services");
      revalidatePath(`/${svc.villageSlug}/services`);
    }
    return { success: true };
  } catch (error: any) {
    console.error("[deleteService] Error:", error);
    return { success: false, error: error.message };
  }
}

export async function toggleServiceStatus(id: string, isActive: boolean) {
  try {
    const session = await requireAdminSession();
    const existing = await queryOne("SELECT id, village_slug FROM services WHERE id::text = $1", [id]);
    if (!existing) {
      return { success: false, error: "सेवा सापडली नाही." };
    }
    if (session.role !== "SUPER_ADMIN" && existing.villageSlug?.toLowerCase() !== session.villageSlug.toLowerCase()) {
      return { success: false, error: "प्रवेश नाकारला: अधिकार नाहीत." };
    }

    const svc = await queryOne(
      "UPDATE services SET is_active = $1, updated_at = NOW() WHERE id::text = $2 RETURNING *",
      [isActive, id]
    );

    if (svc) {
      revalidatePath("/admin/services");
      revalidatePath("/admin/dashboard");
      revalidatePath(`/${svc.villageSlug}/services`);
      revalidatePath(`/${svc.villageSlug}`);
    }
    return { success: true, isActive: svc?.isActive };
  } catch (error: any) {
    console.error("[toggleServiceStatus] Error:", error);
    return { success: false, error: error.message };
  }
}
