"use client";

import React, { useState, useTransition } from "react";
import Image from "next/image";
import {
  BookOpen,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Download,
  AlertCircle,
  Sparkles,
  Globe2,
  Image as ImageIcon,
  Award,
  Users,
} from "lucide-react";
import {
  saveScheme,
  deleteScheme,
  toggleSchemeStatus,
  seedDefaultSchemes,
} from "@/lib/actions/schemes";

interface SchemeItem {
  _id: string;
  villageSlug?: string;
  slug: string;
  title: string;
  category: string;
  imageUrl?: string;
  description: string;
  subsidyDetails?: string;
  targetAudience?: string;
  benefits?: string[];
  eligibility?: string;
  documentsRequired?: string;
  applicationProcess?: string;
  content?: string;
  externalLink?: string;
  attachmentUrl?: string;
  attachmentName?: string;
  isActive: boolean;
  createdAt?: string;
}

interface Props {
  initialSchemes: SchemeItem[];
}

const CATEGORIES = [
  "सर्व (All)",
  "शेतकरी कल्याण",
  "घरकुल व निवारा",
  "महिला व बालविकास",
  "रोजगार व हमी",
  "ग्रामविकास व पायाभूत",
  "कृषी व जलसंधारण",
  "शिक्षण व आरोग्य",
  "सामाजिक न्याय",
];

const PRESET_SCHEME_IMAGES = [
  { name: "घरकुल / पक्के घर (PMAY)", url: "/images/schemes/pmay-gharkul.jpg" },
  { name: "सौर कृषी पंप व शेततळे", url: "/images/schemes/solar-pump-shettale.jpg" },
  { name: "शेतकरी सन्मान निधी", url: "/images/schemes/pm-kisan-farmer.jpg" },
  { name: "महिला बचत गट व लाडकी बहीण", url: "/images/schemes/mahila-bal-kalyan.jpg" },
  { name: "मनरेगा रोजगार हमी", url: "/images/schemes/mgnrega-rozgar.jpg" },
  { name: "१५ वा वित्त आयोग पायाभूत विकास", url: "/images/schemes/gram-vikas-infra.jpg" },
];

