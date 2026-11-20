"use client";

import React, { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Building2,
  ExternalLink,
  Edit2,
  Phone,
  Mail,
  MapPin,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Globe,
  Users,
  Award,
  Target,
  Megaphone,
} from "lucide-react";
import { VillageBannerManager } from "@/components/admin/VillageBannerManager";
import { VillageGalleryManager, GalleryImageItem } from "@/components/admin/VillageGalleryManager";
import { RtiSpendingsManager } from "@/components/admin/RtiSpendingsManager";
import { RtiSpendingItem } from "@/lib/actions/rti";
import { updateVillageAction } from "@/lib/actions/villages";

export interface VillageItem {
  _id: string;
  name: string;
  slug: string;
  taluka?: string;
  district?: string;
  state?: string;
  description?: string;
  phone?: string;
  email?: string;
  address?: string;
  coverImage?: string;
  galleryImages?: GalleryImageItem[];
  // Demographics
  population?: string;
  malePopulation?: string;
  femalePopulation?: string;
  households?: string;
  wards?: string;
  area?: string;
  literacyRate?: string;
  femaleLiteracy?: string;
  schools?: string;
  distanceFromTaluka?: string;
  distanceFromDistrict?: string;
  // Leadership & Announcements
  sarpanchMessage?: string;
  speciality?: string;
  highlightNotice?: string;
  visionPoints?: string[];
  prideHighlights?: Array<{ title: string; description: string; year?: string; imageUrl?: string }>;
}

interface Props {
  villages: VillageItem[];
  initialRtiSpendings?: RtiSpendingItem[];
}

