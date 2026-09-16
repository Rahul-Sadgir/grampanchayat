"use server";

import { connectDB } from "@/lib/mongodb";
import { Application } from "@/models/Application";
import "@/models/Village";
import "@/models/Service";
import { revalidatePath } from "next/cache";
import fs from "fs/promises";
import path from "path";

import { uploadFileBuffer } from "@/lib/cloudinary";

export async function updateApplicationStatus(
  applicationId: string,
  newStatus: string,
  adminNotes?: string
) {
  await connectDB();

  await Application.findByIdAndUpdate(applicationId, {
    status: newStatus,
    adminNotes: adminNotes ?? undefined,
    completedAt: newStatus === "COMPLETED" ? new Date() : undefined,
  });

  revalidatePath("/admin/applications");
  revalidatePath(`/admin/applications/${applicationId}`);
  revalidatePath("/admin/dashboard");
  return { success: true };
}

export interface SendResponseResult {
  success: boolean;
  error?: string;
  whatsappUrl?: string;
  messageText?: string;
  documentUrl?: string;
  documentName?: string;
  status?: string;
}

export async function sendApplicationWhatsAppResponse(
  applicationId: string,
  formData: FormData
): Promise<SendResponseResult> {
  try {
    await connectDB();

    const app = await Application.findById(applicationId)
      .populate("villageId", "name slug")
      .populate("serviceId", "name slug");

    if (!app) {
      return { success: false, error: "अर्ज सापडला नाही." };
    }

    const newStatus = (formData.get("status") as string) || app.status || "COMPLETED";
    const responseText = ((formData.get("responseText") as string) || "").trim();
    const hostOrigin = (formData.get("hostOrigin") as string) || "";
    const responseFile = formData.get("responseFile") as File | null;

    let responseDocumentUrl = app.responseDocumentUrl || "";
    let responseDocumentName = app.responseDocumentName || "";

    // Handle document upload if file provided
    if (responseFile && responseFile.size > 0) {
      const villageSlug =
        (app.villageId as any)?.slug || app.villageSlug || "general";

      const rawName = responseFile.name || "certificate.pdf";
      const arrayBuffer = await responseFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const uploadResult = await uploadFileBuffer(buffer, {
        folder: `responses/${villageSlug}`,
        filename: rawName,
        resourceType: "auto",
      });

      responseDocumentUrl = uploadResult.url;
      responseDocumentName = rawName;
    }

    // Determine response type
    const responseType = responseDocumentUrl && responseText
      ? "BOTH"
      : responseDocumentUrl
      ? "DOCUMENT"
      : "MESSAGE";

    // Update Application record in MongoDB
    await Application.findByIdAndUpdate(applicationId, {
      status: newStatus,
      adminNotes: responseText || undefined,
      responseText: responseText || undefined,
      responseDocumentUrl: responseDocumentUrl || undefined,
      responseDocumentName: responseDocumentName || undefined,
      responseType,
      responseSentAt: new Date(),
      completedAt: newStatus === "COMPLETED" ? new Date() : undefined,
    });

    // Build human-friendly Marathi WhatsApp message
    const villageName = (app.villageId as any)?.name || "ग्रामपंचायत";
    const serviceName = (app.serviceId as any)?.name || app.serviceName || "नागरिक सेवा";
    const applicantName = app.applicantName || "नागरिक";
    const applicationNumber = app.applicationNumber;

    let statusMarathi = "प्रक्रिया पूर्ण";
    if (newStatus === "COMPLETED") statusMarathi = "✅ मंजूर व अधिकृत दाखला तयार (COMPLETED)";
    else if (newStatus === "APPROVED") statusMarathi = "✅ अर्ज मंजूर करण्यात आला आहे (APPROVED)";
    else if (newStatus === "DOCUMENTS_REQUIRED") statusMarathi = "⚠️ कागदपत्रांची पूर्तता आवश्यक (DOCUMENTS REQUIRED)";
    else if (newStatus === "REJECTED") statusMarathi = "❌ अर्ज नामंजूर / त्रुटी आढळली (REJECTED)";
    else if (newStatus === "UNDER_REVIEW") statusMarathi = "ℹ️ अर्जाची पडताळणी सुरू आहे (UNDER REVIEW)";

    // Document download absolute URL if available
    let docLinkText = "";
    if (responseDocumentUrl) {
      const fullDocUrl = responseDocumentUrl.startsWith("http")
        ? responseDocumentUrl
        : hostOrigin
        ? `${hostOrigin}${responseDocumentUrl}`
        : responseDocumentUrl;
      docLinkText = `\n\n📄 *आपला अधिकृत दाखला / कागदपत्र डाउनलोड करा:*\n${fullDocUrl}`;
    }

    const messageLines = [
      `🏛️ *ग्रामपंचायत ${villageName} - अधिकृत नागरिक सेवा पोर्टल*`,
      ``,
      `नमस्कार *${applicantName}* जी,`,
      `आपण *${serviceName}* साठी सादर केलेल्या अर्जाबाबत (अर्ज क्र. *${applicationNumber}*) ग्रामपंचायतीचा अधिकृत प्रतिसाद खालीलप्रमाणे आहे:`,
      ``,
      `📌 *सद्यस्थिती:* ${statusMarathi}`,
    ];

    if (responseText) {
      messageLines.push(`💬 *ग्रामपंचायत शेरा/संदेश:*`);
      messageLines.push(`${responseText}`);
    }

    if (docLinkText) {
      messageLines.push(docLinkText);
    }

    messageLines.push(``);
    messageLines.push(`कोणत्याही अधिक माहितीसाठी ग्रामपंचायत कार्यालयाशी संपर्क साधावा.`);
    messageLines.push(`- *ग्रामसेवक / सरपंच, ग्रामपंचायत ${villageName}*`);

    const fullMessage = messageLines.join("\n");

    // Clean 10-digit mobile number for WhatsApp Click-to-Chat URL
    let cleanMobile = (app.mobileNumber || "").replace(/\D/g, "");
    if (cleanMobile.length === 10) {
      cleanMobile = `91${cleanMobile}`;
    } else if (cleanMobile.startsWith("0") && cleanMobile.length === 11) {
      cleanMobile = `91${cleanMobile.substring(1)}`;
    }

    const whatsappUrl = `https://api.whatsapp.com/send?phone=${cleanMobile}&text=${encodeURIComponent(
      fullMessage
    )}`;

    revalidatePath("/admin/applications");
    revalidatePath(`/admin/applications/${applicationId}`);
    revalidatePath("/admin/dashboard");

    return {
      success: true,
      whatsappUrl,
      messageText: fullMessage,
      documentUrl: responseDocumentUrl,
      documentName: responseDocumentName,
      status: newStatus,
    };
  } catch (error: any) {
    console.error("[sendApplicationWhatsAppResponse] Error:", error);
    return {
      success: false,
      error: error.message || "प्रतिसाद पाठवताना त्रुटी आली. कृपया पुन्हा प्रयत्न करा.",
    };
  }
}