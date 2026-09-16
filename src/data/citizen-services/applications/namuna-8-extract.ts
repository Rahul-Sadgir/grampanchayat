import { FormSchemaDefinition } from "@/types/form";

export const namuna8ExtractService = {
  _id: "svc_namuna_8",
  name: "नमुना नं. ८ मागणी अर्ज",
  slug: "namuna-8-extract",
  description: "घर व मिळकत कर आकारणी नोंद (नमुना ८) अधिकृत उतारा मिळवण्यासाठी ऑनलाइन अर्ज.",
  category: "अर्ज",
  icon: "Building",
  actionText: "अर्ज करा",
  fee: "शासकीय नियमांनुसार",
  isActive: true,
};

export const namuna8ExtractSchema: FormSchemaDefinition = {
  fields: [
    {
      name: "applicantName",
      label: "अर्जदाराचे संपूर्ण नाव (Applicant Name)",
      type: "text",
      required: true,
      placeholder: "उदा. ज्ञानेश्वर विष्णू गांगुर्डे",
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
      placeholder: "उदा. dnyaneshwar@gmail.com",
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
      name: "propertyNumber",
      label: "ज्या मिळकतीचा नमुना नं. ८ हवा आहे त्या मिळकतीचा क्रमांक (House / Property No)",
      type: "text",
      required: true,
      placeholder: "उदा. घर क्र. / मिळकत क्र. १२४",
      section: "details",
    },
    {
      name: "taxPaidStatus",
      label: "सदर मिळकतीचा कर भरणा केला आहे किंवा नाही?",
      type: "select",
      required: true,
      section: "details",
      options: [
        { label: "होय, कर भरणा पूर्ण केला आहे (Yes)", value: "yes" },
        { label: "नाही (No)", value: "no" },
      ],
    },
    {
      name: "taxReceiptNumber",
      label: "कर भरणा पावती क्रमांक व वर्ष (Tax Receipt No & Year)",
      type: "text",
      required: true,
      placeholder: "उदा. पावती क्र. ५६२/२०२५-२६",
      section: "details",
    },
    {
      name: "latestTaxReceiptDoc",
      label: "चालू वर्षाची घरपट्टी / पाणीपट्टी पावती प्रत",
      type: "file",
      required: true,
      acceptedFileTypes: [".pdf", ".jpg", ".jpeg", ".png"],
      maxSizeMB: 5,
      helpText: "चालू किंवा मागील आर्थिक वर्षाची ग्रामपंचायत कर भरणा पावती (PDF/JPG)",
      section: "documents",
    },
    {
      name: "applicantAadhaarDoc",
      label: "अर्जदाराचे आधार कार्ड प्रत",
      type: "file",
      required: true,
      acceptedFileTypes: [".pdf", ".jpg", ".jpeg", ".png"],
      maxSizeMB: 5,
      section: "documents",
    },
  ],
};

export const namuna8ExtractPdf = {
  title: "नमुना नं. ८ मागणी अर्ज विहित नमुना (PDF)",
  code: "NAMUNA-8-FORM",
  fileUrl: "/documents/citizen-services/namuna-8-extract-form.pdf",
};
