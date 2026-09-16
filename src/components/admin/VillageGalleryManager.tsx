"use client";

import React, { useState, useTransition } from "react";
import Image from "next/image";
import {
  ImageIcon,
  Plus,
  Trash2,
  Upload,
  Save,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Layers,
  Edit3,
} from "lucide-react";
import {
  updateVillageGalleryAction,
  uploadVillageGalleryImage,
} from "@/lib/actions/villages";

export interface GalleryImageItem {
  url: string;
  caption?: string;
  category?: string;
}

interface VillageData {
  _id: string;
  name: string;
  slug: string;
  galleryImages?: GalleryImageItem[];
}

interface Props {
  villages: VillageData[];
}

const PRESET_GALLERY_IMAGES = [
  {
    url: "/images/gallery/village-karyalay.jpg",
    caption: "ग्रामपंचायत कार्यालय व ई-सेवा केंद्र",
    category: "प्रशासकीय वास्तू",
  },
  {
    url: "/images/gallery/village-entrance.jpg",
    caption: "गाव मुख्य प्रवेश कमान व स्वागत फलक",
    category: "प्रवेशद्वार व परिसर",
  },
  {
    url: "/images/gallery/smart-village-street.jpg",
    caption: "गावातील पक्के रस्ते व सौर पथदिवे",
    category: "पायाभूत सुविधा",
  },
  {
    url: "/images/gallery/village-lake-nature.jpg",
    caption: "जलसंधारण शेततळे, बंधारे व समृद्ध शेती शिवार",
    category: "निसर्ग व शेती",
  },
  {
    url: "/images/gallery/village-panoramic.png",
    caption: "गावाचा निसर्गरम्य विहंगम देखावा",
    category: "विहंगम देखावा",
  },
  {
    url: "/images/gallery/historic-chavdi.jpg",
    caption: "ऐतिहासिक चावडी व वटवृक्ष पार कट्टा",
    category: "ऐतिहासिक वारसा",
  },
  {
    url: "/images/gallery/village-heritage.jpg",
    caption: "वारली कला व पारंपरिक ग्रामीण संस्कृती",
    category: "ऐतिहासिक वारसा",
  },
];

const CATEGORIES = [
  "प्रशासकीय वास्तू",
  "पायाभूत सुविधा",
  "निसर्ग व शेती",
  "ऐतिहासिक वारसा",
  "विहंगम देखावा",
  "प्रवेशद्वार व परिसर",
  "उत्सव व परंपरा",
  "सर्वसाधारण",
];

