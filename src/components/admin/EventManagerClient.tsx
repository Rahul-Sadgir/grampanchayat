"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Calendar,
  Plus,
  Edit2,
  Trash2,
  Upload,
  CheckCircle2,
  AlertCircle,
  X,
  MapPin,
  Sparkles,
  Camera,
  Search,
  Building2,
  RefreshCw,
  ExternalLink,
  Eye,
  ImageIcon,
} from "lucide-react";
import { saveEvent, deleteEvent, toggleEventStatus } from "@/lib/actions/events";
import { formatMarathiDate } from "@/lib/date-utils";

interface EventImage {
  url: string;
  caption?: string;
  publicId?: string;
}

interface EventItem {
  id: string;
  _id?: string;
  villageId?: string;
  villageSlug: string;
  villageName?: string;
  title: string;
  slug: string;
  category: string;
  content: string;
  summary?: string;
  location?: string;
  eventDate: string | Date;
  event_date?: string | Date;
  coverImage?: string;
  cover_image?: string;
  images: EventImage[];
  isActive: boolean;
  publishedAt?: string | Date;
  createdAt?: string | Date;
}

function formatDateForInput(dateVal: any): string {
  if (!dateVal) return new Date().toISOString().split("T")[0];
  if (dateVal instanceof Date) {
    if (isNaN(dateVal.getTime())) return new Date().toISOString().split("T")[0];
    return dateVal.toISOString().split("T")[0];
  }
  const str = String(dateVal).trim();
  if (!str) return new Date().toISOString().split("T")[0];
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
  if (str.includes("T")) return str.split("T")[0];
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split("T")[0];
  }
  return str;
}

interface Props {
  initialEvents: EventItem[];
  villages: { name: string; slug: string }[];
  selectedVillageSlug?: string;
}

const EVENT_CATEGORIES = [
  "ग्रामसभा व कारभार",
  "पर्यावरण व जलसंधारण",
  "आरोग्य व जनकल्याण",
  "स्वच्छता व पायाभूत सुविधा",
  "कृषी व तंत्रज्ञान",
  "सण व सांस्कृतिक",
  "क्रीडा व युवक",
  "इतर उपक्रम",
];

