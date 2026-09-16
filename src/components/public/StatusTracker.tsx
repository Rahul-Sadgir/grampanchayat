"use client";

import { useState } from "react";
import { trackCitizenApplication } from "@/lib/actions/tracking";
import { CheckCircle2, Clock, Search, AlertCircle } from "lucide-react";

const STATUS_LABELS: Record<string, { label: string; color: string; desc: string }> = {
  SUBMITTED: {
    label: "अर्ज सादर झाला (SUBMITTED)",
    color: "bg-blue-50 text-blue-800 border-blue-200",
    desc: "आपला अर्ज ग्रामपंचायत प्रणालीमध्ये यशस्वीरित्या दाखल झाला आहे.",
  },
  UNDER_REVIEW: {
    label: "कागदपत्रे छाननी सुरू (UNDER_REVIEW)",
    color: "bg-amber-50 text-amber-800 border-amber-200",
    desc: "ग्रामसेवक / अधिकारी आपल्या अर्जाची व कागदपत्रांची पडताळणी करत आहेत.",
  },
  DOCUMENTS_REQUIRED: {
    label: "कागदपत्रे प्रलंबित (DOCUMENTS_REQUIRED)",
    color: "bg-orange-50 text-orange-800 border-orange-200",
    desc: "अर्जाच्या छाननीनंतर काही अतिरिक्त कागदपत्रांची आवश्यकता आहे.",
  },
  DOCUMENTS_SUBMITTED: {
    label: "कागदपत्रे सादर झाली (DOCUMENTS_SUBMITTED)",
    color: "bg-cyan-50 text-cyan-800 border-cyan-200",
    desc: "मागितलेली पूर्तता कागदपत्रे प्राप्त झाली असून पुढील तपासणी सुरू आहे.",
  },
  APPROVED: {
    label: "अर्ज मंजूर (APPROVED)",
    color: "bg-emerald-50 text-emerald-800 border-emerald-200",
    desc: "आपला अर्ज मंजूर करण्यात आला आहे. दाखला तयार करण्याचे काम प्रगतिपथावर आहे.",
  },
  COMPLETED: {
    label: "दाखला / प्रमाणपत्र तयार (COMPLETED)",
    color: "bg-[#003625] text-white border-[#003625]",
    desc: "आपला दाखला तयार असून आपण ग्रामपंचायत कार्यालयातून अधिकृत स्वाक्षरी व शिक्क्यासह प्राप्त करू शकता.",
  },
  REJECTED: {
    label: "अर्ज नाकारला (REJECTED)",
    color: "bg-red-50 text-red-800 border-red-200",
    desc: "काही त्रुटींमुळे किंवा अपूर्ण माहितीमुळे आपला अर्ज फेटाळण्यात आला आहे.",
  },
};

export function StatusTracker() {
  const [appNum, setAppNum] = useState("");
  const [mobile, setMobile] = useState("");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await trackCitizenApplication(appNum, mobile);
    setLoading(false);
    if (res.success) {
      setResult(res.data);
    } else {
      setError(res.error || "माहिती आढळली नाही.");
      setResult(null);
    }
  }

  const currentStatusInfo = result ? STATUS_LABELS[result.status] || {
    label: result.status,
    color: "bg-slate-100 text-slate-800 border-slate-200",
    desc: "",
  } : null;

  return (
    <div className="space-y-6">
      <form onSubmit={handleSearch} className="bg-white p-6 rounded-3xl shadow-xs border border-[#E5DEC9] space-y-4">
        <div>
          <label className="block text-xs font-bold text-[#1E2621] mb-1.5">नोंदणीकृत अर्ज क्रमांक (Application ID) *</label>
          <input
            value={appNum}
            onChange={(e) => setAppNum(e.target.value)}
            placeholder="उदा. GUL-BIRTH-2026-000001"
            required
            className="w-full px-4 py-3 rounded-xl bg-[#FBF9F5] border border-[#E5DEC9] focus:ring-2 focus:ring-[#003625] focus:bg-white focus:outline-none uppercase font-mono text-xs sm:text-sm text-[#1E2621]"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-[#1E2621] mb-1.5">१० अंकी मोबाईल क्रमांक *</label>
          <input
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            type="tel"
            placeholder="उदा. ९८XXXXXXXX"
            required
            className="w-full px-4 py-3 rounded-xl bg-[#FBF9F5] border border-[#E5DEC9] focus:ring-2 focus:ring-[#003625] focus:bg-white focus:outline-none text-xs sm:text-sm text-[#1E2621]"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-[#9e4300] hover:bg-[#692b00] text-white rounded-xl font-bold flex items-center justify-center gap-2 transition text-xs sm:text-sm shadow-xs disabled:opacity-50 active:scale-98 cursor-pointer"
        >
          <Search className="w-4 h-4" />
          {loading ? "तपासत आहे..." : "स्थिती तपासा"}
        </button>
      </form>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs sm:text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {result && currentStatusInfo && (
        <div className="bg-white p-6 rounded-3xl shadow-xs border border-[#E5DEC9] space-y-6 animate-in fade-in-50 duration-300">
          <div className="border-b border-[#E5DEC9] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-[#003625] bg-[#F4EFE6] px-3 py-1 rounded-full border border-[#E5DEC9]">
                {result.villageName} • {result.serviceName}
              </span>
              <h3 className="text-lg font-extrabold text-[#003625] mt-2">{result.applicantName}</h3>
              <p className="text-xs font-mono text-[#526056] mt-0.5">अर्ज क्रमांक: {result.applicationNumber}</p>
            </div>
            <div className="shrink-0">
              <span className={`inline-block px-3 py-1.5 rounded-full text-xs font-extrabold border ${currentStatusInfo.color}`}>
                {currentStatusInfo.label}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#FBF9F5] border border-[#E5DEC9] text-xs sm:text-sm text-[#1E2621] space-y-2">
            <p className="font-medium text-[#526056]">{currentStatusInfo.desc}</p>
            <p className="text-[11px] text-[#526056]">
              सादर केल्याचा दिनांक: <span className="font-semibold text-[#1E2621]">{new Date(result.submittedAt).toLocaleDateString("mr-IN", { day: "numeric", month: "long", year: "numeric" })}</span>
            </p>
          </div>

          {result.adminNotes && (
            <div className="p-4 bg-[#F4EFE6] border border-[#E5DEC9] rounded-2xl text-xs sm:text-sm text-[#003625]">
              <span className="font-bold block mb-1">ग्रामपंचायत शेरा / सूचना:</span>
              <p className="whitespace-pre-line">{result.adminNotes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}