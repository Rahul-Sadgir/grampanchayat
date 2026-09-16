"use client";

import { useState, useRef } from "react";
import {
  FileText,
  Plus,
  Edit2,
  Trash2,
  Upload,
  Download,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  X,
  FileCheck2,
  FileCode,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  RefreshCw,
  Search,
  Filter,
} from "lucide-react";
import {
  saveServiceOrPdf,
  deleteService,
  toggleServiceStatus,
} from "@/lib/actions/services";

interface ServiceItem {
  _id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  tabCategory: string;
  icon: string;
  fileUrl?: string;
  fileName?: string;
  isPdfOnly: boolean;
  order: number;
  isActive: boolean;
  villageSlug?: string;
  villageName?: string;
}

interface Props {
  initialServices: ServiceItem[];
  villages: { name: string; slug: string }[];
}

const TAB_CATEGORIES = [
  { id: "ALL", label: "सर्व विभाग" },
  { id: "aarz", label: "अर्जांचे नमुने (Aarz)" },
  { id: "certificates", label: "दाखले व प्रमाणपत्रे (Certificates)" },
  { id: "self-declaration", label: "स्वयंघोषणापत्रे (Self-Declaration)" },
  { id: "tax", label: "कर आकारणी (Taxation)" },
  { id: "rti", label: "माहितीचा अधिकार (RTI)" },
  { id: "grievance", label: "तक्रार निवारण (Grievance)" },
];

