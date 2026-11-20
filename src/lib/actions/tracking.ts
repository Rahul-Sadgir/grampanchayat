"use server";

import { queryOne } from "@/lib/db";

export async function trackCitizenApplication(applicationNumber: string, mobileNumber: string) {
  if (!applicationNumber || !mobileNumber) {
    return { success: false, error: "कृपया अर्ज क्रमांक आणि मोबाईल नंबर दोन्ही प्रविष्ट करा." };
  }

  try {
    const app = await queryOne(
      `SELECT a.*, v.name as village_name, s.name as service_name_resolved
       FROM applications a
       LEFT JOIN villages v ON a.village_id = v.id
       LEFT JOIN services s ON a.service_id = s.id
       WHERE UPPER(a.application_number) = UPPER($1) 
         AND a.mobile_number = $2`,
      [applicationNumber.trim(), mobileNumber.trim()]
    );

    if (!app) {
      return { success: false, error: "नोंद सापडली नाही. कृपया अर्ज क्रमांक आणि मोबाईल नंबर तपासा." };
    }

    const rawFormData = app.formData;
    const formDataObj =
      rawFormData && typeof rawFormData === "object"
        ? rawFormData
        : typeof rawFormData === "string"
        ? JSON.parse(rawFormData)
        : {};

    return {
      success: true,
      data: {
        applicationNumber: app.applicationNumber,
        applicantName: app.applicantName,
        serviceName: app.serviceNameResolved || app.serviceName || "शासकीय सेवा",
        villageName: app.villageName || "ग्रामपंचायत",
        status: app.status,
        submittedAt: app.submittedAt ? new Date(app.submittedAt).toISOString() : new Date().toISOString(),
        adminNotes: app.adminNotes || null,
        formData: formDataObj,
      },
    };
  } catch (err) {
    console.error("[trackCitizenApplication] Error:", err);
    return { success: false, error: "अर्ज शोधताना तांत्रिक त्रुटी आली. कृपया नंतर प्रयत्न करा." };
  }
}
