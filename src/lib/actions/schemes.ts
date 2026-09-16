"use server";

import { connectDB } from "@/lib/mongodb";
import { Scheme } from "@/models/Scheme";
import { uploadFileBuffer } from "@/lib/cloudinary";
import { FALLBACK_SCHEMES } from "@/lib/data-provider";
import { revalidatePath } from "next/cache";

export async function getSchemesAdmin() {
  try {
    await connectDB();
    let schemes = await Scheme.find()
      .sort({ createdAt: -1 })
      .lean();

    if (schemes.length === 0) {
      const docs = FALLBACK_SCHEMES.map((s) => ({
        villageSlug: "ALL",
        slug: s.slug,
        title: s.title,
        category: s.category,
        imageUrl: s.imageUrl,
        description: s.description,
        subsidyDetails: s.subsidyDetails,
        targetAudience: s.targetAudience,
        benefits: s.benefits,
        eligibility: s.eligibility,
        documentsRequired: s.documentsRequired,
        applicationProcess: s.applicationProcess,
        content: s.content,
        faq: s.faq,
        externalLink: s.externalLink,
        isActive: true,
      }));

      if (docs.length > 0) {
        await Scheme.insertMany(docs);
        schemes = await Scheme.find().sort({ createdAt: -1 }).lean();
      }
    }

    return JSON.parse(JSON.stringify(schemes));
  } catch (error) {
    console.error("Error in getSchemesAdmin:", error);
    return [];
  }
}

export async function saveScheme(formData: FormData) {
  try {
    await connectDB();

    const id = formData.get("id") as string | null;
    let slug = (formData.get("slug") as string)?.trim().toLowerCase();
    const title = (formData.get("title") as string)?.trim();
    const category = (formData.get("category") as string)?.trim();
    const description = (formData.get("description") as string)?.trim();
    const subsidyDetails = (formData.get("subsidyDetails") as string)?.trim();
    const targetAudience = (formData.get("targetAudience") as string)?.trim();
    const eligibility = (formData.get("eligibility") as string)?.trim();
    const documentsRequired = (formData.get("documentsRequired") as string)?.trim();
    const applicationProcess = (formData.get("applicationProcess") as string)?.trim();
    const content = (formData.get("content") as string)?.trim();
    const externalLink = (formData.get("externalLink") as string)?.trim();
    const benefitsStr = (formData.get("benefitsStr") as string)?.trim();

    const imageFile = formData.get("image") as File | null;
    const attachmentFile = formData.get("attachment") as File | null;

    if (!title || !category || !description) {
      return { success: false, error: "कृपया सर्व आवश्यक माहिती भरा." };
    }

    if (!slug) {
      slug = `scheme-${Date.now()}`;
    }

    let imageUrl = (formData.get("existingImageUrl") as string) || "/images/schemes/pmay-gharkul.jpg";
    if (imageFile && imageFile.size > 0 && typeof imageFile.arrayBuffer === "function") {
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      const uploadRes = await uploadFileBuffer(buffer, {
        folder: "schemes",
        filename: imageFile.name,
        resourceType: "image",
      });
      imageUrl = uploadRes.url;
    }

    let attachmentUrl = (formData.get("existingAttachmentUrl") as string) || undefined;
    let attachmentName = (formData.get("existingAttachmentName") as string) || undefined;

    if (attachmentFile && attachmentFile.size > 0 && typeof attachmentFile.arrayBuffer === "function") {
      const buffer = Buffer.from(await attachmentFile.arrayBuffer());
      const uploadRes = await uploadFileBuffer(buffer, {
        folder: "schemes/circulars",
        filename: attachmentFile.name,
        resourceType: "raw",
      });
      attachmentUrl = uploadRes.url;
      attachmentName = attachmentFile.name;
    }

    const benefits = benefitsStr
      ? benefitsStr.split("\n").map((b) => b.trim()).filter(Boolean)
      : undefined;

    // Schemes are universal and common for all villages
    const payload = {
      villageSlug: "ALL",
      slug,
      title,
      category,
      imageUrl,
      description,
      subsidyDetails: subsidyDetails || undefined,
      targetAudience: targetAudience || undefined,
      benefits,
      eligibility: eligibility || "सर्व पात्र नागरिक",
      documentsRequired: documentsRequired || "आधार कार्ड, बँक पासबुक",
      applicationProcess: applicationProcess || "ग्रामपंचायतीमध्ये संपर्क साधावा किंवा महाडीबीटी पोर्टलद्वारे अर्ज करावा.",
      content: content || description,
      externalLink: externalLink || undefined,
      attachmentUrl,
      attachmentName,
      isActive: true,
    };

    let updatedScheme = null;
    if (id && id.match(/^[0-9a-fA-F]{24}$/)) {
      updatedScheme = await Scheme.findByIdAndUpdate(id, payload, { new: true });
    }
    if (!updatedScheme) {
      updatedScheme = await Scheme.findOneAndUpdate({ slug }, payload, { upsert: true, new: true });
    }

    revalidatePath("/admin/schemes");
    revalidatePath("/admin/dashboard");
    revalidatePath("/[villageSlug]", "layout");

    return {
      success: true,
      scheme: JSON.parse(JSON.stringify(updatedScheme)),
    };
  } catch (error: any) {
    console.error("Error in saveScheme:", error);
    return { success: false, error: error.message || "योजना जतन करताना त्रुटी आली." };
  }
}

