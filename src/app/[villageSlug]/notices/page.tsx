import { getVillageBySlug, getVillageNotices } from "@/lib/data-provider";
import { formatMarathiDate } from "@/lib/date-utils";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Bell, ArrowLeft, Calendar, AlertCircle } from "lucide-react";

interface Props {
  params: Promise<{ villageSlug: string }>;
}

export const dynamic = "force-dynamic";

export default async function NoticesPage({ params }: Props) {
  const { villageSlug } = await params;
  const village = await getVillageBySlug(villageSlug);
  if (!village) notFound();

  const notices = await getVillageNotices(village._id, 30, village.slug);

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
          <Bell className="w-3.5 h-3.5 text-[#9e4300]" />
          <span>अधिकृत सूचना फलक</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#003625]">
          {village.name} ग्रामपंचायत सूचना व घोषणा
        </h2>
        <p className="text-xs sm:text-sm text-[#526056]">
          ग्रामसभा, पाणी पुरवठा, कर भरणा व शासकीय अभियानांविषयी अधिकृत माहिती.
        </p>
      </div>

      <div className="space-y-4">
        {notices.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-[#E5DEC9] text-[#526056] text-sm">
            सध्या कोणतीही नवीन सूचना उपलब्ध नाही.
          </div>
        ) : (
          notices.map((n: any, idx: number) => {
            const dateInfo = formatMarathiDate(n.publishedAt);
            return (
              <div
                key={n._id.toString()}
                className={`p-5 sm:p-6 rounded-3xl border shadow-xs space-y-3 transition ${
                  n.isImportant
                    ? "bg-amber-50/40 border-amber-300 ring-2 ring-amber-400/20"
                    : "bg-white border-[#E5DEC9]"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="flex items-center gap-1.5 text-xs font-mono font-semibold text-[#526056] bg-[#FBF9F5] px-2.5 py-1 rounded-lg border border-[#E5DEC9]">
                      <Calendar className="w-3.5 h-3.5 text-[#003625]" />
                      {dateInfo.formatted}
                    </span>
                    <span className="text-[11px] font-bold text-[#003625] bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      {n.category || "जाहिर सूचना"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {n.isImportant && (
                      <span className="text-xs font-extrabold text-amber-900 bg-amber-100 border border-amber-300 px-2.5 py-0.5 rounded-full">
                        ★ महत्त्वाची सूचना
                      </span>
                    )}
                    {idx === 0 && !n.isImportant && (
                      <span className="text-xs font-bold text-[#1E2621] bg-[#F5D77F] px-2.5 py-0.5 rounded-full">
                        नवीन सूचना
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-[#003625]">
                  {n.title}
                </h3>

                <p className="text-xs sm:text-sm text-[#526056] leading-relaxed whitespace-pre-line">
                  {n.content}
                </p>

                {n.documentUrl && (
                  <div className="pt-2 border-t border-[#E5DEC9] flex items-center justify-between">
                    <span className="text-xs text-[#526056] font-medium truncate">
                      {n.fileName || "अधिकृत परिपत्रक / PDF दस्तऐवज"}
                    </span>
                    <a
                      href={n.documentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-[#003625] hover:bg-[#00261a] text-[#F5D77F] rounded-xl font-bold text-xs inline-flex items-center gap-1.5 transition shrink-0"
                    >
                      <span>डाउनलोड करा</span>
                      <span>⬇</span>
                    </a>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
