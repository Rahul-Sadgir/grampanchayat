import { FormSchemaDefinition } from "@/types/form";

export interface SelfDeclarationServiceItem {
  _id: string;
  name: string;
  slug: string;
  description: string;
  category: "स्वयं घोषणापत्र";
  icon: string;
  actionText: string;
  fee?: string;
  isActive?: boolean;
}

export interface SelfDeclarationPdfItem {
  title: string;
  category: string;
  code: string;
  description?: string;
  fileUrl: string;
  isUploaded?: boolean;
}

// Clean list for interactive online self-declarations
export const SELF_DECLARATION_SERVICES: SelfDeclarationServiceItem[] = [];

// Clean schemas for self-declarations
export const SELF_DECLARATION_SCHEMAS: Record<string, FormSchemaDefinition> = {};

// Official Downloadable Self-Declaration PDFs
export const SELF_DECLARATION_PDFS: SelfDeclarationPdfItem[] = [
  {
    title: "शौचालय असल्याबाबत स्वयंघोषणापत्र",
    category: "स्वयं घोषणापत्र",
    code: "DECL-TOILET",
    description: "घरामध्ये वैयक्तिक शौचालय असल्याबाबतचे अधिकृत स्वयंघोषणापत्र.",
    fileUrl: "/api/documents/self-declarations/शौचालय-असल्याबाबत-स्वयंघोषणापत्र.pdf",
    isUploaded: true,
  },
  {
    title: "हयात असल्याबाबत स्वयंघोषणापत्र (Life Certificate)",
    category: "स्वयं घोषणापत्र",
    code: "DECL-LIFE",
    description: "निवृत्तीवेतन / योजनांसाठी नागरिक हयात असल्याबाबत स्वयंघोषणापत्र.",
    fileUrl: "/api/documents/self-declarations/हयात-असल्याबाबत-स्वयंघोषणापत्र.pdf",
    isUploaded: true,
  },
  {
    title: "नवीन वीज जोडणी एनओसी स्वयंघोषणापत्र",
    category: "स्वयं घोषणापत्र",
    code: "DECL-ELECTRICITY",
    description: "महावितरण वीज जोडणीसाठी ग्रामपंचायत हद्दीतील स्वयंघोषणापत्र.",
    fileUrl: "/api/documents/self-declarations/वीज-जोडणी-स्वयंघोषणापत्र.pdf",
    isUploaded: true,
  },
  {
    title: "विभक्त कुटुंब असल्याबाबत स्वयंघोषणापत्र",
    category: "स्वयं घोषणापत्र",
    code: "DECL-FAMILY",
    description: "शिधापत्रिका / घरकुल योजनेसाठी कुटुंब विभक्त असल्याबाबत स्वयंघोषणापत्र.",
    fileUrl: "/api/documents/self-declarations/विभक्त-कुटुंब-असल्यास-स्वयंघोषणापत्र.pdf",
    isUploaded: true,
  },
  {
    title: "रहिवाशी दाखल्यासाठी स्वयंघोषणापत्र",
    category: "स्वयं घोषणापत्र",
    code: "DECL-RESIDENCE",
    description: "गावाचा कायमचा रहिवासी असल्याबाबतचे विहित स्वयंघोषणापत्र.",
    fileUrl: "/api/documents/self-declarations/रहिवाशी_दाखला_स्व_घोषणापत्र.pdf",
    isUploaded: true,
  },
  {
    title: "विधवा असल्याबाबत स्वयंघोषणापत्र",
    category: "स्वयं घोषणापत्र",
    code: "DECL-WIDOW",
    description: "संजय गांधी निराधार व शासकीय योजनांसाठी स्वयंघोषणापत्र.",
    fileUrl: "/api/documents/self-declarations/विधवा-असल्याबाबत-स्वयंघोषणापत्र-1.pdf",
    isUploaded: true,
  },
  {
    title: "परित्यक्ता असल्याबाबत स्वयंघोषणापत्र",
    category: "स्वयं घोषणापत्र",
    code: "DECL-DESERTED",
    description: "परित्यक्ता महिलांसाठी शासकीय मदतीकरिता स्वयंघोषणापत्र.",
    fileUrl: "/api/documents/self-declarations/परितक्या-असल्याबाबत-स्वयंघोषणापत्र.pdf",
    isUploaded: true,
  },
  {
    title: "कोणत्याही शासकीय योजनेचा लाभ न घेतल्याचे स्वयंघोषणापत्र",
    category: "स्वयं घोषणापत्र",
    code: "DECL-NO-SCHEME",
    description: "इतर शासकीय योजनेचा दुहेरी लाभ न घेतल्याचे हमीपत्र.",
    fileUrl: "/api/documents/self-declarations/कोणत्याही-योजनेचा-लाभ-न-घेतल्याचे-स्वयंघोषणापत्र.pdf",
    isUploaded: true,
  },
];
