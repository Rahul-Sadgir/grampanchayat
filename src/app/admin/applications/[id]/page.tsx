import { connectDB } from "@/lib/mongodb";
import { Application } from "@/models/Application";
import "@/models/Village";
import "@/models/Service";
import { notFound } from "next/navigation";
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
  const { id } = await params;
  await connectDB();

  const app = await Application.findById(id)
    .populate("villageId", "name slug")
    .populate("serviceId", "name slug")
    .lean();

  if (!app) notFound();

  async function updateStatusAction(formData: FormData) {
    "use server";
    const status = formData.get("status") as string;
    const notes = formData.get("adminNotes") as string;
    await updateApplicationStatus(id, status, notes);
  }

  const documents = (app.documents || []) as any[];
  const villageName = (app.villageId as any)?.name || (app as any).villageSlug || "ग्रामपंचायत";
  const serviceName = (app.serviceId as any)?.name || (app as any).serviceName || "दाखला / परवाना अर्ज";

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
        applicationId={id}
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
            {Object.entries(app.formData || {}).length === 0 ? (
              <p className="text-slate-400 italic">कोणतीही अतिरिक्त माहिती नाही.</p>
            ) : (
              Object.entries(app.formData || {}).map(([key, val]) => {
                if (typeof val === "object" && val !== null && "url" in val) {
                  return (
                    <div key={key} className="flex justify-between border-b border-slate-200/60 pb-1.5 last:border-b-0">
                      <span className="text-slate-500 font-medium capitalize">{key}:</span>
                      <a
                        href={val.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-bold text-emerald-700 hover:underline inline-flex items-center gap-1"
                      >
                        <span>{val.fileName || "कागदपत्र पहा"}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  );
                }

                return (
                  <div key={key} className="flex justify-between border-b border-slate-200/60 pb-1.5 last:border-b-0">
                    <span className="text-slate-500 font-medium capitalize">{key}:</span>
                    <span className="font-bold text-slate-900 text-right">{String(val || "—")}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Uploaded Documents Attachments */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              ३. नागरिकाने जोडलेली अधिकृत कागदपत्रे (Attached Documents - {documents.length})
            </h3>
          </div>

          {documents.length === 0 ? (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
              या अर्जासोबत कोणतीही फाईल जोडलेली नाही.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {documents.map((doc, idx) => (
                <div
                  key={idx}
                  className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between gap-3 hover:bg-slate-100/80 transition"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {doc.documentName}
                      </p>
                      <p className="text-[10px] text-slate-500 font-mono">
                        {doc.fileSize ? `${Math.round(doc.fileSize / 1024)} KB` : "कागदपत्र"}
                      </p>
                    </div>
                  </div>

                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-white border border-slate-200 hover:bg-emerald-800 hover:text-white text-emerald-800 transition shrink-0"
                    title="कागदपत्र उघडा / डाऊनलोड करा"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Admin Review Action & Status Workflow */}
        <form action={updateStatusAction} className="pt-4 border-t border-slate-100 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            ४. अंतर्गत स्थिती अद्यतन व शेरा (Internal Review)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                नवीन स्थिती निवडा *
              </label>
              <select
                name="status"
                defaultValue={app.status}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-emerald-600 focus:outline-none bg-white"
              >
                <option value="SUBMITTED">SUBMITTED (सादर)</option>
                <option value="UNDER_REVIEW">UNDER_REVIEW (कागदपत्रे तपासणी सुरू)</option>
                <option value="DOCUMENTS_REQUIRED">DOCUMENTS_REQUIRED (अपूर्ण कागदपत्रे / फेरजोडणी)</option>
                <option value="DOCUMENTS_SUBMITTED">DOCUMENTS_SUBMITTED (कागदपत्रे सादर केली)</option>
                <option value="APPROVED">APPROVED (मंजूर केला)</option>
                <option value="COMPLETED">COMPLETED (दाखला / परवाना तयार)</option>
                <option value="REJECTED">REJECTED (नाकारला)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                ग्रामपंचायत अंतर्गत शेरा
              </label>
              <input
                name="adminNotes"
                defaultValue={app.adminNotes || ""}
                placeholder="उदा. कागदपत्रे पडताळणी झाली आहे, दाखला तयार आहे."
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition shadow-xs active:scale-95 flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>स्थिती अद्यतन करा</span>
          </button>
        </form>
      </div>
    </div>
  );
}