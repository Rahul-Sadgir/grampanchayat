"use client";

import { useState } from "react";
import { createCustomServiceAction } from "@/lib/actions/services";
import { Plus, Trash2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Props {
  villages: { _id: string; name: string; slug: string }[];
}

export function NewServiceFormClient({ villages }: Props) {
  const router = useRouter();
  const [fields, setFields] = useState([
    { name: "applicantFullName", label: "अर्जदाराचे पूर्ण नाव", type: "text", required: true },
  ]);
  const [loading, setLoading] = useState(false);

  function addField() {
    setFields([
      ...fields,
      { name: `field_${Date.now()}`, label: "नवीन फील्ड नाव", type: "text", required: true },
    ]);
  }

  function removeField(index: number) {
    setFields(fields.filter((_, i) => i !== index));
  }

  function updateField(index: number, key: string, value: any) {
    const updated = [...fields];
    (updated[index] as any)[key] = value;
    setFields(updated);
  }

  async function handleFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    fd.append("fieldsJson", JSON.stringify(fields));
    await createCustomServiceAction(fd);
    setLoading(false);
    router.push("/admin/services");
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link
        href="/admin/services"
        className="inline-flex items-center text-xs font-semibold text-emerald-800 gap-1.5 bg-white px-3.5 py-2 rounded-full border border-slate-200 shadow-xs hover:bg-slate-50 transition"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>सर्व सेवांकडे परत जा</span>
      </Link>

      <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200 space-y-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            नवीन नागरिक सेवा व फॉर्म तयार करा
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            कोणताही नवीन कोड न लिहिता थेट ॲडमिन पॅनेलमधून फॉर्म व सेवा तयार करा.
          </p>
        </div>

        <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              कोणत्या गावासाठी ही सेवा आहे? *
            </label>
            <select
              name="villageId"
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-600 focus:outline-none bg-white font-medium text-xs"
            >
              <option value="">गाव निवडा</option>
              {villages.map((v) => (
                <option key={v._id} value={v._id}>
                  {v.name} ग्रामपंचायत (/{v.slug})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                सेवेचे नाव (मराठीत) *
              </label>
              <input
                name="name"
                required
                placeholder="उदा. नमुना ८ मालमत्ता उतारा"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-600 focus:outline-none text-xs"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                URL Slug (इंग्रजीत) *
              </label>
              <input
                name="slug"
                required
                placeholder="उदा. namuna-8-extract"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-600 focus:outline-none font-mono text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              प्रवर्ग (Category) *
            </label>
            <input
              name="category"
              required
              placeholder="उदा. महसूल व कर / नागरी नोंदणी"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-600 focus:outline-none text-xs"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              सेवेची थोडक्यात माहिती *
            </label>
            <textarea
              name="description"
              required
              rows={2}
              placeholder="सदर सेवेबद्दल माहिती..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-600 focus:outline-none text-xs"
            />
          </div>

          {/* DYNAMIC FIELD BUILDER */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                फॉर्ममधील आवश्यक प्रश्न / फील्ड्स
              </h4>
              <button
                type="button"
                onClick={addField}
                className="inline-flex items-center gap-1 text-xs bg-emerald-50 text-emerald-800 border border-emerald-300 px-3 py-1.5 rounded-xl font-bold hover:bg-emerald-100 transition"
              >
                <Plus className="w-3.5 h-3.5" /> प्रश्न जोडा
              </button>
            </div>

            <div className="space-y-2.5">
              {fields.map((f, idx) => (
                <div key={idx} className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center gap-2">
                  <input
                    value={f.label}
                    onChange={(e) => updateField(idx, "label", e.target.value)}
                    placeholder="फील्ड लेबल (उदा. मिळकत नंबर)"
                    className="flex-1 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                  />
                  <select
                    value={f.type}
                    onChange={(e) => updateField(idx, "type", e.target.value)}
                    className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                  >
                    <option value="text">Text</option>
                    <option value="date">Date</option>
                    <option value="number">Number</option>
                  </select>
                  <label className="flex items-center gap-1 text-xs text-slate-700 shrink-0 font-medium">
                    <input
                      type="checkbox"
                      checked={f.required}
                      onChange={(e) => updateField(idx, "required", e.target.checked)}
                      className="rounded text-emerald-700"
                    />
                    आवश्यक
                  </label>
                  <button
                    type="button"
                    onClick={() => removeField(idx)}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition shrink-0"
                    title="हटवा"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl transition shadow-xs active:scale-95 disabled:opacity-50 text-xs"
          >
            {loading ? "प्रकाशित होत आहे..." : "सेवा आणि फॉर्म प्रकाशित करा"}
          </button>
        </form>
      </div>
    </div>
  );
}
