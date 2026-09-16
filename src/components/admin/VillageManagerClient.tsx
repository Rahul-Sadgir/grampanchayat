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
} from "lucide-react";
import { VillageBannerManager } from "@/components/admin/VillageBannerManager";
import { VillageGalleryManager, GalleryImageItem } from "@/components/admin/VillageGalleryManager";
import { updateVillageAction } from "@/lib/actions/villages";

interface VillageItem {
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
}

interface Props {
  villages: VillageItem[];
}

export function VillageManagerClient({ villages }: Props) {
  const [editingVillage, setEditingVillage] = useState<VillageItem | null>(null);
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleOpenEdit = (v: VillageItem) => {
    setEditingVillage(v);
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
              ग्रामपंचायत पोर्टल व १६:९ बॅनर नियंत्रण
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
            <span>
              प्रत्येक गाव ही स्वतंत्र अधिकृत वेबसाइट आहे. ॲडमिन येथून संपर्क माहिती व १६:९ कव्हर बॅनर नियंत्रित करू शकतात.
            </span>
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200">
          <Globe className="w-3.5 h-3.5 text-emerald-700" />
          <span>सक्रिय ग्रामपंचायत पोर्टल्स: {villages.length}</span>
        </div>
      </div>

      {/* 16:9 BANNER UPLOADER & RATIO MANAGER */}
      {villages.length > 0 && (
        <VillageBannerManager
          villages={villages.map((v) => ({
            _id: v._id,
            name: v.name,
            slug: v.slug,
            coverImage: v.coverImage,
          }))}
        />
      )}

      {/* VILLAGE ABOUT PHOTO GALLERY MANAGER */}
      {villages.length > 0 && (
        <VillageGalleryManager
          villages={villages.map((v) => ({
            _id: v._id,
            name: v.name,
            slug: v.slug,
            galleryImages: v.galleryImages,
          }))}
        />
      )}

      {/* Configured Villages Cards Grid */}
      <div className="space-y-4">
        <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
          <span>अधिकृत ग्रामपंचायतींची यादी ({villages.length})</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {villages.map((v) => (
            <div
              key={v._id}
              className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between"
            >
              <div>
                {/* 16:9 Banner Header */}
                <div className="relative w-full aspect-[16/9] bg-slate-100 border-b border-slate-100">
                  <Image
                    src={v.coverImage || "/images/panoramic-landscape.png"}
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
                      ता. {v.taluka || "सिन्नर"}, जि. {v.district || "नाशिक"}
                    </p>
                  </div>
                </div>

                {/* Village Details Body */}
                <div className="p-5 space-y-3 text-xs">
                  <p className="text-slate-600 line-clamp-2 leading-relaxed">
                    {v.description || "ग्रामपंचायत अधिकृत नागरी ई-सेवा व डिजिटल प्रशासन पोर्टल."}
                  </p>

                  <div className="space-y-1.5 pt-2 border-t border-slate-100 text-slate-700">
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
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
                >
                  <Edit2 className="w-3.5 h-3.5 text-emerald-700" />
                  <span>माहिती संपादित करा</span>
                </button>

                <Link
                  href={`/${v.slug}`}
                  target="_blank"
                  className="px-3 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                >
                  <span>पोर्टल उघडा</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Village Modal */}
      {editingVillage && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl max-w-lg w-full p-6 space-y-4 my-8">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-800" />
                <span>{editingVillage.name} ग्रामपंचायत माहिती संपादन</span>
              </h3>
              <button
                onClick={() => setEditingVillage(null)}
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

            <form onSubmit={handleFormSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  संपर्क दूरध्वनी / मोबाईल क्रमांक
                </label>
                <input
                  name="phone"
                  defaultValue={editingVillage.phone || ""}
                  placeholder="+91 2551 000000"
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
                  placeholder="grampanchayat@gmail.com"
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
                  placeholder="मु. पो. गाव, ता. सिन्नर, जि. नाशिक"
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

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
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
                  {isPending ? "जतन होत आहे..." : "बदल सेव्ह करा"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
