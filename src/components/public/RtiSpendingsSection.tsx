"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  FileText,
  Eye,
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ExternalLink,
  ShieldCheck,
  Calendar,
} from "lucide-react";
import { RtiSpendingItem } from "@/lib/actions/rti";

interface Props {
  spendings: RtiSpendingItem[];
  villageName: string;
}

export function RtiSpendingsSection({ spendings, villageName }: Props) {
  const [selectedSpending, setSelectedSpending] = useState<RtiSpendingItem | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  const openLightbox = (item: RtiSpendingItem) => {
    setSelectedSpending(item);
    setZoomLevel(1);
  };

  const closeLightbox = () => {
    setSelectedSpending(null);
    setZoomLevel(1);
  };

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.25, 0.75));
  const handleResetZoom = () => setZoomLevel(1);

  return (
    <section id="rti-spendings" className="space-y-4 pt-4 border-t border-[#E5DEC9]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#9e4300] bg-[#F4EFE6] px-3 py-1 rounded-full border border-[#E5DEC9] mb-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#9e4300]" />
            <span>माहितीचा अधिकार (RTI) कलम ४(१)(ख)</span>
          </div>
          <h2 className="text-lg sm:text-2xl font-extrabold text-[#003625]">
            ग्रामपंचायत खर्च व जमा-खर्च पारदर्शकता
          </h2>
          <p className="text-xs sm:text-sm text-[#526056] mt-0.5 leading-relaxed">
            {villageName} ग्रामपंचायतीच्या विकासकामे, खरेदी व प्रशासकीय खर्चाच्या पावत्या / व्हाऊचर छायाचित्रे
          </p>
        </div>

        <div className="shrink-0">
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#003625] bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            <span>एकूण नोंदी: {spendings.length}</span>
          </span>
        </div>
      </div>

      {/* Spendings Grid (A4 Size Proportionate Cards) */}
      {spendings.length === 0 ? (
        <div className="p-8 text-center bg-[#FBF9F5] rounded-3xl border border-[#E5DEC9] space-y-2">
          <FileText className="w-8 h-8 text-slate-400 mx-auto" />
          <p className="text-xs sm:text-sm font-bold text-[#003625]">
            सध्या कोणताही खर्च तपशील प्रसिद्ध केलेला नाही.
          </p>
          <p className="text-xs text-[#526056]">
            ग्रामपंचायत प्रशासनातर्फे नवीन जमा-खर्च पावत्या व व्हाऊचर्स लवकरच येथे प्रसिद्ध केले जातील.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {spendings.map((item, idx) => {
            const formattedDate = item.createdAt
              ? new Date(item.createdAt).toLocaleDateString("mr-IN", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })
              : "";

            return (
              <div
                key={item.id}
                onClick={() => openLightbox(item)}
                className="group cursor-pointer bg-white rounded-3xl border border-[#E5DEC9] overflow-hidden shadow-xs hover:shadow-xl hover:border-[#9e4300]/60 transition-all duration-300 flex flex-col justify-between"
              >
                {/* A4 Sheet Presentation Frame */}
                <div className="p-3.5 sm:p-4 bg-[#F7F4EB] border-b border-[#E5DEC9]/80 flex items-center justify-center">
                  <div className="relative w-full aspect-[210/297] bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden group-hover:shadow-md transition-shadow">
                    <Image
                      src={item.imageUrl}
                      alt={item.title}
                      fill
                      className="object-contain p-1.5 group-hover:scale-[1.02] transition-transform duration-300"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/15 group-hover:bg-black/35 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <span className="px-3 py-1.5 rounded-full bg-white text-[#003625] text-xs font-bold shadow-md flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-all">
                        <Eye className="w-3.5 h-3.5 text-[#9e4300]" />
                        <span>पावती मोठी पहा</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Title Only Container (as requested) */}
                <div className="p-4 space-y-2 bg-white flex-1 flex flex-col justify-between">
                  <h3 className="text-xs sm:text-sm font-bold text-[#003625] group-hover:text-[#9e4300] transition-colors line-clamp-3 leading-snug">
                    {item.title}
                  </h3>

                  {formattedDate && (
                    <div className="flex items-center gap-1 text-[10px] text-[#526056] pt-2 border-t border-slate-100">
                      <Calendar className="w-3 h-3 text-[#9e4300]" />
                      <span>नोंद दिनांक: {formattedDate}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lightbox Modal */}
      {selectedSpending && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex flex-col items-center justify-between p-4 sm:p-6"
          onClick={closeLightbox}
        >
          {/* Top Bar */}
          <div
            className="w-full max-w-4xl flex items-center justify-between gap-3 text-white py-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="min-w-0 flex-1">
              <span className="text-[10px] uppercase font-bold text-amber-300 block">
                माहितीचा अधिकार (RTI) खर्च पावती
              </span>
              <h3 className="text-sm sm:text-base font-extrabold truncate text-white">
                {selectedSpending.title}
              </h3>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={handleZoomIn}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                title="झूम वाढवा (Zoom in)"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleZoomOut}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                title="झूम कमी करा (Zoom out)"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleResetZoom}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                title="मूळ आकार (Reset zoom)"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <a
                href={selectedSpending.imageUrl}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                title="मूळ इमेज नवीन टॅबमध्ये उघडा"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
              <button
                type="button"
                onClick={closeLightbox}
                className="p-2 rounded-xl bg-red-600/80 hover:bg-red-600 text-white transition cursor-pointer ml-1"
                title="बंद करा (Close)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Image Display Area (A4 Proportionate Display) */}
          <div
            className="flex-1 w-full max-w-4xl flex items-center justify-center overflow-auto p-2 sm:p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="relative max-h-[82vh] aspect-[210/297] w-auto h-full max-w-full transition-transform duration-200 flex items-center justify-center"
              style={{ transform: `scale(${zoomLevel})` }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedSpending.imageUrl}
                alt={selectedSpending.title}
                className="max-h-[82vh] w-auto object-contain rounded-xl shadow-2xl border border-white/20 bg-white"
              />
            </div>
          </div>

          {/* Bottom Title Bar */}
          <div
            className="w-full max-w-2xl text-center py-2 text-xs text-white/90 bg-white/10 backdrop-blur-md px-4 rounded-full border border-white/15"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="font-bold">{selectedSpending.title}</span>
          </div>
        </div>
      )}
    </section>
  );
}

