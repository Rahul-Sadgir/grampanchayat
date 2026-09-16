"use client";

import { useState, useRef, useEffect } from "react";
import {
  Send,
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  X,
  ExternalLink,
  MessageSquare,
  Sparkles,
  Phone,
  User,
  Clock,
  Download,
  FileCheck,
  RefreshCw,
} from "lucide-react";
import { sendApplicationWhatsAppResponse } from "@/lib/actions/admin";

interface ApplicationResponseManagerProps {
  applicationId: string;
  applicationNumber: string;
  applicantName: string;
  mobileNumber: string;
  serviceName: string;
  villageName: string;
  currentStatus: string;
  existingResponse?: {
    responseText?: string;
    responseDocumentUrl?: string;
    responseDocumentName?: string;
    responseSentAt?: string | Date;
  };
}

const TEMPLATES = [
  {
    id: "ready",
    label: "✅ दाखला तयार व संलग्न",
    status: "COMPLETED",
    text: "आपला अर्ज मंजूर करण्यात आला असून मागितलेला अधिकृत दाखला सोबत जोडला आहे. आपण खाली दिलेल्या लिंकवरून दाखला सहज डाऊनलोड करू शकता.",
  },
  {
    id: "docs",
    label: "⚠️ कागदपत्रे अपूर्ण / त्रुटी",
    status: "DOCUMENTS_REQUIRED",
    text: "आपल्या अर्जात काही कागदपत्रे अपूर्ण / अस्पष्ट आढळली आहेत. कृपया योग्य व वैध कागदपत्रांसह ग्रामपंचायत कार्यालयाशी संपर्क साधावा किंवा कागदपत्रे जमा करावीत.",
  },
  {
    id: "rejected",
    label: "❌ अर्ज नामंजूर",
    status: "REJECTED",
    text: "आपला अर्ज शासकीय निकषांनुसार पात्र ठरत नसल्याने नामंजूर करण्यात आला आहे. अधिक माहिती व मार्गदर्शनासाठी कार्यालयीन वेळेत ग्रामपंचायत कार्यालयात भेटावे.",
  },
  {
    id: "review",
    label: "ℹ️ पडताळणी सुरू आहे",
    status: "UNDER_REVIEW",
    text: "आपल्या अर्जाची ग्रामपंचायतीमार्फत कागदपत्र पडताळणी सुरू आहे. लवकरच पुढील कार्यवाही पूर्ण करून आपणास सूचित करण्यात येईल.",
  },
];

