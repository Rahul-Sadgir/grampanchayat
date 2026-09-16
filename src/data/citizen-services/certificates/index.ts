import { FormSchemaDefinition } from "@/types/form";

export interface CertificateServiceItem {
  _id: string;
  name: string;
  slug: string;
  description: string;
  category: "दाखले";
  icon: string;
  actionText: string;
  fee?: string;
  isActive?: boolean;
}

export interface CertificatePdfItem {
  title: string;
  category: string;
  code: string;
  description?: string;
  fileUrl: string;
  isUploaded?: boolean;
}

// Clean list for online interactive certificates
export const CERTIFICATE_SERVICES: CertificateServiceItem[] = [];

// Clean schemas for certificates
export const CERTIFICATE_SCHEMAS: Record<string, FormSchemaDefinition> = {};

// Official Downloadable Certificate PDFs
export const CERTIFICATE_PDFS: CertificatePdfItem[] = [
  {
    title: "रहिवासी / अधिवास दाखला अर्ज नमुना (Domicile Certificate Form)",
    category: "दाखले",
    code: "DOMICILE-FORM",
    description: "अधिवास / रहिवासी दाखला मिळवण्यासाठी विहित नमुना अर्ज.",
    fileUrl: "/api/documents/certificates/Domocail_From.pdf",
    isUploaded: true,
  },
  {
    title: "आर्थिक दुर्बल घटक (EWS) प्रमाणपत्र अर्ज नमुना",
    category: "दाखले",
    code: "EWS-FORM",
    description: "आर्थिकदृष्ट्या दुर्बल घटकांसाठी (EWS) प्रमाणपत्र मागणी अर्ज.",
    fileUrl: "/api/documents/certificates/EWS_ApplicationForm.pdf",
    isUploaded: true,
  },
  {
    title: "अल्पभूधारक शेतकरी दाखला अर्ज नमुना",
    category: "दाखले",
    code: "SMALL-FARMER-FORM",
    description: "अल्प व अत्यल्प भूधारक शेतकरी प्रमाणपत्र मागणी नमुना अर्ज.",
    fileUrl: "/api/documents/certificates/अल्पभूधारक_फॉर्म.pdf",
    isUploaded: true,
  },
  {
    title: "जात प्रमाणपत्र अर्ज नमुना (Caste Certificate Form)",
    category: "दाखले",
    code: "CASTE-CERT-FORM",
    description: "जात प्रमाणपत्र मिळवण्यासाठी अधिकृत अर्ज नमुना.",
    fileUrl: "/api/documents/certificates/जातीचा_फॉर्म.pdf",
    isUploaded: true,
  },
];
