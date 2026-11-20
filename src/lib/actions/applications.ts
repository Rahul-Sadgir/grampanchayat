"use server";

import { queryOne, queryMany, dbQuery } from "@/lib/db";
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

export interface IDocumentMeta {
  documentName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  uploadedAt: Date;
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
    // 1. Validate slugs against path traversal & injection
    const SLUG_REGEX = /^[a-z0-9_-]{1,64}$/i;
    const safeVillageSlug = SLUG_REGEX.test(villageSlug) ? villageSlug.toLowerCase() : "komalwadi";
    const safeServiceSlug = SLUG_REGEX.test(serviceSlug) ? serviceSlug.toLowerCase() : "";

    if (!safeServiceSlug) {
      return { success: false, error: "अवैध किंवा अनुपलब्ध सेवेचा प्रकार." };
    }

    const applicantName = (formDataPayload.get("applicantName") as string)?.trim() || "";
    let mobileNumber = (formDataPayload.get("mobileNumber") as string)?.trim() || "";
    const email = (formDataPayload.get("email") as string)?.trim() || "";
    const address = (formDataPayload.get("address") as string)?.trim() || "";

    // 2. Enforce strict input bounds (DoS & ReDoS prevention)
    if (applicantName.length > 200) {
      return { success: false, error: "अर्जदाराचे नाव कमाल २०० अक्षरांचे असावे." };
    }
    if (email && email.length > 254) {
      return { success: false, error: "ईमेल कमाल २५४ अक्षरांचा असावा." };
    }
    if (address.length > 1000) {
      return { success: false, error: "पत्ता कमाल १००० अक्षरांचा असावा." };
    }

    // Normalize Marathi numerals to English digits
    const marathiDigits = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"];
    marathiDigits.forEach((d, idx) => {
      mobileNumber = mobileNumber.replaceAll(d, String(idx));
    });
    mobileNumber = mobileNumber.replace(/\D/g, "");
    if (mobileNumber.startsWith("91") && mobileNumber.length === 12) {
      mobileNumber = mobileNumber.substring(2);
    }

    if (!applicantName) {
      return { success: false, error: "कृपया अर्जदाराचे संपूर्ण नाव प्रविष्ट करा." };
    }

    if (!mobileNumber || mobileNumber.length !== 10) {
      return { success: false, error: "कृपया वैध १० अंकी मोबाईल क्रमांक प्रविष्ट करा." };
    }

    if (!address) {
      return { success: false, error: "कृपया अर्जदाराचा संपूर्ण पत्ता प्रविष्ट करा." };
    }

    // Connect to PostgreSQL and fetch village, service, and form
    let village: any = null;
    let service: any = null;
    let activeForm: any = null;
    let formConfig: FormSchemaDefinition | null = null;

    try {
      village = await queryOne(
        "SELECT * FROM villages WHERE LOWER(slug) = LOWER($1)",
        [villageSlug]
      );

      if (!village) {
        village = await queryOne("SELECT * FROM villages LIMIT 1");
      }

      if (village) {
        service = await queryOne(
          `SELECT * FROM services 
           WHERE LOWER(slug) = LOWER($1) 
             AND (village_id = $2 OR LOWER(village_slug) = LOWER($3))
             AND is_active = true`,
          [serviceSlug, village.id, villageSlug]
        );

        if (!service) {
          service = await queryOne(
            "SELECT * FROM services WHERE LOWER(slug) = LOWER($1) AND is_active = true LIMIT 1",
            [serviceSlug]
          );
        }

        if (service) {
          activeForm = await queryOne(
            `SELECT * FROM forms 
             WHERE service_id = $1 AND is_active = true 
             ORDER BY version DESC LIMIT 1`,
            [service.id]
          );
          if (activeForm && activeForm.schema) {
            formConfig =
              typeof activeForm.schema === "string"
                ? JSON.parse(activeForm.schema)
                : activeForm.schema;
          }
        }
      }
    } catch (dbErr) {
      console.warn("[Applications] Database lookup failed, using fallback:", dbErr);
    }

