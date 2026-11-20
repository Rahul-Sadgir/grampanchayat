import { queryOne } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { updateApplicationStatus } from "@/lib/actions/admin";
import { ApplicationResponseManager } from "@/components/admin/ApplicationResponseManager";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  User,
  Phone,
  MapPin,
  Mail,
  FileText,
  ExternalLink,
  Download,
  AlertCircle,
  ShieldCheck,
  Calendar,
  MessageSquare,
} from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

export default async function ApplicationDetailPage({ params }: Props) {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  const { id } = await params;

  let app: any = null;
  try {
    app = await queryOne(
      `SELECT a.*, v.name as village_name, v.slug as village_slug_resolved, s.name as service_name_resolved
       FROM applications a
       LEFT JOIN villages v ON a.village_id = v.id
       LEFT JOIN services s ON a.service_id = s.id
       WHERE a.id::text = $1 OR a.application_number = $1`,
      [id]
    );
  } catch (e) {
    console.warn("[ApplicationDetailPage] Error finding application from PostgreSQL:", e);
  }

  if (!app) notFound();

  // Enforce single village access: admin can only access applications from their own village
  const appVillageSlug = app.villageSlug || app.villageSlugResolved;
  if (appVillageSlug && session.villageSlug && appVillageSlug.toLowerCase() !== session.villageSlug.toLowerCase()) {
    notFound();
  }

  async function updateStatusAction(formData: FormData) {
    "use server";
    const status = formData.get("status") as string;
    const notes = formData.get("adminNotes") as string;
    await updateApplicationStatus(id, status, notes);
  }

  const rawDocs = app.documents;
  const documents: any[] = Array.isArray(rawDocs)
    ? rawDocs
    : typeof rawDocs === "string"
    ? JSON.parse(rawDocs)
    : [];

  const rawFormData = app.formData;
  const formDataObj: Record<string, any> =
    rawFormData && typeof rawFormData === "object"
      ? rawFormData
      : typeof rawFormData === "string"
      ? JSON.parse(rawFormData)
      : {};

  const villageName = app.villageName || app.villageSlug || "ग्रामपंचायत";
  const serviceName = app.serviceNameResolved || app.serviceName || "दाखला / परवाना अर्ज";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Link
          href="/admin/applications"
          className="inline-flex items-center text-xs font-semibold text-emerald-800 gap-1.5 bg-white px-3.5 py-2 rounded-full border border-slate-200 shadow-xs hover:bg-slate-50 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>सर्व अर्जांकडे परत जा</span>
        </Link>

        <span
          className={`px-3.5 py-1.5 text-xs rounded-full font-bold ${
            app.status === "APPROVED" || app.status === "COMPLETED"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : app.status === "REJECTED"
              ? "bg-red-50 text-red-800 border border-red-200"
              : app.status === "DOCUMENTS_REQUIRED"
              ? "bg-orange-50 text-orange-800 border border-orange-200"
              : "bg-amber-50 text-amber-800 border border-amber-200"
          }`}
        >
          स्थिती: {app.status}
        </span>
      </div>

      {/* Hero WhatsApp Response Workflow Component */}
      <ApplicationResponseManager
        applicationId={(app.id || app._id).toString()}
        applicationNumber={app.applicationNumber}
        applicantName={app.applicantName}
        mobileNumber={app.mobileNumber}
        serviceName={serviceName}
        villageName={villageName}
        currentStatus={app.status}
        existingResponse={{
          responseText: app.responseText,
          responseDocumentUrl: app.responseDocumentUrl,
          responseDocumentName: app.responseDocumentName,
          responseSentAt: app.responseSentAt,
        }}
      />

      <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200 space-y-6">
        {/* Header Badge & Title */}
        <div className="border-b border-slate-100 pb-5 flex flex-wrap justify-between items-start gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono font-bold text-emerald-900 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">
                {app.applicationNumber}
              </span>
              <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                गाव: {villageName}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2">
              {serviceName}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">
              सादर दिनांक: {new Date(app.submittedAt).toLocaleString("mr-IN")}
            </p>
          </div>
        </div>

        {/* Applicant Details */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            १. अर्जदाराचा प्राथमिक तपशील (Applicant Details)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 bg-slate-50 p-4 rounded-2xl border border-slate-200/80 text-xs">
            <div className="flex items-start gap-2.5">
              <User className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <p className="text-slate-400">अर्जदाराचे नाव</p>
                <p className="font-bold text-slate-900 mt-0.5">{app.applicantName}</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Phone className="w-4 h-4 text-[#25D366] shrink-0 mt-0.5" />
              <div>
                <p className="text-slate-400">मोबाईल क्रमांक (WhatsApp)</p>
                <p className="font-bold text-slate-900 font-mono mt-0.5">{app.mobileNumber}</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Mail className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <p className="text-slate-400">ईमेल आयडी</p>
                <p className="font-medium text-slate-900 mt-0.5">{app.email || "—"}</p>
              </div>
            </div>

            <div className="col-span-1 sm:col-span-3 flex items-start gap-2.5 pt-2 border-t border-slate-200/60">
              <MapPin className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <p className="text-slate-400">संपूर्ण पत्ता</p>
                <p className="font-medium text-slate-800 mt-0.5">{app.address}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Form Payload Responses */}
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            २. अर्जात नागरिकाने भरलेली माहिती (Form Responses)
          </h3>
          <div className="bg-slate-50 p-4 rounded-2xl space-y-2.5 text-xs border border-slate-200/80">
            {Object.entries(formDataObj).length === 0 ? (
              <p className="text-slate-400 italic">कोणतीही अतिरिक्त माहिती नाही.</p>
            ) : (
              Object.entries(formDataObj).map(([key, val]) => {
                if (typeof val === "object" && val !== null && "url" in val) {
                  const fileVal = val as { url: string; fileName?: string };
                  return (
                    <div key={key} className="flex justify-between border-b border-slate-200/60 pb-1.5 last:border-b-0">
                      <span className="text-slate-500 font-medium capitalize">{key}:</span>
                      <a
                        href={fileVal.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-bold text-emerald-700 hover:underline inline-flex items-center gap-1"
                      >
                        <span>{fileVal.fileName || "कागदपत्र पहा"}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  );
                }
                return (
                  <div key={key} className="flex justify-between border-b border-slate-200/60 pb-1.5 last:border-b-0">
                    <span className="text-slate-500 font-medium capitalize">{key}:</span>
                    <span className="font-bold text-slate-800 text-right">{String(val || "—")}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Uploaded Documents */}
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            ३. सोबत जोडलेली अधिकृत कागदपत्रे ({documents.length})
          </h3>
          {documents.length === 0 ? (
            <div className="bg-slate-50 p-4 rounded-2xl text-xs text-slate-400 border border-slate-200/80 text-center italic">
              या अर्जासोबत कोणतीही अतिरिक्त कागदपत्रे जोडलेली नाहीत.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {documents.map((doc, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition"
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <FileText className="w-4 h-4 text-emerald-800 shrink-0" />
                    <div className="truncate">
                      <p className="font-bold text-xs text-slate-900 truncate">
                        {doc.documentName || `कागदपत्र ${idx + 1}`}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        {doc.fileSize ? `${Math.round(doc.fileSize / 1024)} KB` : "फाइल"} • {doc.fileType?.split("/")[1]?.toUpperCase() || "PDF"}
                      </p>
                    </div>
                  </div>
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-white border border-slate-200 text-emerald-800 hover:bg-emerald-50 transition shrink-0 shadow-xs"
                    title="कागदपत्र पहा / डाउनलोड करा"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Internal Admin Status Update Form */}
        <div className="pt-4 border-t border-slate-200">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            ४. कार्यालयीन शेरा व स्थिती अद्ययावत करा (Internal Review)
          </h3>
          <form action={updateStatusAction} className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  अर्जाची स्थिती बदला
                </label>
                <select
                  name="status"
                  defaultValue={app.status}
                  className="w-full text-xs font-medium rounded-xl border border-slate-200 p-2.5 bg-white text-slate-900 focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 outline-none"
                >
                  <option value="SUBMITTED">प्राप्त (SUBMITTED)</option>
                  <option value="UNDER_REVIEW">तपासणी सुरू (UNDER_REVIEW)</option>
                  <option value="DOCUMENTS_REQUIRED">कागदपत्रे प्रलंबित (DOCUMENTS_REQUIRED)</option>
                  <option value="APPROVED">मंजूर (APPROVED)</option>
                  <option value="COMPLETED">पूर्ण / दाखला जारी (COMPLETED)</option>
                  <option value="REJECTED">नाकारले (REJECTED)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  कार्यालयीन शेरा / टिप्पणी
                </label>
                <input
                  type="text"
                  name="adminNotes"
                  defaultValue={app.adminNotes || ""}
                  placeholder="उदा. कागदपत्रे अचूक आहेत..."
                  className="w-full text-xs rounded-xl border border-slate-200 p-2.5 bg-white text-slate-900 focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition shadow-xs"
              >
                स्थिती जतन करा
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
