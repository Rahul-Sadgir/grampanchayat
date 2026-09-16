import { FormSchemaDefinition } from "@/types/form";

export interface GrievanceServiceItem {
  _id: string;
  name: string;
  slug: string;
  description: string;
  category: "तक्रार / सूचना";
  icon: string;
  actionText: string;
  fee?: string;
  isActive?: boolean;
}

export interface GrievancePdfItem {
  title: string;
  category: string;
  code: string;
  fileUrl: string;
  isUploaded?: boolean;
}

// 1. Grievance & Suggestion Online Service Definition
export const grievanceSuggestionService: GrievanceServiceItem = {
  _id: "svc_grievance_suggestion",
  name: "तक्रार / सूचना नोंदणी",
  slug: "grievance-suggestion",
  description: "गावातील नागरी समस्या, रस्ते, पाणी, दिवाबत्ती तक्रारी किंवा ग्रामविकासासाठी सूचना थेट ग्रामपंचायतीकडे नोंदवा.",
  category: "तक्रार / सूचना",
  icon: "MessageSquareText",
  actionText: "तक्रार / सूचना नोंदवा",
  fee: "मोफत (Free)",
  isActive: true,
};

// 2. Grievance & Suggestion Form Schema (Matching official screenshot fields)
export const grievanceSuggestionSchema: FormSchemaDefinition = {
  fields: [
    {
      name: "email",
      label: "इमेल (Email ID)",
      type: "email",
      required: false,
      placeholder: "उदा. rahul@gmail.com",
      section: "applicant",
    },
    {
      name: "whatsappNumber",
      label: "व्हाट्सॲप क्र. (WhatsApp Number)",
      type: "text",
      required: true,
      placeholder: "उदा. ९८XXXXXXXX",
      section: "applicant",
    },
    {
      name: "fullName",
      label: "नाव (Full Name)",
      type: "text",
      required: true,
      placeholder: "उदा. राहुल एकनाथ पाटील",
      section: "applicant",
    },
    {
      name: "address",
      label: "पत्ता (Address)",
      type: "textarea",
      required: true,
      placeholder: "मु. पो., गल्ली / प्रभाग, घर क्र.",
      section: "applicant",
    },
    {
      name: "type",
      label: "प्रकार (Type)",
      type: "select",
      required: true,
      section: "details",
      options: [
        { label: "तक्रार (Grievance / Complaint)", value: "तक्रार" },
        { label: "सूचना (Development Suggestion)", value: "सूचना" },
        { label: "पाणी पुरवठा तक्रार (Water Supply)", value: "पाणी पुरवठा" },
        { label: "दिवाबत्ती व वीज समस्या (Street Lights)", value: "दिवाबत्ती" },
        { label: "स्वच्छता व सांडपाणी (Sanitation / Drainage)", value: "स्वच्छता" },
        { label: "रस्ते व खड्डे दुरुस्ती (Roads Repair)", value: "रस्ते दुरुस्ती" },
        { label: "इतर नागरी तक्रार / मागणी (Other)", value: "इतर" },
      ],
    },
    {
      name: "photoAttachment",
      label: "फोटो (असल्यास) (Photo / Document if any)",
      type: "file",
      required: false,
      acceptedFileTypes: [".pdf", ".jpg", ".jpeg", ".png"],
      maxSizeMB: 5,
      helpText: "समस्येचे छायाचित्र किंवा संबंधित कागदपत्र (पर्यायी)",
      section: "details",
    },
    {
      name: "statement",
      label: "तुमचे म्हणणे थोडक्यात सांगा (Your Statement / Description)",
      type: "textarea",
      required: true,
      placeholder: "तक्रार अथवा सूचनेचे सविस्तर वर्णन येथे लिहा...",
      section: "details",
    },
  ],
};

// Export lists
export const GRIEVANCE_SERVICES: GrievanceServiceItem[] = [
  grievanceSuggestionService,
];

export const GRIEVANCE_SCHEMAS: Record<string, FormSchemaDefinition> = {
  "grievance-suggestion": grievanceSuggestionSchema,
};

export const GRIEVANCE_PDFS: GrievancePdfItem[] = [];
