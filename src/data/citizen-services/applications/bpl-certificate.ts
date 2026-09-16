import { FormSchemaDefinition } from "@/types/form";

export const bplCertificateService = {
  _id: "svc_bpl_cert",
  name: "दारिद्र्य रेषा दाखला",
  slug: "bpl-certificate",
  description: "दारिद्र्य रेषेखालील (BPL) यादीत नाव असल्याबाबत अधिकृत शासकीय दाखला मिळवण्यासाठी अर्ज.",
  category: "अर्ज",
  icon: "FileText",
  actionText: "अर्ज करा",
  fee: "मोफत (Free)",
  isActive: true,
};

export const bplCertificateSchema: FormSchemaDefinition = {
  fields: [
    {
      name: "applicantName",
      label: "अर्जदाराचे संपूर्ण नाव (Applicant Name)",
      type: "text",
      required: true,
      placeholder: "उदा. विठ्ठल सखाराम भोसले",
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
      placeholder: "उदा. vitthal@gmail.com",
      section: "applicant",
    },
    {
      name: "aadhaarNumber",
      label: "आधार नंबर (Aadhaar Number)",
      type: "text",
      required: true,
      placeholder: "उदा. 123456789012",
      section: "applicant",
    },
    {
      name: "bplFamilyHead",
      label: "दारिद्र्य रेषा यादीतील कुटुंब प्रमुखाचे नाव (BPL Family Head Name)",
      type: "text",
      required: true,
      placeholder: "कुटुंब प्रमुखाचे संपूर्ण नाव",
      section: "applicant",
    },
    {
      name: "bplNumber",
      label: "दारिद्र्य रेषा यादीतील क्रमांक (BPL Sr No / Score)",
      type: "text",
      required: true,
      placeholder: "उदा. बीपीएल यादी क्र. ४५ / सर्वेक्षण गुण १७",
      section: "details",
    },
    {
      name: "familyMembersCount",
      label: "कुटुंबातील एकूण सदस्य संख्या (Total Family Members)",
      type: "number",
      required: true,
      placeholder: "उदा. ५",
      section: "details",
    },
    {
      name: "purpose",
      label: "दाखला कशासाठी आवश्यक आहे? (Purpose of Certificate)",
      type: "text",
      required: true,
      placeholder: "उदा. प्रधानमंत्री आवास योजना (घरकुल) / शिष्यवृत्ती / वैद्यकीय मदत",
      section: "details",
    },
    {
      name: "rationCardDoc",
      label: "पिवळे / अंत्योदय रेशन कार्ड प्रत (Ration Card Copy)",
      type: "file",
      required: true,
      acceptedFileTypes: [".pdf", ".jpg", ".jpeg", ".png"],
      maxSizeMB: 5,
      helpText: "रेशन कार्डचे पहिले पृष्ठ व कुटुंबातील सदस्यांचे नाव असलेला पृष्ठ (PDF/JPG)",
      section: "documents",
    },
    {
      name: "incomeSelfDeclarationDoc",
      label: "स्वयंघोषणापत्र / उत्पन्नाचा पुरावा",
      type: "file",
      required: false,
      acceptedFileTypes: [".pdf", ".jpg", ".jpeg", ".png"],
      maxSizeMB: 5,
      section: "documents",
    },
  ],
};

export const bplCertificatePdf = {
  title: "दारिद्र्य रेषा दाखला मागणी अर्ज नमुना (PDF)",
  code: "BPL-CERT-FORM",
  fileUrl: "/documents/citizen-services/bpl-certificate-form.pdf",
};