export async function deleteScheme(schemeId: string) {
  try {
    await connectDB();
    await Scheme.findByIdAndDelete(schemeId);

    revalidatePath("/admin/schemes");
    revalidatePath("/admin/dashboard");
    revalidatePath("/[villageSlug]", "layout");
    return { success: true };
  } catch (error: any) {
    console.error("Error in deleteScheme:", error);
    return { success: false, error: error.message || "हटवताना त्रुटी आली." };
  }
}

export async function toggleSchemeStatus(schemeId: string) {
  try {
    await connectDB();
    let scheme = null;
    if (schemeId && schemeId.match(/^[0-9a-fA-F]{24}$/)) {
      scheme = await Scheme.findById(schemeId);
    }

    if (!scheme) {
      const fallback = FALLBACK_SCHEMES.find((s) => s._id === schemeId || s.slug === schemeId);
      if (fallback) {
        scheme = await Scheme.create({
          ...fallback,
          villageSlug: "ALL",
          isActive: false,
        });
      }
    }

    if (!scheme) return { success: false, error: "योजना सापडली नाही." };

    scheme.isActive = !scheme.isActive;
    await scheme.save();

    revalidatePath("/admin/schemes");
    revalidatePath("/admin/dashboard");
    revalidatePath("/[villageSlug]", "layout");
    return { success: true, isActive: scheme.isActive };
  } catch (error: any) {
    console.error("Error in toggleSchemeStatus:", error);
    return { success: false, error: error.message };
  }
}

export async function seedDefaultSchemes() {
  try {
    await connectDB();
    const existing = await Scheme.countDocuments();

    if (existing > 0) {
      return { success: false, error: "शासकीय योजना डेटाबेसमध्ये आधीच उपलब्ध आहेत." };
    }

    const docs = FALLBACK_SCHEMES.map((s) => ({
      villageSlug: "ALL",
      slug: s.slug,
      title: s.title,
      category: s.category,
      imageUrl: s.imageUrl,
      description: s.description,
      subsidyDetails: s.subsidyDetails,
      targetAudience: s.targetAudience,
      benefits: s.benefits,
      eligibility: s.eligibility,
      documentsRequired: s.documentsRequired,
      applicationProcess: s.applicationProcess,
      content: s.content,
      faq: s.faq,
      externalLink: s.externalLink,
      isActive: true,
    }));

    await Scheme.insertMany(docs);

    revalidatePath("/admin/schemes");
    revalidatePath("/admin/dashboard");
    revalidatePath("/[villageSlug]", "layout");

    return { success: true, count: docs.length };
  } catch (error: any) {
    console.error("Error seeding schemes:", error);
    return { success: false, error: error.message };
  }
}
