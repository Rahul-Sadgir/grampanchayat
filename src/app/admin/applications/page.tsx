import { connectDB } from "@/lib/mongodb";
import { Application } from "@/models/Application";
import { Village } from "@/models/Village";
import "@/models/Service";
import Link from "next/link";
import {
  FileCheck2,
  Building2,
  Clock,
  Search,
  CheckCircle2,
  Filter,
  Send,
  MessageSquare,
} from "lucide-react";

interface Props {
  searchParams: Promise<{ village?: string; status?: string; q?: string }>;
}

export const dynamic = "force-dynamic";

export default async function AdminApplicationsPage({ searchParams }: Props) {
  const { village: villageSlug, status, q } = await searchParams;
  await connectDB();

  const villages = await Village.find().sort({ name: 1 }).lean();

  let query: any = {};

  if (villageSlug && villageSlug !== "ALL") {
    const selectedVillage = villages.find((v: any) => v.slug === villageSlug);
    if (selectedVillage) {
      query.villageId = selectedVillage._id;
    }
  }

  if (status && status !== "ALL") {
    query.status = status;
  }

  if (q) {
    query.$or = [
      { applicationNumber: { $regex: q, $options: "i" } },
      { applicantName: { $regex: q, $options: "i" } },
      { mobileNumber: { $regex: q, $options: "i" } },
    ];
  }

  const applications = await Application.find(query)
    .populate("villageId", "name slug")
    .populate("serviceId", "name")
    .sort({ submittedAt: -1 })
    .lean();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            नागरिक अर्ज व्यवस्थापन
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            नागरिकांनी सादर केलेले दाखल्यांचे अर्ज तपासा आणि थेट व्हॉट्सॲपवर अधिकृत दाखला (PDF) किंवा प्रतिसाद पाठवा.
          </p>
        </div>
      </div>

      {/* Filters: Village Selector & Status */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        {/* Village Selection Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
            गाव:
          </span>
          <Link
            href={`/admin/applications${status ? `?status=${status}` : ""}`}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
              !villageSlug || villageSlug === "ALL"
                ? "bg-emerald-800 text-white shadow-xs"
                : "bg-slate-100 hover:bg-slate-200 text-slate-700"
            }`}
          >
            सर्व गावे ({villages.length})
          </Link>
          {villages.map((v: any) => (
            <Link
              key={v.slug}
              href={`/admin/applications?village=${v.slug}${status ? `&status=${status}` : ""}`}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                villageSlug === v.slug
                  ? "bg-emerald-800 text-white shadow-xs"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              {v.name}
            </Link>
          ))}
        </div>

        {/* Status Filters */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs font-semibold">
          <span className="text-slate-400 uppercase tracking-wider text-[11px] mr-1">
            स्थिती:
          </span>
          {[
            { key: "ALL", label: "सर्व स्थिती" },
            { key: "SUBMITTED", label: "सादर (SUBMITTED)" },
            { key: "UNDER_REVIEW", label: "तपासणी सुरू (UNDER_REVIEW)" },
            { key: "DOCUMENTS_REQUIRED", label: "कागदपत्रे प्रलंबित (DOCUMENTS_REQUIRED)" },
            { key: "DOCUMENTS_SUBMITTED", label: "कागदपत्रे सादर (DOCUMENTS_SUBMITTED)" },
            { key: "APPROVED", label: "मंजूर (APPROVED)" },
            { key: "COMPLETED", label: "दाखला तयार (COMPLETED)" },
            { key: "REJECTED", label: "नाकारला (REJECTED)" },
          ].map((st) => {
            const isSelected = (!status && st.key === "ALL") || status === st.key;
            return (
              <Link
                key={st.key}
                href={`/admin/applications?${villageSlug ? `village=${villageSlug}&` : ""}status=${st.key}`}
                className={`px-3 py-1 rounded-lg transition ${
                  isSelected
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                }`}
              >
                {st.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4">अर्ज क्र.</th>
                <th className="py-3.5 px-4">गाव</th>
                <th className="py-3.5 px-4">सेवा / दाखला</th>
                <th className="py-3.5 px-4">अर्जदाराचे नाव</th>
                <th className="py-3.5 px-4">मोबाईल (WhatsApp)</th>
                <th className="py-3.5 px-4">सादर दिनांक</th>
                <th className="py-3.5 px-4">सद्यस्थिती</th>
                <th className="py-3.5 px-4">व्हॉट्सॲप प्रतिसाद</th>
                <th className="py-3.5 px-4 text-right">कृती</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {applications.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400 text-xs">
                    निवडलेल्या निकषांनुसार कोणतेही अर्ज आढळले नाहीत.
                  </td>
                </tr>
              ) : (
                applications.map((app: any) => (
                  <tr key={app._id.toString()} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-900">
                      {app.applicationNumber}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">
                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px]">
                        {app.villageId?.name || app.villageSlug || "—"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-800">
                      {app.serviceId?.name || app.serviceName || "—"}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {app.applicantName}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      {app.mobileNumber}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                      {new Date(app.submittedAt).toLocaleDateString("mr-IN")}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-1 text-[10px] rounded-full font-bold ${
                          app.status === "APPROVED" || app.status === "COMPLETED"
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            : app.status === "REJECTED"
                            ? "bg-red-50 text-red-800 border border-red-200"
                            : "bg-amber-50 text-amber-800 border border-amber-200"
                        }`}
                      >
                        {app.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {app.responseSentAt ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#1E7E34] bg-[#E8F5E9] px-2 py-0.5 rounded-full border border-[#1E7E34]/30">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>प्रतिसाद पाठवला</span>
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-medium">
                          प्रलंबित
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/admin/applications/${app._id.toString()}`}
                        className="inline-flex items-center gap-1.5 text-xs bg-[#25D366] hover:bg-[#1EBE5D] text-slate-950 px-3 py-1.5 rounded-xl font-bold transition shadow-xs active:scale-95"
                      >
                        <Send className="w-3 h-3 text-slate-950" />
                        <span>तपासा व प्रतिसाद द्या</span>
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