export function VillageGalleryManager({ villages }: Props) {
  const [selectedVillageId, setSelectedVillageId] = useState<string>(
    villages[0]?._id || ""
  );
  const activeVillage =
    villages.find((v) => v._id === selectedVillageId) || villages[0];

  const [galleryList, setGalleryList] = useState<GalleryImageItem[]>(
    activeVillage?.galleryImages || []
  );

  const [isPending, startTransition] = useTransition();
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleVillageChange = (vId: string) => {
    setSelectedVillageId(vId);
    const target = villages.find((v) => v._id === vId);
    setGalleryList(target?.galleryImages || []);
    setErrorMsg("");
    setSuccessMsg("");
  };

  const handleAddPreset = (preset: GalleryImageItem) => {
    if (galleryList.some((g) => g.url === preset.url)) {
      setErrorMsg("हे छायाचित्र आधीच जोडलेले आहे.");
      return;
    }
    setGalleryList([
      ...galleryList,
      {
        url: preset.url,
        caption: preset.caption,
        category: preset.category || "सर्वसाधारण",
      },
    ]);
    setSuccessMsg("नवीन छायाचित्र यादीत जोडले. कृपया सेव्ह बटण दाबा.");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("villageSlug", activeVillage.slug);

      const res = await uploadVillageGalleryImage(formData);
      if (res.success && res.url) {
        setGalleryList([
          ...galleryList,
          {
            url: res.url,
            caption: file.name.replace(/\.[^/.]+$/, ""),
            category: "सर्वसाधारण",
          },
        ]);
        setSuccessMsg("छायाचित्र क्लाउडवर यशस्वीरीत्या अपलोड झाले! आता सेव्ह करा.");
      } else {
        setErrorMsg(res.error || "अपलोड करताना त्रुटी आली.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "अपलोड अयशस्वी.");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const handleUpdateItem = (
    index: number,
    field: "caption" | "category" | "url",
    value: string
  ) => {
    const updated = [...galleryList];
    updated[index] = { ...updated[index], [field]: value };
    setGalleryList(updated);
  };

  const handleRemoveItem = (index: number) => {
    const updated = galleryList.filter((_, idx) => idx !== index);
    setGalleryList(updated);
    setSuccessMsg("छायाचित्र काढले. बदल लागू करण्यासाठी सेव्ह करा.");
  };

  const handleSaveGallery = () => {
    if (!activeVillage) return;

    setErrorMsg("");
    setSuccessMsg("");

    startTransition(async () => {
      const res = await updateVillageGalleryAction(activeVillage._id, galleryList);
      if (res.success) {
        setSuccessMsg(
          `${activeVillage.name} गावाची छायाचित्रे यशस्वीरीत्या जतन झाली! 'गावाबद्दल (About)' पृष्ठावर आता ही छायाचित्रे थेट दिसतील.`
        );
      } else {
        setErrorMsg(res.error || "छायाचित्रे जतन करताना त्रुटी आली.");
      }
    });
  };

  if (!activeVillage) return null;

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-7 space-y-6 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-50 text-[#9e4300]">
              <ImageIcon className="w-5 h-5" />
            </span>
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
              गावाची छायाचित्रे व्यवस्थापक (About Page Photo Gallery)
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            'गावाबद्दल (About Village)' पृष्ठावरील निसर्गरम्य व ऐतिहासिक छायाचित्रे येथे संपादित करा, नवीन फोटो अपलोड करा किंवा मथळा (Caption) बदला.
          </p>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSaveGallery}
          disabled={isPending}
          className="px-5 py-2.5 rounded-2xl bg-[#003625] hover:bg-[#00261a] text-white text-xs font-bold transition flex items-center gap-2 shadow-xs cursor-pointer disabled:opacity-50 shrink-0"
        >
          <Save className="w-4 h-4 text-emerald-300" />
          <span>{isPending ? "जतन होत आहे..." : "छायाचित्रे सेव्ह करा"}</span>
        </button>
      </div>

      {/* Alerts */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Village Switcher Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] shrink-0 mr-1">
          गाव निवडा:
        </span>
        {villages.map((v) => (
          <button
            key={v._id}
            onClick={() => handleVillageChange(v._id)}
            className={`px-4 py-2 rounded-xl font-bold transition shrink-0 cursor-pointer ${
              selectedVillageId === v._id
                ? "bg-[#003625] text-white shadow-xs"
                : "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
            }`}
          >
            {v.name} ग्रामपंचायत ({v.galleryImages?.length || 0})
          </button>
        ))}
      </div>

      {/* Current Gallery Photos Grid */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <span>
              {activeVillage.name} गावाची सक्रिय छायाचित्रे ({galleryList.length})
            </span>
          </h4>

          {/* Upload Button */}
          <label className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold border border-slate-200 transition cursor-pointer">
            <Upload className="w-3.5 h-3.5 text-emerald-700" />
            <span>{isUploading ? "अपलोड होत आहे..." : "नवीन फोटो अपलोड करा"}</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
              disabled={isUploading}
            />
          </label>
        </div>

        {galleryList.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-2">
            <ImageIcon className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-xs text-slate-600 font-medium">
              या गावासाठी अद्याप कोणतेही छायाचित्र जोडलेले नाही.
            </p>
            <p className="text-[11px] text-slate-400">
              खालील पूर्वनिर्मित छायाचित्रांमधून निवडा किंवा वरून नवीन फोटो अपलोड करा.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {galleryList.map((item, idx) => (
              <div
                key={idx}
                className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden flex flex-col justify-between"
              >
                {/* Image Preview Container */}
                <div className="relative w-full aspect-[16/9] bg-slate-200 overflow-hidden">
                  <Image
                    src={item.url}
                    alt={item.caption || "छायाचित्र"}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-2 right-2 flex items-center gap-1">
                    <button
                      onClick={() => handleRemoveItem(idx)}
                      className="p-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white transition shadow-xs cursor-pointer"
                      title="काढून टाका"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="absolute bottom-2 left-2">
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-black/70 text-white backdrop-blur-md">
                      #{idx + 1}
                    </span>
                  </div>
                </div>

                {/* Caption & Category Inputs */}
                <div className="p-3.5 space-y-2 text-xs">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                      छायाचित्राचा मथळा (Caption):
                    </label>
                    <input
                      type="text"
                      value={item.caption || ""}
                      onChange={(e) =>
                        handleUpdateItem(idx, "caption", e.target.value)
                      }
                      placeholder="उदा. ग्रामपंचायत कार्यालय"
                      className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                      वर्गवारी (Category):
                    </label>
                    <select
                      value={item.category || "सर्वसाधारण"}
                      onChange={(e) =>
                        handleUpdateItem(idx, "category", e.target.value)
                      }
                      className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-emerald-600"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Preset Curated Village Images Palette */}
      <div className="space-y-3 pt-4 border-t border-slate-100">
        <h4 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-600" />
          <span>शिफारस केलेली पूर्वनिर्मित छायाचित्रे (Quick Presets)</span>
        </h4>
        <p className="text-[11px] text-slate-500">
          खालीलपैकी कोणत्याही छायाचित्रावर क्लिक करून ते थेट {activeVillage.name} गावाच्या दालनात जोडा:
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {PRESET_GALLERY_IMAGES.map((preset, pIdx) => {
            const isAdded = galleryList.some((g) => g.url === preset.url);

            return (
              <div
                key={pIdx}
                onClick={() => !isAdded && handleAddPreset(preset)}
                className={`relative aspect-[16/9] rounded-xl overflow-hidden border transition-all cursor-pointer group ${
                  isAdded
                    ? "border-emerald-500 opacity-60 cursor-not-allowed"
                    : "border-slate-200 hover:border-emerald-600 hover:shadow-xs"
                }`}
              >
                <Image
                  src={preset.url}
                  alt={preset.caption}
                  fill
                  className="object-cover group-hover:scale-105 transition duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
                <div className="absolute bottom-1.5 left-1.5 right-1.5 text-white">
                  <p className="text-[9px] font-bold line-clamp-1 leading-tight">
                    {preset.caption}
                  </p>
                </div>
                {isAdded && (
                  <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">
                    ✓
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