export function ApplicationResponseManager({
  applicationId,
  applicationNumber,
  applicantName,
  mobileNumber,
  serviceName,
  villageName,
  currentStatus,
  existingResponse,
}: ApplicationResponseManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState(currentStatus || "COMPLETED");
  const [messageText, setMessageText] = useState(
    existingResponse?.responseText || TEMPLATES[0].text
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreviewName, setFilePreviewName] = useState<string>(
    existingResponse?.responseDocumentName || ""
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSentResult, setLastSentResult] = useState<{
    whatsappUrl?: string;
    messageText?: string;
    documentUrl?: string;
    documentName?: string;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Set host origin for direct doc links
  const [origin, setOrigin] = useState("");
  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  const handleApplyTemplate = (tmpl: (typeof TEMPLATES)[0]) => {
    setStatus(tmpl.status);
    setMessageText(tmpl.text);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setErrorMsg("फाईलचा आकार १० MB पेक्षा कमी असावा.");
        return;
      }
      setSelectedFile(file);
      setFilePreviewName(file.name);
      setErrorMsg(null);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFilePreviewName("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmitResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const formData = new FormData();
      formData.append("status", status);
      formData.append("responseText", messageText);
      formData.append("hostOrigin", origin);
      if (selectedFile) {
        formData.append("responseFile", selectedFile);
      }

      const res = await sendApplicationWhatsAppResponse(applicationId, formData);

      if (res.success && res.whatsappUrl) {
        setLastSentResult(res);
        // Automatically open WhatsApp in new tab
        window.open(res.whatsappUrl, "_blank");
      } else {
        setErrorMsg(res.error || "प्रतिसाद पाठवताना अडचण आली.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "अपेक्षित त्रुटी आली. कृपया पुन्हा प्रयत्न करा.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. Header Trigger Action Card */}
      <div className="bg-gradient-to-r from-emerald-900 to-[#003625] text-white p-5 sm:p-6 rounded-3xl shadow-sm border border-emerald-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-700/60 text-emerald-200 text-xs font-bold border border-emerald-600/40">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>थेट व्हॉट्सॲप प्रतिसाद सुविधा</span>
          </div>
          <h3 className="text-lg sm:text-xl font-extrabold text-white">
            नागरिकाला दाखला / प्रतिसाद पाठवा
          </h3>
          <p className="text-xs text-emerald-200/90 max-w-xl">
            अर्जदाराच्या व्हॉट्सॲप क्रमांकावर तयार केलेला दाखला (PDF) किंवा सद्यस्थितीचा अधिकृत संदेश १-क्लिकमध्ये पाठवा.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="w-full sm:w-auto px-6 py-3.5 bg-[#25D366] hover:bg-[#1EBE5D] text-slate-950 font-black rounded-2xl text-xs sm:text-sm transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <Send className="w-4 h-4 text-slate-950" />
          <span>प्रतिसाद फॉर्म उघडा</span>
        </button>
      </div>

      {/* 2. Previous Response History Box (If available) */}
      {(existingResponse?.responseSentAt || lastSentResult) && (
        <div className="bg-emerald-50/70 border border-emerald-200 p-5 rounded-2xl space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              <h4 className="text-xs font-bold text-emerald-950">
                यापूर्वी पाठवलेला अधिकृत प्रतिसाद
              </h4>
            </div>
            <span className="text-[11px] font-mono text-emerald-800 bg-white px-2.5 py-0.5 rounded-full border border-emerald-200">
              {existingResponse?.responseSentAt
                ? new Date(existingResponse.responseSentAt).toLocaleString("mr-IN")
                : "आत्ताच पाठवला"}
            </span>
          </div>

          {existingResponse?.responseText && (
            <p className="text-xs text-slate-800 bg-white p-3 rounded-xl border border-emerald-100 font-medium">
              &quot;{existingResponse.responseText}&quot;
            </p>
          )}

          {(existingResponse?.responseDocumentUrl || lastSentResult?.documentUrl) && (
            <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-emerald-100 text-xs">
              <div className="flex items-center gap-2 truncate">
                <FileCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                <span className="font-bold text-slate-900 truncate">
                  {existingResponse?.responseDocumentName || lastSentResult?.documentName || "दाखला / कागदपत्र.pdf"}
                </span>
              </div>
              <a
                href={existingResponse?.responseDocumentUrl || lastSentResult?.documentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold rounded-lg transition inline-flex items-center gap-1 shrink-0 text-[11px]"
              >
                <span>पहा / डाऊनलोड</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>
      )}

      {/* 3. Interactive Response Modal / Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#003625] to-emerald-900 text-white p-5 sm:p-6 flex items-start justify-between gap-3 shrink-0">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#F5D77F] mb-1">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>ग्रामपंचायत {villageName}</span>
                </div>
                <h3 className="text-lg sm:text-xl font-extrabold text-white">
                  नागरिकाला प्रतिसाद व दाखला पाठवा
                </h3>
                <p className="text-xs text-emerald-200/90 mt-0.5">
                  सर्व माहिती अर्जदाराच्या व्हॉट्सॲप क्रमांकावर पाठवली जाईल.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form
              onSubmit={handleSubmitResponse}
              className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1 text-xs"
            >
              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 flex items-center gap-2 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Prefilled Citizen Summary Badge */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2.5">
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  अर्जदाराचा तपशील (Prefilled Details)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-slate-200">
                    <User className="w-4 h-4 text-emerald-700 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[10px] text-slate-400">अर्जदार नाव</p>
                      <p className="font-bold text-slate-900 truncate">{applicantName}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-slate-200">
                    <Phone className="w-4 h-4 text-[#25D366] shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[10px] text-slate-400">व्हॉट्सॲप नंबर</p>
                      <p className="font-bold text-slate-900 font-mono truncate">{mobileNumber}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-slate-200">
                    <FileText className="w-4 h-4 text-emerald-700 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[10px] text-slate-400">मागितलेली सेवा</p>
                      <p className="font-bold text-slate-900 truncate">{serviceName}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-slate-200">
                    <Clock className="w-4 h-4 text-emerald-700 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[10px] text-slate-400">अर्ज क्रमांक</p>
                      <p className="font-mono font-bold text-emerald-900 truncate">{applicationNumber}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Selector */}
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-800 text-xs">
                  १. अर्जाची अंतिम स्थिती निवडा (Application Status) *
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-emerald-600 focus:outline-none bg-white"
                >
                  <option value="COMPLETED">✅ COMPLETED - दाखला / परवाना तयार व वितरित</option>
                  <option value="APPROVED">✅ APPROVED - अर्ज मंजूर करण्यात आला</option>
                  <option value="DOCUMENTS_REQUIRED">⚠️ DOCUMENTS_REQUIRED - अपूर्ण कागदपत्रे / त्रुटी</option>
                  <option value="REJECTED">❌ REJECTED - अर्ज नामंजूर करण्यात आला</option>
                  <option value="UNDER_REVIEW">ℹ️ UNDER_REVIEW - अर्जाची पडताळणी सुरू</option>
                </select>
              </div>

              {/* Upload Document / Certificate File */}
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-800 text-xs">
                  २. तयार केलेला दाखला / अधिकृत कागदपत्र अपलोड करा (Upload PDF/Image)
                </label>
                <div className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-4 text-center transition bg-slate-50/50">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,image/jpeg,image/png,image/jpg"
                    onChange={handleFileChange}
                    className="hidden"
                    id="admin-response-file"
                  />
                  {filePreviewName ? (
                    <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-emerald-200">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                        <span className="font-bold text-slate-900 truncate text-xs">
                          {filePreviewName}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveFile}
                        className="p-1 rounded-lg text-slate-400 hover:text-red-600 transition"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label
                      htmlFor="admin-response-file"
                      className="cursor-pointer flex flex-col items-center justify-center gap-1.5 py-2"
                    >
                      <Upload className="w-6 h-6 text-emerald-700" />
                      <span className="font-bold text-slate-800">
                        दाखला किंवा कागदपत्र फाईल निवडा (PDF, JPG, PNG)
                      </span>
                      <span className="text-[10px] text-slate-400">
                        जास्तीत जास्त आकार: १० MB
                      </span>
                    </label>
                  )}
                </div>
              </div>

              {/* Quick Template Chips */}
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-800 text-xs flex items-center justify-between">
                  <span>३. द्रुत संदेश पर्याय (Quick Template Messages)</span>
                  <span className="text-[10px] text-slate-400 font-normal">१-क्लिकने संदेश भरा</span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {TEMPLATES.map((tmpl) => (
                    <button
                      key={tmpl.id}
                      type="button"
                      onClick={() => handleApplyTemplate(tmpl)}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold transition border ${
                        status === tmpl.status
                          ? "bg-emerald-50 text-emerald-900 border-emerald-300 shadow-2xs font-bold"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {tmpl.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Message Text Area */}
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-800 text-xs">
                  ४. व्हॉट्सॲप संदेश / ग्रामपंचायत शेरा (Custom Message / Reason) *
                </label>
                <textarea
                  rows={3}
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="नागरिकासाठी संदेश लिहा उदा. आपला दाखला तयार असून संलग्न केला आहे..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none resize-none"
                  required
                />
              </div>

              {/* Live WhatsApp Message Preview Bubble */}
              <div className="space-y-1.5">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  व्हॉट्सॲप संदेश पूर्वावलोकन (Live WhatsApp Preview)
                </p>
                <div className="bg-[#EFEAE2] p-3.5 rounded-2xl border border-[#D1D7DB] text-slate-900 font-sans text-xs space-y-1.5 shadow-inner">
                  <div className="bg-white p-3 rounded-xl rounded-tl-none shadow-xs space-y-1">
                    <p className="font-bold text-emerald-950">
                      🏛️ ग्रामपंचायत {villageName} - अधिकृत नागरिक सेवा पोर्टल
                    </p>
                    <p className="text-slate-800">
                      नमस्कार <b>{applicantName}</b> जी,
                    </p>
                    <p className="text-slate-800">
                      आपण <b>{serviceName}</b> साठी सादर केलेल्या अर्जाबाबत (अर्ज क्र. <b>{applicationNumber}</b>) ग्रामपंचायतीचा अधिकृत प्रतिसाद:
                    </p>
                    <p className="text-slate-900 font-bold">
                      📌 सद्यस्थिती: {status}
                    </p>
                    <p className="text-slate-800 whitespace-pre-wrap">
                      💬 <b>शेरा:</b> {messageText}
                    </p>
                    {filePreviewName && (
                      <p className="text-emerald-800 font-semibold pt-1 border-t border-slate-100">
                        📄 दाखला डाऊनलोड लिंक सोबत पाठवली जाईल.
                      </p>
                    )}
                    <p className="text-[10px] text-slate-500 pt-1 text-right">
                      - ग्रामसेवक / सरपंच, {villageName}
                    </p>
                  </div>
                </div>
              </div>

              {/* Submission Action Area */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition text-xs"
                >
                  रद्द करा
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-7 py-3 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-slate-950 font-black transition shadow-md flex items-center justify-center gap-2 text-xs active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                      <span>प्रतिसाद सेव्ह होत आहे...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 text-slate-950" />
                      <span>प्रतिसाद सेव्ह करा व व्हॉट्सॲप उघडा</span>
                    </>
                  )}
                </button>
              </div>

              {lastSentResult?.whatsappUrl && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center justify-between gap-3 mt-2">
                  <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>प्रतिसाद यशस्वीरीत्या सेव्ह झाला!</span>
                  </div>
                  <a
                    href={lastSentResult.whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-1.5 bg-[#25D366] hover:bg-[#1EBE5D] text-slate-950 font-bold rounded-lg transition inline-flex items-center gap-1.5 text-xs shadow-xs"
                  >
                    <span>व्हॉट्सॲप पुन्हा उघडा</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
