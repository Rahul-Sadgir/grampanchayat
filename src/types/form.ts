export type FieldType =
  | "text"
  | "tel"
  | "email"
  | "textarea"
  | "number"
  | "date"
  | "select"
  | "file"
  | "checkbox"
  | "radio";

export interface FieldOption {
  label: string;
  value: string;
}

export interface FormField {
  name: string;
  label: string;
  type: FieldType;
  required: boolean;
  placeholder?: string;
  helpText?: string;
  options?: FieldOption[];
  section?: string;
  acceptedFileTypes?: string[];
  maxSizeMB?: number;
}

export interface FormSection {
  id: string;
  title: string;
  description?: string;
}

export interface FormSchemaDefinition {
  sections?: FormSection[];
  fields: FormField[];
}