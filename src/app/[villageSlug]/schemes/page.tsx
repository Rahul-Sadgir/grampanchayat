import { getVillageBySlug, getVillageSchemes } from "@/lib/data-provider";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  BookOpen,
  ArrowLeft,
  CheckCircle2,
  FileCheck,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  Download,
  Sparkles,
  Award,
} from "lucide-react";

interface Props {
  params: Promise<{ villageSlug: string }>;
}

export const dynamic = "force-dynamic";

export default async function SchemesPage({ params }: Props) {
  const { villageSlug } = await params;
  const village = await getVillageBySlug(villageSlug);
  if (!village) notFound();

  const schemes = await getVillageSchemes(village._id, 30, village.slug);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 sm:py-10 space-y-8">
      {/* Back Button */}
      <Link
        href={`/${villageSlug}`}
        className="inline-flex items-center text-xs font-bold text-[#003625] gap-1.5 bg-white px-4 py-2 rounded-full border border-[#E5DEC9] shadow-xs hover:bg-[#F4EFE6] transition"
      >
        <ArrowLeft className="w-3.5 h-3.5 text-[#9e4300]" />
        <span>मुख्यपृष्ठावर परत जा</span>
      </Link>

      {/* Header Banner */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#9e4300] bg-[#F4EFE6] px-3 py-1 rounded-full border border-[#E5DEC9]">
          <BookOpen className="w-3.5 h-3.5 text-[#9e4300]" />
          <span>शासकीय कल्याणकारी योजना केंद्र</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-[#003625]">
          {village.name} ग्रामपंचायत शासकीय योजना
        </h2>
        <p className="text-xs sm:text-sm text-[#526056] max-w-2xl leading-relaxed">
          शेतकरी, महिला, बेघर व गरजू नागरिकांसाठी केंद्र व राज्य शासनाच्या सर्व कल्याणकारी योजनांची सविस्तर माहिती, पात्रता, कागदपत्रे व अर्ज प्रक्रिया.
        </p>
      </div>

      {/* Scheme Cards Grid (Blog-Style Showcase) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {schemes.map((s: any) => {
          const schemeSlug = s.slug || s._id.toString();
          const detailUrl = `/${villageSlug}/schemes/${schemeSlug}`;
          const imageUrl = s.imageUrl || "/images/schemes/pmay-gharkul.jpg";

          return (
            <div
              key={s._id.toString()}
              className="bg-white rounded-3xl border border-[#E5DEC9] shadow-xs hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col justify-between group"
            >
              <div>
                {/* 16:9 Scheme Featured Image */}
                <Link href={detailUrl} className="block relative w-full aspect-[16/9] bg-slate-100 overflow-hidden">
                  <Image
                    src={imageUrl}
                    alt={s.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
                  
                  {/* Category & Status badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-white/95 text-[#003625] shadow-xs backdrop-blur-md">
                      {s.category}
                    </span>
                    <span className="text-[10px] font-bold text-white bg-emerald-700/90 px-2.5 py-0.5 rounded-full border border-emerald-400/40 backdrop-blur-md">
                      सक्रिय योजना
                    </span>
                  </div>

                  {/* Scheme Title Overlay on Image for strong visual identity */}
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <h3 className="font-extrabold text-base sm:text-lg leading-snug drop-shadow-md group-hover:text-amber-300 transition">
                      {s.title}
                    </h3>
                  </div>
                </Link>

                {/* Card Content Body */}
                <div className="p-5 space-y-3.5 text-xs">
                  <p className="text-slate-600 line-clamp-2 leading-relaxed">
                    {s.description}
                  </p>

                  {/* Subsidy / Benefit Callout */}
                  {s.subsidyDetails && (
                    <div className="p-3 bg-gradient-to-r from-[#F4EFE6] to-[#FBF9F5] rounded-2xl border border-[#E5DEC9] flex items-center gap-2">
                      <Award className="w-4 h-4 text-[#9e4300] shrink-0" />
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold text-[#9e4300] block uppercase">अनुदान / लाभ:</span>
                        <strong className="text-xs text-[#003625] font-black truncate block">
                          {s.subsidyDetails}
                        </strong>
                      </div>
                    </div>
                  )}

                  {/* Snippets: Eligibility & Documents */}
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2.5 bg-[#FBF9F5] rounded-xl border border-[#E5DEC9]">
                      <span className="text-slate-500 block text-[10px] font-bold">पात्रता:</span>
                      <span className="text-slate-700 line-clamp-1 font-medium">{s.eligibility}</span>
                    </div>
                    <div className="p-2.5 bg-[#FBF9F5] rounded-xl border border-[#E5DEC9]">
                      <span className="text-slate-500 block text-[10px] font-bold">कागदपत्रे:</span>
                      <span className="text-slate-700 line-clamp-1 font-medium">{s.documentsRequired}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-4 bg-slate-50/70 border-t border-[#E5DEC9] flex items-center justify-between gap-2">
                <Link
                  href={detailUrl}
                  className="inline-flex items-center gap-1.5 text-xs font-black text-[#003625] group-hover:text-[#9e4300] transition"
                >
                  <span>सविस्तर माहिती व अर्ज वाचा</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                <div className="flex items-center gap-2">
                  {s.attachmentUrl && (
                    <a
                      href={s.attachmentUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-xl bg-white hover:bg-[#F4EFE6] border border-[#E5DEC9] text-[#003625] transition"
                      title="शासन निर्णय GR (PDF)"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>
                  )}
                  {s.externalLink && (
                    <a
                      href={s.externalLink}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-xl bg-white hover:bg-[#F4EFE6] border border-[#E5DEC9] text-[#9e4300] transition"
                      title="अधिकृत शासकीय पोर्टल"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}