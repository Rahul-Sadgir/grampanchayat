"use client";

import React, { useState, useTransition } from "react";
import {
  Construction,
  Plus,
  Trash2,
  Edit2,
  Image as ImageIcon,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  Building2,
  IndianRupee,
  Calendar,
  AlertCircle,
  Sparkles,
  Layers,
} from "lucide-react";
import {
  saveProject,
  updateProjectStatus,
  deleteProject,
  seedDefaultProjects,
} from "@/lib/actions/projects";

interface VillageItem {
  _id: string;
  name: string;
  slug: string;
}

interface ProjectItem {
  _id: string;
  villageId?: {
    _id: string;
    name: string;
    slug: string;
  };
  villageSlug?: string;
  title: string;
  category: string;
  description: string;
  status: "PLANNED" | "ONGOING" | "COMPLETED";
  budget?: number;
  year?: string;
  agency?: string;
  location?: string;
  images?: string[];
  createdAt?: string;
}

interface Props {
  initialProjects: ProjectItem[];
  villages: VillageItem[];
}

const STATUS_FILTERS = [
  { label: "सर्व कामे (All)", value: "ALL" },
  { label: "प्रगतीपथावर (Ongoing)", value: "ONGOING" },
  { label: "पूर्ण झालेले (Completed)", value: "COMPLETED" },
  { label: "नियोजित (Planned)", value: "PLANNED" },
];

