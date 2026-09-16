import { getVillageBySlug, getVillageProjects } from "@/lib/data-provider";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Construction,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Calendar,
  IndianRupee,
  Layers,
} from "lucide-react";

interface Props {
  params: Promise<{ villageSlug: string }>;
}

export const dynamic = "force-dynamic";

export default async function DevelopmentPage({ params }: Props) {
  const { villageSlug } = await params;
  const village = await getVillageBySlug(villageSlug);
  if (!village) notFound();

  const projects = await getVillageProjects(village._id, 30, village.slug);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      <Link
        href={`/${villageSlug}`}
        className="inline-flex items-center text-xs font-bold text-[#003625] gap-1.5 bg-white px-4 py-2 rounded-full border border-[#E5DEC9] shadow-xs hover:bg-[#F4EFE6] transition"
      >
        <ArrowLeft className="w-3.5 h-3.5 text-[#9e4300]" />
        <span>मुख्यपृष्ठावर परत जा</span>
      </Link>

      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#9e4300] bg-[#F4EFE6] px-2.5 py-0.5 rounded-full border border-[#E5DEC9]">
          <Construction className="w-3.5 h-3.5 text-[#9e4300]" />
          <span>पारदर्शक विकास पोर्टल</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#003625]">
          {village.name} ग्रामपंचायत विकासकामे
        </h2>
        <p className="text-xs sm:text-sm text-[#526056]">
          गावात राबविण्यात आलेली व सध्या प्रगतीपथावर असणारी सर्व सार्वजनिक विकासकामे.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {projects.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-[#E5DEC9] text-[#526056] text-sm">
            सध्या कोणतीही विकासकामे नोंदवलेली नाहीत.
          </div>
        ) : (
          projects.map((p: any) => {
            const isCompleted = p.status === "COMPLETED";
            const isOngoing = p.status === "ONGOING";
            const hasImage = p.images && p.images.length > 0 && p.images[0];

            return (
              <div
                key={p._id.toString()}
                className="p-5 sm:p-6 bg-white rounded-3xl border border-[#E5DEC9] shadow-xs space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#F4EFE6] text-[#003625] border border-[#E5DEC9]">
                    {p.category}
                  </span>
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 ${
                      isCompleted
                        ? "bg-[#E8F5E9] text-[#1E7E34] border border-[#1E7E34]/30"
                        : isOngoing
                        ? "bg-[#FFF3E0] text-[#9e4300] border border-[#9e4300]/30"
                        : "bg-[#FBF9F5] text-[#003625] border border-[#E5DEC9]"
                    }`}
                  >
                    {isCompleted && <CheckCircle2 className="w-3.5 h-3.5" />}
                    {isOngoing && <Clock className="w-3.5 h-3.5" />}
                    {isCompleted ? "काम पूर्ण झाले" : isOngoing ? "काम प्रगतीपथावर आहे" : "नियोजित काम"}
                  </span>
                </div>

                {hasImage && (
                  <div className="relative h-48 w-full rounded-2xl overflow-hidden border border-[#E5DEC9] bg-slate-100">
                    <img
                      src={p.images[0]}
                      alt={p.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div>
                  <h3 className="text-base sm:text-lg font-bold text-[#003625]">
                    {p.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#526056] mt-1 leading-relaxed">
                    {p.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 border-t border-[#E5DEC9] text-xs">
                  {p.budget && (
                    <div className="p-2.5 bg-[#FBF9F5] rounded-xl border border-[#E5DEC9]">
                      <span className="text-[#526056] block text-[10px]">मंजूर निधी</span>
                      <span className="font-black text-[#003625] font-mono text-sm">
                        ₹{p.budget.toLocaleString("en-IN")}
                      </span>
                    </div>
                  )}

                  {p.year && (
                    <div className="p-2.5 bg-[#FBF9F5] rounded-xl border border-[#E5DEC9]">
                      <span className="text-[#526056] block text-[10px]">आर्थिक वर्ष</span>
                      <span className="font-bold text-[#1E2621]">
                        {p.year}
                      </span>
                    </div>
                  )}

                  {p.agency && (
                    <div className="p-2.5 bg-[#FBF9F5] rounded-xl border border-[#E5DEC9] col-span-2 sm:col-span-1">
                      <span className="text-[#526056] block text-[10px]">कार्यकारी यंत्रणा</span>
                      <span className="font-bold text-[#1E2621] truncate block">
                        {p.agency}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
