"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import {
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  Smartphone,
  Monitor,
  Sparkles,
  Link2,
  AlertCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";

interface VillageItem {
  _id: string;
  name: string;
  slug: string;
  coverImage?: string;
}

interface Props {
  villages: VillageItem[];
}

const PRESET_BANNERS = [
  {
    name: "गुळवंच निसर्गरम्य व डिजिटल ग्रामपंचायत (१६:९)",
    url: "/images/gulwanch-banner.jpg",
    desc: "पारंपरिक कमान, सौर ऊर्जा इमारत व हिरवेगार शेत परिसर",
  },
  {
    name: "माझगाव आदर्श ग्रामपंचायत (१६:९)",
    url: "/images/mazagaon-banner.jpg",
    desc: "ऐतिहासिक चावडी, वटवृक्ष व आधुनिक ग्रामपंचायत सेवा केंद्र",
  },
  {
    name: "आधुनिक ई-प्रशासन केंद्र (१६:९)",
    url: "/images/village-hero-banner.jpg",
    desc: "डिजिटल भारत ग्रामीण विकास केंद्र",
  },
];

export function VillageBannerManager({ villages }: Props) {
  const [selectedVillageId, setSelectedVillageId] = useState<string>(
    villages[0]?._id || ""
  );
  const [previewUrl, setPreviewUrl] = useState<string>(
    villages[0]?.coverImage || "/images/gulwanch-banner.jpg"
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [directUrl, setDirectUrl] = useState<string>("");
  const [previewMode, setPreviewMode] = useState<"mobile" | "desktop">("mobile");
  const [uploading, setUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const currentVillage = villages.find((v) => v._id === selectedVillageId);

  const handleVillageChange = (id: string) => {
    setSelectedVillageId(id);
    const found = villages.find((v) => v._id === id);
    if (found?.coverImage) {
      setPreviewUrl(found.coverImage);
    }
    setSelectedFile(null);
    setDirectUrl("");
    setStatusMessage(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      setStatusMessage(null);
    }
  };

  const handleSelectPreset = (url: string) => {
    setSelectedFile(null);
    setDirectUrl(url);
    setPreviewUrl(url);
    setStatusMessage(null);
  };

  const handleSaveBanner = async () => {
    if (!selectedVillageId) {
      setStatusMessage({ type: "error", text: "कृपया गाव निवडा." });
      return;
    }

    setUploading(true);
    setStatusMessage(null);

    try {
      const formData = new FormData();
      formData.append("villageId", selectedVillageId);
      if (currentVillage?.slug) {
        formData.append("villageSlug", currentVillage.slug);
      }

      if (selectedFile) {
        formData.append("file", selectedFile);
      } else if (directUrl || previewUrl) {
        formData.append("imageUrl", directUrl || previewUrl);
      } else {
        setStatusMessage({ type: "error", text: "कृपया प्रतिमा निवडा किंवा अपलोड करा." });
        setUploading(false);
        return;
      }

      const res = await fetch("/api/villages/upload-banner", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "अपलोड अयशस्वी झाले.");
      }

      setStatusMessage({
        type: "success",
        text: `१६:९ बॅनर प्रतिमा ${currentVillage?.name || "गाव"} साठी यशस्वीरीत्या सेव्ह झाली!`,
      });
      if (data.url) {
        setPreviewUrl(data.url);
      }
    } catch (err: any) {
      setStatusMessage({
        type: "error",
        text: err.message || "प्रतिमा सेव्ह करताना त्रुटी आली.",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>१६:९ हिरो बॅनर व्यवस्थापन (Hero Background Image)</span>
          </div>
          <h3 className="text-lg font-bold text-gray-900">
            गावाचे मुख्य १६:९ पार्श्वभूमी चित्र अपलोड करा
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            मोबाईल व डेस्कटॉपवर १६:९ प्रमाण (Aspect Ratio) तंतोतंत राखले जाते आणि संपूर्ण प्रतिमा स्पष्ट दिसते.
          </p>
        </div>

        {/* Village Picker */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-gray-700 shrink-0">गाव निवडा:</label>
          <select
            value={selectedVillageId}
            onChange={(e) => handleVillageChange(e.target.value)}
            className="text-xs font-bold px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-none"
          >
            {villages.map((v) => (
              <option key={v._id} value={v._id}>
                {v.name} (/{v.slug})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Upload Controls & Presets (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* File Upload Box */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-emerald-300 hover:border-emerald-500 bg-emerald-50/40 hover:bg-emerald-50/80 rounded-2xl p-5 text-center cursor-pointer transition flex flex-col items-center justify-center space-y-2 group"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/jpeg,image/png,image/webp,image/jpg"
              className="hidden"
            />
            <div className="w-12 h-12 rounded-2xl bg-white shadow-xs border border-emerald-200 text-emerald-800 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-800">
                १६:९ प्रतिमा अपलोड करण्यासाठी येथे क्लिक करा
              </p>
              <p className="text-[11px] text-gray-500 mt-0.5">
                (JPG, PNG, WebP • शिफारस: १९२०×१०८० किंवा १२८०×७२०)
              </p>
            </div>
            {selectedFile && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                <span>निवडली: {selectedFile.name}</span>
              </div>
            )}
          </div>

          {/* Preset Banners */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-700 flex items-center gap-1">
              <ImageIcon className="w-3.5 h-3.5 text-emerald-700" />
              <span>किंवा तयार १६:९ उत्कृष्ट पर्याय निवडा:</span>
            </label>
            <div className="space-y-2">
              {PRESET_BANNERS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectPreset(preset.url)}
                  className={`w-full p-2.5 rounded-xl border text-left flex items-center gap-3 transition ${
                    previewUrl === preset.url
                      ? "border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-600/20"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <div className="w-14 aspect-video rounded-lg overflow-hidden relative border shrink-0 bg-slate-100">
                    <Image
                      src={preset.url}
                      alt={preset.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="text-xs font-bold text-gray-900 truncate">
                      {preset.name}
                    </h5>
                    <p className="text-[10px] text-gray-500 truncate">
                      {preset.desc}
                    </p>
                  </div>
                  {previewUrl === preset.url && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Direct URL Input */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700 flex items-center gap-1">
              <Link2 className="w-3.5 h-3.5 text-slate-500" />
              <span>थेट प्रतिमा URL:</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="https://... किंवा /images/..."
                value={directUrl}
                onChange={(e) => {
                  setDirectUrl(e.target.value);
                  if (e.target.value.trim()) setPreviewUrl(e.target.value.trim());
                }}
                className="flex-1 px-3 py-2 text-xs border rounded-xl font-mono focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  if (directUrl.trim()) setPreviewUrl(directUrl.trim());
                }}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
              >
                पूर्वावलोकन
              </button>
            </div>
          </div>

          {/* Status Message */}
          {statusMessage && (
            <div
              className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                statusMessage.type === "success"
                  ? "bg-emerald-50 text-emerald-900 border border-emerald-200"
                  : "bg-red-50 text-red-900 border border-red-200"
              }`}
            >
              {statusMessage.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Action Button */}
          <button
            type="button"
            disabled={uploading}
            onClick={handleSaveBanner}
            className="w-full py-3 bg-emerald-800 hover:bg-emerald-900 disabled:bg-slate-300 text-white font-extrabold rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 text-xs"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>प्रतिमा सेव्ह होत आहे...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {currentVillage?.name || "गाव"} साठी १६:९ बॅनर लागू करा
                </span>
              </>
            )}
          </button>
        </div>

        {/* Right Column: Live 16:9 Aspect Ratio Preview (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 text-white p-5 rounded-3xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold tracking-wide">
                थेट १६:९ पूर्वावलोकन (Live Aspect Ratio Preview)
              </span>
            </div>

            {/* Viewport Toggle Tabs */}
            <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs">
              <button
                type="button"
                onClick={() => setPreviewMode("mobile")}
                className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5 transition ${
                  previewMode === "mobile"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>मोबाईल (16:9)</span>
              </button>
              <button
                type="button"
                onClick={() => setPreviewMode("desktop")}
                className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5 transition ${
                  previewMode === "desktop"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>डेस्कटॉप (16:9)</span>
              </button>
            </div>
          </div>

          {/* PREVIEW CONTAINER */}
          <div className="flex justify-center items-center py-2">
            <div
              className={`transition-all duration-300 w-full ${
                previewMode === "mobile" ? "max-w-[340px]" : "max-w-full"
              }`}
            >
              {/* Device Frame */}
              <div className="bg-slate-800/80 p-2.5 rounded-2xl border border-slate-700/80 shadow-2xl">
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mb-2 px-1">
                  <span>
                    {previewMode === "mobile" ? "📱 Mobile View (16:9)" : "💻 Desktop View (16:9)"}
                  </span>
                  <span className="text-emerald-400 font-bold">Ratio 16:9 • 100% Visible</span>
                </div>

                {/* 16:9 HERO BANNER SIMULATION */}
                <div className="relative w-full aspect-[16/9] overflow-hidden rounded-xl border border-slate-600/60 flex flex-col justify-between shadow-inner">
                  {/* Background Image */}
                  <Image
                    src={previewUrl}
                    alt="Hero Preview"
                    fill
                    className="object-cover object-center"
                    unoptimized
                  />

                  {/* Subtle Gradient for readability while keeping image fully visible */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/15 pointer-events-none" />

                  {/* Top Badge */}
                  <div className="relative z-10 p-2 sm:p-3">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-900/85 backdrop-blur-md border border-emerald-400/30 text-emerald-200 text-[8px] sm:text-[10px] font-bold">
                      <Sparkles className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                      <span>डिजिटल ग्रामपंचायत</span>
                    </span>
                  </div>

                  {/* Bottom Info in 16:9 */}
                  <div className="relative z-10 p-2 sm:p-3 space-y-0.5">
                    <h4 className="text-xs sm:text-lg font-black text-white leading-tight drop-shadow">
                      {currentVillage?.name || "गाव"} ग्रामपंचायत
                    </h4>
                    <p className="text-[8px] sm:text-xs text-emerald-300 font-medium">
                      ता. {currentVillage?.slug === "gulwanch" ? "सिन्नर" : "सिन्नर"}, जि. नाशिक
                    </p>
                  </div>
                </div>

                {/* Mobile Quick Action Buttons Simulator (rendered just below 16:9 for clean visibility) */}
                <div className="mt-2.5 pt-2 border-t border-slate-700/60 flex items-center justify-between gap-1.5 text-[10px]">
                  <span className="text-slate-400 font-medium">क्रिया:</span>
                  <div className="flex gap-1.5">
                    <span className="px-2 py-1 bg-amber-500 text-slate-950 font-bold rounded-lg text-[9px]">
                      दाखले अर्ज
                    </span>
                    <span className="px-2 py-1 bg-slate-700 text-slate-200 font-bold rounded-lg text-[9px]">
                      योजना
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 space-y-1 bg-slate-800/40 p-3 rounded-xl border border-slate-800">
            <p className="flex items-center gap-1 text-emerald-400 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>१६:९ गुणोत्तर वैशिष्ट्ये:</span>
            </p>
            <ul className="list-disc list-inside space-y-0.5 text-slate-300 text-[10px]">
              <li>मोबाईलवर १६:९ आकाराच्या स्क्रीनमध्ये संपूर्ण बॅनर चित्र तंतोतंत बसते.</li>
              <li>चित्राचा कोणताही महत्त्वाचा भाग कापला जात नाही (Fully Visible).</li>
              <li>पारदर्शक ग्रेडियंटमुळे गावाचे नाव व माहिती स्पष्ट वाचता येते.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
