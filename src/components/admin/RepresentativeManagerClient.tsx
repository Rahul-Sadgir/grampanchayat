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
  Building2,
  RefreshCw,
  Landmark,
  Shield,
  Check,
  Info,
  Calendar,
} from "lucide-react";
import {
  saveRepresentative,
  deleteRepresentative,
  toggleVillageAdministrativeRule,
  updateAdministratorDetails,
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

interface GovernanceStatus {
  isUnderAdministrativeRule: boolean;
  administratorName: string;
  administratorRole: string;
  administratorPhone: string;
  administratorEmail?: string;
  administratorOrderDetails?: string;
  administratorPhotoUrl?: string;
}

interface Props {
  initialRepresentatives: RepresentativeItem[];
  villages: { name: string; slug: string }[];
  selectedVillageSlug?: string;
  initialGovernanceStatus?: GovernanceStatus;
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
  selectedVillageSlug = "komalwadi",
  initialGovernanceStatus,
}: Props) {
  const defaultVillage =
    selectedVillageSlug && selectedVillageSlug !== "ALL"
      ? selectedVillageSlug
      : villages[0]?.slug || "komalwadi";

  const [reps, setReps] = useState<RepresentativeItem[]>(initialRepresentatives);
  const [activeVillage, setActiveVillage] = useState(defaultVillage);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRep, setEditingRep] = useState<RepresentativeItem | null>(null);

  // Administrative Rule Governance State
  const [isUnderRule, setIsUnderRule] = useState<boolean>(
    Boolean(initialGovernanceStatus?.isUnderAdministrativeRule)
  );
  const [isTogglingRule, setIsTogglingRule] = useState(false);
  const [isEditAdminModalOpen, setIsEditAdminModalOpen] = useState(false);
  const [adminName, setAdminName] = useState(
    initialGovernanceStatus?.administratorName || "श्री. आर. एस. पाटील"
  );
  const [adminRole, setAdminRole] = useState(
    initialGovernanceStatus?.administratorRole || "शासन नियुक्त प्रशासक (विस्तार अधिकारी)"
  );
  const [adminPhone, setAdminPhone] = useState(
    initialGovernanceStatus?.administratorPhone || "९८२३५५६६७७"
  );
  const [adminEmail, setAdminEmail] = useState(
    initialGovernanceStatus?.administratorEmail || "gpkomalwadi@gmail.com"
  );
  const [adminOrderDetails, setAdminOrderDetails] = useState(
    initialGovernanceStatus?.administratorOrderDetails ||
      "महाराष्ट्र ग्रामपंचायत अधिनियम व जिल्हा परिषद आदेशानुसार कोमलवाडी ग्रामपंचायतीचा कारभार प्रशासकामार्फत चालविला जात आहे."
  );
  const [adminPhotoUrl, setAdminPhotoUrl] = useState(
    initialGovernanceStatus?.administratorPhotoUrl || "/images/emblem.webp"
  );
  const [selectedAdminPhotoFile, setSelectedAdminPhotoFile] = useState<File | null>(null);
  const [adminPhotoPreview, setAdminPhotoPreview] = useState(
    initialGovernanceStatus?.administratorPhotoUrl || "/images/emblem.webp"
  );
  const [isSubmittingAdmin, setIsSubmittingAdmin] = useState(false);

  // Member Form State
  const [name, setName] = useState("");
  const [role, setRole] = useState(ROLES[0]);
  const [villageSlug, setVillageSlug] = useState(defaultVillage);
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
  const adminFileInputRef = useRef<HTMLInputElement>(null);

  // Switch Rule Handler
  const handleToggleRule = async () => {
    setIsTogglingRule(true);
    setErrorMsg(null);
    try {
      const nextVal = !isUnderRule;
      const res = await toggleVillageAdministrativeRule(activeVillage, nextVal);
      if (res.success) {
        setIsUnderRule(nextVal);
        setSuccessMsg(
          nextVal
            ? "ग्रामपंचायत यशस्वीरीत्या 'प्रशासकीय राजवट' मोडमध्ये बदलली! मुख्यपृष्ठावर 'प्रशासकीय राजवटीखालील ग्रामपंचायत' दिसेल."
            : "ग्रामपंचायत यशस्वीरीत्या 'लोकप्रतिनिधी मंडळ' मोडमध्ये बदलली! मुख्यपृष्ठावर सरपंच व सदस्यांचे तपशील दिसतील."
        );
        setTimeout(() => setSuccessMsg(null), 4000);
      } else {
        setErrorMsg(res.error || "स्थिती बदलताना त्रुटी आली.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "त्रुटी आली.");
    } finally {
      setIsTogglingRule(false);
    }
  };

  // Submit Admin Details
  const handleAdminDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingAdmin(true);
    setErrorMsg(null);

    try {
      const formData = new FormData();
      formData.append("villageSlug", activeVillage);
      formData.append("isUnderAdministrativeRule", String(isUnderRule));
      formData.append("name", adminName);
      formData.append("role", adminRole);
      formData.append("phone", adminPhone);
      formData.append("email", adminEmail);
      formData.append("orderDetails", adminOrderDetails);
      formData.append("photoUrl", adminPhotoUrl);
      if (selectedAdminPhotoFile) {
        formData.append("photoFile", selectedAdminPhotoFile);
      }

      const res = await updateAdministratorDetails(formData);
      if (res.success) {
        setSuccessMsg("प्रशासक तपशील यशस्वीरीत्या जतन केले!");
        setIsEditAdminModalOpen(false);
        setTimeout(() => setSuccessMsg(null), 4000);
      } else {
        setErrorMsg(res.error || "जतन करताना त्रुटी आली.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "त्रुटी आली.");
    } finally {
      setIsSubmittingAdmin(false);
    }
  };

  const openAddModal = () => {
    setEditingRep(null);
    setName("");
    setRole(ROLES[0]);
    setVillageSlug(defaultVillage);
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

  const handleAdminPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedAdminPhotoFile(file);
      const url = URL.createObjectURL(file);
      setAdminPhotoPreview(url);
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
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            ग्रामपंचायत पदाधिकारी व सदस्य व्यवस्थापन
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            लोकप्रतिनिधी किंवा प्रशासकीय राजवट यांपैकी चालू मोड निवडा आणि प्रतिनिधी/प्रशासक तपशील नियंत्रित करा.
          </p>
        </div>

        {!isUnderRule && (
          <button
            type="button"
            onClick={openAddModal}
            className="px-5 py-3 bg-emerald-800 hover:bg-emerald-900 text-white rounded-2xl text-xs font-bold transition shadow-sm active:scale-95 flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>नवीन सदस्य / पदाधिकारी जोडा</span>
          </button>
        )}
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-900 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-300 rounded-2xl text-red-900 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 2. CRITICAL GOVERNANCE MODE SWITCH CARD */}
      <div
        className={`p-5 sm:p-6 rounded-3xl border-2 transition-all shadow-sm ${
          isUnderRule
            ? "bg-gradient-to-r from-amber-50 to-orange-50 border-amber-300 ring-2 ring-amber-400/20"
            : "bg-gradient-to-r from-emerald-50/80 to-teal-50/60 border-emerald-300"
        }`}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                ग्रामपंचायत कारभार मोड (Governance Mode)
              </span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-black shadow-2xs flex items-center gap-1.5 ${
                  isUnderRule
                    ? "bg-[#9e4300] text-white"
                    : "bg-[#003625] text-white"
                }`}
              >
                {isUnderRule ? (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5 text-[#F5D77F]" />
                    <span>🏛️ प्रशासकीय राजवट सक्रिय (Administrative Rule)</span>
                  </>
                ) : (
                  <>
                    <Users className="w-3.5 h-3.5 text-emerald-300" />
                    <span>👥 लोकप्रतिनिधी मंडळ सक्रिय (Elected Body)</span>
                  </>
                )}
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
              {isUnderRule
                ? "ग्रामपंचायतीचा कारभार शासन नियुक्त प्रशासकामार्फत सुरू आहे"
                : "ग्रामपंचायतीचा कारभार सरपंच व निर्वाचित सदस्यांमार्फत सुरू आहे"}
            </h3>

            <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
              {isUnderRule
                ? "स्विच 'प्रशासकीय राजवट' वर असल्याने मुख्यपृष्ठावर 'प्रशासकीय राजवटीखालील ग्रामपंचायत - ग्रामपंचायतीचा कारभार शासन नियुक्त प्रशासकामार्फत चालविण्यात येत आहे.' असे ठळकपणे प्रदर्शित केले जात आहे."
                : "स्विच 'लोकप्रतिनिधी' वर असल्याने मुख्यपृष्ठावर निवडून आलेले सरपंच, उपसरपंच व वार्ड सदस्यांचे फोटो व माहिती प्रदर्शित केली जात आहे."}
            </p>
          </div>

          {/* Interactive Switch Button */}
          <div className="flex flex-col items-center sm:items-end gap-2 shrink-0 w-full sm:w-auto pt-2 sm:pt-0">
            <div className="flex items-center gap-3 bg-white p-2 sm:p-2.5 rounded-2xl border border-slate-200 shadow-xs">
              <span
                className={`text-xs font-bold cursor-pointer transition ${
                  !isUnderRule ? "text-[#003625] font-black" : "text-slate-400"
                }`}
                onClick={() => isUnderRule && handleToggleRule()}
              >
                👥 लोकप्रतिनिधी
              </span>

              <button
                type="button"
                role="switch"
                aria-checked={isUnderRule}
                disabled={isTogglingRule}
                onClick={handleToggleRule}
                className={`relative inline-flex h-8 w-16 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-50 ${
                  isUnderRule ? "bg-[#9e4300]" : "bg-[#003625]"
                }`}
                title="कारभार मोड बदला (Toggle Governance Mode)"
              >
                <span
                  className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    isUnderRule ? "translate-x-8" : "translate-x-0"
                  }`}
                />
              </button>

              <span
                className={`text-xs font-bold cursor-pointer transition ${
                  isUnderRule ? "text-[#9e4300] font-black" : "text-slate-400"
                }`}
                onClick={() => !isUnderRule && handleToggleRule()}
              >
                🏛️ प्रशासकीय राजवट
              </span>
            </div>

            {isTogglingRule && (
              <span className="text-[11px] text-slate-500 font-bold flex items-center gap-1 animate-pulse">
                <RefreshCw className="w-3 h-3 animate-spin" />
                <span>मोड अद्यतनित होत आहे...</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 3. IF ADMINISTRATIVE RULE IS ACTIVE: SHOW ADMINISTRATOR PROFILE */}
      {isUnderRule && (
        <div className="bg-white rounded-3xl p-6 border-2 border-amber-300 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-[#9e4300] flex items-center justify-center shrink-0">
                <Landmark className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-base">
                  शासन नियुक्त प्रशासक माहिती (Administrator Profile)
                </h3>
                <p className="text-xs text-slate-500">
                  ही माहिती मुख्यपृष्ठावर नागरिकांना अधिकृतपणे दर्शवली जात आहे.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsEditAdminModalOpen(true)}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5 text-[#F5D77F]" />
              <span>प्रशासक तपशील संपादित करा</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 overflow-hidden relative shrink-0">
                <Image
                  src={adminPhotoUrl || "/images/emblem.webp"}
                  alt="प्रशासक"
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-semibold uppercase">
                  प्रशासकाचे नाव
                </p>
                <p className="font-extrabold text-slate-900 text-sm">{adminName}</p>
                <p className="text-[11px] text-[#9e4300] font-bold">{adminRole}</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <p className="text-[10px] text-slate-400 font-semibold uppercase">
                संपर्क तपशील
              </p>
              <p className="font-bold text-slate-800 flex items-center gap-1.5 font-mono">
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <span>{adminPhone || "—"}</span>
              </p>
              <p className="text-slate-600 flex items-center gap-1.5 truncate">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{adminEmail || "—"}</span>
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <p className="text-[10px] text-slate-400 font-semibold uppercase">
                शासन आदेश / नियुक्ती शेरा
              </p>
              <p className="text-slate-700 leading-relaxed text-[11px] line-clamp-3">
                {adminOrderDetails}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 4. ELECTED BODY / MEMBERS DIRECTORY */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-800" />
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              {isUnderRule
                ? "ग्रामपंचायत सदस्य यादी (सध्या प्रशासकीय राजवटीमुळे कार्यकाळ समाप्त)"
                : "ग्रामपंचायत सरपंच, उपसरपंच व सदस्य यादी"}
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            एकूण नोंदणी: {filteredReps.length}
          </span>
        </div>

        {/* Representatives Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredReps.length === 0 ? (
            <div className="col-span-full py-12 bg-white rounded-3xl border border-slate-200 text-center space-y-2">
              <Users className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-xs text-slate-500 font-medium">
                कोणताही सदस्य नोंदवलेला नाही.
              </p>
            </div>
          ) : (
            filteredReps.map((rep) => {
              const isLead = rep.role === "सरपंच" || rep.isSarpanch;
              const isSubLead = rep.role === "उपसरपंच" || rep.isUpasarpanch;

              return (
                <div
                  key={rep._id}
                  className={`bg-white rounded-2xl border p-4 sm:p-5 shadow-xs space-y-4 flex flex-col justify-between transition hover:shadow-md ${
                    isLead
                      ? "border-emerald-300 ring-2 ring-emerald-400/20"
                      : isSubLead
                      ? "border-amber-200"
                      : "border-slate-200"
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div className="relative w-14 h-14 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center font-black text-slate-700 text-lg shrink-0">
                      {rep.photoUrl ? (
                        <Image
                          src={rep.photoUrl}
                          alt={rep.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        rep.name.split(" ").slice(0, 2).map((w) => w[0]).join("") || "प"
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                            isLead
                              ? "bg-emerald-100 text-emerald-800"
                              : isSubLead
                              ? "bg-amber-100 text-amber-800"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {rep.role}
                        </span>
                        {rep.ward && (
                          <span className="text-[10px] text-slate-500 font-mono">
                            {rep.ward}
                          </span>
                        )}
                      </div>

                      <h4 className="font-extrabold text-sm text-slate-900 mt-1 truncate">
                        {rep.name}
                      </h4>

                      {rep.phone && (
                        <p className="text-xs text-slate-500 font-mono mt-0.5 flex items-center gap-1">
                          <Phone className="w-3 h-3 text-emerald-700" />
                          <span>{rep.phone}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => openEditModal(rep)}
                      className="p-1.5 rounded-lg text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition cursor-pointer"
                      title="संपादित करा"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(rep._id, rep.name)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                      title="हटवा"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 5. EDIT ADMINISTRATOR DETAILS MODAL */}
      {isEditAdminModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col">
            <div className="bg-gradient-to-r from-[#9e4300] to-amber-900 text-white p-5 flex items-start justify-between gap-3 shrink-0">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#F5D77F] mb-1">
                  <Landmark className="w-3.5 h-3.5" />
                  <span>प्रशासकीय राजवट तपशील</span>
                </div>
                <h3 className="text-lg font-extrabold text-white">
                  शासन नियुक्त प्रशासक माहिती बदला
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditAdminModalOpen(false)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdminDetailsSubmit} className="p-5 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="block font-bold text-slate-800">
                  प्रशासकाचे नाव (Administrator Name) *
                </label>
                <input
                  type="text"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-800">
                  पद / हुद्दा (Designation) *
                </label>
                <input
                  type="text"
                  value={adminRole}
                  onChange={(e) => setAdminRole(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-800">
                    मोबाईल क्रमांक (Phone)
                  </label>
                  <input
                    type="text"
                    value={adminPhone}
                    onChange={(e) => setAdminPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-800">
                    ईमेल (Email)
                  </label>
                  <input
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-800">
                  शासन निर्णय / नियुक्ती आदेश व संदेश (Order Details)
                </label>
                <textarea
                  rows={3}
                  value={adminOrderDetails}
                  onChange={(e) => setAdminOrderDetails(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 resize-none"
                />
              </div>

              {/* Photo Upload */}
              <div className="space-y-1 pt-2 border-t border-slate-200">
                <label className="block font-bold text-slate-800">
                  प्रशासकाचा फोटो किंवा शासकीय चिन्ह (Photo / Emblem)
                </label>
                <input
                  ref={adminFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAdminPhotoChange}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-100 file:text-amber-900 hover:file:bg-amber-200 cursor-pointer"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditAdminModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  रद्द करा
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAdmin}
                  className="px-5 py-2 bg-[#9e4300] hover:bg-[#833700] text-white font-bold rounded-xl shadow-xs"
                >
                  {isSubmittingAdmin ? "जतन होत आहे..." : "तपशील जतन करा"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. ADD / EDIT MEMBER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col">
            <div className="bg-gradient-to-r from-[#003625] to-emerald-900 text-white p-5 flex items-start justify-between gap-3 shrink-0">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#F5D77F] mb-1">
                  <Users className="w-3.5 h-3.5" />
                  <span>ग्रामपंचायत {villageSlug}</span>
                </div>
                <h3 className="text-lg font-extrabold text-white">
                  {editingRep ? "सदस्य माहिती संपादित करा" : "नवीन सदस्य / पदाधिकारी जोडा"}
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

            <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="block font-bold text-slate-800">
                  पूर्ण नाव (Name) *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="उदा. श्री. ज्ञानदेव कांगणे"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-600"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-800">
                    पद / भूमिका (Role) *
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-emerald-600"
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-800">
                    वार्ड / प्रभाग (Ward)
                  </label>
                  <input
                    type="text"
                    value={ward}
                    onChange={(e) => setWard(e.target.value)}
                    placeholder="उदा. प्रभाग क्र. १"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-800">
                    मोबाईल क्रमांक (Phone)
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="उदा. 9890112233"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-800">
                    कार्यकाळ (Term)
                  </label>
                  <input
                    type="text"
                    value={term}
                    onChange={(e) => setTerm(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              {/* Photo Upload */}
              <div className="space-y-1 pt-1">
                <label className="block font-bold text-slate-800">
                  फोटो अपलोड करा (Photo Upload - Cloudinary)
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-100 file:text-emerald-900 hover:file:bg-emerald-200 cursor-pointer"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  रद्द करा
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-[#003625] hover:bg-[#00261a] text-white font-bold rounded-xl shadow-xs"
                >
                  {isSubmitting ? "जतन होत आहे..." : "जतन करा"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
