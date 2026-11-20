"use server";

import { queryOne, queryMany, dbQuery } from "@/lib/db";
import { uploadFileBuffer } from "@/lib/cloudinary";
import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/auth";

export interface EventImage {
  url: string;
  caption?: string;
  publicId?: string;
}

export interface VillageEvent {
  id: string;
  _id?: string;
  villageId: string;
  villageSlug: string;
  villageName?: string;
  title: string;
  slug: string;
  category: string;
  content: string;
  summary?: string;
  location?: string;
  eventDate: string;
  coverImage?: string;
  images: EventImage[];
  isActive: boolean;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

// Generate URL friendly slug from Marathi / English text
function generateSlug(text: string): string {
  const base = text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s\u0900-\u097F-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base || `event-${Date.now()}`;
}

export async function getEventsAdmin(villageSlug?: string) {
  try {
    const session = await requireAdminSession(villageSlug);
    const targetSlug = session.role === "SUPER_ADMIN" ? villageSlug : session.villageSlug;

    const values: any[] = [];
    const whereClauses: string[] = [];

    if (targetSlug && targetSlug !== "ALL") {
      values.push(targetSlug);
      whereClauses.push(`LOWER(e.village_slug) = LOWER($${values.length})`);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";
    const sql = `
      SELECT e.*, v.name as village_name, v.slug as village_slug_resolved
      FROM events e
      LEFT JOIN villages v ON e.village_id = v.id
      ${whereSql}
      ORDER BY e.event_date DESC, e.created_at DESC
    `;

    const rows = await queryMany(sql, values);
    return rows.map((e: any) => ({
      ...e,
      _id: (e.id || e._id).toString(),
      villageId: (e.villageId || e.village_id || "").toString(),
      villageName: e.villageName || e.villageSlug || "कोमलवाडी",
      eventDate:
        e.event_date instanceof Date
          ? e.event_date.toISOString().split("T")[0]
          : e.eventDate instanceof Date
          ? e.eventDate.toISOString().split("T")[0]
          : typeof (e.eventDate || e.event_date) === "string"
          ? (e.eventDate || e.event_date).split("T")[0]
          : new Date().toISOString().split("T")[0],
      images: Array.isArray(e.images) ? e.images : typeof e.images === "string" ? JSON.parse(e.images || "[]") : [],
    }));
  } catch (error) {
    console.error("[getEventsAdmin] Error:", error);
    return [];
  }
}

export async function saveEvent(formData: FormData) {
  try {
    const rawVillageId = formData.get("villageId") as string;
    const session = await requireAdminSession();
    const id = formData.get("id") as string | null;

    if (id) {
      const existing = await queryOne("SELECT id, village_slug FROM events WHERE id::text = $1", [id]);
      if (!existing) {
        return { success: false, error: "घडामोड सापडली नाही." };
      }
      if (session.role !== "SUPER_ADMIN" && existing.villageSlug?.toLowerCase() !== session.villageSlug.toLowerCase()) {
        return { success: false, error: "प्रवेश नाकारला: अधिकार नाहीत." };
      }
    }

    const title = (formData.get("title") as string || "").trim();
    const category = (formData.get("category") as string || "उपक्रम").trim();
    const summary = (formData.get("summary") as string || "").trim();
    const content = (formData.get("content") as string || "").trim();
    const location = (formData.get("location") as string || "").trim();
    const eventDate = (formData.get("eventDate") as string || "").trim() || new Date().toISOString().split("T")[0];
    const rawSlug = (formData.get("slug") as string || "").trim();
    const slug = generateSlug(rawSlug || title);
    const isActive = formData.get("isActive") === "false" ? false : true;

    if (!title || !content) {
      return { success: false, error: "कृपया शीर्षक आणि सविस्तर मजकूर भरा." };
    }

    const targetVillageSlug = session.role === "SUPER_ADMIN" && rawVillageId ? rawVillageId : session.villageSlug;
    const village = await queryOne(
      "SELECT * FROM villages WHERE id::text = $1 OR slug = $1 LIMIT 1",
      [targetVillageSlug || "komalwadi"]
    );
    const vId = village ? village.id : null;
    const vSlug = village ? village.slug : "komalwadi";

    // Handle existing images retained by admin
    const existingImagesRaw = formData.get("existingImages") as string | null;
    let images: EventImage[] = [];
    if (existingImagesRaw) {
      try {
        const parsed = JSON.parse(existingImagesRaw);
        if (Array.isArray(parsed)) {
          images = parsed.map((img: any) => (typeof img === "string" ? { url: img } : img));
        }
      } catch (e) {
        console.warn("Failed to parse existingImages:", e);
      }
    }

    // Handle new uploaded images (Multiple files support with Cloudinary)
    const newFiles = formData.getAll("images") as File[];
    for (const file of newFiles) {
      if (file && file.size > 0 && typeof file.arrayBuffer === "function") {
        try {
          const buffer = Buffer.from(await file.arrayBuffer());
          const uploadRes = await uploadFileBuffer(buffer, {
            folder: `events/${vSlug}`,
            filename: file.name,
            resourceType: "image",
          });

          images.push({
            url: uploadRes.url,
            caption: "",
            publicId: uploadRes.publicId,
          });
        } catch (uploadErr) {
          console.error(`Failed to upload event image ${file.name}:`, uploadErr);
        }
      }
    }

    // Set cover image to first image if not explicitly set
    const coverImage = images.length > 0 ? images[0].url : (formData.get("coverImage") as string) || null;

    if (id) {
      // UPDATE
      await dbQuery(
        `UPDATE events
         SET title = $1, slug = $2, category = $3, summary = $4,
             content = $5, location = $6, event_date = $7,
             cover_image = $8, images = $9, is_active = $10,
             updated_at = NOW()
         WHERE id::text = $11`,
        [
          title,
          slug,
          category,
          summary || null,
          content,
          location || null,
          eventDate,
          coverImage,
          JSON.stringify(images),
          isActive,
          id,
        ]
      );
    } else {
      // INSERT
      await dbQuery(
        `INSERT INTO events (
           village_id, village_slug, title, slug, category, summary,
           content, location, event_date, cover_image, images, is_active
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [
          vId,
          vSlug,
          title,
          slug,
          category,
          summary || null,
          content,
          location || null,
          eventDate,
          coverImage,
          JSON.stringify(images),
          isActive,
        ]
      );
    }

    // Revalidate relevant pages
    revalidatePath(`/${vSlug}`);
    revalidatePath(`/${vSlug}/events`);
    revalidatePath(`/${vSlug}/events/${slug}`);
    revalidatePath("/admin/events");
    revalidatePath("/admin/dashboard");

    return { success: true };
  } catch (err: any) {
    console.error("[saveEvent] Error:", err);
    return {
      success: false,
      error: err.message || "घडामोडी जतन करताना त्रुटी आली. कृपया पुन्हा प्रयत्न करा.",
    };
  }
}

export async function deleteEvent(id: string, villageSlug = "komalwadi") {
  try {
    const session = await requireAdminSession();
    const existing = await queryOne("SELECT id, village_slug FROM events WHERE id::text = $1", [id]);
    if (!existing) {
      return { success: false, error: "घडामोड सापडली नाही." };
    }
    if (session.role !== "SUPER_ADMIN" && existing.villageSlug?.toLowerCase() !== session.villageSlug.toLowerCase()) {
      return { success: false, error: "प्रवेश नाकारला: अधिकार नाहीत." };
    }

    await dbQuery("DELETE FROM events WHERE id::text = $1", [id]);

    const targetSlug = existing.villageSlug || villageSlug;
    revalidatePath(`/${targetSlug}`);
    revalidatePath(`/${targetSlug}/events`);
    revalidatePath("/admin/events");
    revalidatePath("/admin/dashboard");

    return { success: true };
  } catch (err: any) {
    console.error("[deleteEvent] Error:", err);
    return { success: false, error: err.message || "हटवताना अडचण आली." };
  }
}

export async function toggleEventStatus(id: string, isActive: boolean, villageSlug = "komalwadi") {
  try {
    const session = await requireAdminSession();
    const existing = await queryOne("SELECT id, village_slug FROM events WHERE id::text = $1", [id]);
    if (!existing) {
      return { success: false, error: "घडामोड सापडली नाही." };
    }
    if (session.role !== "SUPER_ADMIN" && existing.villageSlug?.toLowerCase() !== session.villageSlug.toLowerCase()) {
      return { success: false, error: "प्रवेश नाकारला: अधिकार नाहीत." };
    }

    await dbQuery("UPDATE events SET is_active = $1, updated_at = NOW() WHERE id::text = $2", [isActive, id]);

    const targetSlug = existing.villageSlug || villageSlug;
    revalidatePath(`/${targetSlug}`);
    revalidatePath(`/${targetSlug}/events`);
    revalidatePath("/admin/events");

    return { success: true };
  } catch (err: any) {
    console.error("[toggleEventStatus] Error:", err);
    return { success: false, error: err.message || "स्थिती बदलताना अडचण आली." };
  }
}

