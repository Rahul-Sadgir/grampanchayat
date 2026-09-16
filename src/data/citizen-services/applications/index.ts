import { FormSchemaDefinition } from "@/types/form";
import {
  constructionPermissionService,
  constructionPermissionSchema,
  constructionPermissionPdf,
} from "./construction-permission";
import {
  birthCertificateService,
  birthCertificateSchema,
  birthCertificatePdf,
} from "./birth-certificate";
import {
  deathCertificateService,
  deathCertificateSchema,
  deathCertificatePdf,
} from "./death-certificate";
import {
  marriageCertificateService,
  marriageCertificateSchema,
  marriageCertificatePdf,
} from "./marriage-certificate";
import {
  namuna8ExtractService,
  namuna8ExtractSchema,
  namuna8ExtractPdf,
} from "./namuna-8-extract";
import {
  propertyMutationService,
  propertyMutationSchema,
  propertyMutationPdf,
} from "./property-mutation";
import {
  mgnregaWorkDemandService,
  mgnregaWorkDemandSchema,
  mgnregaWorkDemandPdf,
} from "./mgnrega-work-demand";
import {
  businessNocService,
  businessNocSchema,
  businessNocPdf,
} from "./business-noc";
import {
  bplCertificateService,
  bplCertificateSchema,
  bplCertificatePdf,
} from "./bpl-certificate";
import {
  residenceCertificateService,
  residenceCertificateSchema,
  residenceCertificatePdf,
} from "./residence-certificate";

// Export all individual forms
export * from "./construction-permission";
export * from "./birth-certificate";
export * from "./death-certificate";
export * from "./marriage-certificate";
export * from "./namuna-8-extract";
export * from "./property-mutation";
export * from "./mgnrega-work-demand";
export * from "./business-noc";
export * from "./bpl-certificate";
export * from "./residence-certificate";

// 10 Official Online Application Services
export const APPLICATION_SERVICES = [
  constructionPermissionService,
  birthCertificateService,
  deathCertificateService,
  marriageCertificateService,
  namuna8ExtractService,
  propertyMutationService,
  mgnregaWorkDemandService,
  businessNocService,
  bplCertificateService,
  residenceCertificateService,
];

// Map of Schemas for the 10 Forms
export const APPLICATION_SCHEMAS: Record<string, FormSchemaDefinition> = {
  "construction-permission": constructionPermissionSchema,
  "birth-certificate": birthCertificateSchema,
  "death-certificate": deathCertificateSchema,
  "marriage-certificate": marriageCertificateSchema,
  "namuna-8-extract": namuna8ExtractSchema,
  "property-mutation": propertyMutationSchema,
  "mgnrega-work-demand": mgnregaWorkDemandSchema,
  "business-noc": businessNocSchema,
  "bpl-certificate": bplCertificateSchema,
  "residence-certificate": residenceCertificateSchema,
};

// User Uploaded Real PDF Documents for "अर्ज" Tab
export const UPLOADED_APPLICATION_PDFS = [
  {
    title: "जन्म नोंद दाखला अर्ज नमुना (PDF)",
    category: "अर्ज",
    code: "APP-BIRTH-01",
    description: "ग्रामपंचायत हद्दीत बालकाच्या जन्म नोंदीसाठी व दाखल्यासाठी विहित नमुन्यातील छापील अर्ज.",
    fileUrl: "/api/documents/applications/दाखले_अर्ज_नमुना.pdf",
    isUploaded: true,
  },
  {
    title: "रहिवासी दाखला अर्ज नमुना (PDF)",
    category: "अर्ज",
    code: "APP-RES-08",
    description: "गावातील स्थानिक रहिवासी असल्याचा अधिकृत दाखला मिळवण्यासाठीचा छापील नमुना अर्ज.",
    fileUrl: "/api/documents/certificates/Domocail_From.pdf",
    isUploaded: true,
  },
  {
    title: "अर्जासोबत जोडावयाच्या कागदपत्रांची यादी",
    category: "अर्ज",
    code: "DOCS-CHECKLIST",
    description: "ग्रामपंचायत विविध दाखले व अर्जांसाठी लागणाऱ्या सर्व आवश्यक कागदपत्रांची अधिकृत चेकलिस्ट.",
    fileUrl: "/api/documents/applications/अर्जासोबत_जोडावयाच्या_कागदपत्रांची_यादी.pdf",
    isUploaded: true,
  },
  {
    title: "दाखले अर्ज नमुना",
    category: "अर्ज",
    code: "DAKHALE-ARJ-FORM",
    description: "ग्रामपंचायतीकडे विविध दाखले मागणीसाठी अधिकृत विहित अर्ज नमुना.",
    fileUrl: "/api/documents/applications/दाखले_अर्ज_नमुना.pdf",
    isUploaded: true,
  },
  {
    title: "माहितीचा अधिकार (RTI) अर्ज नमुना - जोडपत्र 'अ'",
    category: "अर्ज",
    code: "RTI-ANNEXURE-A",
    description: "माहिती अधिकार अधिनियम २००५ अंतर्गत माहिती मिळवण्यासाठी विहित नमुन्यातील अर्ज (जोडपत्र अ).",
    fileUrl: "/api/documents/applications/माहितीचा-अधिकार-अंतर्गत-अर्जाचा-नमुना-जोडपत्र-अ.pdf",
    isUploaded: true,
  },
];

// Downloadable PDF Forms / Templates (Strictly user-uploaded files only)
export const APPLICATION_PDFS = [
  ...UPLOADED_APPLICATION_PDFS,
];
