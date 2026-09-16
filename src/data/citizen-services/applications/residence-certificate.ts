import { FormSchemaDefinition } from "@/types/form";

export const residenceCertificateService = {
  _id: "svc_res_cert",
  name: "रहिवासी दाखला",
  slug: "residence-certificate",
  description: "गावातील स्थानिक रहिवासी असल्याचा अधिकृत शासकीय दाखला मिळवण्यासाठी ऑनलाइन अर्ज.",
  category: "अर्ज",
  icon: "Home",
  actionText: "अर्ज करा",
  fee: "मोफत (Free)",
  isActive: true,
};

export const residenceCertificateSchema: FormSchemaDefinition = {
  fields: [
    {
      name: "applicantName",
      label: "अर्जदाराचे संपूर्ण नाव (Applicant Full Name)",
      type: "text",
      required: true,
      placeholder: "उदा. अनिकेत संजय जाधव",
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
      placeholder: "उदा. aniket@gmail.com",
      section: "applicant",
    },
    {
      name: "aadhaarNumber",
      label: "अर्जदाराचा १२ अंकी आधार क्रमांक (Aadhaar Number)",
      type: "text",
      required: true,
      placeholder: "उदा. 123456789012",
      section: "applicant",
    },
    {
      name: "yearsLiving",
      label: "गावात किती वर्षांपासून वास्तव्यास आहात? (Years of Residence)",
      type: "text",
      required: true,
      placeholder: "उदा. १५ वर्षे / जन्मापासून",
      section: "details",
    },
    {
      name: "houseNumber",
      label: "घर नंबर / मिळकत नंबर (House / Property No)",
      type: "text",
      required: true,
      placeholder: "उदा. घर क्र. १२४ / प्लॉट नं. ४५",
      section: "details",
    },
    {
      name: "purpose",
      label: "दाखल्याचे प्रयोजन - कशासाठी हवा आहे? (Purpose)",
      type: "text",
      required: true,
      placeholder: "उदा. शाळा/कॉलेज प्रवेश / नोकरी / नवीन बँक खाते उघडणे",
      section: "details",
    },
    {
      name: "aadhaarCardDoc",
      label: "अर्जदाराचे आधार कार्ड प्रत (Aadhaar Card Copy)",
      type: "file",
      required: true,
      acceptedFileTypes: [".pdf", ".jpg", ".jpeg", ".png"],
      maxSizeMB: 5,
      helpText: "गावातील पत्ता असलेले आधार कार्ड प्रत (PDF/JPG)",
      section: "documents",
    },
    {
      name: "lightBillOrTaxDoc",
      label: "लाईट बिल किंवा चालू वर्षाची घरपट्टी पावती",
      type: "file",
      required: true,
      acceptedFileTypes: [".pdf", ".jpg", ".jpeg", ".png"],
      maxSizeMB: 5,
      helpText: "रहिवासी पुराव्यासाठी लाईट बिल किंवा चालू वर्षाची कर पावती (PDF/JPG)",
      section: "documents",
    },
  ],
};

export const residenceCertificatePdf = {
  title: "रहिवासी दाखला मागणी अर्ज नमुना (PDF)",
  code: "RES-CERT-FORM",
  fileUrl: "/documents/citizen-services/residence-certificate-form.pdf",
};