export function ProjectManagerClient({ initialProjects, villages }: Props) {
  const [projects, setProjects] = useState<ProjectItem[]>(initialProjects);
  const [selectedVillage, setSelectedVillage] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectItem | null>(null);
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Filter projects
  const filteredProjects = projects.filter((p) => {
    const matchVillage =
      selectedVillage === "ALL" ||
      p.villageSlug === selectedVillage ||
      p.villageId?.slug === selectedVillage;

    const matchStatus = selectedStatus === "ALL" || p.status === selectedStatus;

    const matchSearch =
      searchQuery === "" ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());

    return matchVillage && matchStatus && matchSearch;
  });

  const handleOpenAddModal = () => {
    setEditingProject(null);
    setErrorMsg("");
    setSuccessMsg("");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (project: ProjectItem) => {
    setEditingProject(project);
    setErrorMsg("");
    setSuccessMsg("");
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    const formData = new FormData(e.currentTarget);
    if (editingProject) {
      formData.set("id", editingProject._id);
      if (editingProject.images && editingProject.images.length > 0) {
        formData.set("existingImageUrl", editingProject.images[0]);
      }
    }

    startTransition(async () => {
      const res = await saveProject(formData);
      if (res.success) {
        setSuccessMsg(
          editingProject ? "विकासकाम यशस्वीरीत्या अद्यतनित झाले!" : "नवीन विकासकाम नोंदवले गेले!"
        );
        setIsModalOpen(false);
        window.location.reload();
      } else {
        setErrorMsg(res.error || "त्रुटी आली.");
      }
    });
  };

  const handleQuickStatusChange = (
    projectId: string,
    currentStatus: "PLANNED" | "ONGOING" | "COMPLETED"
  ) => {
    const nextStatus: "PLANNED" | "ONGOING" | "COMPLETED" =
      currentStatus === "PLANNED"
        ? "ONGOING"
        : currentStatus === "ONGOING"
        ? "COMPLETED"
        : "PLANNED";

    startTransition(async () => {
      const res = await updateProjectStatus(projectId, nextStatus);
      if (res.success) {
        setProjects((prev) =>
          prev.map((p) => (p._id === projectId ? { ...p, status: nextStatus } : p))
        );
      } else {
        alert(res.error || "स्थिती बदलताना त्रुटी आली.");
      }
    });
  };

  const handleDelete = (projectId: string, title: string) => {
    if (!confirm(`तुम्हाला नक्की '${title}' हे विकासकाम हटवायचे आहे का?`)) return;

    startTransition(async () => {
      const res = await deleteProject(projectId);
      if (res.success) {
        setProjects((prev) => prev.filter((p) => p._id !== projectId));
      } else {
        alert(res.error || "हटवताना त्रुटी आली.");
      }
    });
  };

  const handleSeed = (village: VillageItem) => {
    if (!confirm(`'${village.name}' ग्रामपंचायतीसाठी प्राथमिक विकासकामे डेटा लोड करायचा का?`)) return;
    startTransition(async () => {
      const res = await seedDefaultProjects(village._id, village.slug);
      if (res.success) {
        alert(`यशस्वी! ${res.count} विकासकामे जोडली गेली.`);
        window.location.reload();
      } else {
        alert(res.error || "त्रुटी आली.");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-50 text-purple-800">
              <Construction className="w-5 h-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              विकासकामे व प्रकल्प व्यवस्थापन (CMS)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            गावातील रस्ते, पाणीपुरवठा, शाळा, सौर दिवे व इतर सर्व विकासकामांची नोंद व प्रगती स्थिती ठेवा.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-xl transition shadow-xs active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>नवीन विकासकाम जोडा</span>
        </button>
      </div>

      {/* Village & Status Filters */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row gap-3 justify-between items-stretch md:items-center">
          {/* Village Select */}
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
            <div className="flex flex-wrap gap-1.5 text-xs font-bold">
              <button
                onClick={() => setSelectedVillage("ALL")}
                className={`px-3 py-1.5 rounded-xl transition ${
                  selectedVillage === "ALL"
                    ? "bg-emerald-800 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                सर्व गावे
              </button>
              {villages.map((v) => (
                <button
                  key={v.slug}
                  onClick={() => setSelectedVillage(v.slug)}
                  className={`px-3 py-1.5 rounded-xl transition ${
                    selectedVillage === v.slug
                      ? "bg-emerald-800 text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {v.name}
                </button>
              ))}
            </div>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="विकासकाम शोधा..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-semibold">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0 mr-1" />
          {STATUS_FILTERS.map((s) => (
            <button
              key={s.value}
              onClick={() => setSelectedStatus(s.value)}
              className={`px-3 py-1 rounded-full whitespace-nowrap transition text-xs ${
                selectedStatus === s.value
                  ? "bg-purple-100 text-purple-900 font-bold border border-purple-300"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 border border-transparent"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center space-y-4">
          <Construction className="w-12 h-12 text-slate-300 mx-auto" />
          <div>
            <h3 className="text-base font-bold text-slate-800">कोणतेही विकासकाम सापडले नाही</h3>
            <p className="text-xs text-slate-500 mt-1">
              नवीन विकासकाम जोडा किंवा खालील बटणावरून प्राथमिक डेटा लोड करा.
            </p>
          </div>
          {villages.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 pt-2">
              {villages.map((v) => (
                <button
                  key={v._id}
                  onClick={() => handleSeed(v)}
                  disabled={isPending}
                  className="px-3.5 py-2 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{v.name} साठी विकासकामे लोड करा</span>
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredProjects.map((p) => {
            const isCompleted = p.status === "COMPLETED";
            const isOngoing = p.status === "ONGOING";
            const hasImage = p.images && p.images.length > 0 && p.images[0];

            return (
              <div
                key={p._id}
                className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 sm:p-6 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  {/* Header: Village badge, Category & Status */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {p.villageId?.name || (p.villageSlug ? p.villageSlug : "—")}
                      </span>
                      <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                        {p.category}
                      </span>
                    </div>

                    <button
                      onClick={() => handleQuickStatusChange(p._id, p.status)}
                      title="पुढील स्थितीवर जाण्यासाठी क्लिक करा"
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 transition ${
                        isCompleted
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                          : isOngoing
                          ? "bg-amber-100 text-amber-800 border border-amber-300"
                          : "bg-blue-100 text-blue-800 border border-blue-300"
                      }`}
                    >
                      {isCompleted && <CheckCircle2 className="w-3 h-3" />}
                      {isOngoing && <Clock className="w-3 h-3" />}
                      <span>
                        {isCompleted ? "पूर्ण झाले" : isOngoing ? "काम सुरू आहे" : "नियोजित"} ↻
                      </span>
                    </button>
                  </div>

                  {/* Photo if present */}
                  {hasImage && (
                    <div className="relative h-36 w-full rounded-2xl overflow-hidden border border-slate-100 bg-slate-100">
                      <img
                        src={p.images![0]}
                        alt={p.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div>
                    <h3 className="font-extrabold text-sm sm:text-base text-slate-900 leading-snug">
                      {p.title}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                      {p.description}
                    </p>
                  </div>

                  {/* Meta stats: Budget, Year, Agency, Location */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-[11px]">
                    {p.budget && (
                      <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-slate-500 block text-[10px]">मंजूर निधी</span>
                        <strong className="text-emerald-800 font-mono text-xs">
                          ₹{p.budget.toLocaleString("en-IN")}
                        </strong>
                      </div>
                    )}
                    {p.year && (
                      <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-slate-500 block text-[10px]">आर्थिक वर्ष</span>
                        <strong className="text-slate-800 text-xs">{p.year}</strong>
                      </div>
                    )}
                    {p.location && (
                      <div className="p-2 bg-slate-50 rounded-xl border border-slate-100 col-span-2 sm:col-span-1">
                        <span className="text-slate-500 block text-[10px]">स्थान / वॉर्ड</span>
                        <strong className="text-slate-800 text-xs truncate block">
                          {p.location}
                        </strong>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <span className="text-[11px] text-slate-400">
                    {p.agency ? `यंत्रणा: ${p.agency}` : ""}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEditModal(p)}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                      title="संपादित करा"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(p._id, p.title)}
                      className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition"
                      title="हटवा"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl max-w-xl w-full p-6 space-y-4 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <Construction className="w-5 h-5 text-purple-700" />
                <span>{editingProject ? "विकासकाम संपादित करा" : "नवीन विकासकाम जोडा"}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
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

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">कोणत्या गावासाठी? *</label>
                <select
                  name="villageId"
                  required
                  defaultValue={editingProject?.villageId?._id || villages[0]?._id}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-600 focus:outline-none bg-white font-medium"
                >
                  {villages.map((v) => (
                    <option key={v._id} value={v._id}>
                      {v.name} ग्रामपंचायत
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  कामाचे नाव (Project Title) *
                </label>
                <input
                  name="title"
                  required
                  defaultValue={editingProject?.title || ""}
                  placeholder="उदा. गावठाण अंतर्गत काँक्रीट रस्ता बांधकाम"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    कामाचा प्रकार / Category *
                  </label>
                  <input
                    name="category"
                    required
                    defaultValue={editingProject?.category || "रस्ते विकास"}
                    placeholder="उदा. रस्ते विकास / पाणी पुरवठा / शिक्षण"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    सध्याची प्रगती स्थिती (Status) *
                  </label>
                  <select
                    name="status"
                    required
                    defaultValue={editingProject?.status || "PLANNED"}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-600 focus:outline-none bg-white font-medium"
                  >
                    <option value="PLANNED">नियोजित (PLANNED)</option>
                    <option value="ONGOING">काम सुरू आहे (ONGOING)</option>
                    <option value="COMPLETED">पूर्ण झाले (COMPLETED)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    मंजूर निधी रक्कम (₹)
                  </label>
                  <input
                    name="budget"
                    type="number"
                    defaultValue={editingProject?.budget || ""}
                    placeholder="उदा. 850000"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-600 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">आर्थिक वर्ष</label>
                  <input
                    name="year"
                    defaultValue={editingProject?.year || "2025-2026"}
                    placeholder="उदा. 2025-2026"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">स्थान / वॉर्ड</label>
                  <input
                    name="location"
                    defaultValue={editingProject?.location || ""}
                    placeholder="उदा. वॉर्ड क्र. २"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  कार्यकारी यंत्रणा (Agency)
                </label>
                <input
                  name="agency"
                  defaultValue={editingProject?.agency || ""}
                  placeholder="उदा. ग्रामपंचायत स्वनिधी / जि. प. बांधकाम विभाग"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  कामाचा तपशील (Description) *
                </label>
                <textarea
                  name="description"
                  required
                  rows={3}
                  defaultValue={editingProject?.description || ""}
                  placeholder="कामाची सविस्तर माहिती..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  कामाचा फोटो / साइट छायाचित्र (Upload Image)
                </label>
                <input
                  name="image"
                  type="file"
                  accept="image/*"
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                />
                {editingProject?.images && editingProject.images.length > 0 && (
                  <p className="text-[11px] text-emerald-700 mt-1 font-medium">
                    सध्याचा फोटो जोडलेला आहे. नवीन फोटो निवडल्यास तो बदलेल.
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition"
                >
                  रद्द करा
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl transition shadow-xs active:scale-95 disabled:opacity-50"
                >
                  {isPending
                    ? "जतन होत आहे..."
                    : editingProject
                    ? "बदल जतन करा"
                    : "विकासकाम नोंदवा"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
