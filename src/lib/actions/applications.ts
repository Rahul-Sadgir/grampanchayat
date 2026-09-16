"use server";

import { connectDB } from "@/lib/mongodb";
import { Village } from "@/models/Village";
import { Service } from "@/models/Service";
import { Form } from "@/models/Form";
import { Application, IDocumentMeta } from "@/models/Application";
import { FormSchemaDefinition } from "@/types/form";
import { getServiceAndForm, getVillageBySlug } from "@/lib/data-provider";
import { revalidatePath } from "next/cache";
import fs from "fs/promises";
import path from "path";

import { uploadFileBuffer } from "@/lib/cloudinary";

export interface SubmitResult {
  success: boolean;
  applicationNumber?: string;
  applicantName?: string;
  serviceName?: string;
  submittedAt?: string;
  error?: string;
}

const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export async function submitCitizenApplication(
  villageSlug: string,
  serviceSlug: string,
  formDataPayload: FormData
): Promise<SubmitResult> {
  try {
    const applicantName = (formDataPayload.get("applicantName") as string)?.trim();
    const mobileNumber = (formDataPayload.get("mobileNumber") as string)?.trim();
    const email = (formDataPayload.get("email") as string)?.trim() || "";
    const address = (formDataPayload.get("address") as string)?.trim();

    if (!applicantName) {
      return { success: false, error: "कृपया अर्जदाराचे संपूर्ण नाव प्रविष्ट करा." };
    }

    if (!mobileNumber || !/^[0-9]{10}$/.test(mobileNumber)) {
      return { success: false, error: "कृपया वैध १० अंकी मोबाईल क्रमांक प्रविष्ट करा." };
    }

    if (!address) {
      return { success: false, error: "कृपया अर्जदाराचा संपूर्ण पत्ता प्रविष्ट करा." };
    }

    // Connect to DB and fetch village and service
    let village: any = null;
    let service: any = null;
    let activeForm: any = null;
    let formConfig: FormSchemaDefinition | null = null;

    try {
      const conn = await connectDB();
      if (conn) {
        village = await Village.findOne({ slug: villageSlug });
        if (village) {
          service = await Service.findOne({
            villageId: village._id,
            slug: serviceSlug,
            isActive: true,
          });
          if (service) {
            activeForm = await Form.findOne({
              serviceId: service._id,
              isActive: true,
            }).sort({ version: -1 });
            if (activeForm) {
              formConfig = activeForm.schema as FormSchemaDefinition;
            }
          }
        }
      }
    } catch (dbErr) {
      console.warn("[Applications] Database lookup failed, using fallback schema provider:", dbErr);
    }

    // Fallback schema if not found in DB
    if (!formConfig) {
      const fallbackData = await getServiceAndForm(village?._id || villageSlug, serviceSlug);
      formConfig = fallbackData.schema;
      if (!service && fallbackData.service) {
        service = fallbackData.service;
      }
    }

    if (!village) {
      const fallbackVillage = await getVillageBySlug(villageSlug);
      village = fallbackVillage || { _id: "65f000000000000000000001", slug: villageSlug, name: villageSlug };
    }

    const dynamicData: Record<string, any> = {};
    const uploadedDocuments: IDocumentMeta[] = [];

    // Ensure upload directory exists
    const uploadDir = path.join(process.cwd(), "public", "uploads", "applications", villageSlug);
    await fs.mkdir(uploadDir, { recursive: true });

    if (formConfig && formConfig.fields) {
      for (const field of formConfig.fields) {
        if (field.name === "applicantName" || field.name === "mobileNumber" || field.name === "email" || field.name === "address") {
          continue;
        }

        if (field.type === "file") {
          const file = formDataPayload.get(field.name) as File | null;

          if (file && typeof file === "object" && file.size > 0) {
            if (file.size > MAX_FILE_SIZE_BYTES) {
              return {
                success: false,
                error: `${field.label} फाईल आकाराची मर्यादा ५ MB आहे. कृपया लहान फाईल जोडा.`,
              };
            }

            const fileExt = path.extname(file.name || "").toLowerCase();
            const mimeType = file.type || "application/octet-stream";

            if (
              !ALLOWED_MIME_TYPES.has(mimeType) &&
              ![".pdf", ".jpg", ".jpeg", ".png", ".webp"].includes(fileExt)
            ) {
              return {
                success: false,
                error: `${field.label} साठी केवळ PDF, JPG किंवा PNG फॉरमॅट अनुज्ञेय आहे.`,
              };
            }

            const buffer = Buffer.from(await file.arrayBuffer());
            const uploadResult = await uploadFileBuffer(buffer, {
              folder: `applications/${villageSlug}`,
              filename: file.name || "document.pdf",
              resourceType: "auto",
            });

            const publicUrl = uploadResult.url;

            const docMeta: IDocumentMeta = {
              documentName: field.label,
              fileUrl: publicUrl,
              fileType: mimeType,
              fileSize: file.size,
              uploadedAt: new Date(),
            };

            uploadedDocuments.push(docMeta);
            dynamicData[field.name] = {
              fileName: file.name,
              url: publicUrl,
              size: file.size,
            };
          } else if (field.required) {
            return {
              success: false,
              error: `कृपया ${field.label} कागदपत्र अपलोड करा.`,
            };
          }
        } else {
          const val = (formDataPayload.get(field.name) as string)?.trim();
          if (field.required && !val) {
            return { success: false, error: `${field.label} भरणे आवश्यक आहे.` };
          }
          dynamicData[field.name] = val || "";
        }
      }
    }

    // Generate unique Application ID: GUL-CONST-2026-000001
    const prefix = (village.slug || villageSlug).substring(0, 3).toUpperCase();
    const serviceCode = (service?.slug || serviceSlug).substring(0, 5).toUpperCase();
    let sequence = "000001";

    try {
      const conn = await connectDB();
      if (conn) {
        const totalCount = await Application.countDocuments({ villageId: village._id });
        sequence = String(totalCount + 1).padStart(6, "0");
      }
    } catch {
      sequence = String(Math.floor(100000 + Math.random() * 900000));
    }

    const applicationNumber = `${prefix}-${serviceCode}-2026-${sequence}`;

    try {
      const conn = await connectDB();
      if (conn) {
        // Ensure Village in DB
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
              address: `${vData.name}, ता. ${vData.taluka}, जि. ${vData.district}`,
              phone: vData.contactPhone || "0253-2223344",
              email: vData.contactEmail || `info@${vData.slug}.gov.in`,
              primaryColor: "#003625",
              secondaryColor: "#9e4300",
            });
          }
        }

        const vId = dbVillage ? dbVillage._id : village._id;

        // Ensure Service in DB if possible
        let dbService = await Service.findOne({ villageId: vId, slug: serviceSlug });
        if (!dbService && service?.name && vId) {
          try {
            dbService = await Service.create({
              villageId: vId,
              name: service.name,
              slug: serviceSlug,
              description: service.description || "नागरिक सेवा",
              category: service.category || "दाखले",
              icon: service.icon || "FileText",
              isActive: true,
            });
          } catch (svcErr) {
            console.warn("[Applications] Service creation warning:", svcErr);
          }
        }

        const sId = dbService ? dbService._id : (service?._id || undefined);

        await Application.create({
          applicationNumber,
          villageId: vId,
          serviceId: sId,
          formId: activeForm?._id || sId || undefined,
          serviceName: service?.name || "ऑनलाइन अर्ज",
          serviceSlug: serviceSlug,
          villageSlug: villageSlug,
          applicantName,
          mobileNumber,
          email,
          address,
          formData: dynamicData,
          documents: uploadedDocuments,
          status: "SUBMITTED",
          submittedAt: new Date(),
        });
      }
    } catch (saveErr) {
      console.warn("[Applications] Database record creation failed (fallback mode active):", saveErr);
    }

    revalidatePath(`/${villageSlug}/services`);
    revalidatePath("/admin/applications");
    revalidatePath("/admin/dashboard");

    return {
      success: true,
      applicationNumber,
      applicantName,
      serviceName: service?.name || "ऑनलाइन अर्ज",
      submittedAt: new Date().toLocaleDateString("mr-IN"),
    };
  } catch (err: any) {
    console.error("[Applications] Submission error:", err);
    return { success: false, error: err.message || "अर्ज पाठवताना समस्या आली. कृपया पुन्हा प्रयत्न करा." };
  }
}