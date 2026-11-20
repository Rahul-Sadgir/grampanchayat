"use server";

import { queryOne, dbQuery } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/auth";

export async function updateApplicationStatus(
  applicationId: string,
  newStatus: string,
  adminNotes?: string
) {
  try {
    const session = await requireAdminSession();

    // Check application ownership & village isolation (CWE-639)
    const existing = await queryOne(
      `SELECT id, village_slug FROM applications WHERE id::text = $1 OR application_number = $1`,
      [applicationId]
    );

    if (!existing) {
      return { success: false, error: "अर्ज सापडला नाही." };
    }

    if (
      session.role !== "SUPER_ADMIN" &&
      existing.villageSlug?.toLowerCase() !== session.villageSlug.toLowerCase()
    ) {
      return {
        success: false,
        error: "प्रवेश नाकारला: आपल्याकडे या गावाच्या अर्जावर प्रक्रिया करण्याचे अधिकार नाहीत. (403 Forbidden)",
      };
    }

    await dbQuery(
      `UPDATE applications 
       SET status = $1, 
           admin_notes = $2, 
           completed_at = CASE WHEN $1 = 'COMPLETED' THEN NOW() ELSE completed_at END,
           updated_at = NOW()
       WHERE id::text = $3 OR application_number = $3`,
      [newStatus, adminNotes ?? null, applicationId]
    );

    revalidatePath("/admin/applications");
    revalidatePath(`/admin/applications/${applicationId}`);
    revalidatePath("/admin/dashboard");
    return { success: true };
  } catch (err: any) {
    console.error("[updateApplicationStatus] PostgreSQL Error:", err);
    return { success: false, error: err.message || "स्थिती अद्यतनित करताना त्रुटी आली." };
  }
}

export interface SendResponseResult {
  success: boolean;
  error?: string;
  whatsappUrl?: string;
  messageText?: string;
  status?: string;
}

export async function sendApplicationWhatsAppResponse(
  applicationId: string,
  formData: FormData
): Promise<SendResponseResult> {
  try {
    const session = await requireAdminSession();

    const app = await queryOne(
      `SELECT a.*, v.name as village_name, v.slug as village_slug_resolved, s.name as service_name_resolved
       FROM applications a
       LEFT JOIN villages v ON a.village_id = v.id
       LEFT JOIN services s ON a.service_id = s.id
       WHERE a.id::text = $1 OR a.application_number = $1`,
      [applicationId]
    );

    if (!app) {
      return { success: false, error: "अर्ज सापडला नाही." };
    }

    // Verify single-village access control (CWE-639)
    if (
      session.role !== "SUPER_ADMIN" &&
      app.villageSlug?.toLowerCase() !== session.villageSlug.toLowerCase()
    ) {
      return {
        success: false,
        error: "प्रवेश नाकारला: आपल्याकडे या गावाच्या अर्जाचा प्रतिसाद पाठवण्याचे अधिकार नाहीत. (403 Forbidden)",
      };
    }

    const newStatus = (formData.get("status") as string) || app.status || "COMPLETED";
    const responseText = ((formData.get("responseText") as string) || "").trim();

    // Update Application record in PostgreSQL (pure message response)
    await dbQuery(
      `UPDATE applications
       SET status = $1,
           admin_notes = $2,
           response_text = $3,
           response_type = 'MESSAGE',
           response_sent_at = NOW(),
           completed_at = CASE WHEN $1 = 'COMPLETED' THEN NOW() ELSE completed_at END,
           updated_at = NOW()
       WHERE id::text = $4 OR application_number = $4`,
      [
        newStatus,
        responseText || null,
        responseText || null,
        applicationId,
      ]
    );

    // Build human-friendly Marathi WhatsApp message
    const villageName = app.villageName || app.villageSlug || "ग्रामपंचायत";
    const serviceName = app.serviceNameResolved || app.serviceName || "नागरिक सेवा";
    const applicantName = app.applicantName || "नागरिक";
    const applicationNumber = app.applicationNumber;

    let statusMarathi = "प्रक्रिया पूर्ण";
    if (newStatus === "COMPLETED") statusMarathi = "✅ अर्ज मंजूर व कार्यवाही पूर्ण (COMPLETED)";
    else if (newStatus === "APPROVED") statusMarathi = "✅ अर्ज मंजूर करण्यात आला आहे (APPROVED)";
    else if (newStatus === "DOCUMENTS_REQUIRED") statusMarathi = "⚠️ कागदपत्रांची पूर्तता आवश्यक (DOCUMENTS REQUIRED)";
    else if (newStatus === "REJECTED") statusMarathi = "❌ अर्ज नामंजूर / त्रुटी आढळली (REJECTED)";
    else if (newStatus === "UNDER_REVIEW") statusMarathi = "ℹ️ अर्जाची पडताळणी सुरू आहे (UNDER REVIEW)";

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

    messageLines.push(``);
    messageLines.push(`कोणत्याही अधिक माहितीसाठी ग्रामपंचायत कार्यालयाशी संपर्क साधावा.`);
    messageLines.push(`- *ग्रामसेवक / सरपंच, ग्रामपंचायत ${villageName}*`);

    const fullMessage = messageLines.join("\n");

    // Clean 10-digit mobile number for WhatsApp Click-to-Chat URL
    const rawMobile = String(app.mobileNumber || app.mobile_number || "");
    const devanagariMap: { [key: string]: string } = {
      "०": "0", "१": "1", "२": "2", "३": "3", "४": "4",
      "५": "5", "६": "6", "७": "7", "८": "8", "९": "9",
    };
    const normalizedMobile = rawMobile.replace(/[०-९]/g, (d) => devanagariMap[d] || d);
    let cleanMobile = normalizedMobile.replace(/\D/g, "");
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
