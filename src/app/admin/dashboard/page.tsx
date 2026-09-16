import { connectDB } from "@/lib/mongodb";
import { Village } from "@/models/Village";
import { Application } from "@/models/Application";
import { Notice } from "@/models/Notice";
import { Scheme } from "@/models/Scheme";
import { Project } from "@/models/Project";
import { Service } from "@/models/Service";
import { Representative } from "@/models/Representative";
import Link from "next/link";
import {
  FileCheck2,
  Clock,
  CheckCircle2,
  Building2,
  Bell,
  BookOpen,
  Construction,
  Users,
  Layers,
  ArrowRight,
  Plus,
  ExternalLink,
  FileSpreadsheet,
  Send,
} from "lucide-react";

interface Props {
  searchParams: Promise<{ village?: string }>;
}

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage({ searchParams }: Props) {
  const { village: selectedVillageSlug } = await searchParams;
  await connectDB();

  const villages = await Village.find().sort({ name: 1 }).lean();

  let targetVillageId: any = null;
  let activeVillageName = "सर्व गावे (All Villages)";

  if (selectedVillageSlug && selectedVillageSlug !== "ALL") {
    const selectedVillage = villages.find((v: any) => v.slug === selectedVillageSlug);
    if (selectedVillage) {
      targetVillageId = selectedVillage._id;
      activeVillageName = `${selectedVillage.name} ग्रामपंचायत`;
    }
  }

  const appFilter = targetVillageId ? { villageId: targetVillageId } : {};
  const noticeFilter = targetVillageId ? { villageId: targetVillageId } : {};
  const schemeFilter = {}; // Schemes are common across all villages
  const projectFilter = targetVillageId ? { villageId: targetVillageId } : {};
  const repFilter = targetVillageId
    ? { $or: [{ villageId: targetVillageId }, { villageSlug: selectedVillageSlug }] }
    : {};
  const serviceFilter = targetVillageId
    ? { $or: [{ villageId: targetVillageId }, { villageSlug: selectedVillageSlug }] }
    : {};

  const [
    totalApps,
    pendingApps,
    approvedApps,
    totalReps,
    totalServices,
    totalNotices,
    totalSchemes,
    totalProjects,
    recentApplications,
  ] = await Promise.all([
    Application.countDocuments(appFilter),
    Application.countDocuments({
      ...appFilter,
      status: { $in: ["SUBMITTED", "UNDER_REVIEW"] },
    }),
    Application.countDocuments({
      ...appFilter,
      status: { $in: ["APPROVED", "COMPLETED"] },
    }),
    Representative.countDocuments(repFilter),
    Service.countDocuments(serviceFilter),
    Notice.countDocuments(noticeFilter),
    Scheme.countDocuments(schemeFilter),
    Project.countDocuments(projectFilter),
    Application.find(appFilter)
      .populate("villageId", "name slug")
      .populate("serviceId", "name")
      .sort({ submittedAt: -1 })
      .limit(6)
      .lean(),
  ]);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header & Village Filter Selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            केंद्रीय प्रशासन नियंत्रण कक्ष
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            सध्याची निवड: <span className="font-bold text-emerald-800">{activeVillageName}</span>
          </p>
        </div>

        {/* Village Switcher Pills for Admin */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200 text-xs font-bold w-full sm:w-auto overflow-x-auto">
          <Link
            href="/admin/dashboard"
            className={`px-3 py-1.5 rounded-xl transition ${
              !selectedVillageSlug || selectedVillageSlug === "ALL"
                ? "bg-emerald-800 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            सर्व गावे
          </Link>
          {villages.map((v: any) => (
            <Link
              key={v.slug}
              href={`/admin/dashboard?village=${v.slug}`}
              className={`px-3 py-1.5 rounded-xl transition ${
                selectedVillageSlug === v.slug
                  ? "bg-emerald-800 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {v.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Quick Action Shortcuts Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
        <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
          जलद कृती (Quick CMS Actions)
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          <Link
            href="/admin/services"
            className="p-3 bg-emerald-50/80 hover:bg-emerald-100/80 border border-emerald-200 rounded-2xl transition flex items-center gap-2.5 group"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-800 text-white flex items-center justify-center shrink-0">
              <Plus className="w-4 h-4" />
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-emerald-950">सेवा / PDF फॉर्म</p>
              <p className="text-[10px] text-emerald-700">जोडा / व्यवस्थापित</p>
            </div>
          </Link>

          <Link
            href="/admin/notices"
            className="p-3 bg-amber-50/80 hover:bg-amber-100/80 border border-amber-200 rounded-2xl transition flex items-center gap-2.5 group"
          >
            <div className="w-8 h-8 rounded-xl bg-amber-800 text-white flex items-center justify-center shrink-0">
              <Bell className="w-4 h-4" />
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-amber-950">सूचना व बातम्या</p>
              <p className="text-[10px] text-amber-700">नवीन नोटीस काढा</p>
            </div>
          </Link>

          <Link
            href="/admin/representatives"
            className="p-3 bg-blue-50/80 hover:bg-blue-100/80 border border-blue-200 rounded-2xl transition flex items-center gap-2.5 group"
          >
            <div className="w-8 h-8 rounded-xl bg-blue-800 text-white flex items-center justify-center shrink-0">
              <Users className="w-4 h-4" />
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-blue-950">ग्रामपंचायत मंडळ</p>
              <p className="text-[10px] text-blue-700">सरपंच / सदस्य</p>
            </div>
          </Link>

          <Link
            href="/admin/schemes"
            className="p-3 bg-indigo-50/80 hover:bg-indigo-100/80 border border-indigo-200 rounded-2xl transition flex items-center gap-2.5 group"
          >
            <div className="w-8 h-8 rounded-xl bg-indigo-800 text-white flex items-center justify-center shrink-0">
              <BookOpen className="w-4 h-4" />
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-indigo-950">शासकीय योजना</p>
              <p className="text-[10px] text-indigo-700">योजना प्रकाशित करा</p>
            </div>
          </Link>

          <Link
            href="/admin/projects"
            className="p-3 bg-purple-50/80 hover:bg-purple-100/80 border border-purple-200 rounded-2xl transition flex items-center gap-2.5 group col-span-2 sm:col-span-1"
          >
            <div className="w-8 h-8 rounded-xl bg-purple-800 text-white flex items-center justify-center shrink-0">
              <Construction className="w-4 h-4" />
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-purple-950">विकासकामे</p>
              <p className="text-[10px] text-purple-700">प्रकल्प नोंदणी</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <Link
          href="/admin/applications"
          className="p-4 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-1 hover:border-emerald-500 transition"
        >
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center mb-1">
            <FileCheck2 className="w-4 h-4" />
          </div>
          <p className="text-[10px] text-slate-500 font-medium">एकूण अर्ज</p>
          <p className="text-xl font-black text-slate-900 font-mono">{totalApps}</p>
        </Link>

        <Link
          href="/admin/applications"
          className="p-4 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-1 hover:border-amber-500 transition"
        >
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center mb-1">
            <Clock className="w-4 h-4" />
          </div>
          <p className="text-[10px] text-slate-500 font-medium">तपासणी बाकी</p>
          <p className="text-xl font-black text-amber-700 font-mono">{pendingApps}</p>
        </Link>

        <Link
          href="/admin/applications"
          className="p-4 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-1 hover:border-blue-500 transition"
        >
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-800 flex items-center justify-center mb-1">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <p className="text-[10px] text-slate-500 font-medium">मंजूर दाखले</p>
          <p className="text-xl font-black text-blue-700 font-mono">{approvedApps}</p>
        </Link>

        <Link
          href="/admin/representatives"
          className="p-4 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-1 hover:border-teal-500 transition"
        >
          <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center mb-1">
            <Users className="w-4 h-4" />
          </div>
          <p className="text-[10px] text-slate-500 font-medium">पदाधिकारी</p>
          <p className="text-xl font-black text-slate-900 font-mono">{totalReps}</p>
        </Link>

        <Link
          href="/admin/services"
          className="p-4 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-1 hover:border-emerald-500 transition"
        >
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center mb-1">
            <Layers className="w-4 h-4" />
          </div>
          <p className="text-[10px] text-slate-500 font-medium">सेवा / फॉर्म्स</p>
          <p className="text-xl font-black text-slate-900 font-mono">{totalServices}</p>
        </Link>

        <Link
          href="/admin/notices"
          className="p-4 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-1 hover:border-amber-500 transition"
        >
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center mb-1">
            <Bell className="w-4 h-4" />
          </div>
          <p className="text-[10px] text-slate-500 font-medium">सूचना व GR</p>
          <p className="text-xl font-black text-slate-900 font-mono">{totalNotices}</p>
        </Link>

        <Link
          href="/admin/schemes"
          className="p-4 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-1 hover:border-indigo-500 transition"
        >
          <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-800 flex items-center justify-center mb-1">
            <BookOpen className="w-4 h-4" />
          </div>
          <p className="text-[10px] text-slate-500 font-medium">योजना</p>
          <p className="text-xl font-black text-slate-900 font-mono">{totalSchemes}</p>
        </Link>

        <Link
          href="/admin/projects"
          className="p-4 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-1 hover:border-purple-500 transition"
        >
          <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-800 flex items-center justify-center mb-1">
            <Construction className="w-4 h-4" />
          </div>
          <p className="text-[10px] text-slate-500 font-medium">विकासकामे</p>
          <p className="text-xl font-black text-slate-900 font-mono">{totalProjects}</p>
        </Link>
      </div>

      {/* Villages Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {villages.map((v: any) => (
          <div
            key={v._id.toString()}
            className="p-5 bg-white rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-800 text-white font-bold flex items-center justify-center text-xl">
                  {v.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">
                    {v.name} ग्रामपंचायत
                  </h3>
                  <p className="text-xs text-slate-500">
                    ता. {v.taluka}, जि. {v.district}
                  </p>
                </div>
              </div>

              <Link
                href={`/${v.slug}`}
                target="_blank"
                className="text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-xl transition flex items-center gap-1"
              >
                पोर्टल पाहा <ExternalLink className="w-3 h-3" />
              </Link>
            </div>

            <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
              {v.description}
            </p>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400">संपर्क: {v.phone || "उपलब्ध नाही"}</span>
              <Link
                href={`/admin/dashboard?village=${v.slug}`}
                className="font-bold text-emerald-800 hover:text-emerald-900 flex items-center gap-1"
              >
                <span>फक्त {v.name} चे तपशील पाहा</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Applications Feed */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              अलिकडील नागरी अर्ज
            </h3>
            <p className="text-xs text-slate-500">
              नागरिकांनी सादर केलेले नवीन अर्ज व त्यांची सद्यस्थिती
            </p>
          </div>
          <Link
            href="/admin/applications"
            className="text-xs font-bold text-emerald-800 hover:text-emerald-900 flex items-center gap-1"
          >
            <span>सर्व अर्ज</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-3 px-3">अर्ज क्र.</th>
                <th className="py-3 px-3">गाव</th>
                <th className="py-3 px-3">सेवा</th>
                <th className="py-3 px-3">अर्जदार</th>
                <th className="py-3 px-3">मोबाईल</th>
                <th className="py-3 px-3">स्थिती</th>
                <th className="py-3 px-3 text-right">कृती</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentApplications.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                    सध्या कोणतेही नवीन अर्ज उपलब्ध नाहीत.
                  </td>
                </tr>
              ) : (
                recentApplications.map((app: any) => (
                  <tr key={app._id.toString()} className="hover:bg-slate-50/80">
                    <td className="py-3 px-3 font-mono font-bold text-emerald-900">
                      {app.applicationNumber}
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-800">
                      {app.villageId?.name || "—"}
                    </td>
                    <td className="py-3 px-3">{app.serviceId?.name || "—"}</td>
                    <td className="py-3 px-3 font-medium">{app.applicantName}</td>
                    <td className="py-3 px-3 font-mono text-slate-600">
                      {app.mobileNumber}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2.5 py-1 text-[10px] rounded-full font-bold bg-slate-100 text-slate-700">
                        {app.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <Link
                        href={`/admin/applications/${app._id.toString()}`}
                        className="inline-flex items-center gap-1 text-[11px] bg-emerald-800 hover:bg-emerald-900 text-white px-3 py-1 rounded-lg font-bold transition"
                      >
                        <Send className="w-3 h-3" />
                        <span>तपासा / उत्तर पाठवा</span>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