    // Fallback schema if not found in DB
    if (!formConfig) {
      const fallbackData = await getServiceAndForm(village?.id || villageSlug, serviceSlug);
      formConfig = fallbackData.schema;
      if (!service && fallbackData.service) {
        service = fallbackData.service;
      }
    }

    if (!village) {
      village = await queryOne("SELECT * FROM villages LIMIT 1");
    }

    const dynamicData: Record<string, any> = {};
    const uploadedDocuments: IDocumentMeta[] = [];

    // Ensure upload directory exists for local fallback with directory traversal containment
    const uploadDir = path.resolve(process.cwd(), "public", "uploads", "applications", safeVillageSlug);
    const parentUploadDir = path.resolve(process.cwd(), "public", "uploads", "applications");
    if (uploadDir.startsWith(parentUploadDir)) {
      try {
        await fs.mkdir(uploadDir, { recursive: true });
      } catch {}
    }

    if (formConfig && formConfig.fields) {
      for (const field of formConfig.fields) {
        if (
          field.name === "applicantName" ||
          field.name === "mobileNumber" ||
          field.name === "email" ||
          field.name === "address"
        ) {
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

            // Sanitize filename to prevent directory traversal
            const safeFileName = (file.name || "document.pdf").replace(/[^a-zA-Z0-9._-]/g, "_");

            const buffer = Buffer.from(await file.arrayBuffer());
            const uploadResult = await uploadFileBuffer(buffer, {
              folder: `applications/${safeVillageSlug}`,
              filename: safeFileName,
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

    // Generate unique Application ID: KOM-CONST-2026-000001
    const prefix = (village.slug || villageSlug).substring(0, 3).toUpperCase();
    const serviceCode = (service?.slug || serviceSlug).substring(0, 5).toUpperCase();
    let sequence = "000001";

    try {
      const countRes = await queryOne(
        "SELECT COUNT(*) as count FROM applications WHERE LOWER(village_slug) = LOWER($1)",
        [villageSlug]
      );
      const totalCount = Number(countRes?.count || 0);
      sequence = String(totalCount + 1).padStart(6, "0");
    } catch {
      sequence = String(Math.floor(100000 + Math.random() * 900000));
    }

    const applicationNumber = `${prefix}-${serviceCode}-2026-${sequence}`;

    // Insert into PostgreSQL
    const insertRes = await dbQuery(
      `INSERT INTO applications (
        application_number, village_id, service_id, form_id,
        service_name, service_slug, village_slug,
        applicant_name, mobile_number, email, address,
        form_data, documents, status, submitted_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW())
      RETURNING id, application_number`,
      [
        applicationNumber,
        village.id,
        service?.id || null,
        activeForm?.id || null,
        service?.name || "नागरी सेवा अर्ज",
        serviceSlug,
        villageSlug,
        applicantName,
        mobileNumber,
        email,
        address,
        JSON.stringify(dynamicData),
        JSON.stringify(uploadedDocuments),
        "SUBMITTED",
      ]
    );

    console.log(
      `[Applications] Application ${applicationNumber} saved successfully to PostgreSQL. Record ID:`,
      insertRes.rows[0]?.id
    );

    try {
      revalidatePath(`/${villageSlug}/services`);
      revalidatePath("/admin/applications");
      revalidatePath("/admin/dashboard");
    } catch {}

    return {
      success: true,
      applicationNumber,
      applicantName,
      serviceName: service?.name || "ऑनलाइन अर्ज",
      submittedAt: new Date().toLocaleDateString("mr-IN"),
    };
  } catch (err: any) {
    console.error("[Applications] Submission error:", err);
    return {
      success: false,
      error: err.message || "अर्ज पाठवताना समस्या आली. कृपया पुन्हा प्रयत्न करा.",
    };
  }
}
