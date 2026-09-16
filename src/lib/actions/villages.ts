"use server";

import { connectDB } from "@/lib/mongodb";
import { Village } from "@/models/Village";
import { uploadFileBuffer } from "@/lib/cloudinary";
import { revalidatePath } from "next/cache";

export async function getVillagesAdmin() {
  try {
    await connectDB();
    const villages = await Village.find().sort({ name: 1 }).lean();
    return JSON.parse(JSON.stringify(villages));
  } catch (error) {
    console.error("Error in getVillagesAdmin:", error);
    return [];
  }
}

export async function updateVillageAction(formData: FormData) {
  try {
    await connectDB();

    const id = formData.get("id") as string;
    const phone = (formData.get("phone") as string)?.trim();
    const email = (formData.get("email") as string)?.trim();
    const address = (formData.get("address") as string)?.trim();
    const description = (formData.get("description") as string)?.trim();

    if (!id) {
      return { success: false, error: "गाव ओळखता आले नाही." };
    }

    let updated = null;
    if (id && id.match(/^[0-9a-fA-F]{24}$/)) {
      updated = await Village.findByIdAndUpdate(
        id,
        {
          phone,
          email,
          address,
          description,
        },
        { new: true }
      );
    }

    if (!updated) {
      const fallback = (await import("@/lib/data-provider")).FALLBACK_VILLAGES.find(
        (v) => v._id === id || v.slug === id
      );
      if (fallback) {
        updated = await Village.create({
          ...fallback,
          phone,
          email,
          address,
          description,
        });
      }
    }

    if (!updated) {
      return { success: false, error: "गाव डेटाबेसमध्ये सापडले नाही." };
    }

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
    await connectDB();
    if (!villageId) {
      return { success: false, error: "गाव ओळखता आले नाही." };
    }

    let updated = null;
    if (villageId && villageId.match(/^[0-9a-fA-F]{24}$/)) {
      updated = await Village.findByIdAndUpdate(
        villageId,
        { galleryImages },
        { new: true }
      );
    }

    if (!updated) {
      const fallback = (await import("@/lib/data-provider")).FALLBACK_VILLAGES.find(
        (v) => v._id === villageId || v.slug === villageId
      );
      if (fallback) {
        updated = await Village.create({
          ...fallback,
          galleryImages,
        });
      }
    }

    if (!updated) {
      return { success: false, error: "गाव डेटाबेसमध्ये सापडले नाही." };
    }

    revalidatePath("/admin/villages");
    revalidatePath("/admin/dashboard");
    revalidatePath(`/${updated.slug}`);
    revalidatePath(`/${updated.slug}/about`);

    return {
      success: true,
      village: JSON.parse(JSON.stringify(updated)),
    };
  } catch (error: any) {
    console.error("Error in updateVillageGalleryAction:", error);
    return {
      success: false,
      error: error.message || "छायाचित्रे जतन करताना त्रुटी आली.",
    };
  }
}

export async function uploadVillageGalleryImage(formData: FormData) {
  try {
    const file = formData.get("file") as File | null;
    const villageSlug = (formData.get("villageSlug") as string) || "village";

    if (!file || file.size === 0) {
      return { success: false, error: "कृपया वैध छायाचित्र निवडा." };
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const uploadRes = await uploadFileBuffer(buffer, {
      folder: `villages/${villageSlug}/gallery`,
      filename: file.name,
      resourceType: "image",
    });

    return { success: true, url: uploadRes.url };
  } catch (error: any) {
    console.error("Error in uploadVillageGalleryImage:", error);
    return { success: false, error: error.message || "छायाचित्र अपलोड करताना त्रुटी आली." };
  }
}