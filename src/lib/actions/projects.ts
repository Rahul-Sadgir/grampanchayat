"use server";

import { connectDB } from "@/lib/mongodb";
import { Project } from "@/models/Project";
import { Village } from "@/models/Village";
import { uploadFileBuffer } from "@/lib/cloudinary";
import { FALLBACK_PROJECTS } from "@/lib/data-provider";
import { revalidatePath } from "next/cache";

export async function getProjectsAdmin(villageSlug?: string) {
  try {
    await connectDB();
    let query: any = {};
    if (villageSlug && villageSlug !== "ALL") {
      const village = await Village.findOne({ slug: villageSlug }).lean();
      if (village) {
        query.$or = [{ villageId: village._id }, { villageSlug }];
      }
    }

    let projects = await Project.find(query)
      .populate("villageId", "name slug")
      .sort({ createdAt: -1 })
      .lean();

    if (projects.length === 0) {
      const defaultVillage = await Village.findOne({});
      if (defaultVillage) {
        const docs = FALLBACK_PROJECTS.map((p) => ({
          villageId: defaultVillage._id,
          villageSlug: defaultVillage.slug || "komalwadi",
          title: p.title,
          category: p.category,
          description: p.description,
          status: p.status as "PLANNED" | "ONGOING" | "COMPLETED",
          budget: p.budget,
          startDate: p.startDate,
          completionDate: p.completionDate,
          images: [],
        }));
        await Project.insertMany(docs);
        projects = await Project.find(query)
          .populate("villageId", "name slug")
          .sort({ createdAt: -1 })
          .lean();
      }
    }

    return JSON.parse(JSON.stringify(projects));
  } catch (error) {
    console.error("Error in getProjectsAdmin:", error);
    return [];
  }
}

export async function saveProject(formData: FormData) {
  try {
    await connectDB();

    const id = formData.get("id") as string | null;
    const villageId = formData.get("villageId") as string;
    const title = formData.get("title") as string;
    const category = formData.get("category") as string;
    const description = formData.get("description") as string;
    const status = (formData.get("status") as "PLANNED" | "ONGOING" | "COMPLETED") || "PLANNED";
    const budgetStr = formData.get("budget") as string;
    const year = formData.get("year") as string;
    const agency = formData.get("agency") as string;
    const location = formData.get("location") as string;
    const imageFile = formData.get("image") as File | null;

    if (!villageId || !title || !category || !description) {
      return { success: false, error: "कृपया सर्व आवश्यक माहिती भरा." };
    }

    const village = await Village.findById(villageId).lean();
    const villageSlug = village ? village.slug : "";

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

    const budget = budgetStr ? Number(budgetStr) : undefined;

    const payload = {
      villageId,
      villageSlug,
      title: title.trim(),
      category: category.trim(),
      description: description.trim(),
      status,
      budget,
      year: year ? year.trim() : undefined,
      agency: agency ? agency.trim() : undefined,
      location: location ? location.trim() : undefined,
      images,
      startDate: status !== "PLANNED" ? new Date() : undefined,
      completionDate: status === "COMPLETED" ? new Date() : undefined,
    };

    let updatedProject = null;
    if (id && id.match(/^[0-9a-fA-F]{24}$/)) {
      updatedProject = await Project.findByIdAndUpdate(id, payload, { new: true });
    }
    if (!updatedProject) {
      updatedProject = await Project.create(payload);
    }

    revalidatePath("/admin/projects");
    revalidatePath("/admin/dashboard");
    if (villageSlug) {
      revalidatePath(`/${villageSlug}`);
      revalidatePath(`/${villageSlug}/development`);
    }

    return {
      success: true,
      project: JSON.parse(JSON.stringify(updatedProject)),
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
    await connectDB();
    let updated: any = null;
    if (projectId && projectId.match(/^[0-9a-fA-F]{24}$/)) {
      updated = await Project.findByIdAndUpdate(
        projectId,
        {
          status: newStatus,
          completionDate: newStatus === "COMPLETED" ? new Date() : undefined,
        },
        { new: true }
      ).populate("villageId", "slug");
    }

    if (!updated) {
      const fallback = FALLBACK_PROJECTS.find((p: any) => p._id === projectId || p.title?.includes(projectId));
      const defaultVillage = await Village.findOne({});
      if (fallback && defaultVillage) {
        updated = await Project.create({
          villageId: defaultVillage._id,
          villageSlug: defaultVillage.slug,
          title: fallback.title,
          category: fallback.category,
          description: fallback.description,
          status: newStatus,
          budget: fallback.budget,
          startDate: newStatus !== "PLANNED" ? new Date() : undefined,
          completionDate: newStatus === "COMPLETED" ? new Date() : undefined,
          images: [],
        });
      }
    }

    revalidatePath("/admin/projects");
    revalidatePath("/admin/dashboard");
    if (updated?.villageId) {
      const vSlug = (updated.villageId as any).slug || updated.villageSlug;
      if (vSlug) {
        revalidatePath(`/${vSlug}`);
        revalidatePath(`/${vSlug}/development`);
      }
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error in updateProjectStatus:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteProject(projectId: string) {
  try {
    await connectDB();
    await Project.findByIdAndDelete(projectId);

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
    await connectDB();
    const existing = await Project.countDocuments({
      $or: [{ villageId }, { villageSlug }],
    });

    if (existing > 0) {
      return { success: false, error: "या गावासाठी आधीच विकासकामे नोंदवलेली आहेत." };
    }

    const docs = FALLBACK_PROJECTS.map((p) => ({
      villageId,
      villageSlug,
      title: p.title,
      category: p.category,
      description: p.description,
      status: p.status as "PLANNED" | "ONGOING" | "COMPLETED",
      budget: p.budget,
      startDate: p.startDate,
      completionDate: p.completionDate,
      images: [],
    }));

    await Project.insertMany(docs);

    revalidatePath("/admin/projects");
    revalidatePath("/admin/dashboard");
    revalidatePath(`/${villageSlug}`);
    revalidatePath(`/${villageSlug}/development`);

    return { success: true, count: docs.length };
  } catch (error: any) {
    console.error("Error seeding projects:", error);
    return { success: false, error: error.message };
  }
}
