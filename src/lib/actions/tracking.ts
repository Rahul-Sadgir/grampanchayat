"use server";

import { connectDB } from "@/lib/mongodb";
import { Application } from "@/models/Application";
import "@/models/Service";
import "@/models/Village";

export async function trackCitizenApplication(applicationNumber: string, mobileNumber: string) {
  if (!applicationNumber || !mobileNumber) {
    return { success: false, error: "कृपया अर्ज क्रमांक आणि मोबाईल नंबर दोन्ही प्रविष्ट करा." };
  }

  await connectDB();

  const application = await Application.findOne({
    applicationNumber: applicationNumber.trim().toUpperCase(),
    mobileNumber: mobileNumber.trim(),
  }).populate("serviceId", "name").populate("villageId", "name");

  if (!application) {
    return { success: false, error: "नोंद सापडली नाही. कृपया अर्ज क्रमांक आणि मोबाईल नंबर तपासा." };
  }

  return {
    success: true,
    data: {
      applicationNumber: application.applicationNumber,
      applicantName: application.applicantName,
      serviceName: (application.serviceId as any)?.name || "शासकीय सेवा",
      villageName: (application.villageId as any)?.name || "ग्रामपंचायत",
      status: application.status,
      submittedAt: application.submittedAt.toISOString(),
      adminNotes: application.adminNotes || null,
      formData: application.formData,
    },
  };
}