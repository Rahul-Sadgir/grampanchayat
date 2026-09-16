"use server";

import { connectDB } from "@/lib/mongodb";
import { Service } from "@/models/Service";
import { Form } from "@/models/Form";
import { Village } from "@/models/Village";
import { uploadFileBuffer } from "@/lib/cloudinary";
import { getVillageBySlug, FALLBACK_SERVICES } from "@/lib/data-provider";
import { revalidatePath } from "next/cache";

export async function getServicesAdmin(villageSlug?: string, tabCategory?: string) {
  try {
    await connectDB();

    const query: any = {};
    if (villageSlug && villageSlug !== "ALL") {
      query.villageSlug = villageSlug;
    }
    if (tabCategory && tabCategory !== "ALL") {
      query.tabCategory = tabCategory;
    }

    const services = await Service.find(query)
      .populate("villageId", "name slug")
      .sort({ order: 1, createdAt: -1 })
      .lean();

    return services.map((s: any) => ({
      ...s,
      _id: s._id.toString(),
      villageId: s.villageId?._id ? s.villageId._id.toString() : (s.villageId ? s.villageId.toString() : ""),
      villageName: s.villageId?.name || s.villageSlug || "—",
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
    await connectDB();

    const id = formData.get("id") as string | null;
    const villageSlug = (formData.get("villageSlug") as string) || "komalwadi";
    const name = (formData.get("name") as string)?.trim();
    const description = (formData.get("description") as string)?.trim() || "";
    const tabCategory = (formData.get("tabCategory") as any) || "aarz";
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
    const generatedSlug = (formData.get("slug") as string)?.trim() ||
      name.toLowerCase().replace(/[^a-z0-9]/gi, "-").replace(/-+/g, "-") ||
      `service-${Date.now()}`;

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

    if (id && id.match(/^[0-9a-fA-F]{24}$/)) {
      svc = await Service.findByIdAndUpdate(
        id,
        {
          villageId: dbVillage._id,
          villageSlug,
          name,
          slug: generatedSlug,
          description,
          category,
          tabCategory,
          icon,
          isPdfOnly,
          order,
          ...(fileUrl ? { fileUrl, fileName } : {}),
        },
        { new: true }
      );
    }

    if (!svc) {
      svc = await Service.create({
        villageId: dbVillage._id,
        villageSlug,
        name,
        slug: generatedSlug,
        description,
        category,
        tabCategory,
        icon,
        isPdfOnly,
        order,
        fileUrl,
        fileName,
        isActive: true,
      });

      // If online service form, create default base form in Form collection
      if (!isPdfOnly) {
        await Form.create({
          serviceId: svc._id,
          villageId: dbVillage._id,
          version: 1,
          isActive: true,
          schema: {
            serviceName: name,
            category: tabCategory,
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
          },
        });
      }
    }

    revalidatePath("/admin/services");
    revalidatePath(`/${villageSlug}`);
    revalidatePath(`/${villageSlug}/services`);

    return {
      success: true,
      service: JSON.parse(JSON.stringify(svc)),
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
    await connectDB();
    const villageId = formData.get("villageId") as string;
    const name = formData.get("name") as string;
    const slug = formData.get("slug") as string;
    const category = formData.get("category") as string;
    const description = formData.get("description") as string;
    const fieldsJson = formData.get("fieldsJson") as string;

    const village = await Village.findById(villageId).lean();
    const villageSlug = village ? village.slug : "gulwanch";

    let fields = [];
    try {
      fields = JSON.parse(fieldsJson);
    } catch {
      fields = [
        { name: "applicantFullName", label: "अर्जदाराचे पूर्ण नाव", type: "text", required: true },
      ];
    }

    const svc = await Service.create({
      villageId,
      villageSlug,
      name,
      slug,
      category,
      tabCategory: "aarz",
      description,
      isPdfOnly: false,
      isActive: true,
    });

    await Form.create({
      serviceId: svc._id,
      villageId,
      version: 1,
      isActive: true,
      schema: {
        serviceName: name,
        category,
        fields,
      },
    });

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
    await connectDB();
    const svc = await Service.findByIdAndDelete(id);
    if (svc) {
      await Form.deleteMany({ serviceId: id });
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
    await connectDB();
    let svc: any = null;
    if (id && id.match(/^[0-9a-fA-F]{24}$/)) {
      svc = await Service.findByIdAndUpdate(id, { isActive }, { new: true });
    }
    if (!svc) {
      const fallback: any = FALLBACK_SERVICES.find((f: any) => f._id === id || f.slug === id);
      const defaultVillage = await Village.findOne({});
      if (fallback && defaultVillage) {
        svc = await Service.create({
          villageId: defaultVillage._id,
          villageSlug: defaultVillage.slug,
          name: fallback.name,
          slug: fallback.slug,
          description: fallback.description,
          category: fallback.category,
          tabCategory: fallback.tabCategory || "aarz",
          isPdfOnly: fallback.isPdfOnly || false,
          fileUrl: fallback.fileUrl || "",
          fileName: fallback.fileName || "",
          order: fallback.order || 0,
          isActive,
        });
      }
    }
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