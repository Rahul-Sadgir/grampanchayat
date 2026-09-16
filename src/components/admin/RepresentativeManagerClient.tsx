"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  Upload,
  Phone,
  Mail,
  Award,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  X,
  Building,
  RefreshCw,
} from "lucide-react";
import {
  saveRepresentative,
  deleteRepresentative,
} from "@/lib/actions/representatives";

interface RepresentativeItem {
  _id: string;
  villageSlug: string;
  name: string;
  role: string;
  phone?: string;
  email?: string;
  ward?: string;
  photoUrl?: string;
  isSarpanch?: boolean;
  isUpasarpanch?: boolean;
  order?: number;
  term?: string;
}

interface Props {
  initialRepresentatives: RepresentativeItem[];
  villages: { name: string; slug: string }[];
  selectedVillageSlug?: string;
}

const ROLES = [
  "सरपंच",
  "उपसरपंच",
  "ग्रामसेवक / ग्रामविकास अधिकारी",
  "ग्रामपंचायत सदस्या",
  "ग्रामपंचायत सदस्य",
  "संगणक परिचालक (Data Operator)",
  "शिपाई / कर्मचारी",
];

export function RepresentativeManagerClient({
  initialRepresentatives,
  villages,
  selectedVillageSlug = "ALL",
}: Props) {
  const [reps, setReps] = useState<RepresentativeItem[]>(initialRepresentatives);
  const [activeVillage, setActiveVillage] = useState(selectedVillageSlug);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRep, setEditingRep] = useState<RepresentativeItem | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [role, setRole] = useState(ROLES[0]);
  const [villageSlug, setVillageSlug] = useState(
    villages[0]?.slug || "gulwanch"
  );
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [ward, setWard] = useState("");
  const [term, setTerm] = useState("२०२२ - २०२७");
  const [order, setOrder] = useState(0);
  const [photoUrl, setPhotoUrl] = useState("");
  const [selectedPhotoFile, setSelectedPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const openAddModal = () => {
    setEditingRep(null);
    setName("");
    setRole(ROLES[0]);
    setVillageSlug(activeVillage === "ALL" ? villages[0]?.slug || "gulwanch" : activeVillage);
    setPhone("");
    setEmail("");
    setWard("");
    setTerm("२०२२ - २०२७");
    setOrder(reps.length + 1);
    setPhotoUrl("");
    setSelectedPhotoFile(null);
    setPhotoPreview("");
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const openEditModal = (rep: RepresentativeItem) => {
    setEditingRep(rep);
    setName(rep.name);
    setRole(rep.role);
    setVillageSlug(rep.villageSlug);
    setPhone(rep.phone || "");
    setEmail(rep.email || "");
    setWard(rep.ward || "");
    setTerm(rep.term || "२०२२ - २०२७");
    setOrder(rep.order || 0);
    setPhotoUrl(rep.photoUrl || "");
    setSelectedPhotoFile(null);
    setPhotoPreview(rep.photoUrl || "");
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedPhotoFile(file);
      const url = URL.createObjectURL(file);
      setPhotoPreview(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const formData = new FormData();
      if (editingRep) {
        formData.append("id", editingRep._id);
      }
      formData.append("villageSlug", villageSlug);
      formData.append("name", name);
      formData.append("role", role);
      formData.append("phone", phone);
      formData.append("email", email);
      formData.append("ward", ward);
      formData.append("term", term);
      formData.append("order", String(order));
      formData.append("isSarpanch", String(role === "सरपंच"));
      formData.append("isUpasarpanch", String(role === "उपसरपंच"));
      formData.append("photoUrl", photoUrl);

      if (selectedPhotoFile) {
        formData.append("photoFile", selectedPhotoFile);
      }

      const res = await saveRepresentative(formData);

      if (res.success && res.representative) {
        if (editingRep) {
          setReps((prev) =>
            prev.map((r) => (r._id === editingRep._id ? res.representative : r))
          );
          setSuccessMsg("पदाधिकारी माहिती यशस्वीरीत्या अद्यतनित केली!");
        } else {
          setReps((prev) => [...prev, res.representative]);
          setSuccessMsg("नवीन पदाधिकारी यशस्वीरीत्या जोडला गेला!");
        }
        setIsModalOpen(false);
        setTimeout(() => setSuccessMsg(null), 4000);
      } else {
        setErrorMsg(res.error || "माहिती सेव्ह करताना अडचण आली.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "त्रुटी आली.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (repId: string, repName: string) => {
    if (!confirm(`तुम्हाला नक्की "${repName}" यांची नोंद काढून टाकायची आहे का?`)) {
      return;
    }

    try {
      const res = await deleteRepresentative(repId);
      if (res.success) {
        setReps((prev) => prev.filter((r) => r._id !== repId));
        setSuccessMsg("नोंद यशस्वीरीत्या काढून टाकली.");
        setTimeout(() => setSuccessMsg(null), 3000);
      } else {
        alert("नोंद काढताना अडचण आली: " + res.error);
      }
    } catch (err: any) {
      alert("त्रुटी: " + err.message);
    }
  };

  const filteredReps =
    activeVillage === "ALL"
      ? reps
      : reps.filter((r) => r.villageSlug === activeVillage);

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            ग्रामपंचायत पदाधिकारी व सदस्य व्यवस्थापन
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            सरपंच, उपसरपंच, ग्रामसेवक व वार्ड सदस्यांची नावे, संपर्क, कार्यकाळ व फोटो (Cloudinary) नियंत्रित करा.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="px-5 py-3 bg-emerald-800 hover:bg-emerald-900 text-white rounded-2xl text-xs font-bold transition shadow-sm active:scale-95 flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>नवीन सदस्य / पदाधिकारी जोडा</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-900 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Village Filter Tabs */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs flex items-center gap-2 overflow-x-auto">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
          गाव:
        </span>
        <button
          type="button"
          onClick={() => setActiveVillage("ALL")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
            activeVillage === "ALL"
              ? "bg-emerald-800 text-white shadow-xs"
              : "bg-slate-100 hover:bg-slate-200 text-slate-700"
          }`}
        >
          सर्व गावे ({reps.length})
        </button>
        {villages.map((v) => {
          const count = reps.filter((r) => r.villageSlug === v.slug).length;
          return (
            <button
              key={v.slug}
              type="button"
              onClick={() => setActiveVillage(v.slug)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                activeVillage === v.slug
                  ? "bg-emerald-800 text-white shadow-xs"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              {v.name} ({count})
            </button>
          );
        })}
      </div>

      {/* Representatives Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredReps.length === 0 ? (
          <div className="col-span-full py-16 bg-white rounded-3xl border border-slate-200 text-center space-y-3">
            <Users className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-xs text-slate-500 font-medium">
              या गावासाठी अद्याप कोणतीही पदाधिकारी नोंद नाही.
            </p>
            <button
              type="button"
              onClick={openAddModal}
              className="px-4 py-2 bg-emerald-800 text-white rounded-xl text-xs font-bold hover:bg-emerald-900 transition"
            >
              पहिली नोंद जोडा
            </button>
          </div>
        ) : (
          filteredReps.map((rep) => {
            const isLeader = rep.isSarpanch || rep.isUpasarpanch;
            return (
              <div
                key={rep._id}
                className={`bg-white rounded-3xl p-5 border transition-all hover:shadow-md flex flex-col justify-between ${
                  rep.isSarpanch
                    ? "border-amber-300 ring-2 ring-amber-400/20 shadow-xs"
                    : rep.isUpasarpanch
                    ? "border-emerald-300 shadow-xs"
                    : "border-slate-200 shadow-2xs"
                }`}
              >
                <div className="space-y-3.5">
                  {/* Top Badge & Village */}
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        rep.isSarpanch
                          ? "bg-amber-100 text-amber-900 border border-amber-300"
                          : rep.isUpasarpanch
                          ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {rep.role}
                    </span>

                    <span className="text-[11px] font-semibold text-slate-400">
                      गाव: {rep.villageSlug}
                    </span>
                  </div>

                  {/* Photo & Name */}
                  <div className="flex items-center gap-3.5">
                    <div className="relative w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                      {rep.photoUrl ? (
                        <Image
                          src={rep.photoUrl}
                          alt={rep.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <Users className="w-6 h-6 text-slate-400" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <h4 className="font-extrabold text-slate-900 text-sm truncate">
                        {rep.name}
                      </h4>
                      {rep.ward && (
                        <p className="text-[11px] text-slate-500 font-medium">
                          {rep.ward}
                        </p>
                      )}
                      <p className="text-[10px] text-slate-400">
                        कार्यकाळ: {rep.term || "२०२२ - २०२७"}
                      </p>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
                    {rep.phone && (
                      <div className="flex items-center gap-2 text-slate-700">
                        <Phone className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                        <span className="font-mono">{rep.phone}</span>
                      </div>
                    )}
                    {rep.email && (
                      <div className="flex items-center gap-2 text-slate-500 truncate">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{rep.email}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 mt-4">
                  <button
                    type="button"
                    onClick={() => openEditModal(rep)}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                    title="संपादित करा"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(rep._id, rep.name)}
                    className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition"
                    title="काढून टाका"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Representative Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#003625] to-emerald-900 text-white p-5 flex items-center justify-between gap-3 shrink-0">
              <div>
                <h3 className="text-lg font-extrabold text-white">
                  {editingRep ? "पदाधिकारी माहिती संपादित करा" : "नवीन पदाधिकारी / सदस्य जोडा"}
                </h3>
                <p className="text-xs text-emerald-200/90 mt-0.5">
                  सर्व माहिती ग्रामपंचायतीच्या सार्वजनिक पृष्ठावर दिसेल.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
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

              {/* Village Selector & Role */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    गाव निवडा *
                  </label>
                  <select
                    value={villageSlug}
                    onChange={(e) => setVillageSlug(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-emerald-600 focus:outline-none bg-white"
                  >
                    {villages.map((v) => (
                      <option key={v.slug} value={v.slug}>
                        {v.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    पद / हुद्दा *
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-emerald-600 focus:outline-none bg-white"
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  संपूर्ण नाव (उदा. सौ. अलका साहेबराव भोर) *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="उदा. श्री. / सौ. नाव..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none font-medium"
                  required
                />
              </div>

              {/* Ward & Term */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    वार्ड क्र. / प्रभाग (लागू असल्यास)
                  </label>
                  <input
                    type="text"
                    value={ward}
                    onChange={(e) => setWard(e.target.value)}
                    placeholder="उदा. वार्ड क्र. १"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    कार्यकाळ
                  </label>
                  <input
                    type="text"
                    value={term}
                    onChange={(e) => setTerm(e.target.value)}
                    placeholder="२०२२ - २०२७"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Phone & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    मोबाईल क्रमांक
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="उदा. ९८२३९७८४९२"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    ईमेल आयडी
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="उदा. gpkomalwadi@gmail.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Photo Upload (Cloudinary) */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  फोटो अपलोड करा (Cloudinary Storage)
                </label>
                <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  <div className="relative w-16 h-16 rounded-2xl bg-white border border-slate-300 overflow-hidden shrink-0 flex items-center justify-center">
                    {photoPreview ? (
                      <Image
                        src={photoPreview}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <Users className="w-6 h-6 text-slate-400" />
                    )}
                  </div>

                  <div className="flex-1 space-y-1">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                      id="rep-photo-input"
                    />
                    <label
                      htmlFor="rep-photo-input"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-xl font-bold text-xs cursor-pointer shadow-2xs transition"
                    >
                      <Upload className="w-3.5 h-3.5 text-emerald-700" />
                      <span>फोटो निवडा</span>
                    </label>
                    <p className="text-[10px] text-slate-400">
                      JPG, PNG किंवा WEBP फॉरमॅट (Max 5MB)
                    </p>
                  </div>
                </div>
              </div>

              {/* Order index */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  प्रदर्शन क्रम (Order - 1 = प्रथम)
                </label>
                <input
                  type="number"
                  value={order}
                  onChange={(e) => setOrder(Number(e.target.value))}
                  className="w-24 px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition text-xs"
                >
                  रद्द करा
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl text-xs transition shadow-sm active:scale-95 disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>सेव्ह होत आहे...</span>
                    </>
                  ) : (
                    <span>{editingRep ? "बदल सेव्ह करा" : "जोडा"}</span>
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
