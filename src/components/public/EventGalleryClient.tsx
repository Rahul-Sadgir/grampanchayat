"use client";

import { useState } from "react";
import Image from "next/image";
import { Camera, X, ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";

interface GalleryImage {
  url: string;
  caption?: string;
  publicId?: string;
}

interface EventGalleryClientProps {
  images: GalleryImage[];
  title: string;
}

export function EventGalleryClient({ images, title }: EventGalleryClientProps) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  if (!images || images.length === 0) {
    return null;
  }

  const handlePrev = () => {
    if (activeIdx === null) return;
    setActiveIdx((prev) => ((prev! - 1 + images.length) % images.length));
  };

  const handleNext = () => {
    if (activeIdx === null) return;
    setActiveIdx((prev) => ((prev! + 1) % images.length));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-extrabold text-[#003625] flex items-center gap-1.5">
          <Camera className="w-4 h-4 text-[#9e4300]" />
          <span>कार्यक्रमाचे सचित्र छायाचित्रे ({images.length} फोटो)</span>
        </h3>
        <span className="text-[11px] text-[#707973] font-medium">
          फोटो मोठा करून पाहण्यासाठी त्यावर क्लिक करा
        </span>
      </div>

      {/* Photo Grid / Mosaic */}
      <div
        className={`grid gap-3 ${
          images.length === 1
            ? "grid-cols-1"
            : images.length === 2
            ? "grid-cols-1 sm:grid-cols-2"
            : "grid-cols-2 sm:grid-cols-3"
        }`}
      >
        {images.map((img, idx) => (
          <div
            key={idx}
            onClick={() => setActiveIdx(idx)}
            className="group relative h-48 sm:h-56 bg-slate-100 rounded-2xl overflow-hidden cursor-pointer border border-[#E5DEC9] shadow-2xs hover:shadow-md transition"
          >
            <Image
              src={img.url}
              alt={img.caption || `${title} - छायाचित्र ${idx + 1}`}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 text-white p-2 rounded-full">
                <Maximize2 className="w-4 h-4 text-[#F5D77F]" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {activeIdx !== null && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <button
            onClick={() => setActiveIdx(null)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition z-10 cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/50 text-white hover:bg-black/80 transition z-10 cursor-pointer"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/50 text-white hover:bg-black/80 transition z-10 cursor-pointer"
                aria-label="Next image"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Image & Caption */}
          <div className="max-w-4xl max-h-[85vh] w-full flex flex-col items-center justify-center">
            <div className="relative w-full h-[65vh] sm:h-[75vh]">
              <Image
                src={images[activeIdx].url}
                alt={`${title} - छायाचित्र ${activeIdx + 1}`}
                fill
                className="object-contain"
                sizes="100vw"
                priority
              />
            </div>
            <div className="text-center text-white mt-3">
              <p className="text-xs text-white/70 font-mono bg-black/50 px-3 py-1 rounded-full inline-block">
                {activeIdx + 1} / {images.length}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

