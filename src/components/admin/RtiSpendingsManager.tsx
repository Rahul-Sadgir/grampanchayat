"use client";

import React, { useState, useRef, useTransition } from "react";
import Image from "next/image";
import {
  FileText,
  Plus,
  Trash2,
  Edit2,
  Upload,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Eye,
  X,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import {
  RtiSpendingItem,
  createRtiSpending,
  updateRtiSpending,
  deleteRtiSpending,
} from "@/lib/actions/rti";

interface Props {
  initialSpendings: RtiSpendingItem[];
  villageSlug: string;
}

export function RtiSpendingsManager({ initialSpendings, villageSlug }: Props) {
  const [spendings, setSpendings] = useState<RtiSpendingItem[]>(initialSpendings);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<RtiSpendingItem | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const openAddModal = () => {
    setEditingItem(null);
    setTitle("");
    setSelectedFile(null);
    setPreviewUrl("");
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: RtiSpendingItem) => {
    setEditingItem(item);
    setTitle(item.title);
    setSelectedFile(null);
    setPreviewUrl(item.imageUrl);
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("villageSlug", villageSlug);
      formData.append("title", title);

      if (selectedFile) {
        formData.append("imageFile", selectedFile);
      } else if (editingItem) {
        formData.append("imageUrl", editingItem.imageUrl);
      }

      if (editingItem) {
        formData.append("id", editingItem.id);
        const res = await updateRtiSpending(formData);
        if (res.success && res.spending) {
          setSpendings((prev) =>
            prev.map((s) => (s.id === editingItem.id ? res.spending! : s))
          );
          setSuccessMsg("खर्च पावती यशस्वीरीत्या अद्यतनित झाली!");
          setIsModalOpen(false);
          setTimeout(() => setSuccessMsg(null), 4000);
        } else {
          setErrorMsg(res.error || "अद्यतनित करताना त्रुटी आली.");
        }
      } else {
        const res = await createRtiSpending(formData);
        if (res.success && res.spending) {
          setSpendings((prev) => [res.spending!, ...prev]);
          setSuccessMsg("नवीन खर्च पावती यशस्वीरीत्या जोडली गेली!");
          setIsModalOpen(false);
          setTimeout(() => setSuccessMsg(null), 4000);
        } else {
          setErrorMsg(res.error || "खर्च पावती जोडताना त्रुटी आली.");
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || "त्रुटी आली.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, itemTitle: string) => {
    if (!confirm(`तुम्हाला नक्की "${itemTitle}" ही खर्च नोंद हटवायची आहे का?`)) {
      return;
    }

    try {
      const res = await deleteRtiSpending(id, villageSlug);
      if (res.success) {
        setSpendings((prev) => prev.filter((s) => s.id !== id));
        setSuccessMsg("खर्च नोंद यशस्वीरीत्या काढून टाकली.");
        setTimeout(() => setSuccessMsg(null), 3000);
      } else {
        alert("त्रुटी: " + res.error);
      }
    } catch (err: any) {
      alert("त्रुटी: " + err.message);
    }
  };

  return (
    <div id="rti-manager" className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-100 text-amber-900">
              <ShieldCheck className="w-5 h-5 text-[#9e4300]" />
            </span>
            <div>
              <h3 className="font-black text-base sm:text-lg text-slate-900">
                माहितीचा अधिकार (RTI) - खर्च व जमा-खर्च व्यवस्थापन
              </h3>
              <p className="text-xs text-slate-500">
                गावाच्या About पेजवर खर्च पारदर्शकतेसाठी शीर्षक व पावतीचे छायाचित्र अपलोड करा (Title & Image only).
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="px-4 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-2xl text-xs font-bold transition shadow-xs flex items-center gap-2 shrink-0 cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>नवीन खर्च पावती / व्हाउचर जोडा</span>
        </button>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-red-900 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Spendings List Grid (A4 Size Proportionate Cards) */}
      {spendings.length === 0 ? (
        <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-2">
          <FileText className="w-8 h-8 text-slate-400 mx-auto" />
          <p className="text-xs sm:text-sm font-bold text-slate-700">
            कोणतीही खर्च पावती जोडलेली नाही.
          </p>
          <p className="text-xs text-slate-500">
            वरील &apos;नवीन खर्च पावती / व्हाउचर जोडा&apos; बटणावर क्लिक करून पहिली नोंद प्रसिद्ध करा.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {spendings.map((item, idx) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl border border-slate-200 overflow-hidden flex flex-col justify-between shadow-2xs hover:shadow-md transition"
            >
              {/* A4 Document Presentation Frame */}
              <div className="p-3.5 bg-slate-100 border-b border-slate-200 flex items-center justify-center">
                <div className="relative w-full aspect-[210/297] bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
                  <Image
                    src={item.imageUrl}
                    alt={item.title}
                    fill
                    className="object-contain p-1.5"
                    sizes="(max-width: 640px) 100vw, 33vw"
                  />
                  <a
                    href={item.imageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white transition shadow-2xs"
                    title="पूर्ण आकारात उघडा"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Title & Actions */}
              <div className="p-4 space-y-3 bg-white flex-1 flex flex-col justify-between">
                <h4 className="text-xs font-bold text-slate-900 line-clamp-3 leading-snug">
                  {item.title}
                </h4>

                <div className="flex items-center justify-between pt-2.5 border-t border-slate-100">
                  <span className="text-[10px] text-slate-400">
                    {new Date(item.createdAt).toLocaleDateString("mr-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => openEditModal(item)}
                      className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition cursor-pointer"
                      title="शीर्षक संपादित करा"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id, item.title)}
                      className="p-1.5 rounded-lg bg-slate-50 hover:bg-red-50 text-red-600 border border-slate-200 transition cursor-pointer"
                      title="काढून टाका"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Add / Edit RTI Spending */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#003625] to-emerald-900 text-white p-4 sm:p-5 flex items-center justify-between gap-3 shrink-0">
              <div>
                <span className="text-[10px] font-bold text-[#F5D77F] uppercase tracking-wider block">
                  माहितीचा अधिकार (RTI) खर्च पावती
                </span>
                <h3 className="text-base sm:text-lg font-black text-white">
                  {editingItem ? "खर्च पावती संपादित करा" : "नवीन खर्च पावती / व्हाउचर जोडा"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs overflow-y-auto flex-1">
              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs font-bold">
                  {errorMsg}
                </div>
              )}

              {/* Title Field (Title only as requested!) */}
              <div className="space-y-1">
                <label className="block font-bold text-slate-800">
                  खर्चाचे शीर्षक (Spending Title) *
                </label>
                <textarea
                  rows={2}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="उदा. १५ वा वित्त आयोग - शुद्ध पेयजल पाईपलाईन दुरुस्ती खर्च व्हाउचर"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-600 resize-none font-medium text-slate-900"
                  required
                />
                <p className="text-[10px] text-slate-500">
                  खर्चाचा विषय, कामाचे नाव किंवा खरेदीचे स्पष्ट शीर्षक प्रविष्ट करा.
                </p>
              </div>

              {/* Image Upload */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="block font-bold text-slate-800">
                  पावती / व्हाउचर छायाचित्र (Receipt Image) {editingItem ? "(पर्यायी)" : "*"}
                </label>

                {previewUrl && (
                  <div className="p-3 bg-slate-100 rounded-2xl border border-slate-200 flex items-center justify-center">
                    <div className="relative aspect-[210/297] w-48 max-w-full bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
                      <Image
                        src={previewUrl}
                        alt="पावती प्रिव्ह्यू"
                        fill
                        className="object-contain p-1"
                      />
                    </div>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-100 file:text-emerald-900 hover:file:bg-emerald-200 cursor-pointer"
                  required={!editingItem && !previewUrl}
                />
                <p className="text-[10px] text-slate-400">
                  JPG, PNG, WEBP स्वरूपातील स्पष्ट बिल किंवा व्हाउचर छायाचित्र निवडा.
                </p>
              </div>

              {/* Actions */}
              <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition cursor-pointer"
                >
                  रद्द करा
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>अपलोड होत आहे...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5" />
                      <span>{editingItem ? "बदल सेव्ह करा" : "खर्च नोंद प्रसिद्ध करा"}</span>
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