export function ServiceManagerClient({
  initialServices,
  villages,
}: Props) {
  const [services, setServices] = useState<ServiceItem[]>(initialServices);
  const [selectedVillage, setSelectedVillage] = useState<string>("ALL");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);

  // Form State
  const [villageSlug, setVillageSlug] = useState(villages[0]?.slug || "komalwadi");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [tabCategory, setTabCategory] = useState("aarz");
  const [category, setCategory] = useState("दाखले व अर्ज");
  const [isPdfOnly, setIsPdfOnly] = useState(false);
  const [fileUrl, setFileUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [order, setOrder] = useState(0);
  const [selectedPdfFile, setSelectedPdfFile] = useState<File | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const openAddModal = () => {
    setEditingService(null);
    setVillageSlug(selectedVillage === "ALL" ? villages[0]?.slug || "komalwadi" : selectedVillage);
    setName("");
    setSlug("");
    setDescription("");
    setTabCategory(selectedCategory === "ALL" ? "aarz" : selectedCategory);
    setCategory("दाखले व अर्ज");
    setIsPdfOnly(false);
    setFileUrl("");
    setFileName("");
    setOrder(services.length + 1);
    setSelectedPdfFile(null);
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const openEditModal = (svc: ServiceItem) => {
    setEditingService(svc);
    setVillageSlug(svc.villageSlug || villages[0]?.slug || "komalwadi");
    setName(svc.name);
    setSlug(svc.slug);
    setDescription(svc.description);
    setTabCategory(svc.tabCategory || "aarz");
    setCategory(svc.category || "दाखले व अर्ज");
    setIsPdfOnly(Boolean(svc.isPdfOnly));
    setFileUrl(svc.fileUrl || "");
    setFileName(svc.fileName || "");
    setOrder(svc.order || 0);
    setSelectedPdfFile(null);
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedPdfFile(file);
      setFileName(file.name);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const formData = new FormData();
      if (editingService) {
        formData.append("id", editingService._id);
      }
      formData.append("villageSlug", villageSlug);
      formData.append("name", name);
      formData.append("slug", slug);
      formData.append("description", description);
      formData.append("tabCategory", tabCategory);
      formData.append("category", category);
      formData.append("isPdfOnly", String(isPdfOnly));
      formData.append("order", String(order));
      formData.append("fileUrl", fileUrl);
      formData.append("fileName", fileName);

      if (selectedPdfFile) {
        formData.append("pdfFile", selectedPdfFile);
      }

      const res = await saveServiceOrPdf(formData);

      if (res.success && res.service) {
        if (editingService) {
          setServices((prev) =>
            prev.map((s) => (s._id === editingService._id ? res.service : s))
          );
          setSuccessMsg("सेवा / अर्ज माहिती अद्यतनित केली!");
        } else {
          setServices((prev) => [res.service, ...prev]);
          setSuccessMsg("नवीन सेवा / अर्ज यशस्वीरीत्या जोडला गेला!");
        }
        setIsModalOpen(false);
        setTimeout(() => setSuccessMsg(null), 4000);
      } else {
        setErrorMsg(res.error || "माहिती सेव्ह करताना अडचण आली.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "त्रुटी आली.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (svcId: string, svcName: string) => {
    if (!confirm(`तुम्हाला नक्की "${svcName}" ही सेवा काढून टाकायची आहे का?`)) {
      return;
    }

    try {
      const res = await deleteService(svcId);
      if (res.success) {
        setServices((prev) => prev.filter((s) => s._id !== svcId));
        setSuccessMsg("सेवा यशस्वीरीत्या काढून टाकली.");
        setTimeout(() => setSuccessMsg(null), 3000);
      } else {
        alert("त्रुटी: " + res.error);
      }
    } catch (err: any) {
      alert("त्रुटी: " + err.message);
    }
  };

  const handleToggle = async (svcId: string, current: boolean) => {
    try {
      const res = await toggleServiceStatus(svcId, !current);
      if (res.success) {
        setServices((prev) =>
          prev.map((s) => (s._id === svcId ? { ...s, isActive: !current } : s))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredServices = services.filter((s) => {
    const matchVillage = selectedVillage === "ALL" || s.villageSlug === selectedVillage;
    const matchCategory = selectedCategory === "ALL" || s.tabCategory === selectedCategory;
    const matchQuery =
      !searchQuery ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchVillage && matchCategory && matchQuery;
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            नागरिक सेवा, अर्ज नमुने व PDFs व्यवस्थापन
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            नवीन अर्जांचे नमुने, प्रमाणपत्रे, स्वयंघोषणापत्रे किंवा थेट डाऊनलोड करण्यायोग्य PDFs (Cloudinary) जोडा व संपादित करा.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="px-5 py-3 bg-emerald-800 hover:bg-emerald-900 text-white rounded-2xl text-xs font-bold transition shadow-sm active:scale-95 flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>नवीन सेवा / अर्ज PDF जोडा</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-900 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Filters & Search */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="सेवा किंवा अर्जाचे नाव शोधा..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
            />
          </div>

          {/* Village Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
              गाव:
            </span>
            <button
              type="button"
              onClick={() => setSelectedVillage("ALL")}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition shrink-0 ${
                selectedVillage === "ALL"
                  ? "bg-emerald-800 text-white shadow-xs"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              सर्व ({services.length})
            </button>
            {villages.map((v) => (
              <button
                key={v.slug}
                type="button"
                onClick={() => setSelectedVillage(v.slug)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition shrink-0 ${
                  selectedVillage === v.slug
                    ? "bg-emerald-800 text-white shadow-xs"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                }`}
              >
                {v.name}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-slate-100 pb-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
            विभाग:
          </span>
          {TAB_CATEGORIES.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedCategory(tab.id)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition shrink-0 ${
                selectedCategory === tab.id
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Services Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4">सेवेचे / अर्जाचे नाव</th>
                <th className="py-3.5 px-4">गाव</th>
                <th className="py-3.5 px-4">विभाग (Tab)</th>
                <th className="py-3.5 px-4">प्रकार (Type)</th>
                <th className="py-3.5 px-4">कागदपत्र / PDF</th>
                <th className="py-3.5 px-4">सक्रिय</th>
                <th className="py-3.5 px-4 text-right">कृती</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredServices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                    निवडलेल्या निकषांनुसार कोणत्याही सेवा किंवा अर्ज आढळले नाहीत.
                  </td>
                </tr>
              ) : (
                filteredServices.map((svc) => (
                  <tr key={svc._id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 text-xs">
                        {svc.name}
                      </div>
                      {svc.description && (
                        <div className="text-[11px] text-slate-500 line-clamp-1 max-w-xs">
                          {svc.description}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium text-[11px]">
                        {svc.villageSlug || "सर्व"}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-bold text-[10px] border border-emerald-200">
                        {svc.tabCategory || "aarz"}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      {svc.isPdfOnly ? (
                        <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-900 font-bold text-[10px] border border-amber-200">
                          📄 PDF अर्ज
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-900 font-bold text-[10px] border border-blue-200">
                          📝 ऑनलाइन फॉर्म
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      {svc.fileUrl ? (
                        <a
                          href={svc.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-emerald-700 hover:underline font-bold text-[11px]"
                        >
                          <Download className="w-3 h-3" />
                          <span>PDF पहा</span>
                        </a>
                      ) : (
                        <span className="text-slate-400 text-[10px]">—</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <button
                        type="button"
                        onClick={() => handleToggle(svc._id, svc.isActive)}
                        className="cursor-pointer text-xs"
                      >
                        {svc.isActive ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                            सक्रिय
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 font-bold text-[10px]">
                            बंद
                          </span>
                        )}
                      </button>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditModal(svc)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                          title="संपादित करा"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(svc._id, svc.name)}
                          className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition"
                          title="काढून टाका"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Service Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#003625] to-emerald-900 text-white p-5 flex items-center justify-between gap-3 shrink-0">
              <div>
                <h3 className="text-lg font-extrabold text-white">
                  {editingService ? "सेवा / अर्ज संपादित करा" : "नवीन सेवा / अर्ज PDF जोडा"}
                </h3>
                <p className="text-xs text-emerald-200/90 mt-0.5">
                  नागरिक सेवा विभागातील टॅब्समध्ये ही सेवा थेट जोडली जाईल.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <form
              onSubmit={handleSubmit}
              className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1 text-xs"
            >
              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 flex items-center gap-2 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Village & Category Tab */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    गाव निवडा *
                  </label>
                  <select
                    value={villageSlug}
                    onChange={(e) => setVillageSlug(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-emerald-600 focus:outline-none bg-white"
                  >
                    {villages.map((v) => (
                      <option key={v.slug} value={v.slug}>
                        {v.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    विभाग टॅब (Citizen Tab) *
                  </label>
                  <select
                    value={tabCategory}
                    onChange={(e) => setTabCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-emerald-600 focus:outline-none bg-white"
                  >
                    <option value="aarz">अर्जांचे नमुने (Aarz)</option>
                    <option value="certificates">दाखले व प्रमाणपत्रे (Certificates)</option>
                    <option value="self-declaration">स्वयंघोषणापत्रे (Self-Declaration)</option>
                    <option value="tax">कर आकारणी (Taxation)</option>
                    <option value="rti">माहितीचा अधिकार (RTI)</option>
                    <option value="grievance">तक्रार निवारण (Grievance)</option>
                  </select>
                </div>
              </div>

              {/* Service Name */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  सेवेचे / अर्जाचे नाव *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="उदा. जन्म नोंद प्रमाणपत्र अर्ज"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none font-medium"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  वर्णन / तपशील
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="सेवेबद्दल संक्षिप्त माहिती..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              {/* Type Switch: PDF vs Online Form */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
                <label className="block font-bold text-slate-800 text-xs">
                  सेवेचे स्वरूप निवडा:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setIsPdfOnly(false)}
                    className={`p-3 rounded-xl border text-center transition font-bold text-xs ${
                      !isPdfOnly
                        ? "bg-emerald-50 border-emerald-400 text-emerald-950 shadow-2xs"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    📝 ऑनलाइन अर्ज फॉर्म
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsPdfOnly(true)}
                    className={`p-3 rounded-xl border text-center transition font-bold text-xs ${
                      isPdfOnly
                        ? "bg-amber-50 border-amber-400 text-amber-950 shadow-2xs"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    📄 डाउनलोड PDF फॉर्म
                  </button>
                </div>
              </div>

              {/* Upload PDF Form (Cloudinary) */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  अर्ज नमुना PDF अपलोड करा (Cloudinary Storage)
                </label>
                <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                    id="service-pdf-input"
                  />
                  <label
                    htmlFor="service-pdf-input"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-xl font-bold text-xs cursor-pointer shadow-2xs transition"
                  >
                    <Upload className="w-3.5 h-3.5 text-emerald-700" />
                    <span>PDF फाईल निवडा</span>
                  </label>

                  <div className="min-w-0 flex-1">
                    {fileName ? (
                      <p className="text-xs font-bold text-emerald-900 truncate">
                        {fileName}
                      </p>
                    ) : fileUrl ? (
                      <p className="text-xs text-slate-600 font-mono truncate">
                        विद्यमान: {fileUrl}
                      </p>
                    ) : (
                      <p className="text-[11px] text-slate-400">
                        कोणतीही फाईल निवडलेली नाही
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Order */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  प्रदर्शन क्रम (Order)
                </label>
                <input
                  type="number"
                  value={order}
                  onChange={(e) => setOrder(Number(e.target.value))}
                  className="w-24 px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition text-xs cursor-pointer"
                >
                  रद्द करा
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl text-xs transition shadow-sm active:scale-95 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>सेव्ह होत आहे...</span>
                    </>
                  ) : (
                    <span>{editingService ? "बदल सेव्ह करा" : "जोडा"}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
