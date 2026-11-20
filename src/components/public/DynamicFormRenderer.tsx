"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { FormSchemaDefinition, FormField } from "@/types/form";
import { submitCitizenApplication } from "@/lib/actions/applications";
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  Send,
  UploadCloud,
  FileText,
  X,
  User,
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  Calendar,
  ArrowRight,
  RefreshCw,
  Copy,
  Check,
  Printer,
  FileCheck2,
} from "lucide-react";
import Link from "next/link";

interface Props {
  villageSlug: string;
  serviceSlug: string;
  schema: FormSchemaDefinition;
}

interface FileState {
  [fieldName: string]: {
    file: File | null;
    fileName: string;
    fileSizeFormatted: string;
  };
}

export function DynamicFormRenderer({ villageSlug, serviceSlug, schema }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ [fieldName: string]: string }>({});
  const [copied, setCopied] = useState(false);
  const [successData, setSuccessData] = useState<{
    applicationNumber: string;
    applicantName?: string;
    serviceName?: string;
    submittedAt?: string;
  } | null>(null);

  const [filesState, setFilesState] = useState<FileState>({});
  const [declarationChecked, setDeclarationChecked] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const topBannerRef = useRef<HTMLDivElement>(null);

  // Distinguish primary identity fields from custom service fields to prevent duplicate inputs
  const primaryFieldNames = new Set(["applicantName", "mobileNumber", "email", "address"]);
  const serviceFields = schema.fields.filter(
    (f) => f.type !== "file" && !primaryFieldNames.has(f.name)
  );
  const fileFields = schema.fields.filter((f) => f.type === "file");

  const handleFileChange = (field: FormField, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      const sizeKB = Math.round(file.size / 1024);
      const sizeStr = sizeKB > 1024 ? `${(sizeKB / 1024).toFixed(2)} MB` : `${sizeKB} KB`;
      setFilesState((prev) => ({
        ...prev,
        [field.name]: {
          file,
          fileName: file.name,
          fileSizeFormatted: sizeStr,
        },
      }));
      // Clear field error for this file
      setFieldErrors((prev) => {
        const copy = { ...prev };
        delete copy[field.name];
        return copy;
      });
    }
  };

  const handleRemoveFile = (fieldName: string) => {
    setFilesState((prev) => {
      const copy = { ...prev };
      delete copy[fieldName];
      return copy;
    });
    // Reset file input element value if present
    if (formRef.current) {
      const input = formRef.current.querySelector(`input[name="${fieldName}"]`) as HTMLInputElement;
      if (input) input.value = "";
    }
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setFieldErrors({});

    const formData = new FormData(e.currentTarget);

    // 1. Normalize applicant mobile number (support Marathi numerals & spaces)
    let rawMobile = (formData.get("mobileNumber") as string)?.trim() || "";
    const marathiDigits = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"];
    marathiDigits.forEach((d, idx) => {
      rawMobile = rawMobile.replaceAll(d, String(idx));
    });
    rawMobile = rawMobile.replace(/\D/g, "");
    if (rawMobile.startsWith("91") && rawMobile.length === 12) {
      rawMobile = rawMobile.substring(2);
    }
    formData.set("mobileNumber", rawMobile);

    const applicantName = (formData.get("applicantName") as string)?.trim();
    const address = (formData.get("address") as string)?.trim();

    // 2. Perform comprehensive client validation and gather all errors
    const errors: { [fieldName: string]: string } = {};

    if (!applicantName) {
      errors.applicantName = "कृपया अर्जदाराचे संपूर्ण नाव प्रविष्ट करा.";
    }

    if (!rawMobile || rawMobile.length !== 10) {
      errors.mobileNumber = "कृपया वैध १० अंकी मोबाईल क्रमांक प्रविष्ट करा (उदा. ९८२३XXXXXX).";
    }

    if (!address) {
      errors.address = "कृपया अर्जदाराचा संपूर्ण पत्ता प्रविष्ट करा.";
    }

    // 3. Validate service-specific regular fields
    for (const field of serviceFields) {
      const val = (formData.get(field.name) as string)?.trim();
      if (field.required && !val) {
        errors[field.name] = `कृपया '${field.label}' माहिती भरा.`;
      }
    }

    // 4. Ensure all files from filesState are explicitly appended into FormData
    for (const [fieldName, fileInfo] of Object.entries(filesState)) {
      if (fileInfo?.file) {
        formData.set(fieldName, fileInfo.file);
      }
    }

    // 5. Validate required file fields
    for (const field of fileFields) {
      if (field.required && !filesState[field.name]?.file) {
        errors[field.name] = `कृपया आवश्यक कागदपत्र जोडा: ${field.label}`;
      }
    }

    // 6. Validate self-declaration checkbox
    if (!declarationChecked) {
      errors.declaration = "कृपया खालील स्वयं घोषणा व संमती चौकटीवर (Declaration) टिक करा.";
    }

    // If validation fails, show error and scroll to first invalid field
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      const firstErrorMessage = Object.values(errors)[0];
      setError(firstErrorMessage);
      setLoading(false);

      if (typeof window !== "undefined") {
        setTimeout(() => {
          const firstErrElement = formRef.current?.querySelector(".border-red-500, input:invalid") as HTMLElement;
          if (firstErrElement) {
            firstErrElement.scrollIntoView({ behavior: "smooth", block: "center" });
            firstErrElement.focus?.();
          } else if (topBannerRef.current) {
            topBannerRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
          } else {
            window.scrollTo({ top: 0, behavior: "smooth" });
          }
        }, 50);
      }
      return;
    }

    // 7. Submit via dedicated API Route (with Server Action fallback) to PostgreSQL
    try {
      formData.set("villageSlug", villageSlug);
      formData.set("serviceSlug", serviceSlug);

      let result: any = null;

      try {
        const response = await fetch("/api/applications/submit", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          result = await response.json();
        } else {
          const errData = await response.json().catch(() => null);
          throw new Error(errData?.error || `सर्व्हर त्रुटी (${response.status})`);
        }
      } catch (apiErr: any) {
        console.warn("[DynamicFormRenderer] API route error, falling back to Server Action:", apiErr);
        // Fallback to direct Server Action
        result = await submitCitizenApplication(villageSlug, serviceSlug, formData);
      }

      setLoading(false);
      if (result && result.success && result.applicationNumber) {
        setSuccessData({
          applicationNumber: result.applicationNumber,
          applicantName: result.applicantName || applicantName,
          serviceName: result.serviceName,
          submittedAt: result.submittedAt,
        });
        if (typeof window !== "undefined") {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      } else {
        setError(result?.error || "अर्ज सादर करताना त्रुटी आली. कृपया पुन्हा प्रयत्न करा.");
        if (typeof window !== "undefined") {
          topBannerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    } catch (submitErr: any) {
      console.error("[DynamicFormRenderer] Submit Error:", submitErr);
      setLoading(false);
      setError(submitErr.message || "सर्व्हरशी संपर्क होऊ शकला नाही. कृपया पुन्हा प्रयत्न करा.");
      if (typeof window !== "undefined") {
        topBannerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }

  // ==================== SUCCESS CONFIRMATION RECEIPT VIEW ====================
  if (successData) {
    return (
      <div className="bg-white p-6 sm:p-10 rounded-3xl shadow-md border-2 border-emerald-600/30 space-y-6 text-center animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-center gap-3">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white p-1 border-2 border-emerald-600 shadow-md flex items-center justify-center shrink-0">
            <Image
              src="/images/grampanchayat-emblem.webp"
              alt="महाराष्ट्र शासन ग्रामपंचायत अधिकृत बोधचिन्ह"
              width={64}
              height={64}
              unoptimized
              className="object-contain rounded-full"
            />
          </div>
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#E8F5E9] text-[#1E7E34] flex items-center justify-center shadow-inner border border-emerald-300 shrink-0">
            <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12" />
          </div>
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#1E7E34] bg-[#E8F5E9] px-3.5 py-1 rounded-full border border-[#1E7E34]/30 inline-flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>अर्ज यशस्वीरित्या सादर झाला</span>
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-[#003625]">
            आपला अर्ज ग्रामपंचायतीत नोंदवला गेला आहे!
          </h2>
          <p className="text-xs sm:text-sm text-[#526056] max-w-lg mx-auto leading-relaxed">
            खालील अधिकृत अर्ज क्रमांक (Application ID) कृपया जतन करून ठेवा. या क्रमांकावरून आपण अर्जाची सद्यस्थिती तपासू शकता.
          </p>
        </div>

        {/* Application Number Highlight Card */}
        <div className="bg-[#F4EFE6] p-5 sm:p-6 rounded-2xl border-2 border-dashed border-[#003625]/40 space-y-2.5 max-w-md mx-auto shadow-xs">
          <span className="text-[11px] font-bold text-[#526056] uppercase tracking-wider block">
            नोंदणीकृत अधिकृत अर्ज क्रमांक (Application ID)
          </span>
          <div className="text-2xl sm:text-3xl font-mono font-black text-[#9e4300] tracking-wider select-all py-1">
            {successData.applicationNumber}
          </div>
          <div className="pt-1 flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (typeof navigator !== "undefined" && navigator.clipboard && successData?.applicationNumber) {
                  // Safely write plain text tracking ID without throwing on permission rejection
                  navigator.clipboard
                    .writeText(String(successData.applicationNumber))
                    .then(() => {
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2500);
                    })
                    .catch(() => {});
                }
              }}
              className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-1.5 rounded-xl bg-white border border-[#E5DEC9] text-[#003625] hover:bg-[#E5DEC9]/40 transition shadow-2xs cursor-pointer active:scale-95"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">क्रमांक कॉपी झाला!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[#9e4300]" />
                  <span>क्रमांक कॉपी करा</span>
                </>
              )}
            </button>
          </div>
          <p className="text-[11px] text-[#707973]">
            (हा क्रमांक आपण कॉपी करून अथवा स्क्रीनशॉट काढून ठेवू शकता)
          </p>
        </div>

        {/* Summary Meta */}
        <div className="bg-[#FBF9F5] rounded-2xl p-4 sm:p-5 border border-[#E5DEC9] max-w-md mx-auto text-left text-xs space-y-2.5">
          {successData.applicantName && (
            <div className="flex justify-between border-b border-[#E5DEC9]/60 pb-1.5">
              <span className="text-[#526056]">अर्जदाराचे नाव:</span>
              <span className="font-bold text-[#003625]">{successData.applicantName}</span>
            </div>
          )}
          {successData.serviceName && (
            <div className="flex justify-between border-b border-[#E5DEC9]/60 pb-1.5">
              <span className="text-[#526056]">अर्जाचा प्रकार:</span>
              <span className="font-bold text-[#003625]">{successData.serviceName}</span>
            </div>
          )}
          <div className="flex justify-between border-b border-[#E5DEC9]/60 pb-1.5">
            <span className="text-[#526056]">सादर दिनांक:</span>
            <span className="font-mono font-bold text-[#003625]">
              {successData.submittedAt || new Date().toLocaleDateString("mr-IN")}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[#526056]">अर्जाची स्थिती:</span>
            <span className="font-bold text-[#1E7E34] bg-[#E8F5E9] px-2.5 py-0.5 rounded-full border border-emerald-300">
              सादर झाले (SUBMITTED)
            </span>
          </div>
        </div>

        {/* CTA Actions */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href={`/${villageSlug}/services`}
            className="w-full sm:w-auto px-7 py-3 bg-[#003625] hover:bg-[#134e39] text-white rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-xs active:scale-95 cursor-pointer"
          >
            <span>इतर नागरिक सेवा पहा</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <button
            type="button"
            onClick={() => {
              if (typeof window !== "undefined") window.print();
            }}
            className="w-full sm:w-auto px-6 py-3 bg-white hover:bg-[#F4EFE6] border border-[#E5DEC9] text-[#003625] rounded-xl text-xs sm:text-sm font-bold transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-[#9e4300]" />
            <span>पावती प्रिंट करा</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setSuccessData(null);
              setFilesState({});
              setFieldErrors({});
              setDeclarationChecked(false);
            }}
            className="w-full sm:w-auto px-6 py-3 bg-[#F4EFE6] hover:bg-[#E5DEC9] text-[#003625] rounded-xl text-xs sm:text-sm font-bold transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>नवीन अर्ज भरा</span>
          </button>
        </div>
      </div>
    );
  }

  // ==================== FORM VIEW ====================
  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      noValidate
      className="space-y-6 bg-white p-5 sm:p-8 rounded-3xl shadow-sm border border-[#E5DEC9]"
    >
      {/* TOP ERROR BANNER */}
      {error && (
        <div
          ref={topBannerRef}
          className="flex items-center gap-3 p-4 text-xs sm:text-sm text-red-700 bg-red-50 rounded-2xl border-2 border-red-300 animate-in fade-in duration-200"
        >
          <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
          <span className="font-bold">{error}</span>
        </div>
      )}

      {/* SECTION 1: APPLICANT PRIMARY DETAILS */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-[#E5DEC9] pb-2.5">
          <div className="w-6 h-6 rounded-lg bg-[#003625] text-white flex items-center justify-center text-xs font-bold">
            १
          </div>
          <h3 className="font-extrabold text-[#003625] text-sm sm:text-base">
            अर्जदाराची प्राथमिक माहिती (Applicant Details)
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Full Name */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-[#1E2621] mb-1.5">
              अर्जदाराचे संपूर्ण नाव <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#707973] pointer-events-none" />
              <input
                name="applicantName"
                type="text"
                defaultValue=""
                className={`w-full pl-10 pr-4 py-3 rounded-xl bg-[#FBF9F5] border text-xs sm:text-sm text-[#1E2621] transition ${
                  fieldErrors.applicantName
                    ? "border-red-500 ring-2 ring-red-200 bg-red-50/50"
                    : "border-[#E5DEC9] focus:ring-2 focus:ring-[#003625] focus:bg-white"
                } focus:outline-none`}
                placeholder="उदा. राहुल शांताराम पाटील"
              />
            </div>
            {fieldErrors.applicantName && (
              <p className="text-[11px] text-red-600 font-bold mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{fieldErrors.applicantName}</span>
              </p>
            )}
          </div>

          {/* Mobile Number */}
          <div>
            <label className="block text-xs font-bold text-[#1E2621] mb-1.5">
              १० अंकी मोबाईल क्रमांक <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#707973] pointer-events-none" />
              <input
                name="mobileNumber"
                type="tel"
                defaultValue=""
                className={`w-full pl-10 pr-4 py-3 rounded-xl bg-[#FBF9F5] border text-xs sm:text-sm text-[#1E2621] font-mono transition ${
                  fieldErrors.mobileNumber
                    ? "border-red-500 ring-2 ring-red-200 bg-red-50/50"
                    : "border-[#E5DEC9] focus:ring-2 focus:ring-[#003625] focus:bg-white"
                } focus:outline-none`}
                placeholder="उदा. ९८XXXXXXXX"
              />
            </div>
            {fieldErrors.mobileNumber ? (
              <p className="text-[11px] text-red-600 font-bold mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{fieldErrors.mobileNumber}</span>
              </p>
            ) : (
              <p className="text-[10px] text-[#707973] mt-1">अर्जाच्या व्हॉट्सॲप / एसएमएस अपडेट्ससाठी आवश्यक</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-[#1E2621] mb-1.5">
              ईमेल आयडी (ऐच्छिक)
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#707973] pointer-events-none" />
              <input
                name="email"
                type="email"
                defaultValue=""
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#FBF9F5] border border-[#E5DEC9] focus:ring-2 focus:ring-[#003625] focus:bg-white focus:outline-none text-xs sm:text-sm text-[#1E2621]"
                placeholder="उदा. applicant@gmail.com"
              />
            </div>
          </div>

          {/* Address */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-[#1E2621] mb-1.5">
              अर्जदाराचा संपूर्ण पत्ता <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-[#707973] pointer-events-none" />
              <textarea
                name="address"
                rows={2}
                defaultValue=""
                className={`w-full pl-10 pr-4 py-3 rounded-xl bg-[#FBF9F5] border text-xs sm:text-sm text-[#1E2621] transition ${
                  fieldErrors.address
                    ? "border-red-500 ring-2 ring-red-200 bg-red-50/50"
                    : "border-[#E5DEC9] focus:ring-2 focus:ring-[#003625] focus:bg-white"
                } focus:outline-none`}
                placeholder="घर नं. / गल्ली / परिसर, गाव, तालुका, जिल्हा..."
              />
            </div>
            {fieldErrors.address && (
              <p className="text-[11px] text-red-600 font-bold mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{fieldErrors.address}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 2: SERVICE SPECIFIC DETAILS (NO DUPLICATES OF SECTION 1) */}
      {serviceFields.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-[#E5DEC9]">
          <div className="flex items-center gap-2 border-b border-[#E5DEC9] pb-2.5">
            <div className="w-6 h-6 rounded-lg bg-[#003625] text-white flex items-center justify-center text-xs font-bold">
              २
            </div>
            <h3 className="font-extrabold text-[#003625] text-sm sm:text-base">
              अर्जाचा तपशील व माहिती (Application Information)
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {serviceFields.map((field) => {
              const hasErr = Boolean(fieldErrors[field.name]);
              const isFullWidth =
                field.type === "textarea" ||
                field.name.toLowerCase().includes("address") ||
                field.name.toLowerCase().includes("notes") ||
                field.name.toLowerCase().includes("purpose") ||
                field.name.toLowerCase().includes("details");

              return (
                <div key={field.name} className={isFullWidth ? "sm:col-span-2" : "col-span-1"}>
                  <label className="block text-xs font-bold text-[#1E2621] mb-1.5">
                    {field.label} {field.required && <span className="text-red-500">*</span>}
                  </label>

                  {field.type === "textarea" ? (
                    <textarea
                      name={field.name}
                      rows={3}
                      defaultValue=""
                      className={`w-full px-4 py-3 rounded-xl bg-[#FBF9F5] border text-xs sm:text-sm text-[#1E2621] transition ${
                        hasErr
                          ? "border-red-500 ring-2 ring-red-200 bg-red-50/50"
                          : "border-[#E5DEC9] focus:ring-2 focus:ring-[#003625] focus:bg-white"
                      } focus:outline-none`}
                      placeholder={field.placeholder || "तपशील प्रविष्ट करा..."}
                    />
                  ) : field.type === "select" ? (
                    <select
                      name={field.name}
                      defaultValue=""
                      className={`w-full px-4 py-3 rounded-xl bg-[#FBF9F5] border text-xs sm:text-sm text-[#1E2621] transition ${
                        hasErr
                          ? "border-red-500 ring-2 ring-red-200 bg-red-50/50"
                          : "border-[#E5DEC9] focus:ring-2 focus:ring-[#003625] focus:bg-white"
                      } focus:outline-none`}
                    >
                      <option value="">-- कृपया पर्याय निवडा --</option>
                      {field.options?.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      name={field.name}
                      type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
                      defaultValue=""
                      placeholder={field.placeholder}
                      className={`w-full px-4 py-3 rounded-xl bg-[#FBF9F5] border text-xs sm:text-sm text-[#1E2621] transition ${
                        hasErr
                          ? "border-red-500 ring-2 ring-red-200 bg-red-50/50"
                          : "border-[#E5DEC9] focus:ring-2 focus:ring-[#003625] focus:bg-white"
                      } focus:outline-none`}
                    />
                  )}

                  {hasErr && (
                    <p className="text-[11px] text-red-600 font-bold mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{fieldErrors[field.name]}</span>
                    </p>
                  )}

                  {!hasErr && field.helpText && (
                    <p className="text-[10px] text-[#707973] mt-1">{field.helpText}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 3: DOCUMENT UPLOADS */}
      {fileFields.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-[#E5DEC9]">
          <div className="flex items-center gap-2 border-b border-[#E5DEC9] pb-2.5">
            <div className="w-6 h-6 rounded-lg bg-[#003625] text-white flex items-center justify-center text-xs font-bold">
              ३
            </div>
            <div>
              <h3 className="font-extrabold text-[#003625] text-sm sm:text-base">
                आवश्यक कागदपत्रे जोडा (Document Uploads)
              </h3>
              <p className="text-[11px] text-[#526056]">
                कृपया मूळ अथवा छायांकित प्रतीचे स्पष्ट फोटो/PDF जोडा (कमाल आकार: ५ MB प्रति फाईल)
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {fileFields.map((field) => {
              const fileInfo = filesState[field.name];
              const hasErr = Boolean(fieldErrors[field.name]);

              return (
                <div
                  key={field.name}
                  className={`p-4 rounded-2xl border transition space-y-2 flex flex-col justify-between ${
                    hasErr
                      ? "bg-red-50/40 border-2 border-red-400"
                      : "bg-[#FBF9F5] border-[#E5DEC9]"
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <label className="text-xs font-bold text-[#003625]">
                        {field.label} {field.required && <span className="text-red-500">*</span>}
                      </label>
                      <span className="text-[10px] uppercase font-bold text-[#707973] bg-white px-2 py-0.5 rounded border border-[#E5DEC9] shrink-0">
                        PDF / JPG / PNG
                      </span>
                    </div>
                    {field.helpText && (
                      <p className="text-[10px] text-[#526056] leading-relaxed">{field.helpText}</p>
                    )}
                  </div>

                  {fileInfo?.file ? (
                    <div className="bg-white p-3 rounded-xl border border-[#1E7E34]/40 flex items-center justify-between gap-2 shadow-2xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="w-4 h-4 text-[#1E7E34] shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-[#003625] truncate">{fileInfo.fileName}</p>
                          <p className="text-[10px] text-[#707973]">{fileInfo.fileSizeFormatted}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(field.name)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-red-600 transition shrink-0 cursor-pointer"
                        title="कागदपत्र काढून टाका"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer border-2 border-dashed border-[#E5DEC9] hover:border-[#003625] bg-white hover:bg-[#F4EFE6]/50 p-3.5 rounded-xl flex items-center justify-center gap-2 transition group text-center">
                      <UploadCloud className="w-4 h-4 text-[#9e4300] group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-bold text-[#003625]">कागदपत्र निवडा / फोटो जोडा</span>
                      <input
                        type="file"
                        name={field.name}
                        accept={field.acceptedFileTypes?.join(",") || ".pdf,.jpg,.jpeg,.png"}
                        onChange={(e) => handleFileChange(field, e)}
                        className="sr-only"
                      />
                    </label>
                  )}

                  {hasErr && (
                    <p className="text-[11px] text-red-600 font-bold mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{fieldErrors[field.name]}</span>
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 4: DECLARATION & CONSENT */}
      <div className="pt-4 border-t border-[#E5DEC9] space-y-2">
        <label
          className={`flex items-start gap-3 p-3.5 sm:p-4 rounded-2xl border cursor-pointer transition ${
            fieldErrors.declaration
              ? "bg-red-50/60 border-2 border-red-500"
              : "bg-[#F4EFE6] border-[#E5DEC9] hover:bg-[#E5DEC9]/40"
          }`}
        >
          <input
            type="checkbox"
            checked={declarationChecked}
            onChange={(e) => {
              setDeclarationChecked(e.target.checked);
              if (e.target.checked) {
                setFieldErrors((prev) => {
                  const copy = { ...prev };
                  delete copy.declaration;
                  return copy;
                });
              }
            }}
            className="w-4 h-4 mt-0.5 text-[#003625] rounded border-[#E5DEC9] focus:ring-[#003625] shrink-0"
          />
          <div className="text-xs text-[#1E2621] leading-relaxed">
            <span className="font-bold text-[#003625] block mb-0.5 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#1E7E34]" />
              <span>स्वयं घोषणा व संमती (Self-Declaration):</span>
            </span>
            मी शपथपूर्वक जाहीर करतो/करते की, या अर्जात दिलेली सर्व माहिती व जोडलेली कागदपत्रे माझ्या माहितीनुसार खरी व बिनचूक आहेत. काहीही असत्य आढळल्यास होणाऱ्या कायदेशीर कारवाईस मी व्यक्तिशः जबाबदार राहीन.
          </div>
        </label>
        {fieldErrors.declaration && (
          <p className="text-[11px] text-red-600 font-bold pl-2 flex items-center gap-1">
            <AlertCircle className="w-3 h-3 shrink-0" />
            <span>{fieldErrors.declaration}</span>
          </p>
        )}
      </div>

      {/* BOTTOM ERROR BANNER (RIGHT ABOVE BUTTON SO CITIZEN SEES IT IMMEDIATELY) */}
      {error && (
        <div className="flex items-center gap-3 p-3.5 text-xs sm:text-sm text-red-700 bg-red-50 rounded-2xl border-2 border-red-300 animate-in fade-in duration-200">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
          <span className="font-bold">{error}</span>
        </div>
      )}

      {/* SUBMIT BUTTON */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-[#9e4300] hover:bg-[#692b00] text-white rounded-xl font-extrabold flex items-center justify-center gap-2 text-xs sm:text-sm transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
              <span>अर्ज व कागदपत्रे सादर होत आहेत...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>अधिकृत ऑनलाइन अर्ज सादर करा</span>
            </>
          )}
        </button>
        <p className="text-[11px] text-center text-[#707973] mt-2">
          अर्ज यशस्वीरित्या सादर झाल्यावर आपल्याला तात्काळ अर्ज क्रमांक प्राप्त होईल.
        </p>
      </div>
    </form>
  );
}
