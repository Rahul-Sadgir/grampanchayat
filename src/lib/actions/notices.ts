"use server";

import { connectDB } from "@/lib/mongodb";
import { Notice } from "@/models/Notice";
import { Village } from "@/models/Village";
import { uploadFileBuffer } from "@/lib/cloudinary";
import { getVillageBySlug, FALLBACK_NOTICES } from "@/lib/data-provider";
import { revalidatePath } from "next/cache";

export async function getNoticesAdmin(villageSlug?: string) {
  try {
    await connectDB();

    // Backfill any existing notices without villageSlug
    const missingSlugNotices = await Notice.find({
      $or: [{ villageSlug: { $exists: false } }, { villageSlug: null }, { villageSlug: "" }],
    }).populate("villageId", "slug");

    for (const n of missingSlugNotices) {
      if ((n.villageId as any)?.slug) {
        await Notice.findByIdAndUpdate(n._id, {
          villageSlug: (n.villageId as any).slug,
        });
      }
    }

    const query: any = {};
    if (villageSlug && villageSlug !== "ALL") {
      query.$or = [{ villageSlug }, { "villageId.slug": villageSlug }];
    }

    let notices = await Notice.find(query)
      .populate("villageId", "name slug")
      .sort({ isImportant: -1, publishedAt: -1 })
      .lean();

    // Auto-seed if database is empty so admins can edit/toggle right away
    if (notices.length === 0) {
      let defaultVillage = await Village.findOne({});
      if (!defaultVillage) {
        defaultVillage = await Village.create({
          name: "कोमलवाडी",
          slug: "komalwadi",
          district: "नाशिक",
          taluka: "सिन्नर",
          state: "महाराष्ट्र",
          primaryColor: "#003625",
          secondaryColor: "#9e4300",
        });
      }

      const docs = FALLBACK_NOTICES.map((f, idx) => ({
        villageId: defaultVillage._id,
        villageSlug: defaultVillage.slug,
        title: f.title,
        content: f.content,
        category: "जाहिर सूचना",
        isImportant: idx === 0, // default first notice as important
        publishedAt: f.publishedAt || new Date(),
        isActive: true,
      }));

      await Notice.insertMany(docs);

      notices = await Notice.find(query)
        .populate("villageId", "name slug")
        .sort({ isImportant: -1, publishedAt: -1 })
        .lean();
    }

    return notices.map((n: any) => ({
      ...n,
      _id: n._id.toString(),
      villageId: n.villageId?._id ? n.villageId._id.toString() : (n.villageId ? n.villageId.toString() : ""),
      villageName: n.villageId?.name || n.villageSlug || "—",
      villageSlug: n.villageSlug || n.villageId?.slug || "",
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
    await connectDB();

    const id = formData.get("id") as string | null;
    const villageSlug = (formData.get("villageSlug") as string) || "komalwadi";
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
    let documentUrl = (formData.get("documentUrl") as string) || "";
    let fileName = (formData.get("fileName") as string) || "";

    if (!title || !content) {
      return { success: false, error: "कृपया शीर्षक आणि मजकूर प्रविष्ट करा." };
    }

    let dbVillage = await Village.findOne({ slug: villageSlug });
    if (!dbVillage) {
      const vData = await getVillageBySlug(villageSlug);
      if (vData) {
        dbVillage = await Village.create({
          name: vData.name,
          slug: vData.slug,
          district: vData.district,
          taluka: vData.taluka,
          state: "महाराष्ट्र",
          primaryColor: "#003625",
          secondaryColor: "#9e4300",
        });
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
      documentUrl = uploadRes.url;
      fileName = docFile.name;
    }

    let notice: any = null;

    if (id && id.match(/^[0-9a-fA-F]{24}$/)) {
      notice = await Notice.findByIdAndUpdate(
        id,
        {
          villageId: dbVillage._id,
          villageSlug,
          title,
          content,
          category,
          isImportant,
          publishedAt,
          ...(documentUrl ? { documentUrl, fileName } : {}),
        },
        { new: true }
      );
    }

    // If notice was not in DB yet (or fallback ID was edited), create a fresh record in DB
    if (!notice) {
      notice = await Notice.create({
        villageId: dbVillage._id,
        villageSlug,
        title,
        content,
        category,
        isImportant,
        publishedAt,
        documentUrl,
        fileName,
        isActive: true,
      });
    }

    revalidatePath("/admin/notices");
    revalidatePath("/admin/dashboard");
    revalidatePath(`/${villageSlug}`);
    revalidatePath(`/${villageSlug}/notices`);

    const formattedNotice = {
      ...JSON.parse(JSON.stringify(notice)),
      _id: notice._id.toString(),
      villageId: dbVillage._id.toString(),
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
    await connectDB();
    const n = await Notice.findByIdAndDelete(id);
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
    await connectDB();
    let n: any = null;

    if (id && id.match(/^[0-9a-fA-F]{24}$/)) {
      n = await Notice.findByIdAndUpdate(id, { isImportant }, { new: true });
    }

    if (!n) {
      const fallback = FALLBACK_NOTICES.find((f: any) => f._id === id);
      const defaultVillage = await Village.findOne({});
      n = await Notice.create({
        villageId: defaultVillage?._id,
        villageSlug: defaultVillage?.slug || "komalwadi",
        title: fallback?.title || "ग्रामपंचायत जाहीर सूचना",
        content: fallback?.content || "ग्रामपंचायत अधिकृत सूचना",
        category: "जाहिर सूचना",
        isImportant,
        publishedAt: fallback?.publishedAt || new Date(),
        isActive: true,
      });
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
      notice: JSON.parse(JSON.stringify(n)),
    };
  } catch (error: any) {
    console.error("[toggleNoticeImportant] Error:", error);
    return { success: false, error: error.message };
  }
}