export function VillageManagerClient({ villages, initialRtiSpendings = [] }: Props) {
  const [editingVillage, setEditingVillage] = useState<VillageItem | null>(null);
  const [activeTab, setActiveTab] = useState<"general" | "stats" | "leadership" | "pride">("general");
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleOpenEdit = (v: VillageItem) => {
    setEditingVillage(v);
    setActiveTab("general");
    setErrorMsg("");
    setSuccessMsg("");
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingVillage) return;

    setErrorMsg("");
    setSuccessMsg("");

    const formData = new FormData(e.currentTarget);
    formData.set("id", editingVillage._id);

    startTransition(async () => {
      const res = await updateVillageAction(formData);
      if (res.success) {
        setSuccessMsg("गावाची माहिती यशस्वीरीत्या अद्यतनित झाली!");
        setEditingVillage(null);
        window.location.reload();
      } else {
        setErrorMsg(res.error || "त्रुटी आली.");
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-800">
              <Building2 className="w-5 h-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              ग्रामपंचायत प्रोफाइल, सांख्यिकी व कव्हर बॅनर
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
            <span>
              येथून गावाचे नाव, लोकसंख्या, कुटुंबे, वॉर्ड, साक्षरता, सरपंच संदेश, ठळक सूचना व गाव अभिमान थेट डेटाबेसमध्ये अद्यतनित करा.
            </span>
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200">
          <Globe className="w-3.5 h-3.5 text-emerald-700" />
          <span>अधिकृत गाव: {villages[0]?.name || "कोमलवाडी"}</span>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* 1. Sixteen by Nine Banner Manager */}
      {villages[0] && (
        <VillageBannerManager
          villages={villages}
        />
      )}

      {/* 2. Photo Gallery Manager */}
      {villages[0] && (
        <VillageGalleryManager
          villages={villages}
        />
      )}

      {/* 3. RTI Spendings Manager (माहितीचा अधिकार - खर्च व जमा-खर्च व्यवस्थापन) */}
      {villages[0] && (
        <RtiSpendingsManager
          initialSpendings={initialRtiSpendings}
          villageSlug={villages[0].slug || "komalwadi"}
        />
      )}

      {/* 4. Village Demographic Profile & Quick View Card */}
      <div className="space-y-4">
        <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-700" />
          <span>ग्रामपंचायत माहिती व लोकसंख्या तपशील</span>
        </h3>

        <div className="grid grid-cols-1 gap-6">
          {villages.map((v) => (
            <div
              key={v._id}
              className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between"
            >
              <div>
                {/* 16:9 Banner Preview */}
                <div className="relative w-full aspect-16/9 bg-slate-100 overflow-hidden">
                  <Image
                    src={v.coverImage || "/images/panoramic-landscape.webp"}
                    alt={v.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-900/90 border border-emerald-400/40 text-emerald-200">
                      /{v.slug}
                    </span>
                    <h4 className="text-base font-black mt-1">{v.name} ग्रामपंचायत</h4>
                    <p className="text-[11px] text-slate-200">
                      ता. {v.taluka || "सिन्नर"}, जि. {v.district || "नाशिक"} • {v.speciality || "आदर्श स्मार्ट ग्राम"}
                    </p>
                  </div>
                </div>

                {/* Village Details Body */}
                <div className="p-5 space-y-4 text-xs">
                  <p className="text-slate-600 line-clamp-2 leading-relaxed">
                    {v.description || "ग्रामपंचायत अधिकृत नागरी ई-सेवा व डिजिटल प्रशासन पोर्टल."}
                  </p>

                  {/* Demographic Stats Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-center">
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold block">एकूण लोकसंख्या</span>
                      <strong className="text-emerald-900 font-black text-sm">{v.population || "—"}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold block">एकूण कुटुंबे</span>
                      <strong className="text-amber-800 font-black text-sm">{v.households || "—"}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold block">साक्षरता दर</span>
                      <strong className="text-emerald-900 font-black text-sm">{v.literacyRate || "—"}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold block">वॉर्ड संख्या</span>
                      <strong className="text-amber-800 font-black text-sm">{v.wards || "—"}</strong>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-1 text-slate-700">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                      <span className="truncate">{v.phone || "उपलब्ध नाही"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                      <span className="truncate">{v.email || "उपलब्ध नाही"}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{v.address || "ग्रामपंचायत कार्यालय"}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => handleOpenEdit(v)}
                  className="px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                >
                  <Edit2 className="w-3.5 h-3.5 text-emerald-200" />
                  <span>सर्व माहिती व सांख्यिकी संपादित करा</span>
                </button>

                <Link
                  href="/"
                  target="_blank"
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
                >
                  <span>मुख्य पोर्टल पहा</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Comprehensive Edit Village Modal */}
      {editingVillage && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl max-w-2xl w-full p-6 space-y-4 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-800" />
                <span>{editingVillage.name} ग्रामपंचायत माहिती व सांख्यिकी संपादन</span>
              </h3>
              <button
                onClick={() => setEditingVillage(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex gap-2 border-b border-slate-100 pb-2 overflow-x-auto text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveTab("general")}
                className={`px-3 py-1.5 rounded-xl transition ${
                  activeTab === "general"
                    ? "bg-emerald-800 text-white shadow-xs"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                सामान्य व संपर्क
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("stats")}
                className={`px-3 py-1.5 rounded-xl transition ${
                  activeTab === "stats"
                    ? "bg-emerald-800 text-white shadow-xs"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                लोकसंख्या व सांख्यिकी
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("leadership")}
                className={`px-3 py-1.5 rounded-xl transition ${
                  activeTab === "leadership"
                    ? "bg-emerald-800 text-white shadow-xs"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                सरपंच संदेश व ठळक सूचना
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("pride")}
                className={`px-3 py-1.5 rounded-xl transition ${
                  activeTab === "pride"
                    ? "bg-emerald-800 text-white shadow-xs"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                गाव अभिमान व ध्येय
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              {/* TAB 1: GENERAL & CONTACT */}
              {activeTab === "general" && (
                <div className="space-y-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      संपर्क दूरध्वनी / मोबाईल क्रमांक
                    </label>
                    <input
                      name="phone"
                      defaultValue={editingVillage.phone || ""}
                      placeholder="उदा. ९८२३९७८४९२"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      अधिकृत ई-मेल (Email)
                    </label>
                    <input
                      name="email"
                      type="email"
                      defaultValue={editingVillage.email || ""}
                      placeholder="gpkomalwadi@gmail.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      ग्रामपंचायत पत्ता (Address)
                    </label>
                    <input
                      name="address"
                      defaultValue={editingVillage.address || ""}
                      placeholder="मु. कोमलवाडी, पो. वडांगळी, ता. सिन्नर, जि. नाशिक"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      गावाची वैशिष्ट्ये (Speciality Tagline)
                    </label>
                    <input
                      name="speciality"
                      defaultValue={editingVillage.speciality || ""}
                      placeholder="उदा. डिजिटल आदर्श स्मार्ट ग्राम, निसर्गरम्य परिसर"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      गावाबद्दल माहिती (About / Description)
                    </label>
                    <textarea
                      name="description"
                      rows={3}
                      defaultValue={editingVillage.description || ""}
                      placeholder="गावाबद्दल माहिती..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: DEMOGRAPHICS & CENSUS */}
              {activeTab === "stats" && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">एकूण लोकसंख्या</label>
                      <input
                        name="population"
                        defaultValue={editingVillage.population || ""}
                        placeholder="उदा. १,५९८"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-600"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">पुरुष संख्या</label>
                      <input
                        name="malePopulation"
                        defaultValue={editingVillage.malePopulation || ""}
                        placeholder="उदा. ८०७"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-600"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">स्त्री संख्या</label>
                      <input
                        name="femalePopulation"
                        defaultValue={editingVillage.femalePopulation || ""}
                        placeholder="उदा. ७९१"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">एकूण कुटुंबे</label>
                      <input
                        name="households"
                        defaultValue={editingVillage.households || ""}
                        placeholder="उदा. २९५"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-600"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">वॉर्ड संख्या</label>
                      <input
                        name="wards"
                        defaultValue={editingVillage.wards || ""}
                        placeholder="उदा. ७"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-600"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">गावाचे क्षेत्रफळ</label>
                      <input
                        name="area"
                        defaultValue={editingVillage.area || ""}
                        placeholder="उदा. ५००० चौ.कि.मी."
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">साक्षरता दर (%)</label>
                      <input
                        name="literacyRate"
                        defaultValue={editingVillage.literacyRate || ""}
                        placeholder="उदा. ७२.३%"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-600"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">महिला साक्षरता (%)</label>
                      <input
                        name="femaleLiteracy"
                        defaultValue={editingVillage.femaleLiteracy || ""}
                        placeholder="उदा. ३३.२%"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-600"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">शाळा व केंद्रे</label>
                      <input
                        name="schools"
                        defaultValue={editingVillage.schools || ""}
                        placeholder="उदा. ०४ केंद्रे"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">तालुक्यापासून अंतर</label>
                      <input
                        name="distanceFromTaluka"
                        defaultValue={editingVillage.distanceFromTaluka || ""}
                        placeholder="उदा. १८ कि.मी. (सिन्नर)"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-600"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">जिल्ह्यापासून अंतर</label>
                      <input
                        name="distanceFromDistrict"
                        defaultValue={editingVillage.distanceFromDistrict || ""}
                        placeholder="उदा. ४२ कि.मी. (नाशिक)"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-600"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: LEADERSHIP & HIGHLIGHTS */}
              {activeTab === "leadership" && (
                <div className="space-y-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      सरपंच विचार / संदेश (Sarpanch Quote)
                    </label>
                    <textarea
                      name="sarpanchMessage"
                      rows={3}
                      defaultValue={editingVillage.sarpanchMessage || ""}
                      placeholder="सरपंच संदेश..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      ठळक सूचना (Scrolling Urgent Announcement)
                    </label>
                    <input
                      name="highlightNotice"
                      defaultValue={editingVillage.highlightNotice || ""}
                      placeholder="उदा. विशेष ग्रामसभा बैठक सोमवारी सकाळी ११ वाजता..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      ही सूचना पोर्टलच्या मुख्यपृष्ठावर ठळक लाल पट्टीवर धावत्या अक्षरांमध्ये दिसते.
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 4: PRIDE & VISION */}
              {activeTab === "pride" && (
                <div className="space-y-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-amber-600" />
                      <span>कोमलवाडीचा अभिमान (Village Pride & Achievements)</span>
                    </label>
                    <textarea
                      name="prideHighlights"
                      rows={4}
                      defaultValue={
                        editingVillage.prideHighlights && editingVillage.prideHighlights.length > 0
                          ? editingVillage.prideHighlights
                              .map((p) =>
                                p.year
                                  ? `${p.title} | ${p.description || p.title} | ${p.year}`
                                  : p.description && p.description !== p.title
                                  ? `${p.title} | ${p.description}`
                                  : p.title
                              )
                              .join("\n")
                          : "तंटामुक्त गाव पुरस्कार प्राप्त | शांतता व सामंजस्याने गाव पुरस्कार | २०२३\n१००% हागणदारीमुक्त व सुंदर गाव अभियान | स्वच्छतेत आदर्श कामगिरी | २०२४\nस्मार्ट डिजिटल ई-प्रशासन उपक्रम | सर्व सेवा ऑनलाइन उपलब्ध | २०२५"
                      }
                      placeholder="उदा. पुरस्कार नाव | थोडक्यात माहिती | २०२४"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-600 focus:outline-none font-mono text-[11px]"
                    />
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      प्रत्येक ओळीवर १ कामगिरी लिहा. स्वरूप: नाव | माहिती | वर्ष (उदा. तंटामुक्त गाव | सहकार्याने पुरस्कार | २०२३)
                    </p>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5 text-emerald-700" />
                      <span>ग्रामपंचायतीचे ध्येय व उद्दिष्टे (Vision & Goals)</span>
                    </label>
                    <textarea
                      name="visionPoints"
                      rows={4}
                      defaultValue={
                        editingVillage.visionPoints && editingVillage.visionPoints.length > 0
                          ? editingVillage.visionPoints.join("\n")
                          : "गावातील प्रत्येक कुटुंबाला २४ तास शुद्ध व मुबलक पिण्याचे पाणी उपलब्ध करणे.\n१००% सांडपाणी व घनकचरा व्यवस्थापनातून गाव कचरामुक्त व हरित करणे.\nडिजिटल ई-प्रशासनाच्या माध्यमातून सर्व शासकीय दाखले व सेवा घरबसल्या देणे.\nमहिला बचत गटांना बळकटी व युवकांसाठी कौशल्य विकास प्रशिक्षण."
                      }
                      placeholder="प्रत्येक ध्येय नवीन ओळीवर लिहा..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-600 focus:outline-none font-mono text-[11px]"
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingVillage(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition"
                >
                  रद्द करा
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl transition shadow-xs active:scale-95 disabled:opacity-50"
                >
                  {isPending ? "जतन होत आहे..." : "डेटाबेसमध्ये सेव्ह करा"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
