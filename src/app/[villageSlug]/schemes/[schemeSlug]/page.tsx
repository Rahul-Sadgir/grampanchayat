import { getVillageBySlug, getSchemeBySlug, getVillageSchemes } from "@/lib/data-provider";
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
  Download,
  IndianRupee,
  Users,
  Calendar,
  Building2,
  Sparkles,
  Share2,
  ChevronRight,
  ShieldCheck,
  Award,
} from "lucide-react";

interface Props {
  params: Promise<{ villageSlug: string; schemeSlug: string }>;
}

export const dynamic = "force-dynamic";

export default async function SchemeDetailPage({ params }: Props) {
  const { villageSlug, schemeSlug } = await params;
  const village = await getVillageBySlug(villageSlug);
  if (!village) notFound();

  const scheme = await getSchemeBySlug(schemeSlug);
  if (!scheme) notFound();

  const allSchemes = await getVillageSchemes(village._id, 6, village.slug);
  const relatedSchemes = allSchemes.filter(
    (s: any) => s.slug !== scheme.slug && s._id.toString() !== scheme._id.toString()
  ).slice(0, 3);

  const heroImage = scheme.imageUrl || "/images/schemes/pmay-gharkul.jpg";

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-10 space-y-8">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 overflow-x-auto pb-1">
        <Link href={`/${villageSlug}`} className="hover:text-emerald-800 transition">
          {village.name} ग्रामपंचायत
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <Link href={`/${villageSlug}/schemes`} className="hover:text-emerald-800 transition">
          शासकीय योजना
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span className="text-slate-900 font-bold truncate">{scheme.title}</span>
      </div>

      <Link
        href={`/${villageSlug}/schemes`}
        className="inline-flex items-center text-xs font-bold text-[#003625] gap-1.5 bg-white px-4 py-2 rounded-full border border-[#E5DEC9] shadow-xs hover:bg-[#F4EFE6] transition"
      >
        <ArrowLeft className="w-3.5 h-3.5 text-[#9e4300]" />
        <span>सर्व शासकीय योजनांकडे परत जा</span>
      </Link>

      {/* Blog Article Header */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#F4EFE6] text-[#003625] border border-[#E5DEC9]">
            {scheme.category}
          </span>
          <span className="text-[11px] font-bold text-[#1E7E34] bg-[#E8F5E9] px-3 py-1 rounded-full border border-[#1E7E34]/30 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>सक्रिय शासकीय योजना</span>
          </span>
          {scheme.targetAudience && (
            <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
              👥 {scheme.targetAudience}
            </span>
          )}
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold text-[#003625] leading-tight">
          {scheme.title}
        </h1>

        <p className="text-sm sm:text-base text-[#526056] leading-relaxed">
          {scheme.description}
        </p>
      </div>

      {/* Featured 16:9 Image */}
      <div className="relative w-full aspect-[16/9] rounded-3xl overflow-hidden border border-[#E5DEC9] shadow-md bg-slate-100">
        <Image
          src={heroImage}
          alt={scheme.title}
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
        <div className="absolute bottom-4 left-4 right-4 text-white flex justify-between items-end">
          <div>
            <span className="text-xs font-bold bg-emerald-900/90 text-emerald-200 px-3 py-1 rounded-full border border-emerald-400/40 backdrop-blur-md">
              महाराष्ट्र व केंद्र शासन पुरस्कृत
            </span>
          </div>
        </div>
      </div>

      {/* Quick Key Highlights Card */}
      {scheme.subsidyDetails && (
        <div className="p-5 sm:p-6 bg-gradient-to-r from-[#F4EFE6] to-[#FBF9F5] rounded-3xl border border-[#E5DEC9] shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-xs font-extrabold text-[#9e4300] uppercase tracking-wider">
            <Award className="w-4 h-4 text-[#9e4300]" />
            <span>योजनेचे मुख्य अनुदान व आर्थिक सहाय्य</span>
          </div>
          <p className="text-base sm:text-xl font-black text-[#003625] leading-snug">
            {scheme.subsidyDetails}
          </p>
        </div>
      )}

      {/* Main Blog Article Content */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E5DEC9] shadow-xs space-y-8 text-slate-800">
        {/* 1. Overview */}
        {scheme.content && (
          <div className="space-y-3">
            <h2 className="text-lg sm:text-xl font-extrabold text-[#003625] flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#9e4300]" />
              <span>योजनेची पार्श्वभूमी व स्वरूप</span>
            </h2>
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed whitespace-pre-line">
              {scheme.content}
            </p>
          </div>
        )}

        {/* 2. Key Benefits (प्रमुख फायदे) */}
        {scheme.benefits && scheme.benefits.length > 0 && (
          <div className="space-y-3 pt-2 border-t border-[#E5DEC9]">
            <h2 className="text-lg sm:text-xl font-extrabold text-[#003625] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-600" />
              <span>योजनेचे प्रमुख फायदे व लाभ</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {scheme.benefits.map((benefit: string, idx: number) => (
                <div
                  key={idx}
                  className="p-4 bg-[#FBF9F5] rounded-2xl border border-[#E5DEC9] flex items-start gap-3"
                >
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-slate-800 leading-relaxed">
                    {benefit}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. Eligibility Criteria (पात्रता व अटी) */}
        <div className="space-y-3 pt-2 border-t border-[#E5DEC9]">
          <h2 className="text-lg sm:text-xl font-extrabold text-[#003625] flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-700" />
            <span>पात्रता निकष व अटी</span>
          </h2>
          <div className="p-4 sm:p-5 bg-[#FBF9F5] rounded-2xl border border-[#E5DEC9] text-sm text-slate-700 leading-relaxed">
            {scheme.eligibility}
          </div>
        </div>

        {/* 4. Required Documents (आवश्यक कागदपत्रे) */}
        <div className="space-y-3 pt-2 border-t border-[#E5DEC9]">
          <h2 className="text-lg sm:text-xl font-extrabold text-[#003625] flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-[#003625]" />
            <span>आवश्यक कागदपत्रांची यादी</span>
          </h2>
          <div className="p-4 sm:p-5 bg-[#FBF9F5] rounded-2xl border border-[#E5DEC9] text-sm text-slate-700 leading-relaxed">
            {scheme.documentsRequired}
          </div>
        </div>

        {/* 5. How to Apply (अर्ज कसा करावा?) */}
        <div className="space-y-3 pt-2 border-t border-[#E5DEC9]">
          <h2 className="text-lg sm:text-xl font-extrabold text-[#003625] flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-[#9e4300]" />
            <span>अर्ज कसा करावा? (Application Process)</span>
          </h2>
          <div className="p-4 sm:p-5 bg-[#F4EFE6] rounded-2xl border border-[#E5DEC9] text-sm text-[#526056] leading-relaxed space-y-2">
            <p className="font-medium text-slate-800">
              {scheme.applicationProcess}
            </p>
            <p className="text-xs text-slate-600">
              अधिक मार्गदर्शनासाठी {village.name} ग्रामपंचायत कार्यालयामध्ये ग्रामसेवक अथवा आपले सरकार सेवा केंद्र चालकांशी संपर्क साधावा.
            </p>
          </div>
        </div>

        {/* 6. FAQ (वारंवार विचारले जाणारे प्रश्न) */}
        {scheme.faq && scheme.faq.length > 0 && (
          <div className="space-y-4 pt-2 border-t border-[#E5DEC9]">
            <h2 className="text-lg sm:text-xl font-extrabold text-[#003625] flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-blue-700" />
              <span>वारंवार विचारले जाणारे प्रश्न (FAQ)</span>
            </h2>
            <div className="space-y-3">
              {scheme.faq.map((item: any, idx: number) => (
                <div
                  key={idx}
                  className="p-4 bg-white rounded-2xl border border-[#E5DEC9] space-y-1.5 shadow-2xs"
                >
                  <h4 className="font-bold text-sm text-[#003625] flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-black">
                      ?
                    </span>
                    <span>{item.question}</span>
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 pl-7 leading-relaxed">
                    {item.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 7. Action Bar: Downloads & External Portal Link */}
        <div className="pt-4 border-t border-[#E5DEC9] flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            {scheme.attachmentUrl && (
              <a
                href={scheme.attachmentUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#003625] text-white text-xs font-bold hover:bg-[#00261a] transition shadow-xs active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>शासन निर्णय / GR (PDF) डाऊनलोड करा</span>
              </a>
            )}

            {scheme.externalLink && (
              <a
                href={scheme.externalLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white border border-[#E5DEC9] text-[#003625] text-xs font-bold hover:bg-[#F4EFE6] transition shadow-xs"
              >
                <span>अधिकृत पोर्टलवर ऑनलाइन अर्ज</span>
                <ExternalLink className="w-4 h-4 text-[#9e4300]" />
              </a>
            )}
          </div>

          <div className="text-xs text-slate-500">
            माहिती स्रोत: <strong>ग्रामपंचायत {village.name} व महाराष्ट्र शासन</strong>
          </div>
        </div>
      </div>

      {/* Related Schemes Section */}
      {relatedSchemes.length > 0 && (
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-extrabold text-[#003625]">
              इतर महत्त्वाच्या शासकीय योजना
            </h3>
            <Link
              href={`/${villageSlug}/schemes`}
              className="text-xs font-bold text-[#9e4300] hover:underline"
            >
              सर्व योजना पहा →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {relatedSchemes.map((rel: any) => (
              <Link
                key={rel.slug || rel._id}
                href={`/${villageSlug}/schemes/${rel.slug || rel._id}`}
                className="bg-white rounded-3xl border border-[#E5DEC9] overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between group"
              >
                <div>
                  <div className="relative w-full aspect-video bg-slate-100 overflow-hidden">
                    <Image
                      src={rel.imageUrl || "/images/schemes/pmay-gharkul.jpg"}
                      alt={rel.title}
                      fill
                      className="object-cover group-hover:scale-105 transition duration-300"
                    />
                    <div className="absolute top-2 left-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/95 text-[#003625] shadow-xs">
                        {rel.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-4 space-y-1">
                    <h4 className="font-bold text-xs sm:text-sm text-[#003625] line-clamp-2 leading-snug group-hover:text-[#9e4300] transition">
                      {rel.title}
                    </h4>
                    <p className="text-[11px] text-[#526056] line-clamp-2">
                      {rel.description}
                    </p>
                  </div>
                </div>

                <div className="px-4 pb-4 pt-1 flex items-center gap-1 text-[11px] font-bold text-[#9e4300]">
                  <span>सविस्तर माहिती वाचा</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
