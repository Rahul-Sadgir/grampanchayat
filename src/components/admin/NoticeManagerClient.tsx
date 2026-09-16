"use client";

import { useState, useRef } from "react";
import {
  Bell,
  Plus,
  Edit2,
  Trash2,
  Upload,
  Download,
  CheckCircle2,
  AlertCircle,
  X,
  Calendar,
  Sparkles,
  Flame,
  FileText,
  Search,
  RefreshCw,
} from "lucide-react";
import {
  saveNotice,
  deleteNotice,
  toggleNoticeImportant,
} from "@/lib/actions/notices";

interface NoticeItem {
  _id: string;
  title: string;
  content: string;
  category: string;
  documentUrl?: string;
  fileName?: string;
  isImportant: boolean;
  publishedAt: string;
  villageSlug?: string;
  villageName?: string;
}

interface Props {
  initialNotices: NoticeItem[];
  villages: { name: string; slug: string }[];
}

const NOTICE_CATEGORIES = [
  "जाहिर सूचना",
  "ग्रामसभा नोटीस",
  "निविदा (Tender)",
  "विकासकाम बातमी",
  "आरोग्य व लसीकरण",
  "कृषी कार्यशाळा",
  "कार्यक्रम व उत्सव",
];

export function NoticeManagerClient({ initialNotices, villages }: Props) {
  const [notices, setNotices] = useState<NoticeItem[]>(initialNotices);
  const [selectedVillage, setSelectedVillage] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<NoticeItem | null>(null);

  // Form State
  const [villageSlug, setVillageSlug] = useState(villages[0]?.slug || "komalwadi");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState(NOTICE_CATEGORIES[0]);
  const [isImportant, setIsImportant] = useState(false);
  const [publishedAt, setPublishedAt] = useState(new Date().toISOString().split("T")[0]);
  const [documentUrl, setDocumentUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [selectedDocFile, setSelectedDocFile] = useState<File | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const openAddModal = () => {
    setEditingNotice(null);
    setVillageSlug(selectedVillage === "ALL" ? villages[0]?.slug || "komalwadi" : selectedVillage);
    setTitle("");
    setContent("");
    setCategory(NOTICE_CATEGORIES[0]);
    setIsImportant(false);
    setPublishedAt(new Date().toISOString().split("T")[0]);
    setDocumentUrl("");
    setFileName("");
    setSelectedDocFile(null);
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const openEditModal = (n: NoticeItem) => {
    setEditingNotice(n);
    setVillageSlug(n.villageSlug || villages[0]?.slug || "komalwadi");
    setTitle(n.title);
    setContent(n.content);
    setCategory(n.category || NOTICE_CATEGORIES[0]);
    setIsImportant(Boolean(n.isImportant));
    setPublishedAt(
      n.publishedAt ? new Date(n.publishedAt).toISOString().split("T")[0] : new Date().toISOString().split("T")[0]
    );
    setDocumentUrl(n.documentUrl || "");
    setFileName(n.fileName || "");
    setSelectedDocFile(null);
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedDocFile(file);
      setFileName(file.name);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const formData = new FormData();
      if (editingNotice) {
        formData.append("id", editingNotice._id);
      }
      formData.append("villageSlug", villageSlug);
      formData.append("title", title);
      formData.append("content", content);
      formData.append("category", category);
      formData.append("isImportant", String(isImportant));
      formData.append("publishedAt", publishedAt);
      formData.append("documentUrl", documentUrl);
      formData.append("fileName", fileName);

      if (selectedDocFile) {
        formData.append("docFile", selectedDocFile);
      }

      const res = await saveNotice(formData);

      if (res.success && res.notice) {
        if (editingNotice) {
          setNotices((prev) =>
            prev.map((n) => (n._id === editingNotice._id ? res.notice : n))
          );
          setSuccessMsg("सूचना यशस्वीरीत्या अद्यतनित केली!");
        } else {
          setNotices((prev) => [res.notice, ...prev]);
          setSuccessMsg("नवीन जाहीर सूचना यशस्वीरीत्या प्रकाशित झाली!");
        }
        setIsModalOpen(false);
        setTimeout(() => setSuccessMsg(null), 4000);
      } else {
        setErrorMsg(res.error || "सूचना सेव्ह करताना अडचण आली.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "त्रुटी आली.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, noticeTitle: string) => {
    if (!confirm(`तुम्हाला नक्की "${noticeTitle}" ही सूचना काढून टाकायची आहे का?`)) {
      return;
    }

    try {
      const res = await deleteNotice(id);
      if (res.success) {
        setNotices((prev) => prev.filter((n) => n._id !== id));
        setSuccessMsg("सूचना काढून टाकली.");
        setTimeout(() => setSuccessMsg(null), 3000);
      } else {
        alert("त्रुटी: " + res.error);
      }
    } catch (err: any) {
      alert("त्रुटी: " + err.message);
    }
  };

  const handleToggleImportant = async (id: string, current: boolean) => {
    try {
      const nextState = !current;
      // Optimistic update
      setNotices((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isImportant: nextState } : n))
      );

      const res = await toggleNoticeImportant(id, nextState);
      if (res.success) {
        if (res.notice && res.notice._id) {
          setNotices((prev) =>
            prev.map((n) =>
              n._id === id ? { ...res.notice, isImportant: res.isImportant ?? nextState } : n
            )
          );
        }
        setSuccessMsg(
          nextState
            ? "सूचना 'महत्त्वाची' म्हणून चिन्हांकित केली! (मुख्य पृष्ठावर अग्रक्रमाने ठळक दिसेल)"
            : "सूचनेची 'महत्त्वाची' स्थिती काढली."
        );
        setTimeout(() => setSuccessMsg(null), 3500);
      } else {
        // Rollback
        setNotices((prev) =>
          prev.map((n) => (n._id === id ? { ...n, isImportant: current } : n))
        );
        setErrorMsg(res.error || "स्थिती बदलता आली नाही.");
      }
    } catch (err: any) {
      // Rollback
      setNotices((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isImportant: current } : n))
      );
      console.error(err);
      setErrorMsg(err.message || "त्रुटी आली.");
    }
  };

  const filteredNotices = notices.filter((n) => {
    const matchVillage = selectedVillage === "ALL" || n.villageSlug === selectedVillage;
    const matchQuery =
      !searchQuery ||
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchVillage && matchQuery;
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            जाहीर सूचना, ग्रामसभा व बातम्या फलक
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            ग्रामसभेच्या नोटिसा, निविदा, विकासकामांचे परिपत्रक व महत्त्वपूर्ण घडामोडी प्रकाशित करा.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="px-5 py-3 bg-emerald-800 hover:bg-emerald-900 text-white rounded-2xl text-xs font-bold transition shadow-sm active:scale-95 flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>नवीन जाहीर सूचना जोडा</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-900 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Filters & Village Selector */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="सूचनेचे शीर्षक किंवा मजकूर शोधा..."
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
            सर्व ({notices.length})
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

      {/* Notices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredNotices.length === 0 ? (
          <div className="col-span-full py-16 bg-white rounded-3xl border border-slate-200 text-center space-y-3">
            <Bell className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-xs text-slate-500 font-medium">
              कोणतीही जाहीर सूचना उपलब्ध नाही.
            </p>
            <button
              type="button"
              onClick={openAddModal}
              className="px-4 py-2 bg-emerald-800 text-white rounded-xl text-xs font-bold hover:bg-emerald-900 transition"
            >
              पहिली सूचना प्रकाशित करा
            </button>
          </div>
        ) : (
          filteredNotices.map((n) => (
            <div
              key={n._id}
              className={`bg-white rounded-3xl p-5 border transition-all hover:shadow-md flex flex-col justify-between space-y-3.5 ${
                n.isImportant
                  ? "border-amber-300 ring-2 ring-amber-400/20 shadow-xs"
                  : "border-slate-200 shadow-2xs"
              }`}
            >
              <div className="space-y-2.5">
                {/* Header Tags */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-200 text-[10px] font-bold">
                    {n.category || "जाहिर सूचना"}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {n.isImportant && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold flex items-center gap-1">
                        <Flame className="w-3 h-3 text-amber-600" />
                        <span>महत्त्वाची</span>
                      </span>
                    )}
                    <span className="text-[10px] text-slate-400 font-mono">
                      {n.villageSlug}
                    </span>
                  </div>
                </div>

                {/* Title & Content */}
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm leading-snug">
                    {n.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-3 leading-relaxed">
                    {n.content}
                  </p>
                </div>

                {/* Published Date */}
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 pt-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    {n.publishedAt
                      ? new Date(n.publishedAt).toLocaleDateString("mr-IN")
                      : "—"}
                  </span>
                </div>

                {/* Attached File */}
                {n.documentUrl && (
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium truncate text-[11px]">
                      {n.fileName || "परिपत्रक / PDF"}
                    </span>
                    <a
                      href={n.documentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg font-bold text-[11px] inline-flex items-center gap-1 shrink-0"
                    >
                      <Download className="w-3 h-3" />
                      <span>PDF</span>
                    </a>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleToggleImportant(n._id, n.isImportant)}
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition ${
                    n.isImportant
                      ? "bg-amber-100 text-amber-900 hover:bg-amber-200"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {n.isImportant ? "★ महत्त्वाची" : "☆ सामान्य"}
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => openEditModal(n)}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                    title="संपादित करा"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(n._id, n.title)}
                    className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition cursor-pointer"
                    title="काढून टाका"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#003625] to-emerald-900 text-white p-5 flex items-center justify-between gap-3 shrink-0">
              <div>
                <h3 className="text-lg font-extrabold text-white">
                  {editingNotice ? "जाहीर सूचना संपादित करा" : "नवीन जाहीर सूचना प्रकाशित करा"}
                </h3>
                <p className="text-xs text-emerald-200/90 mt-0.5">
                  ही सूचना मुख्य पृष्ठावर व सूचना फलकावर तात्काळ दिसेल.
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

            {/* Form Body */}
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

              {/* Village & Category */}
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
                    सूचनेचा प्रकार (Category) *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-emerald-600 focus:outline-none bg-white"
                  >
                    {NOTICE_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  सूचनेचे शीर्षक (Title) *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="उदा. स्वातंत्र्यदिन विशेष ग्रामसभा जाहीर नोटीस"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none font-medium"
                  required
                />
              </div>

              {/* Content */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  सूचनेचा सविस्तर मजकूर *
                </label>
                <textarea
                  rows={4}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="नागरिकांसाठी संपूर्ण सूचना किंवा इतिवृत्त तपशील लिहा..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  required
                />
              </div>

              {/* Date & Important Check */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    प्रकाशन दिनांक
                  </label>
                  <input
                    type="date"
                    value={publishedAt}
                    onChange={(e) => setPublishedAt(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>

                <div className="pt-4">
                  <label className="flex items-center gap-2.5 cursor-pointer font-bold text-xs bg-amber-50/80 hover:bg-amber-100/80 p-3 rounded-xl border border-amber-300 text-amber-950 transition select-none">
                    <input
                      type="checkbox"
                      checked={Boolean(isImportant)}
                      onChange={(e) => setIsImportant(e.target.checked)}
                      className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 cursor-pointer accent-amber-600"
                    />
                    <span className="flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>महत्त्वाची सूचना (मुख्य पृष्ठावर व सूचना फलकावर अग्रक्रमाने ठळक करा)</span>
                    </span>
                  </label>
                </div>
              </div>

              {/* Upload Attachment PDF (Cloudinary) */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  परिपत्रक / अधिकृत PDF किंवा प्रतिमा (Cloudinary Storage)
                </label>
                <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="notice-doc-input"
                  />
                  <label
                    htmlFor="notice-doc-input"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-xl font-bold text-xs cursor-pointer shadow-2xs transition"
                  >
                    <Upload className="w-3.5 h-3.5 text-emerald-700" />
                    <span>कागदपत्र निवडा</span>
                  </label>

                  <div className="min-w-0 flex-1">
                    {fileName ? (
                      <p className="text-xs font-bold text-emerald-900 truncate">
                        {fileName}
                      </p>
                    ) : documentUrl ? (
                      <p className="text-xs text-slate-600 font-mono truncate">
                        विद्यमान: {documentUrl}
                      </p>
                    ) : (
                      <p className="text-[11px] text-slate-400">
                        कोणतीही फाईल निवडलेली नाही (पर्यायी)
                      </p>
                    )}
                  </div>
                </div>
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
                      <span>प्रकाशित होत आहे...</span>
                    </>
                  ) : (
                    <span>{editingNotice ? "बदल सेव्ह करा" : "प्रकाशित करा"}</span>
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
