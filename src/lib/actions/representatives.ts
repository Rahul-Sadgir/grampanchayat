"use server";

import { connectDB } from "@/lib/mongodb";
import { Representative } from "@/models/Representative";
import { Village } from "@/models/Village";
import { uploadFileBuffer } from "@/lib/cloudinary";
import { getVillageBySlug, getVillageDetailsData } from "@/lib/data-provider";
import { revalidatePath } from "next/cache";

export async function getRepresentativesByVillage(villageSlug?: string) {
  try {
    await connectDB();

    let query: any = { isActive: true };
    if (villageSlug && villageSlug !== "ALL") {
      query.villageSlug = villageSlug;
    }

    const reps = await Representative.find(query).sort({ order: 1, createdAt: 1 }).lean();

    // If empty and villageSlug provided, auto-seed from static data
    if (reps.length === 0 && villageSlug && villageSlug !== "ALL") {
      await seedDefaultRepresentatives(villageSlug);
      return await Representative.find(query).sort({ order: 1, createdAt: 1 }).lean();
    }

    return reps.map((r: any) => ({
      ...r,
      _id: r._id.toString(),
      villageId: r.villageId ? r.villageId.toString() : "",
    }));
  } catch (error) {
    console.error("[getRepresentativesByVillage] Error:", error);
    return [];
  }
}

export async function seedDefaultRepresentatives(villageSlug: string) {
  try {
    await connectDB();
    const count = await Representative.countDocuments({ villageSlug });
    if (count > 0) return;

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

    if (!dbVillage) return;

    const details = getVillageDetailsData(villageSlug);
    const staticReps = details?.representatives || [];

    const docs = staticReps.map((rep, idx) => ({
      villageId: dbVillage._id,
      villageSlug,
      name: rep.name,
      role: rep.role,
      phone: rep.phone || "",
      email: rep.email || "",
      ward: rep.ward || "",
      photoUrl: rep.photoUrl || "",
      isSarpanch: rep.isSarpanch || rep.role === "सरपंच",
      isUpasarpanch: rep.isUpasarpanch || rep.role === "उपसरपंच",
      order: idx,
      isActive: true,
      term: "२०२२ - २०२७",
    }));

    if (docs.length > 0) {
      await Representative.insertMany(docs);
    }
  } catch (err) {
    console.warn("[seedDefaultRepresentatives] Warning:", err);
  }
}

export interface SaveRepresentativeResult {
  success: boolean;
  error?: string;
  representative?: any;
}

export async function saveRepresentative(formData: FormData): Promise<SaveRepresentativeResult> {
  try {
    await connectDB();

    const id = formData.get("id") as string | null;
    const villageSlug = (formData.get("villageSlug") as string) || "gulwanch";
    const name = (formData.get("name") as string)?.trim();
    const role = (formData.get("role") as string)?.trim();
    const phone = (formData.get("phone") as string)?.trim() || "";
    const email = (formData.get("email") as string)?.trim() || "";
    const ward = (formData.get("ward") as string)?.trim() || "";
    const term = (formData.get("term") as string)?.trim() || "२०२२ - २०२७";
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

    if (id && id.match(/^[0-9a-fA-F]{24}$/)) {
      rep = await Representative.findByIdAndUpdate(
        id,
        {
          villageSlug,
          villageId: dbVillage._id,
          name,
          role,
          phone,
          email,
          ward,
          term,
          order,
          isSarpanch,
          isUpasarpanch,
          ...(photoUrl ? { photoUrl } : {}),
        },
        { new: true }
      );
    }

    if (!rep) {
      rep = await Representative.create({
        villageId: dbVillage._id,
        villageSlug,
        name,
        role,
        phone,
        email,
        ward,
        term,
        order,
        isSarpanch,
        isUpasarpanch,
        photoUrl,
        isActive: true,
      });
    }

    revalidatePath("/admin/representatives");
    revalidatePath(`/${villageSlug}`);
    revalidatePath(`/${villageSlug}/about`);

    return {
      success: true,
      representative: JSON.parse(JSON.stringify(rep)),
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
    await connectDB();
    const rep = await Representative.findByIdAndDelete(id);
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
