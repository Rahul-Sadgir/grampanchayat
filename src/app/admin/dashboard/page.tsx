import { connectDB } from "@/lib/mongodb";
import { Village } from "@/models/Village";
import { Application } from "@/models/Application";
import { Notice } from "@/models/Notice";
import { Scheme } from "@/models/Scheme";
import { Project } from "@/models/Project";
import { Service } from "@/models/Service";
import { Representative } from "@/models/Representative";
import Link from "next/link";
import { redirect } from "next/navigation";
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
  ShieldCheck,
  Send,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";
import { getAdminSession } from "@/lib/auth";
import { getAllVillages, FALLBACK_SERVICES, FALLBACK_SCHEMES, FALLBACK_NOTICES } from "@/lib/data-provider";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  const conn = await connectDB();
  const villages = await getAllVillages();

  const villageSlug = session.villageSlug || "komalwadi";
  const village = villages.find((v: any) => v.slug === villageSlug) || villages[0];
  const targetVillageId = village?._id;
  const activeVillageName = `${village?.name || "कोमलवाडी"} ग्रामपंचायत`;

  let totalApps = 0;
  let pendingApps = 0;
  let approvedApps = 0;
  let totalReps = 0;
  let totalServices = 0;
  let totalNotices = 0;
  let totalSchemes = 0;
  let totalProjects = 0;
  let recentApplications: any[] = [];

  if (conn && targetVillageId) {
    try {
      const appFilter = { villageId: targetVillageId };
      const noticeFilter = { $or: [{ villageId: targetVillageId }, { villageSlug }] };
      const schemeFilter = {}; // State and central schemes applicable
      const projectFilter = { $or: [{ villageId: targetVillageId }, { villageSlug }] };
      const repFilter = { $or: [{ villageId: targetVillageId }, { villageSlug }] };
      const serviceFilter = { $or: [{ villageId: targetVillageId }, { villageSlug }] };

      [
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
          .populate("serviceId", "name")
          .sort({ submittedAt: -1 })
          .limit(8)
          .lean(),
      ]);
    } catch (err) {
      console.warn("[Dashboard] Database queries failed (using fallbacks):", err);
      totalServices = FALLBACK_SERVICES?.length || 10;
      totalSchemes = FALLBACK_SCHEMES?.length || 12;
      totalNotices = FALLBACK_NOTICES?.length || 4;
    }
  } else {
    // Sensible fallback metrics when MongoDB Atlas is connecting or offline
    totalServices = FALLBACK_SERVICES?.length || 10;
    totalSchemes = FALLBACK_SCHEMES?.length || 12;
    totalNotices = FALLBACK_NOTICES?.length || 4;
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header with Single Village Enforcement Badge */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-900 text-[11px] font-bold border border-emerald-200 mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
            <span>एकल गाव अधिकृत लॉगिन (Single Village Admin Login)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            {activeVillageName} प्रशासन नियंत्रण कक्ष
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            आपण <strong className="text-emerald-900 font-bold">{activeVillageName}</strong> चे अधिकृत प्रशासक ({session.name}) म्हणून लॉगिन आहात.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/${villageSlug}`}
            target="_blank"
            className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl border border-emerald-200 text-xs font-bold transition flex items-center gap-1.5"
          >
            <span>अधिकृत पोर्टल पाहा</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Quick Action Shortcuts Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
        <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
          जलद कृती (Quick Actions)
        </h3>
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/admin/applications"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold transition shadow-xs"
          >
            <FileCheck2 className="w-4 h-4" />
            <span>नागरिक अर्ज तपासा ({pendingApps} प्रलंबित)</span>
          </Link>

          <Link
            href="/admin/notices"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition"
          >
            <Plus className="w-4 h-4 text-emerald-800" />
            <span>नवीन सूचना प्रकाशित करा</span>
          </Link>

          <Link
            href="/admin/representatives"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition"
          >
            <Users className="w-4 h-4 text-amber-700" />
            <span>पदाधिकारी व्यवस्थापन</span>
          </Link>

          <Link
            href="/admin/villages"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition"
          >
            <Building2 className="w-4 h-4 text-blue-700" />
            <span>बॅनर व प्रोफाइल संपादित करा</span>
          </Link>
        </div>
      </div>

      {/* Primary KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Applications */}
        <Link
          href="/admin/applications"
          className="p-5 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-3 hover:border-emerald-600 transition group"
        >
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              एकूण नागरिक अर्ज
            </span>
            <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileCheck2 className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <p className="text-3xl font-black text-slate-900 font-mono tracking-tight">
              {totalApps}
            </p>
            <span className="text-[11px] font-bold text-emerald-800 flex items-center gap-0.5">
              <span>सर्व पाहा</span>
              <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </Link>

        {/* Pending Applications */}
        <Link
          href="/admin/applications?status=SUBMITTED"
          className="p-5 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-3 hover:border-amber-500 transition group"
        >
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              प्रलंबित अर्ज
            </span>
            <div className="w-9 h-9 rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <p className="text-3xl font-black text-amber-600 font-mono tracking-tight">
              {pendingApps}
            </p>
            <span className="text-[11px] font-bold text-amber-700 flex items-center gap-0.5">
              <span>पडताळणी करा</span>
              <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </Link>

        {/* Approved Applications */}
        <Link
          href="/admin/applications?status=APPROVED"
          className="p-5 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-3 hover:border-emerald-500 transition group"
        >
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              मंजूर व पूर्ण दाखले
            </span>
            <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <p className="text-3xl font-black text-emerald-700 font-mono tracking-tight">
              {approvedApps}
            </p>
            <span className="text-[11px] font-bold text-emerald-700">पूर्ण झालेले</span>
          </div>
        </Link>

        {/* Total Village Representatives */}
        <Link
          href="/admin/representatives"
          className="p-5 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-3 hover:border-blue-500 transition group"
        >
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              पदाधिकारी व सदस्य
            </span>
            <div className="w-9 h-9 rounded-2xl bg-blue-50 text-blue-800 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <p className="text-3xl font-black text-slate-900 font-mono tracking-tight">
              {totalReps || 12}
            </p>
            <span className="text-[11px] font-bold text-blue-700 flex items-center gap-0.5">
              <span>यादी पाहा</span>
              <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </Link>
      </div>

      {/* Secondary Resource Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Link
          href="/admin/services"
          className="p-4 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-1 hover:border-emerald-500 transition"
        >
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center mb-1">
            <Layers className="w-4 h-4" />
          </div>
          <p className="text-[10px] text-slate-500 font-medium">सक्रिय डिजिटल सेवा</p>
          <p className="text-xl font-black text-slate-900 font-mono">{totalServices}</p>
        </Link>

        <Link
          href="/admin/notices"
          className="p-4 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-1 hover:border-amber-500 transition"
        >
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center mb-1">
            <Bell className="w-4 h-4" />
          </div>
          <p className="text-[10px] text-slate-500 font-medium">सूचना व निविदा</p>
          <p className="text-xl font-black text-slate-900 font-mono">{totalNotices}</p>
        </Link>

        <Link
          href="/admin/schemes"
          className="p-4 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-1 hover:border-blue-500 transition"
        >
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-800 flex items-center justify-center mb-1">
            <BookOpen className="w-4 h-4" />
          </div>
          <p className="text-[10px] text-slate-500 font-medium">शासकीय योजना</p>
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

      {/* Village Jurisdiction Profile Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-800 to-emerald-950 text-white font-bold flex items-center justify-center text-xl shadow-xs">
              {village?.name?.charAt(0) || "क"}
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">
                {activeVillageName} अधिकार क्षेत्र व माहिती
              </h3>
              <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                <span>ता. {village?.taluka || "सिन्नर"}, जि. {village?.district || "नाशिक"} • महाराष्ट्र शासन</span>
              </p>
            </div>
          </div>

          <Link
            href="/admin/villages"
            className="text-xs font-bold text-emerald-800 hover:text-emerald-900 bg-emerald-50 px-3.5 py-2 rounded-xl border border-emerald-200 self-start sm:self-auto flex items-center gap-1.5 transition"
          >
            <span>बॅनर व तपशील संपादित करा</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-1">
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/60">
            <span className="text-slate-400 font-semibold block text-[11px]">अधिकृत संपर्क</span>
            <span className="font-bold text-slate-800 mt-1 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-emerald-700" />
              <span>{village?.phone || "९८२३९७८४९२"}</span>
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/60">
            <span className="text-slate-400 font-semibold block text-[11px]">अधिकृत ईमेल</span>
            <span className="font-bold text-slate-800 mt-1 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-emerald-700" />
              <span>{village?.email || "gpkomalwadi@gmail.com"}</span>
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/60">
            <span className="text-slate-400 font-semibold block text-[11px]">लॉगिन स्थिती</span>
            <span className="font-bold text-emerald-800 mt-1 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              <span>सक्रिय एकल गाव प्रशासक</span>
            </span>
          </div>
        </div>
      </div>

      {/* Recent Applications Feed */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              अलिकडील नागरी अर्ज ({village?.name} ग्रामपंचायत)
            </h3>
            <p className="text-xs text-slate-500">
              नागरिकांनी सादर केलेले नवीन अर्ज व त्यांची सद्यस्थिती
            </p>
          </div>
          <Link
            href="/admin/applications"
            className="text-xs font-bold text-emerald-800 hover:text-emerald-900 flex items-center gap-1"
          >
            <span>सर्व अर्ज पाहा</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-3 px-3">अर्ज क्र.</th>
                <th className="py-3 px-3">दाखला / सेवा</th>
                <th className="py-3 px-3">अर्जदार</th>
                <th className="py-3 px-3">मोबाईल</th>
                <th className="py-3 px-3">स्थिती</th>
                <th className="py-3 px-3 text-right">कृती</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentApplications.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                    सध्या कोणतेही नवीन अर्ज उपलब्ध नाहीत.
                  </td>
                </tr>
              ) : (
                recentApplications.map((app: any) => (
                  <tr key={app._id.toString()} className="hover:bg-slate-50/80">
                    <td className="py-3 px-3 font-mono font-bold text-emerald-900">
                      {app.applicationNumber}
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-800">
                      {app.serviceId?.name || app.serviceName || "—"}
                    </td>
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
