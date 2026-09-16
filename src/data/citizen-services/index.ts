import { FormSchemaDefinition } from "@/types/form";
import { CITIZEN_TABS, CitizenTabConfig } from "./tabs";
import {
  APPLICATION_SERVICES,
  APPLICATION_SCHEMAS,
  APPLICATION_PDFS,
} from "./applications";
import { TAX_SERVICES, TAX_SCHEMAS, TAX_PDFS } from "./tax-payment";
import {
  SELF_DECLARATION_SERVICES,
  SELF_DECLARATION_SCHEMAS,
  SELF_DECLARATION_PDFS,
} from "./self-declarations";
import {
  CERTIFICATE_SERVICES,
  CERTIFICATE_SCHEMAS,
  CERTIFICATE_PDFS,
} from "./certificates";
import {
  GRIEVANCE_SERVICES,
  GRIEVANCE_SCHEMAS,
  GRIEVANCE_PDFS,
} from "./grievances";

// Re-export all tab modules
export * from "./tabs";
export * from "./applications";
export * from "./tax-payment";
export * from "./self-declarations";
export * from "./certificates";
export * from "./grievances";

export interface CitizenServiceItem {
  _id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  icon?: string;
  actionText?: string;
  fee?: string;
  isActive?: boolean;
}

export interface CitizenPdfItem {
  title: string;
  category?: string;
  code?: string;
  fileUrl: string;
}

// Master list of all citizen services (strictly real 10 application forms)
export const ALL_CITIZEN_SERVICES: CitizenServiceItem[] = [
  ...APPLICATION_SERVICES,
  ...TAX_SERVICES,
  ...SELF_DECLARATION_SERVICES,
  ...CERTIFICATE_SERVICES,
  ...GRIEVANCE_SERVICES,
];

// Master map of all form schemas
export const ALL_CITIZEN_SCHEMAS: Record<string, FormSchemaDefinition> = {
  ...APPLICATION_SCHEMAS,
  ...TAX_SCHEMAS,
  ...SELF_DECLARATION_SCHEMAS,
  ...CERTIFICATE_SCHEMAS,
  ...GRIEVANCE_SCHEMAS,
};

// Master list of all downloadable PDF templates / forms
export const ALL_CITIZEN_PDFS = [
  ...APPLICATION_PDFS,
  ...TAX_PDFS,
  ...SELF_DECLARATION_PDFS,
  ...CERTIFICATE_PDFS,
  ...GRIEVANCE_PDFS,
];

// Helpers
export function getAllCitizenServices(): CitizenServiceItem[] {
  return ALL_CITIZEN_SERVICES;
}

export function getCitizenServicesByCategory(category: string): CitizenServiceItem[] {
  return ALL_CITIZEN_SERVICES.filter((s) => s.category === category);
}

export function getCitizenServiceBySlug(slug: string): CitizenServiceItem | null {
  return ALL_CITIZEN_SERVICES.find((s) => s.slug === slug) || null;
}

export function getCitizenFormSchema(slug: string): FormSchemaDefinition | null {
  return ALL_CITIZEN_SCHEMAS[slug] || null;
}
