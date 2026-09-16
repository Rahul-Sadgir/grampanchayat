import { FormSchemaDefinition } from "@/types/form";

export interface TaxServiceItem {
  _id: string;
  name: string;
  slug: string;
  description: string;
  category: "कर भरणा";
  icon: string;
  actionText: string;
  fee?: string;
  isActive?: boolean;
}

export interface TaxPdfItem {
  title: string;
  code: string;
  fileUrl: string;
}

// Clean list — ready for actual village tax services
export const TAX_SERVICES: TaxServiceItem[] = [];

// Clean schemas for tax payment
export const TAX_SCHEMAS: Record<string, FormSchemaDefinition> = {};

// Clean downloadable tax challan / payment PDFs
export const TAX_PDFS: TaxPdfItem[] = [];
