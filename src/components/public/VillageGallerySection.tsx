"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  ImageIcon,
  Maximize2,
  X,
  Layers,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";

export interface GalleryItem {
  url: string;
  caption?: string;
  category?: string;
}

interface Props {
  villageName: string;
  images: GalleryItem[];
}

export function VillageGallerySection({ villageName, images }: Props) {
  const [selectedCategory, setSelectedCategory] = useState<string>("सर्व");
  const [activeModalIndex, setActiveModalIndex] = useState<number | null>(null);

  if (!images || images.length === 0) return null;

  // Extract unique categories
  const categories = ["सर्व", ...Array.from(new Set(images.map((i) => i.category || "सर्वसाधारण")))];

  const filteredImages =
    selectedCategory === "सर्व"
      ? images
      : images.filter((i) => (i.category || "सर्वसाधारण") === selectedCategory);

  const handleNext = () => {
    if (activeModalIndex !== null) {
      setActiveModalIndex((activeModalIndex + 1) % filteredImages.length);
    }
  };

  const handlePrev = () => {
    if (activeModalIndex !== null) {
      setActiveModalIndex((activeModalIndex - 1 + filteredImages.length) % filteredImages.length);
    }
  };

  return (
    <div className="space-y-6 pt-4 border-t border-[#E5DEC9]">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#9e4300] bg-[#F4EFE6] px-3 py-1 rounded-full border border-[#E5DEC9] mb-1">
            <ImageIcon className="w-3.5 h-3.5 text-[#9e4300]" />
            <span>छायाचित्र दालन • ग्रामदर्शन</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#003625]">
            {villageName} गावाची निसर्गरम्य व ऐतिहासिक छायाचित्रे
          </h2>
          <p className="text-xs text-[#526056] mt-0.5">
            गावातील प्रशासकीय वास्तू, निसर्ग, कृषी शिवार, मंदिरे व लोकजीवनाची अधिकृत छायाचित्रे.
          </p>
        </div>

        <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-[#FBF9F5] text-[#003625] border border-[#E5DEC9] shrink-0">
          एकूण छायाचित्रे: {images.length}
        </span>
      </div>

      {/* Category Pills */}
      {categories.length > 2 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full font-bold transition-all shrink-0 cursor-pointer ${
                selectedCategory === cat
                  ? "bg-[#003625] text-white shadow-xs"
                  : "bg-white text-slate-700 hover:bg-[#F4EFE6] border border-[#E5DEC9]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Photo Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredImages.map((img, idx) => (
          <div
            key={idx}
            onClick={() => setActiveModalIndex(idx)}
            className="group relative bg-[#FBF9F5] rounded-2xl border border-[#E5DEC9] overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 cursor-pointer flex flex-col justify-between"
          >
            {/* 16:9 Image Container */}
            <div className="relative w-full aspect-[16/9] bg-slate-100 overflow-hidden">
              <Image
                src={img.url}
                alt={img.caption || `${villageName} छायाचित्र`}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 opacity-80 group-hover:opacity-100 transition-opacity" />

              {/* Category Badge */}
              {img.category && (
                <div className="absolute top-2.5 left-2.5">
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white/95 text-[#003625] shadow-xs backdrop-blur-md">
                    {img.category}
                  </span>
                </div>
              )}

              {/* Maximize Icon on Hover */}
              <div className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-md">
                <Maximize2 className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Caption & Details */}
            <div className="p-3.5 flex items-center justify-between gap-2">
              <p className="text-xs font-bold text-[#003625] line-clamp-1 leading-snug group-hover:text-[#9e4300] transition">
                {img.caption || `${villageName} ग्राम परिसर`}
              </p>
              <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                मोठे पहा ↗
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox / Fullscreen Modal */}
      {activeModalIndex !== null && filteredImages[activeModalIndex] && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4"
          onClick={() => setActiveModalIndex(null)}
        >
          {/* Close Button */}
          <button
            onClick={() => setActiveModalIndex(null)}
            className="absolute top-4 right-4 z-50 p-2.5 rounded-full bg-white/20 hover:bg-white/40 text-white transition cursor-pointer"
            aria-label="बंद करा"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Modal Content */}
          <div
            className="relative max-w-4xl w-full max-h-[85vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Active Image */}
            <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden shadow-2xl bg-black border border-white/20">
              <Image
                src={filteredImages[activeModalIndex].url}
                alt={filteredImages[activeModalIndex].caption || `${villageName} छायाचित्र`}
                fill
                className="object-contain"
                priority
              />
            </div>

            {/* Caption & Navigation Controls */}
            <div className="w-full mt-4 flex items-center justify-between text-white px-2">
              <div>
                <span className="text-xs font-bold text-amber-300 block">
                  {filteredImages[activeModalIndex].category || "छायाचित्र"} ({activeModalIndex + 1}/{filteredImages.length})
                </span>
                <h3 className="text-sm sm:text-base font-bold text-white">
                  {filteredImages[activeModalIndex].caption || `${villageName} ग्राम परिसर`}
                </h3>
              </div>

              {/* Prev / Next Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrev}
                  className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white transition cursor-pointer"
                  title="मागील"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={handleNext}
                  className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white transition cursor-pointer"
                  title="पुढील"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
