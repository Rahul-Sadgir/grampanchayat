import { queryMany } from "@/lib/db";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import {
  FileCheck2,
  Building2,
  Clock,
  Search,
  CheckCircle2,
  Filter,
  Send,
  MessageSquare,
  ShieldCheck,
} from "lucide-react";
import { getAdminSession } from "@/lib/auth";
import { getAllVillages } from "@/lib/data-provider";

interface Props {
  searchParams: Promise<{ status?: string; q?: string }>;
}

export const dynamic = "force-dynamic";

export default async function AdminApplicationsPage({ searchParams }: Props) {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  const { status, q } = await searchParams;

  const villages = await getAllVillages();
  const villageSlug = session.villageSlug || "komalwadi";
  const selectedVillage = villages.find((v: any) => v.slug === villageSlug) || villages[0];

  const values: any[] = [];
  const whereClauses: string[] = [];

  // Enforce single village
  values.push(villageSlug);
  whereClauses.push(`LOWER(a.village_slug) = LOWER($${values.length})`);

  if (status && status !== "ALL") {
    values.push(status);
    whereClauses.push(`a.status = $${values.length}`);
  }

  if (q) {
    const sanitizedQ = q.slice(0, 100).replace(/[%_\\]/g, "\\$&");
    values.push(`%${sanitizedQ}%`);
    const qIndex = values.length;
    whereClauses.push(
      `(a.application_number ILIKE $${qIndex} OR a.applicant_name ILIKE $${qIndex} OR a.mobile_number ILIKE $${qIndex})`
    );
  }

  const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";
  const sql = `
    SELECT a.*, s.name as service_name_from_db
    FROM applications a
    LEFT JOIN services s ON a.service_id = s.id
    ${whereSql}
    ORDER BY a.submitted_at DESC
  `;

  let applications: any[] = [];
  try {
    applications = await queryMany(sql, values);
  } catch (e) {
    console.warn("[AdminApplications] Failed to query applications from PostgreSQL:", e);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-900 text-[11px] font-bold border border-emerald-200 mb-2">
            <Image
              src="/images/grampanchayat-emblem.webp"
              alt="महाराष्ट्र शासन बोधचिन्ह"
              width={18}
              height={18}
              unoptimized
              className="rounded-full shrink-0"
            />
            <span>{selectedVillage?.name || "कोमलवाडी"} ग्रामपंचायत</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            नागरिक अर्ज व्यवस्थापन
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {selectedVillage?.name || "कोमलवाडी"} ग्रामपंचायतीसाठी नागरिकांनी सादर केलेले अर्ज तपासा आणि थेट व्हॉट्सॲपवर अधिकृत दाखला (PDF) किंवा प्रतिसाद पाठवा.
          </p>
        </div>
      </div>

      {/* Filters: Search & Status (No multi-village switching) */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        {/* Village Identification Badge */}
        <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              ग्रामपंचायत:
            </span>
            <span className="text-xs font-bold text-emerald-900 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-emerald-700" />
              {selectedVillage?.name || "कोमलवाडी"} (ता. {selectedVillage?.taluka || "सिन्नर"}, जि. {selectedVillage?.district || "नाशिक"})
            </span>
          </div>

          <span className="text-xs text-slate-500 font-medium">
            एकूण प्राप्त अर्ज: <strong className="text-slate-800">{applications.length}</strong>
          </span>
        </div>

        {/* Search Input */}
        <form className="flex gap-2">
          {status && <input type="hidden" name="status" value={status} />}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              name="q"
              defaultValue={q || ""}
              placeholder="अर्ज क्रमांक, नाव किंवा मोबाईल क्रमांकाने शोधा..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 outline-none transition"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition"
          >
            शोधा
          </button>
        </form>

        {/* Status Pills */}
        <div className="flex gap-1.5 flex-wrap pt-1">
          {[
            { label: "सर्व अर्ज", val: "ALL" },
            { label: "नवीन प्राप्त (Submitted)", val: "SUBMITTED" },
            { label: "प्रक्रिया सुरू (Under Review)", val: "UNDER_REVIEW" },
            { label: "कागदपत्रे प्रलंबित", val: "DOCUMENTS_REQUIRED" },
            { label: "मंजूर (Approved)", val: "APPROVED" },
            { label: "पूर्ण झाले (Completed)", val: "COMPLETED" },
            { label: "नाकारलेले (Rejected)", val: "REJECTED" },
          ].map((st) => {
            const isActive = (!status && st.val === "ALL") || status === st.val;
            return (
              <Link
                key={st.val}
                href={`/admin/applications?status=${st.val}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
                className={`text-xs px-3.5 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
                  isActive
                    ? "bg-emerald-900 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
                }`}
              >
                {isActive && <Filter className="w-3 h-3" />}
                <span>{st.label}</span>
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
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4">अर्ज क्रमांक</th>
                <th className="py-3.5 px-4">सेवा / दाखला</th>
                <th className="py-3.5 px-4">अर्जदाराचे नाव</th>
                <th className="py-3.5 px-4">मोबाईल</th>
                <th className="py-3.5 px-4">सादर तारीख</th>
                <th className="py-3.5 px-4">स्थिती</th>
                <th className="py-3.5 px-4 text-right">कृती</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {applications.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                    कोणतेही अर्ज सापडले नाहीत.
                  </td>
                </tr>
              ) : (
                applications.map((app: any) => (
                  <tr key={(app.id || app._id).toString()} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-900">
                      {app.applicationNumber}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-800">
                      {app.serviceNameFromDb || app.serviceName || "—"}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-900">
                      {app.applicantName}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      {app.mobileNumber}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {app.submittedAt
                        ? new Date(app.submittedAt).toLocaleDateString("mr-IN")
                        : "—"}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-1 text-[10px] rounded-full font-bold ${
                          app.status === "COMPLETED" || app.status === "APPROVED"
                            ? "bg-emerald-100 text-emerald-800"
                            : app.status === "SUBMITTED"
                            ? "bg-amber-100 text-amber-800"
                            : app.status === "REJECTED"
                            ? "bg-red-100 text-red-800"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {app.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/admin/applications/${(app.id || app._id).toString()}`}
                        className="inline-flex items-center gap-1.5 text-xs bg-emerald-800 hover:bg-emerald-900 text-white px-3.5 py-1.5 rounded-xl font-bold transition shadow-xs active:scale-95"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>तपासा / उत्तर द्या</span>
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