export function SchemeManagerClient({ initialSchemes }: Props) {
  const [schemes, setSchemes] = useState<SchemeItem[]>(initialSchemes);
  const [selectedCategory, setSelectedCategory] = useState<string>("सर्व (All)");
  const [searchQuery, setSearchQuery] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingScheme, setEditingScheme] = useState<SchemeItem | null>(null);
  const [selectedPresetImage, setSelectedPresetImage] = useState<string>("");
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Filter schemes
  const filteredSchemes = schemes.filter((s) => {
    const matchCategory =
      selectedCategory === "सर्व (All)" || s.category.includes(selectedCategory.split(" ")[0]);

    const matchSearch =
      searchQuery === "" ||
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.category.toLowerCase().includes(searchQuery.toLowerCase());

    return matchCategory && matchSearch;
  });

  const handleOpenAddModal = () => {
    setEditingScheme(null);
    setSelectedPresetImage(PRESET_SCHEME_IMAGES[0].url);
    setErrorMsg("");
    setSuccessMsg("");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (scheme: SchemeItem) => {
    setEditingScheme(scheme);
    setSelectedPresetImage(scheme.imageUrl || PRESET_SCHEME_IMAGES[0].url);
    setErrorMsg("");
    setSuccessMsg("");
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    const formData = new FormData(e.currentTarget);
    if (editingScheme) {
      formData.set("id", editingScheme._id);
      if (editingScheme.attachmentUrl) {
        formData.set("existingAttachmentUrl", editingScheme.attachmentUrl);
      }
      if (editingScheme.attachmentName) {
        formData.set("existingAttachmentName", editingScheme.attachmentName);
      }
    }
    formData.set("existingImageUrl", selectedPresetImage || editingScheme?.imageUrl || "/images/schemes/pmay-gharkul.jpg");

    startTransition(async () => {
      const res = await saveScheme(formData);
      if (res.success) {
        setSuccessMsg(
          editingScheme ? "योजना यशस्वीरीत्या अद्यतनित झाली!" : "नवीन योजना यशस्वीरीत्या जोडली!"
        );
        setIsModalOpen(false);
        window.location.reload();
      } else {
        setErrorMsg(res.error || "त्रुटी आली.");
      }
    });
  };

  const handleDelete = (schemeId: string, title: string) => {
    if (!confirm(`तुम्हाला नक्की '${title}' ही योजना हटवायची आहे का?`)) return;

    startTransition(async () => {
      const res = await deleteScheme(schemeId);
      if (res.success) {
        setSchemes((prev) => prev.filter((s) => s._id !== schemeId));
      } else {
        alert(res.error || "हटवताना त्रुटी आली.");
      }
    });
  };

  const handleToggleStatus = (schemeId: string) => {
    startTransition(async () => {
      const res = await toggleSchemeStatus(schemeId);
      if (res.success) {
        setSchemes((prev) =>
          prev.map((s) => (s._id === schemeId ? { ...s, isActive: res.isActive ?? !s.isActive } : s))
        );
      }
    });
  };

  const handleSeed = () => {
    if (!confirm("सर्व ग्रामपंचायतींसाठी प्राथमिक समृद्ध शासकीय योजना डेटा लोड करायचा का?")) return;
    startTransition(async () => {
      const res = await seedDefaultSchemes();
      if (res.success) {
        alert(`यशस्वी! ${res.count} शासकीय योजना जोडल्या गेल्या.`);
        window.location.reload();
      } else {
        alert(res.error || "त्रुटी आली.");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-800">
              <BookOpen className="w-5 h-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              शासकीय योजना व ब्लॉग व्यवस्थापन (CMS)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
            <Globe2 className="w-3.5 h-3.5 text-emerald-700 inline" />
            <span>
              प्रत्येक शासकीय योजना स्वतंत्र माहितीपूर्ण ब्लॉग व मार्गदर्शक म्हणून सर्व ग्रामपंचायतींच्या पोर्टलवर प्रकाशित होते.
            </span>
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-xl transition shadow-xs active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>नवीन योजना जोडा</span>
        </button>
      </div>

      {/* Category & Search Filters */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row gap-3 justify-between items-stretch md:items-center">
          {/* Category Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-semibold">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0 mr-1" />
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full whitespace-nowrap transition text-xs ${
                  selectedCategory === cat
                    ? "bg-emerald-100 text-emerald-900 font-bold border border-emerald-300"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 border border-transparent"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="योजना शोधा..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>
        </div>
      </div>

      {/* Schemes Grid */}
      {filteredSchemes.length === 0 ? (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center space-y-4">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
          <div>
            <h3 className="text-base font-bold text-slate-800">कोणतीही योजना सापडली नाही</h3>
            <p className="text-xs text-slate-500 mt-1">
              नवीन योजना तयार करा किंवा खालील बटणावरून उच्च दर्जाचा प्राथमिक सरकारी योजना डेटा लोड करा.
            </p>
          </div>
          <div className="flex justify-center pt-2">
            <button
              onClick={handleSeed}
              disabled={isPending}
              className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>प्राथमिक सरकारी योजना लोड करा</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSchemes.map((s) => {
            const imageUrl = s.imageUrl || "/images/schemes/pmay-gharkul.jpg";

            return (
              <div
                key={s._id}
                className={`bg-white rounded-3xl border ${
                  s.isActive ? "border-slate-200 shadow-xs" : "border-slate-200 opacity-60 bg-slate-50"
                } overflow-hidden flex flex-col justify-between`}
              >
                <div>
                  {/* Scheme 16:9 Thumbnail Image */}
                  <div className="relative w-full aspect-[16/9] bg-slate-100 border-b border-slate-100">
                    <Image
                      src={imageUrl}
                      alt={s.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/20" />
                    
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white/95 text-[#003625] shadow-xs">
                        {s.category}
                      </span>

                      <button
                        onClick={() => handleToggleStatus(s._id)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 transition ${
                          s.isActive
                            ? "bg-emerald-600 text-white border border-emerald-400"
                            : "bg-slate-700 text-slate-200"
                        }`}
                      >
                        {s.isActive ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        <span>{s.isActive ? "सक्रिय" : "बंद"}</span>
                      </button>
                    </div>

                    <div className="absolute bottom-2.5 left-3 right-3 text-white">
                      <h3 className="font-extrabold text-sm line-clamp-2 leading-snug drop-shadow-md">
                        {s.title}
                      </h3>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-2.5 text-xs">
                    <p className="text-slate-600 line-clamp-2 leading-relaxed">
                      {s.description}
                    </p>

                    {s.subsidyDetails && (
                      <div className="p-2 bg-gradient-to-r from-amber-50 to-emerald-50 rounded-xl border border-amber-200/80 text-[11px]">
                        <span className="text-[10px] font-bold text-amber-900 block">अनुदान:</span>
                        <strong className="text-emerald-950 font-black truncate block">
                          {s.subsidyDetails}
                        </strong>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="p-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    {s.attachmentUrl && (
                      <a
                        href={s.attachmentUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 transition"
                        title="GR / PDF"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {s.externalLink && (
                      <a
                        href={s.externalLink}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-blue-700 transition"
                        title="अधिकृत पोर्टल"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEditModal(s)}
                      className="p-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 transition"
                      title="संपादित करा"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(s._id, s.title)}
                      className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition"
                      title="हटवा"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl max-w-2xl w-full p-6 space-y-4 my-8 max-h-[92vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-800" />
                <span>{editingScheme ? "शासकीय योजना संपादन (Blog Article)" : "नवीन शासकीय योजना व ब्लॉग जोडा"}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">योजनेचे नाव (Title) *</label>
                  <input
                    name="title"
                    required
                    defaultValue={editingScheme?.title || ""}
                    placeholder="उदा. प्रधानमंत्री आवास योजना ग्रामीण (PMAY-G)"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">URL Slug *</label>
                  <input
                    name="slug"
                    required
                    defaultValue={editingScheme?.slug || `pmay-rural-${Date.now()}`}
                    placeholder="उदा. pmay-rural-gharkul"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-600 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">प्रवर्ग / Category *</label>
                  <input
                    name="category"
                    required
                    defaultValue={editingScheme?.category || "घरकुल व निवारा"}
                    placeholder="उदा. शेतकरी कल्याण / घरकुल व निवारा / महिला व बालविकास"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">लाभार्थी प्रवर्ग (Target Audience)</label>
                  <input
                    name="targetAudience"
                    defaultValue={editingScheme?.targetAudience || ""}
                    placeholder="उदा. अल्पभूधारक शेतकरी, बेघर कुटुंब, महिला"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Preset Image Selector / Custom upload */}
              <div className="space-y-2 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <label className="block font-bold text-slate-800">योजनेचे मुख्य छायाचित्र (Cover Banner Image)</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {PRESET_SCHEME_IMAGES.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedPresetImage(preset.url)}
                      className={`p-2 rounded-xl border text-left transition flex flex-col items-start gap-1.5 ${
                        selectedPresetImage === preset.url
                          ? "border-emerald-600 bg-emerald-100/60 ring-2 ring-emerald-600/30 font-bold text-emerald-950"
                          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                      }`}
                    >
                      <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-slate-200">
                        <Image src={preset.url} alt={preset.name} fill className="object-cover" />
                      </div>
                      <span className="text-[10px] truncate w-full">{preset.name}</span>
                    </button>
                  ))}
                </div>

                <div className="pt-2">
                  <label className="block font-bold text-slate-700 mb-1">
                    किंवा नवीन फोटो अपलोड करा (Upload Image via Cloudinary):
                  </label>
                  <input
                    name="image"
                    type="file"
                    accept="image/*"
                    className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">अनुदान व आर्थिक सहाय्य (Subsidy Details)</label>
                <input
                  name="subsidyDetails"
                  defaultValue={editingScheme?.subsidyDetails || ""}
                  placeholder="उदा. ₹ १.२० लाख थेट बँक खात्यात + ₹ २३,८५० मनरेगा मजुरी"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-600 focus:outline-none font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">योजनेचा संक्षिप्त गोषवारा (Card Description) *</label>
                <textarea
                  name="description"
                  required
                  rows={2}
                  defaultValue={editingScheme?.description || ""}
                  placeholder="योजनेबद्दल २-३ ओळींची माहिती..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  सविस्तर ब्लॉग लेख / उद्दिष्टे व स्वरूप (Detailed Blog Content)
                </label>
                <textarea
                  name="content"
                  rows={4}
                  defaultValue={editingScheme?.content || ""}
                  placeholder="योजनेची सविस्तर पार्श्वभूमी, कार्यपद्धती आणि माहितीपूर्ण लेख..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  योजनेचे प्रमुख फायदे (Key Benefits - प्रत्येक ओळीवर एक फायदा लिहा)
                </label>
                <textarea
                  name="benefitsStr"
                  rows={3}
                  defaultValue={editingScheme?.benefits?.join("\n") || ""}
                  placeholder="४ टप्प्यांमध्ये थेट बँक खात्यात अनुदान&#10;९० दिवसांची अकुशल मजुरी&#10;स्वच्छ भारत शौचालय ₹ १२,०००"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">पात्रता निकष (Eligibility)</label>
                  <input
                    name="eligibility"
                    defaultValue={editingScheme?.eligibility || ""}
                    placeholder="उदा. दारिद्र्य रेषेखालील कुटुंब"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">आवश्यक कागदपत्रे (Documents)</label>
                  <input
                    name="documentsRequired"
                    defaultValue={editingScheme?.documentsRequired || ""}
                    placeholder="उदा. आधार कार्ड, ७/१२, बँक पासबुक"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">अर्ज प्रक्रिया (Application Process)</label>
                <input
                  name="applicationProcess"
                  defaultValue={editingScheme?.applicationProcess || ""}
                  placeholder="उदा. महाडीबीटी पोर्टलवर ऑनलाइन अर्ज किंवा ग्रामपंचायतीत संपर्क"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">अधिकृत पोर्टल लिंक (External Link)</label>
                  <input
                    name="externalLink"
                    type="url"
                    defaultValue={editingScheme?.externalLink || ""}
                    placeholder="https://pmayg.nic.in"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-600 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    GR / शासन निर्णय (PDF Circular Upload)
                  </label>
                  <input
                    name="attachment"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition"
                >
                  रद्द करा
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl transition shadow-xs active:scale-95 disabled:opacity-50"
                >
                  {isPending ? "जतन होत आहे..." : editingScheme ? "बदल जतन करा" : "योजना व लेख प्रकाशित करा"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
