import { FormSchemaDefinition } from "@/types/form";

export const businessNocService = {
  _id: "svc_biz_noc",
  name: "व्यवसाय ना हरकत दाखला",
  slug: "business-noc",
  description: "गावात नवीन व्यवसाय, दुकान किंवा उद्योग सुरू करण्यासाठी ग्रामपंचायत NOC दाखला मिळवण्यासाठी अर्ज.",
  category: "अर्ज",
  icon: "Building",
  actionText: "अर्ज करा",
  fee: "व्यवसाय वर्गवारीनुसार",
  isActive: true,
};

export const businessNocSchema: FormSchemaDefinition = {
  fields: [
    {
      name: "applicantName",
      label: "अर्जदाराचे संपूर्ण नाव (Applicant Full Name)",
      type: "text",
      required: true,
      placeholder: "उदा. संदीप रामदास शिंदे",
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
      placeholder: "उदा. sandeep@gmail.com",
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
      name: "businessDescription",
      label: "कोणता व्यवसाय करावयाचा आहे त्याचे नाव व स्वरूप (Business Name & Type)",
      type: "text",
      required: true,
      placeholder: "उदा. श्री गणेश किराणा व जनरल स्टोअर्स / पीठ गिरणी / ऑटो गॅरेज",
      section: "details",
    },
    {
      name: "shopPropertyNumber",
      label: "व्यवसाय ज्या मिळकतीत करावयाचा आहे तिचा क्रमांक (Shop / House No)",
      type: "text",
      required: true,
      placeholder: "उदा. गाळा नं. ४ / घर नं. २५ / प्लॉट नं. १२",
      section: "details",
    },
    {
      name: "propertyOwnerName",
      label: "सदर मिळकतीची मालकी कोणाची आहे? (Property Ownership)",
      type: "text",
      required: true,
      placeholder: "स्वतःची मालकी / भाडेकरू (मालकाचे नाव)",
      section: "details",
    },
    {
      name: "ownershipProof",
      label: "मालकी हक्काचा पुरावा किंवा भाडेकरार तपशील (Rent Agreement Details)",
      type: "text",
      required: true,
      placeholder: "उदा. नोंदणीकृत भाडेकरार दिनांक व ५ वर्षांची मुदत",
      section: "details",
    },
    {
      name: "rentAgreementDoc",
      label: "भाडेकरार / जागेचा ८-अ उतारा प्रत (Rent Agreement / Form 8)",
      type: "file",
      required: true,
      acceptedFileTypes: [".pdf", ".jpg", ".jpeg", ".png"],
      maxSizeMB: 5,
      helpText: "भाडेकरारनामा किंवा स्वतःच्या जागेचा नमुना ८-अ उतारा (PDF/JPG)",
      section: "documents",
    },
    {
      name: "shopLayoutDoc",
      label: "व्यवसाय जागेचा नकाशा किंवा जागेचा फोटो",
      type: "file",
      required: false,
      acceptedFileTypes: [".pdf", ".jpg", ".jpeg", ".png"],
      maxSizeMB: 5,
      helpText: "दुकानाचा/जागेचा स्पष्ट फोटो किंवा नकाशा (PDF/JPG)",
      section: "documents",
    },
  ],
};

export const businessNocPdf = {
  title: "व्यवसाय ना हरकत दाखला मागणी अर्ज नमुना (PDF)",
  code: "BIZ-NOC-FORM",
  fileUrl: "/documents/citizen-services/business-noc-form.pdf",
};
