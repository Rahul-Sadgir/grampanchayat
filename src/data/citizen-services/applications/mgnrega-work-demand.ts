import { FormSchemaDefinition } from "@/types/form";

export const mgnregaWorkDemandService = {
  _id: "svc_mgnrega",
  name: "नमुना नं. ४ काम मागणी अर्ज",
  slug: "mgnrega-work-demand",
  description: "महात्मा गांधी राष्ट्रीय ग्रामीण रोजगार हमी (मनरेगा) अंतर्गत अकुशल कामाची मागणी करण्यासाठी अर्ज.",
  category: "अर्ज",
  icon: "FileText",
  actionText: "अर्ज करा",
  fee: "मोफत (Free)",
  isActive: true,
};

export const mgnregaWorkDemandSchema: FormSchemaDefinition = {
  fields: [
    {
      name: "applicantName",
      label: "अर्जदाराचे संपूर्ण नाव (Applicant Name)",
      type: "text",
      required: true,
      placeholder: "उदा. बाळू तुकाराम जाधव",
      section: "applicant",
    },
    {
      name: "mobileNumber",
      label: "मोबाईल नंबर (Mobile Number)",
      type: "text",
      required: true,
      placeholder: "उदा. ९८XXXXXXXX",
      section: "applicant",
    },
    {
      name: "email",
      label: "ईमेल आयडी (Email ID)",
      type: "email",
      required: false,
      placeholder: "उदा. balu@gmail.com",
      section: "applicant",
    },
    {
      name: "familyHeadName",
      label: "जॉब कार्ड धारक कुटुंबाचे कुटुंब प्रमुखाचे नाव (Family Head Name)",
      type: "text",
      required: true,
      placeholder: "कुटुंब प्रमुखाचे संपूर्ण नाव",
      section: "applicant",
    },
    {
      name: "jobCardNumber",
      label: "जॉब कार्ड नंबर (Job Card No)",
      type: "text",
      required: true,
      placeholder: "उदा. MH-04-001-025-001/458",
      section: "details",
    },
    {
      name: "workRequiredDate",
      label: "कधीपासून काम हवे आहे? (Work Demand Date)",
      type: "date",
      required: true,
      section: "details",
    },
    {
      name: "laborersCount",
      label: "किती मजुरांना काम हवे आहे? (संख्या / No of Laborers)",
      type: "number",
      required: true,
      placeholder: "उदा. २",
      section: "details",
    },
    {
      name: "jobCardDoc",
      label: "मनरेगा जॉब कार्ड प्रत (पहिला व शेवटचा पृष्ठ)",
      type: "file",
      required: true,
      acceptedFileTypes: [".pdf", ".jpg", ".jpeg", ".png"],
      maxSizeMB: 5,
      helpText: "जॉब कार्डचे पहिले पृष्ठ व कुटुंबातील मजुरांची नावे असलेला पृष्ठ (PDF/JPG)",
      section: "documents",
    },
    {
      name: "bankPassbookDoc",
      label: "मजुरांचे बँक पासबुक / आधार लिंक खाते प्रत",
      type: "file",
      required: true,
      acceptedFileTypes: [".pdf", ".jpg", ".jpeg", ".png"],
      maxSizeMB: 5,
      helpText: "बँक खाते क्रमांक व IFSC कोड स्पष्ट दिसणारे पासबुक (PDF/JPG)",
      section: "documents",
    },
  ],
};

export const mgnregaWorkDemandPdf = {
  title: "नमुना नं. ४ काम मागणी अर्ज नमुना (मनरेगा PDF)",
  code: "MGNREGA-FORM-4",
  fileUrl: "/documents/citizen-services/mgnrega-work-demand-form.pdf",
};