export function EventManagerClient({
  initialEvents,
  villages,
  selectedVillageSlug,
}: Props) {
  const defaultVillage = selectedVillageSlug || villages[0]?.slug || "komalwadi";
  const [events, setEvents] = useState<EventItem[]>(initialEvents);
  const [selectedVillage, setSelectedVillage] = useState<string>(defaultVillage);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("सर्व");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);

  // Form State
  const [villageSlug, setVillageSlug] = useState(defaultVillage);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState(EVENT_CATEGORIES[0]);
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [location, setLocation] = useState("");
  const [eventDate, setEventDate] = useState(new Date().toISOString().split("T")[0]);
  const [isActive, setIsActive] = useState(true);

  // Images state
  const [existingImages, setExistingImages] = useState<EventImage[]>([]);
  const [selectedNewFiles, setSelectedNewFiles] = useState<File[]>([]);
  const [newFilePreviews, setNewFilePreviews] = useState<string[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Open Add Modal
  const openAddModal = () => {
    setEditingEvent(null);
    setVillageSlug(defaultVillage);
    setTitle("");
    setSlug("");
    setCategory(EVENT_CATEGORIES[0]);
    setSummary("");
    setContent("");
    setLocation("");
    setEventDate(new Date().toISOString().split("T")[0]);
    setIsActive(true);
    setExistingImages([]);
    setSelectedNewFiles([]);
    setNewFilePreviews([]);
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (ev: EventItem) => {
    setEditingEvent(ev);
    setVillageSlug(ev.villageSlug || defaultVillage);
    setTitle(ev.title);
    setSlug(ev.slug);
    setCategory(ev.category || EVENT_CATEGORIES[0]);
    setSummary(ev.summary || "");
    setContent(ev.content || "");
    setLocation(ev.location || "");
    setEventDate(formatDateForInput(ev.eventDate || ev.event_date));
    setIsActive(ev.isActive !== false);
    setExistingImages(ev.images || []);
    setSelectedNewFiles([]);
    setNewFilePreviews([]);
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  // Handle Multiple File Selection
  const handleFilesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files);
    // Limit to 10 images max per upload
    if (selectedNewFiles.length + fileList.length > 10) {
      setErrorMsg("एका वेळी जास्तीत जास्त १० फोटो अपलोड करू शकता.");
      return;
    }

    const updatedFiles = [...selectedNewFiles, ...fileList];
    setSelectedNewFiles(updatedFiles);

    // Create object URLs for preview
    const newPreviews = fileList.map((file) => URL.createObjectURL(file));
    setNewFilePreviews((prev) => [...prev, ...newPreviews]);
    setErrorMsg(null);
  };

  // Remove newly added file
  const handleRemoveNewFile = (idx: number) => {
    setSelectedNewFiles((prev) => prev.filter((_, i) => i !== idx));
    setNewFilePreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  // Remove existing image
  const handleRemoveExistingImage = (idx: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== idx));
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const formData = new FormData();
      if (editingEvent) {
        formData.append("id", editingEvent.id || editingEvent._id || "");
      }
      formData.append("villageId", villageSlug);
      formData.append("title", title);
      formData.append("slug", slug);
      formData.append("category", category);
      formData.append("summary", summary);
      formData.append("content", content);
      formData.append("location", location);
      formData.append("eventDate", eventDate);
      formData.append("isActive", isActive ? "true" : "false");

      // Pass existing images retained
      formData.append("existingImages", JSON.stringify(existingImages));

      // Append all new files for Cloudinary upload
      selectedNewFiles.forEach((file) => {
        formData.append("images", file);
      });

      const res = await saveEvent(formData);

      if (res.success) {
        setSuccessMsg("घडामोडी / बातमी यशस्वीरीत्या जतन झाली!");
        // Refresh local state or close after small delay
        setTimeout(() => {
          setIsModalOpen(false);
          window.location.reload();
        }, 800);
      } else {
        setErrorMsg(res.error || "जतन करताना त्रुटी आली.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "अपेक्षित त्रुटी आली. कृपया पुन्हा प्रयत्न करा.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Handler
  const handleDelete = async (id: string, evTitle: string) => {
    if (!confirm(`तुम्हाला खात्री आहे का की '${evTitle}' ही घडामोड कायमस्वरूपी हटवायची आहे?`)) {
      return;
    }

    try {
      const res = await deleteEvent(id, villageSlug);
      if (res.success) {
        setEvents((prev) => prev.filter((e) => (e.id || e._id) !== id));
      } else {
        alert(res.error || "हटवताना त्रुटी आली.");
      }
    } catch (err: any) {
      alert(err.message || "त्रुटी आली.");
    }
  };

  // Toggle Active Status
  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    try {
      const res = await toggleEventStatus(id, newStatus, villageSlug);
      if (res.success) {
        setEvents((prev) =>
          prev.map((e) => ((e.id || e._id) === id ? { ...e, isActive: newStatus } : e))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Filter events
  const filteredEvents = events.filter((e) => {
    const matchesVillage =
      selectedVillage === "ALL" ||
      !e.villageSlug ||
      e.villageSlug.toLowerCase() === selectedVillage.toLowerCase();

    const matchesCategory =
      selectedCategoryFilter === "सर्व" || e.category === selectedCategoryFilter;

    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      e.title.toLowerCase().includes(q) ||
      (e.summary && e.summary.toLowerCase().includes(q)) ||
      (e.location && e.location.toLowerCase().includes(q));

    return matchesVillage && matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 to-[#003625] text-white p-6 sm:p-8 rounded-3xl shadow-sm border border-emerald-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-700/60 text-emerald-200 text-xs font-bold border border-emerald-600/40">
            <Camera className="w-3.5 h-3.5" />
            <span>गावातील घडामोडी व ब्लॉग व्यवस्थापन</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            गावातील हालचाली, उपक्रम व कार्यक्रम (Events & Posts)
          </h2>
          <p className="text-xs text-emerald-200/90 max-w-xl">
            गावातील विकासकामे, ग्रामसभा, आरोग्य शिबिरे व सण-उत्सवांचे फोटो (Cloudinary) व सविस्तर वृत्तांत प्रसिद्ध करा.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="w-full sm:w-auto px-6 py-3.5 bg-[#F5D77F] hover:bg-[#ebd074] text-slate-950 font-black rounded-2xl text-xs sm:text-sm transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 text-slate-950" />
          <span>नवीन घडामोड / पोस्ट जोडा</span>
        </button>
      </div>

      {/* 2. Controls & Filter Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="शीर्षक, वर्ग किंवा स्थळानुसार शोधा..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-700"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            className="w-full sm:w-auto px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold bg-slate-50 text-slate-700 focus:outline-none"
          >
            <option value="सर्व">सर्व वर्ग (All Categories)</option>
            {EVENT_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 3. Events Grid / List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredEvents.length === 0 ? (
          <div className="col-span-full bg-white p-12 text-center rounded-3xl border border-slate-200 space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-800 flex items-center justify-center mx-auto">
              <Camera className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-800 text-sm">
              कोणतीही घडामोड नोंदवलेली नाही
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              गावात घडलेल्या कार्यक्रमांचे किंवा निर्णयांचे सचित्र वृत्तांत जोडण्यासाठी वरील &apos;नवीन घडामोड / पोस्ट जोडा&apos; बटणावर क्लिक करा.
            </p>
          </div>
        ) : (
          filteredEvents.map((ev) => {
            const rawDate = ev.eventDate || ev.event_date;
            const dateInfo = formatMarathiDate(rawDate);
            const cover =
              ev.coverImage ||
              ev.cover_image ||
              (ev.images && ev.images[0]?.url) ||
              "/images/gallery/village-karyalay.webp";
            const imageCount = ev.images?.length || 0;

            return (
              <div
                key={ev.id || ev._id}
                className="bg-white rounded-3xl border border-slate-200 shadow-2xs hover:shadow-md transition overflow-hidden flex flex-col justify-between"
              >
                {/* Image Cover */}
                <div className="relative h-44 bg-slate-100 overflow-hidden">
                  <Image
                    src={cover}
                    alt={ev.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-xs text-[#F5D77F] text-[10px] font-extrabold">
                    {ev.category}
                  </div>

                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    <button
                      onClick={() => handleToggleActive(ev.id || ev._id || "", ev.isActive !== false)}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold shadow-xs cursor-pointer ${
                        ev.isActive !== false
                          ? "bg-emerald-500 text-white"
                          : "bg-slate-400 text-white"
                      }`}
                    >
                      {ev.isActive !== false ? "सक्रिय (Live)" : "अक्रिय (Draft)"}
                    </button>
                  </div>

                  {imageCount > 1 && (
                    <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-xs text-white text-[10px] font-bold flex items-center gap-1">
                      <Camera className="w-3 h-3 text-[#F5D77F]" />
                      <span>{imageCount} फोटो</span>
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
                      <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                      <span>{dateInfo.formatted}</span>
                      {ev.location && (
                        <span className="truncate flex items-center gap-0.5 text-slate-600">
                          • <MapPin className="w-3 h-3 text-[#9e4300]" />
                          {ev.location}
                        </span>
                      )}
                    </div>

                    <h3 className="font-extrabold text-sm text-slate-900 line-clamp-2 leading-snug">
                      {ev.title}
                    </h3>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {ev.summary || ev.content}
                    </p>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <Link
                      href={`/${ev.villageSlug || defaultVillage}/events/${ev.slug || ev.id}`}
                      target="_blank"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 hover:underline"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>वेबसाईटवर पहा</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(ev)}
                        className="p-1.5 rounded-lg text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition cursor-pointer"
                        title="संपादित करा"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(ev.id || ev._id || "", ev.title)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                        title="हटवा"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 4. Add / Edit Modal Drawer */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#003625] to-emerald-900 text-white p-5 sm:p-6 flex items-start justify-between gap-3 shrink-0">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#F5D77F] mb-1">
                  <Camera className="w-3.5 h-3.5" />
                  <span>ग्रामपंचायत {villageSlug}</span>
                </div>
                <h3 className="text-lg sm:text-xl font-extrabold text-white">
                  {editingEvent ? "घडामोडी / बातमी संपादित करा" : "नवीन घडामोडी / कार्यक्रम जोडा"}
                </h3>
                <p className="text-xs text-emerald-200/90 mt-0.5">
                  सर्व माहिती व छायाचित्रे थेट डेटाबेस व Cloudinary वर सेव्ह केली जातील.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
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

              {successMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Title */}
              <div className="space-y-1">
                <label className="block font-bold text-slate-800 text-xs">
                  १. घडामोडीचे शीर्षक / बातमीचे नाव (Title) *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="उदा. वार्षिक ग्रामसभा व विकास आराखडा २०२६ मंजूर..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  required
                />
              </div>

              {/* Category & Date Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-800 text-xs">
                    २. घडामोडीचा वर्ग / प्रकार (Category) *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  >
                    {EVENT_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-800 text-xs">
                    ३. कार्यक्रम दिनांक (Event Date) *
                  </label>
                  <input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none font-mono"
                    required
                  />
                </div>
              </div>

              {/* Location */}
              <div className="space-y-1">
                <label className="block font-bold text-slate-800 text-xs">
                  ४. स्थळ / ठिकाण (Location)
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="उदा. ग्रामपंचायत कार्यालय सभागृह, कोमलवाडी"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              {/* Short Summary */}
              <div className="space-y-1">
                <label className="block font-bold text-slate-800 text-xs">
                  ५. संक्षिप्त सारांश (Short Summary - कार्डवर दाखवण्यासाठी)
                </label>
                <textarea
                  rows={2}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="१-२ ओळीत ठळक सारांश लिहा..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none resize-none"
                />
              </div>

              {/* Full Blog Content */}
              <div className="space-y-1">
                <label className="block font-bold text-slate-800 text-xs">
                  ६. सविस्तर बातमी / वृत्तांत (Full Blog Story) *
                </label>
                <textarea
                  rows={5}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="कार्यक्रमाविषयी संपूर्ण सविस्तर माहिती, ठराव, उपस्थित मान्यवर व ग्रामस्थांचा सहभाग येथे लिहा..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none resize-y"
                  required
                />
              </div>

              {/* 7. Multiple Images Upload (Cloudinary) */}
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-slate-800 text-xs">
                    ७. छायाचित्रे अपलोड करा (Multiple Images - Cloudinary Storage)
                  </label>
                  <span className="text-[10px] text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Cloudinary Supported
                  </span>
                </div>

                <div className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-4 text-center transition bg-slate-50/60">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    multiple
                    onChange={handleFilesSelect}
                    className="hidden"
                    id="event-images-input"
                  />
                  <label
                    htmlFor="event-images-input"
                    className="cursor-pointer flex flex-col items-center justify-center gap-1 py-1"
                  >
                    <Upload className="w-5 h-5 text-emerald-700" />
                    <span className="font-bold text-slate-800 text-xs">
                      संगणक / मोबाईलमधून फोटो निवडा (एकापेक्षा जास्त निवडू शकता)
                    </span>
                    <span className="text-[10px] text-slate-400">
                      JPG, PNG, WEBP • जास्तीत जास्त १० फोटो
                    </span>
                  </label>
                </div>

                {/* Newly Selected Images Preview */}
                {newFilePreviews.length > 0 && (
                  <div className="space-y-1.5 pt-2">
                    <p className="text-[11px] font-bold text-emerald-950">
                      नवीन निवडलेले फोटो ({newFilePreviews.length}):
                    </p>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {newFilePreviews.map((url, idx) => (
                        <div
                          key={idx}
                          className="relative h-20 bg-slate-100 rounded-xl overflow-hidden border border-emerald-300 group"
                        >
                          <Image
                            src={url}
                            alt={`Preview ${idx}`}
                            fill
                            className="object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveNewFile(idx)}
                            className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition cursor-pointer shadow-xs"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Existing Images (when editing) */}
                {existingImages.length > 0 && (
                  <div className="space-y-1.5 pt-2">
                    <p className="text-[11px] font-bold text-slate-700">
                      यापूर्वीचे सेव्ह केलेले फोटो ({existingImages.length}):
                    </p>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {existingImages.map((img, idx) => (
                        <div
                          key={idx}
                          className="relative h-20 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 group"
                        >
                          <Image
                            src={img.url}
                            alt={`Existing ${idx}`}
                            fill
                            className="object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveExistingImage(idx)}
                            className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition cursor-pointer shadow-xs"
                            title="हा फोटो काढून टाका"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Active Toggle */}
              <div className="pt-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="event-is-active"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded-sm focus:ring-emerald-500 border-slate-300"
                />
                <label
                  htmlFor="event-is-active"
                  className="font-bold text-slate-800 text-xs cursor-pointer"
                >
                  ही घडामोड नागरिकांना वेबसाईटवर लगेच दिसावी (Live on Website)
                </label>
              </div>

              {/* Form Buttons */}
              <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition text-xs cursor-pointer"
                >
                  रद्द करा
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-black transition shadow-md flex items-center justify-center gap-2 text-xs active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                      <span>फोटो व माहिती सेव्ह होत आहे...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-[#F5D77F]" />
                      <span>
                        {editingEvent ? "बदल जतन करा" : "घडामोड प्रसिद्ध करा"}
                      </span>
                    </>
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

