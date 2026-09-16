import {
  getVillageBySlug,
  getVillageServices,
  getVillageNotices,
  getVillageSchemes,
  getVillageProjects,
  getVillageDetailsData,
  getVillageRepresentatives,
} from "@/lib/data-provider";
import { formatMarathiDate } from "@/lib/date-utils";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Hero } from "@/components/public/Hero";
import { QuickSearchSection } from "@/components/public/QuickSearchSection";
import { CitizenServicesHomeGateway } from "@/components/public/CitizenServicesHomeGateway";
import {
  FileText,
  Bell,
  BookOpen,
  PhoneCall,
  ArrowRight,
  Baby,
  Home,
  Droplets,
  Heart,
  Building,
  UserCheck,
  CheckCircle2,
  Clock,
  ExternalLink,
  Phone,
  Mail,
  MessageCircle,
  Construction,
  ShieldAlert,
  Sparkles,
  MapPin,
  Calendar,
  Landmark,
  School,
  Hospital,
  Store,
  BookMarked,
  Award,
  Check,
  Users,
  Search,
  Shield,
  Ambulance,
  PhoneForwarded,
  HeartCrack,
  BadgeCheck,
  Building2,
  Newspaper,
  Compass,
  Image as ImageIcon,
  CheckCircle,
  ChevronRight,
} from "lucide-react";

interface Props {
  params: Promise<{ villageSlug: string }>;
}

const iconMap: Record<string, any> = {
  Baby,
  FileText,
  Home,
  Droplets,
  Heart,
  Building,
  HeartCrack,
};

export const revalidate = 300;

export async function generateStaticParams() {
  return [
    { villageSlug: "gulwanch" },
    { villageSlug: "mazagaon" },
    { villageSlug: "komalwadi" },
  ];
}

export default async function VillageHomePage({ params }: Props) {
  const { villageSlug } = await params;
  const village = await getVillageBySlug(villageSlug);
  if (!village) notFound();

  const [services, notices, schemes, projects] = await Promise.all([
    getVillageServices(village._id, village.slug),
    getVillageNotices(village._id, 4, village.slug),
    getVillageSchemes(village._id, 4, village.slug),
    getVillageProjects(village._id, 3, village.slug),
  ]);

  const taluka = village.taluka || "सिन्नर";
  const district = village.district || "नाशिक";

  const details = getVillageDetailsData(village.slug);
  const representatives = await getVillageRepresentatives(village.slug);
  const sarpanch = representatives.find((r) => r.isSarpanch) || representatives[0];
  const upasarpanch = representatives.find((r) => r.isUpasarpanch);
  const vdo = representatives.find((r) => r.isOfficer);
  const otherMembers = representatives.filter((r) => !r.isSarpanch);

  return (
    <div className="space-y-12 sm:space-y-16">
      {/* 01 — HERO SECTION (Strict 16:9 Aspect Ratio on both Desktop & Mobile) */}
      <Hero
        villageName={village.name}
        slug={village.slug}
        taluka={taluka}
        district={district}
        coverImage={village.coverImage || "/images/panoramic-landscape.png"}
      />

      {/* 02 — QUICK SEARCH & RECOMMENDATION CHIPS CARD */}
      <QuickSearchSection villageSlug={village.slug} />

      {/* 03 — CITIZEN SERVICES (Modern Gateway to Services Portal) */}
      <CitizenServicesHomeGateway villageSlug={village.slug} />

      {/* 04 — IMPORTANT NOTICES (महत्त्वाच्या सूचना व फलक) */}
      <section id="notices" className="max-w-5xl mx-auto px-4">
        <div className="bg-[#F4EFE6] rounded-3xl p-5 sm:p-8 border border-[#E5DEC9] space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#9e4300] text-white flex items-center justify-center shadow-xs">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg sm:text-2xl font-extrabold text-[#003625]">
                  महत्त्वाच्या सूचना व फलक
                </h2>
              </div>
            </div>
            <Link
              href={`/${village.slug}/notices`}
              className="text-xs font-bold text-[#9e4300] hover:underline flex items-center gap-1"
            >
              <span>सर्व परिपत्रके पहा</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {notices.map((n: any, idx: number) => {
              const dateInfo = formatMarathiDate(n.publishedAt);
              return (
                <div
                  key={n._id.toString()}
                  className={`rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border transition ${
                    n.isImportant
                      ? "bg-amber-50/50 border-amber-300 ring-2 ring-amber-400/20 shadow-xs"
                      : "bg-white border-[#E5DEC9] shadow-xs hover:shadow-sm"
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    {/* Date Badge */}
                    <div
                      className={`shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-xl text-white flex flex-col items-center justify-center text-center shadow-xs ${
                        n.isImportant ? "bg-[#9e4300]" : "bg-[#003625]"
                      }`}
                    >
                      <span className="text-base sm:text-lg font-black leading-none">{dateInfo.day}</span>
                      <span className="text-[9px] sm:text-[10px] uppercase font-bold text-[#F5D77F] mt-0.5">
                        {dateInfo.month}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {n.isImportant && (
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-extrabold flex items-center gap-1">
                            ★ महत्त्वाची सूचना
                          </span>
                        )}
                        {idx === 0 && !n.isImportant && (
                          <span className="px-2 py-0.5 rounded-full bg-[#F5D77F] text-[#1E2621] text-[10px] font-bold">
                            नवीन
                          </span>
                        )}
                        <span className="text-[11px] text-[#526056] font-medium">
                          {n.category || "ग्रामपंचायत सूचना"}
                        </span>
                      </div>
                      <h3 className="text-xs sm:text-sm font-bold text-[#003625] leading-snug">
                        {n.title}
                      </h3>
                      <p className="text-xs text-[#526056] line-clamp-2 leading-relaxed">
                        {n.content}
                      </p>
                    </div>
                  </div>

                  <Link
                    href={`/${village.slug}/notices`}
                    className="inline-flex items-center gap-1 shrink-0 text-xs font-bold text-[#9e4300] hover:text-[#692b00] self-end sm:self-center"
                  >
                    <span>सविस्तर पहा</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 05 — GOVERNMENT SCHEMES & BLOG GUIDES (शासकीय कल्याणकारी योजना) */}
      {schemes && schemes.length > 0 && (
        <section id="schemes" className="max-w-5xl mx-auto px-4">
          <div className="bg-[#F4EFE6] rounded-3xl p-5 sm:p-8 border border-[#E5DEC9] space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#9e4300] uppercase tracking-wider mb-1">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>शासकीय कल्याणकारी योजना व माहिती मार्गदर्शक</span>
                </div>
                <h2 className="text-xl sm:text-3xl font-extrabold text-[#003625]">
                  शासकीय योजना व थेट लाभ (DBT)
                </h2>
              </div>
              <Link
                href={`/${village.slug}/schemes`}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#9e4300] hover:text-[#692b00] bg-white px-4 py-2 rounded-full border border-[#E5DEC9] shadow-2xs hover:bg-[#FBF9F5] transition"
              >
                <span>सर्व १२ योजना पहा</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {schemes.slice(0, 4).map((s: any) => {
                const schemeSlug = s.slug || s._id.toString();
                const detailUrl = `/${village.slug}/schemes/${schemeSlug}`;
                const imageUrl = s.imageUrl || "/images/schemes/pmay-gharkul.jpg";

                return (
                  <Link
                    key={s._id.toString()}
                    href={detailUrl}
                    className="bg-white rounded-3xl border border-[#E5DEC9] shadow-xs hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col justify-between group block"
                  >
                    <div>
                      {/* 16:9 Scheme Featured Image */}
                      <div className="relative w-full aspect-[16/9] bg-slate-100 overflow-hidden">
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

                        {/* Scheme Title on Image */}
                        <div className="absolute bottom-3 left-3 right-3 text-white">
                          <h3 className="font-extrabold text-base sm:text-lg leading-snug drop-shadow-md group-hover:text-amber-300 transition">
                            {s.title}
                          </h3>
                        </div>
                      </div>

                      {/* Card Content Body */}
                      <div className="p-5 space-y-3.5 text-xs">
                        <p className="text-slate-600 line-clamp-2 leading-relaxed">
                          {s.description}
                        </p>

                        {/* Subsidy / Benefit Callout */}
                        {s.subsidyDetails && (
                          <div className="p-3 bg-gradient-to-r from-[#F4EFE6] to-[#FBF9F5] rounded-2xl border border-[#E5DEC9] flex items-center gap-2">
                            <Award className="w-4 h-4 text-[#9e4300]" />
                            <div className="min-w-0">
                              <span className="text-[10px] font-bold text-[#9e4300] block uppercase">अनुदान / लाभ:</span>
                              <strong className="text-xs text-[#003625] font-black truncate block">
                                {s.subsidyDetails}
                              </strong>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Card Footer Actions */}
                    <div className="p-4 bg-slate-50/70 border-t border-[#E5DEC9] flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 text-xs font-black text-[#003625] group-hover:text-[#9e4300] transition">
                        <span>सविस्तर माहिती व अर्ज वाचा</span>
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </span>
                      <span className="text-[11px] font-semibold text-[#9e4300] bg-white px-2.5 py-1 rounded-lg border border-[#E5DEC9]">
                        ब्लॉग वाचा →
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* 06 — ABOUT VILLAGE (आपलं गाव - ऐतिहासिक व भौगोलिक वारसा) */}
      <section id="about" className="max-w-5xl mx-auto px-4">
        <div className="bg-[#F4EFE6] rounded-3xl p-5 sm:p-8 border border-[#E5DEC9] space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
            {/* Left Image */}
            <div className="lg:col-span-5 relative group">
              <div className="overflow-hidden rounded-2xl shadow-sm border border-[#E5DEC9] aspect-4/3 relative bg-white">
                <Image
                  src={village.coverImage || "/images/panoramic-landscape.png"}
                  alt={`${village.name} गाव देखावा`}
                  fill
                  className="object-cover transform group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl text-[#003625] text-xs font-bold shadow-xs border border-[#E5DEC9]">
                सह्याद्रीच्या कुशीतील निसर्गरम्य व समृद्ध {village.name}
              </div>
            </div>

            {/* Right Content */}
            <div className="lg:col-span-7 flex flex-col justify-center space-y-4">
              <div>
                <div className="inline-flex items-center gap-1.5 text-[#9e4300] text-xs font-bold uppercase tracking-wider mb-1">
                  <Landmark className="w-3.5 h-3.5" />
                  <span>गावाचा ऐतिहासिक व भौगोलिक वारसा</span>
                </div>
                <h2 className="text-xl sm:text-3xl font-extrabold text-[#003625]">
                  आपलं {village.name}
                </h2>
              </div>

              <p className="text-xs sm:text-sm text-[#1E2621] leading-relaxed">
                {village.description || `${village.name} हे ${taluka} तालुक्यातील एक निसर्गरम्य, ऐक्यप्रिय व प्रगतिशील गाव असून ग्रामपंचायतीच्या माध्यमातून लोकसहभागातून जलसंधारण, दर्जेदार शिक्षण आणि शाश्वत शेती विकासासाठी विविध आदर्श उपक्रम यशस्वीपणे राबविले जात आहेत.`}
              </p>

              {/* Statistics Grid (2x2 on mobile, 4-col on desktop) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 pt-2">
                <div className="p-3 sm:p-3.5 rounded-2xl bg-white border border-[#E5DEC9] text-center shadow-xs">
                  <span className="text-base sm:text-2xl font-black text-[#003625] block">
                    {details.stats.population}
                  </span>
                  <span className="text-[10px] text-[#526056] font-medium">एकूण लोकसंख्या</span>
                </div>
                <div className="p-3 sm:p-3.5 rounded-2xl bg-white border border-[#E5DEC9] text-center shadow-xs">
                  <span className="text-base sm:text-2xl font-black text-[#9e4300] block">
                    {details.stats.households}
                  </span>
                  <span className="text-[10px] text-[#526056] font-medium">एकूण कुटुंबे</span>
                </div>
                <div className="p-3 sm:p-3.5 rounded-2xl bg-white border border-[#E5DEC9] text-center shadow-xs">
                  <span className="text-base sm:text-2xl font-black text-[#003625] block">
                    {details.stats.literacyRate}
                  </span>
                  <span className="text-[10px] text-[#526056] font-medium">साक्षरता दर</span>
                </div>
                <div className="p-3 sm:p-3.5 rounded-2xl bg-white border border-[#E5DEC9] text-center shadow-xs">
                  <span className="text-base sm:text-2xl font-black text-[#9e4300] block">
                    {details.stats.schools}
                  </span>
                  <span className="text-[10px] text-[#526056] font-medium">शाळा व केंद्रे</span>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href={`/${village.slug}/about`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#003625] bg-white px-4 py-2 rounded-full border border-[#E5DEC9] shadow-2xs hover:text-[#9e4300] hover:bg-[#FBF9F5] transition"
                >
                  <span>{village.name} बद्दल अधिक जाणून घ्या</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 06 — GRAM PANCHAYAT REPRESENTATIVES (आपले ग्रामपंचायत प्रतिनिधी) */}
      <section id="representatives" className="max-w-5xl mx-auto px-4">
        <div className="bg-[#F4EFE6] rounded-3xl p-5 sm:p-8 border border-[#E5DEC9] space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-1">
            <div className="inline-flex items-center gap-1.5 text-[#9e4300] text-xs font-bold uppercase tracking-wider">
              <Users className="w-3.5 h-3.5" />
              <span>लोकप्रतिनिधी व प्रशासन</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-extrabold text-[#003625]">
              आपले ग्रामपंचायत प्रतिनिधी
            </h2>
          </div>

          {/* Featured Sarpanch Card */}
          <div className="bg-white rounded-3xl p-5 sm:p-8 border border-[#E5DEC9] shadow-xs max-w-3xl mx-auto">
            <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-6">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-[#F4EFE6] border-2 border-[#E5DEC9] text-[#003625] font-black flex items-center justify-center text-2xl sm:text-4xl shadow-xs shrink-0 text-center px-2">
                {sarpanch.name.split(" ").slice(0, 2).map((n: string) => n[0]).join("") || "स"}
              </div>
              <div className="flex-1 text-center sm:text-left space-y-2">
                <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#F5D77F]/60 text-[#1E2621] text-xs font-bold">
                  <UserCheck className="w-3.5 h-3.5 text-[#003625]" />
                  <span>लोकनियुक्त प्रथम नागरिक</span>
                </div>
                <h3 className="text-lg sm:text-2xl font-extrabold text-[#003625]">
                  {sarpanch.name}
                </h3>
                <p className="text-xs sm:text-sm text-[#9e4300] font-bold">
                  {sarpanch.role} - {village.name} ग्रामपंचायत
                </p>
                <blockquote className="text-xs sm:text-sm text-[#526056] italic leading-relaxed">
                  “गावातील शेवटच्या घटकापर्यंत शासकीय योजना पोहोचवणे आणि आधुनिक लोकसहभागातून समृद्ध, डिजिटल {village.name} घडवणे हेच आमचे ध्येय आहे.”
                </blockquote>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-2">
                  {sarpanch.phone && (
                    <a
                      href={`tel:${sarpanch.phone}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#003625] text-white font-bold text-xs hover:bg-[#134e39] transition shadow-xs"
                    >
                      <Phone className="w-3.5 h-3.5 text-[#F5D77F]" />
                      <span>संपर्क: {sarpanch.phone}</span>
                    </a>
                  )}
                  {sarpanch.email && (
                    <a
                      href={`mailto:${sarpanch.email}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#F4EFE6] text-[#003625] border border-[#E5DEC9] font-bold text-xs hover:bg-[#E5DEC9] transition shadow-xs"
                    >
                      <Mail className="w-3.5 h-3.5 text-[#9e4300]" />
                      <span>{sarpanch.email}</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Representatives Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {otherMembers.slice(0, 8).map((rep: any, idx: number) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-4 text-center border border-[#E5DEC9] shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto rounded-full bg-[#F4EFE6] border border-[#E5DEC9] text-[#003625] font-bold flex items-center justify-center text-sm sm:text-base mb-2">
                    {rep.name.split(" ").slice(0, 2).map((w: string) => w[0]).join("") || "स"}
                  </div>
                  <h4 className="font-extrabold text-xs sm:text-sm text-[#003625] line-clamp-2">
                    {rep.name}
                  </h4>
                  <p className="text-[10px] sm:text-[11px] text-[#9e4300] font-bold mt-0.5">
                    {rep.role}
                  </p>
                  {rep.ward && (
                    <p className="text-[9px] sm:text-[10px] text-[#526056] mt-0.5">{rep.ward}</p>
                  )}
                </div>
                {rep.phone && (
                  <a
                    href={`tel:${rep.phone}`}
                    className="mt-2 text-[10px] font-bold text-[#003625] bg-[#FBF9F5] py-1 px-2 rounded-lg border border-[#E5DEC9] block hover:bg-[#F4EFE6]"
                  >
                    📞 {rep.phone}
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 07 — VILLAGE INITIATIVES & NEWS (गावातील हालचाली / उपक्रम) */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="bg-[#F4EFE6] rounded-3xl p-5 sm:p-8 border border-[#E5DEC9] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 text-[#9e4300] font-bold text-xs uppercase tracking-wider mb-1">
                <Newspaper className="w-3.5 h-3.5" />
                <span>गावातील हालचाली व उपक्रम</span>
              </div>
              <h2 className="text-xl sm:text-3xl font-extrabold text-[#003625]">
                {village.name} मध्ये काय घडत आहे?
              </h2>
            </div>
            <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-[#E5DEC9] shadow-xs text-xs font-semibold">
              <span className="px-3 py-1 rounded-lg bg-[#003625] text-white">सर्व घडामोडी</span>
              <span className="px-3 py-1 rounded-lg text-[#526056] hover:text-[#003625] cursor-pointer">बातम्या</span>
              <span className="px-3 py-1 rounded-lg text-[#526056] hover:text-[#003625] cursor-pointer">उपक्रम</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {details.initiatives.map((init: any, idx: number) => (
              <article
                key={idx}
                className="bg-white rounded-2xl border border-[#E5DEC9] overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between"
              >
                <div className="h-40 bg-[#F4EFE6] relative flex items-center justify-center text-[#003625]">
                  {idx === 0 ? (
                    <Users className="w-12 h-12 text-[#003625] opacity-40" />
                  ) : idx === 1 ? (
                    <Construction className="w-12 h-12 text-[#9e4300] opacity-40" />
                  ) : (
                    <Droplets className="w-12 h-12 text-[#134e39] opacity-40" />
                  )}
                  <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-[#F5D77F] text-[#1E2621] text-[10px] font-bold">
                    {init.category}
                  </div>
                </div>
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-[10px] text-[#526056] font-medium block mb-1">
                      {init.date} • ग्रामपंचायत {village.name}
                    </span>
                    <h3 className="font-extrabold text-sm text-[#003625] leading-snug">
                      {init.title}
                    </h3>
                    <p className="text-xs text-[#526056] mt-1.5 line-clamp-3 leading-relaxed">
                      {init.description}
                    </p>
                  </div>
                  <Link
                    href={`/${village.slug}/notices`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#9e4300] hover:underline pt-2 border-t border-[#E5DEC9]/40"
                  >
                    <span>सविस्तर वाचा</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 08 — VILLAGE DEVELOPMENT PROGRESS (गावाचा विकास प्रकल्प अहवाल) */}
      <section id="development" className="max-w-5xl mx-auto px-4">
        <div className="bg-[#F4EFE6] rounded-3xl p-5 sm:p-8 border border-[#E5DEC9] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 text-[#9e4300] font-bold text-xs uppercase tracking-wider mb-1">
                <Construction className="w-3.5 h-3.5" />
                <span>पारदर्शक कारभार व सार्वजनिक परीक्षण</span>
              </div>
              <h2 className="text-xl sm:text-3xl font-extrabold text-[#003625]">
                गावाचा विकास प्रकल्प अहवाल
              </h2>
            </div>
            <Link
              href={`/${village.slug}/development`}
              className="text-xs font-bold text-[#9e4300] hover:underline flex items-center gap-1 shrink-0 bg-white px-3.5 py-1.5 rounded-full border border-[#E5DEC9] shadow-2xs hover:bg-[#FBF9F5]"
            >
              <span>सर्व प्रकल्प पहा ({projects.length}+)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Featured Development Work Card */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E5DEC9] shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-[#003625] text-white text-[10px] font-bold">
                  पायाभूत सुविधा
                </span>
                <span className="px-2.5 py-0.5 rounded-md bg-[#F5D77F] text-[#1E2621] text-[10px] font-bold">
                  जल जीवन मिशन
                </span>
              </div>
              <span className="px-3 py-1 rounded-full bg-[#1E7E34]/15 text-[#1E7E34] text-xs font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#1E7E34]" /> प्रगतीपथावर (९५% पूर्ण)
              </span>
            </div>

            <h3 className="text-base sm:text-xl font-extrabold text-[#003625]">
              जलजीवन मिशन अंतर्गत हर घर नल से जल योजना व जलकुंभ विस्तार
            </h3>
            <p className="text-xs sm:text-sm text-[#526056] leading-relaxed">
              गावातील प्रत्येक वस्ती आणि वाडीपर्यंत शुद्ध, फिल्टरयुक्त पिण्याचे पाणी पाईपलाईनद्वारे पोहोचविण्यासाठी जलकुंभ आणि मुख्य वितरण वाहिनीचे काम अंतिम टप्प्यात आहे.
            </p>

            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-[#1E2621]">
                <span>भौतिक काम प्रगती: ९५%</span>
                <span>अपेक्षित पूर्णता: ऑक्टोबर २०२६</span>
              </div>
              <div className="w-full h-3 rounded-full bg-[#E5DEC9] overflow-hidden">
                <div className="h-full bg-[#1E7E34] rounded-full transition-all duration-1000 w-[95%]" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-[#E5DEC9] text-xs">
              <div>
                <span className="text-[#526056] text-[10px] block">मंजूर निधी:</span>
                <strong className="text-[#1E2621] font-mono font-bold">₹ ८४,५०,०००</strong>
              </div>
              <div>
                <span className="text-[#526056] text-[10px] block">निधी स्त्रोत:</span>
                <strong className="text-[#1E2621]">केंद्र व राज्य शासन संयुक्त अनुदान</strong>
              </div>
              <div>
                <span className="text-[#526056] text-[10px] block">पर्यवेक्षण यंत्रणा:</span>
                <strong className="text-[#1E2621]">ग्रामीण पाणीपुरवठा विभाग, जि.प. नाशिक</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 09 — VILLAGE PRIDE (गावाचा अभिमान / गौरव) */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="bg-[#F4EFE6] rounded-3xl p-5 sm:p-8 border border-[#E5DEC9] space-y-6">
          <div className="relative overflow-hidden rounded-2xl bg-[#003625] text-white p-5 sm:p-8 shadow-md border border-[#E5DEC9]">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 sm:gap-6 items-center">
              <div className="sm:col-span-3 flex justify-center">
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-[#F4EFE6] border-4 border-[#F5D77F] text-[#003625] font-black flex items-center justify-center text-3xl sm:text-4xl shadow-xl">
                  <Award className="w-12 h-12 sm:w-16 sm:h-16 text-[#9e4300]" />
                </div>
              </div>
              <div className="sm:col-span-9 space-y-2 text-center sm:text-left">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F5D77F] text-[#1E2621] text-xs font-bold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{village.name} चा अभिमान</span>
                </div>
                <h3 className="text-base sm:text-2xl font-extrabold text-white leading-snug">
                  {village.name} च्या सुकन्या कुमारी अनिता पाटील यांचे MPSC परीक्षेत उत्तुंग यश!
                </h3>
                <p className="text-xs sm:text-sm text-[#FBF9F5]/90 leading-relaxed">
                  प्रतिकूल परिस्थितीवर मात करत महाराष्ट्र लोकसेवा आयोगाच्या (MPSC) राज्यसेवा परीक्षेत उपजिल्हाधिकारी पदी निवड होऊन गावाचे नाव राज्यात उंचावले आहे.
                </p>
                <p className="text-[11px] text-[#F5D77F] font-semibold pt-1">
                  ग्रामपंचायत {village.name} व समस्त ग्रामस्थांतर्फे मनःपूर्वक अभिनंदन!
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 10 — VILLAGE GALLERY PREVIEW (गाव दर्शन) */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="bg-[#F4EFE6] rounded-3xl p-5 sm:p-8 border border-[#E5DEC9] space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 text-[#9e4300] font-bold text-xs uppercase tracking-wider mb-1">
                <ImageIcon className="w-3.5 h-3.5" />
                <span>छायाचित्र दालन</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#003625]">
                {village.name} दर्शन
              </h2>
            </div>
            <Link
              href={`/${village.slug}/about`}
              className="text-xs font-bold text-[#9e4300] hover:underline flex items-center gap-1 bg-white px-3.5 py-1.5 rounded-full border border-[#E5DEC9] shadow-2xs hover:bg-[#FBF9F5]"
            >
              <span>संपूर्ण गॅलरी</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="h-36 sm:h-44 rounded-2xl overflow-hidden shadow-xs relative group bg-white border border-[#E5DEC9]">
              <Image
                src="/images/panoramic-landscape.png"
                alt="ग्रामदैवत उत्सव देखावा"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-xs text-white text-[10px] sm:text-xs font-semibold">
                ग्रामदैवत उत्सव
              </span>
            </div>

            <div className="h-36 sm:h-44 rounded-2xl overflow-hidden shadow-xs relative group bg-white border border-[#E5DEC9]">
              <Image
                src={village.coverImage || "/images/panoramic-landscape.png"}
                alt="ग्रामपंचायत भवन"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-xs text-white text-[10px] sm:text-xs font-semibold">
                ग्रामपंचायत भवन
              </span>
            </div>

            <div className="h-36 sm:h-44 rounded-2xl overflow-hidden shadow-xs relative group bg-white border border-[#E5DEC9]">
              <Image
                src="/images/panoramic-landscape.png"
                alt="सुजलाम सुफलाम शिवार"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-xs text-white text-[10px] sm:text-xs font-semibold">
                सुजलाम सुफलाम शिवार
              </span>
            </div>

            <div className="h-36 sm:h-44 rounded-2xl overflow-hidden shadow-xs relative group bg-white border border-[#E5DEC9]">
              <Image
                src={village.coverImage || "/images/panoramic-landscape.png"}
                alt="जि.प. डिजिटल शाळा"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-xs text-white text-[10px] sm:text-xs font-semibold">
                जि.प. डिजिटल शाळा
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 11 — PUBLIC FACILITIES & MAP (भौगोलिक स्थान व सुविधा) */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="bg-[#F4EFE6] rounded-3xl p-5 sm:p-8 border border-[#E5DEC9] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 text-[#9e4300] font-bold text-xs uppercase tracking-wider mb-1">
                <MapPin className="w-3.5 h-3.5" />
                <span>भौगोलिक स्थान व सुविधा</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#003625]">
                {village.name} मधील प्रमुख शासकीय ठिकाणे
              </h2>
            </div>
            <span className="px-3 py-1 rounded-full bg-white text-[#003625] text-xs font-bold border border-[#E5DEC9] self-start sm:self-auto shadow-2xs">
              तालुका शहरापासून अंतर: {details.stats.distanceFromTaluka || `${taluka} १४ कि.मी.`}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-white border border-[#E5DEC9] shadow-xs flex items-start gap-3">
              <Building2 className="w-5 h-5 text-[#003625] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-[#003625]">ग्रामपंचायत कार्यालय</h4>
                <p className="text-[10px] text-[#526056]">मुख्य चौक, गावठाण परिसर</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-[#E5DEC9] shadow-xs flex items-start gap-3">
              <School className="w-5 h-5 text-[#003625] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-[#003625]">जि. प. प्राथमिक शाळा</h4>
                <p className="text-[10px] text-[#526056]">इयत्ता १ ली ते ७ वी • क्रीडांगण</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-[#E5DEC9] shadow-xs flex items-start gap-3">
              <Hospital className="w-5 h-5 text-[#003625] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-[#003625]">प्राथमिक आरोग्य उपकेंद्र</h4>
                <p className="text-[10px] text-[#526056]">२४/७ प्रसूती व प्राथमिक उपचार</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-[#E5DEC9] shadow-xs flex items-start gap-3">
              <Store className="w-5 h-5 text-[#003625] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-[#003625]">सहकारी विकास सोसायटी</h4>
                <p className="text-[10px] text-[#526056]">खते, बियाणे व किसान पतपुरवठा</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 12 — EMERGENCY CONTACTS (महत्त्वाचे आणीबाणी संपर्क) */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="bg-[#F4EFE6] rounded-3xl p-5 sm:p-8 border border-[#E5DEC9] space-y-6">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[#9e4300] font-bold text-xs uppercase tracking-wider mb-1">
              <PhoneCall className="w-3.5 h-3.5" />
              <span>तातडीची मदत व संपर्क</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#003625]">
              महत्त्वाचे आणीबाणी संपर्क
            </h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {/* GP Office */}
            <a
              href={`tel:${village.phone || "02551245000"}`}
              className="p-3.5 sm:p-4 rounded-2xl bg-white border border-[#E5DEC9] shadow-xs hover:border-[#003625] transition flex flex-col sm:flex-row items-start sm:items-center gap-3 group"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#F4EFE6] text-[#003625] flex items-center justify-center shrink-0 group-hover:bg-[#003625] group-hover:text-white transition-colors">
                <Building className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#003625]">ग्रामपंचायत</h4>
                <p className="text-xs font-black text-[#9e4300] font-mono">{village.phone || "०२५५१-२४५०००"}</p>
                <span className="text-[10px] text-[#526056]">कार्यालयीन वेळ</span>
              </div>
            </a>

            {/* Sarpanch / VDO */}
            <a
              href={`tel:${vdo?.phone || sarpanch?.phone || village.phone || "02551245000"}`}
              className="p-3.5 sm:p-4 rounded-2xl bg-white border border-[#E5DEC9] shadow-xs hover:border-[#003625] transition flex flex-col sm:flex-row items-start sm:items-center gap-3 group"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#F4EFE6] text-[#003625] flex items-center justify-center shrink-0 group-hover:bg-[#003625] group-hover:text-white transition-colors">
                <UserCheck className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#003625]">ग्रामसेवक थेट</h4>
                <p className="text-xs font-black text-[#9e4300] font-mono">{vdo?.phone || sarpanch?.phone || "९९६०३९३९२४"}</p>
                <span className="text-[10px] text-[#526056]">नागरिक मदत कक्ष</span>
              </div>
            </a>

            {/* Ambulance 108 */}
            <a
              href="tel:108"
              className="p-3.5 sm:p-4 rounded-2xl bg-white border border-[#E5DEC9] shadow-xs hover:border-red-600 transition flex flex-col sm:flex-row items-start sm:items-center gap-3 group"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-red-50 text-red-700 flex items-center justify-center shrink-0 group-hover:bg-red-700 group-hover:text-white transition-colors">
                <Ambulance className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#003625]">रुग्णवाहिका</h4>
                <p className="text-xs font-black text-red-700 font-mono">१०८ (आपत्कालीन)</p>
                <span className="text-[10px] text-[#526056]">२४/७ सेवा</span>
              </div>
            </a>

            {/* Police 112 */}
            <a
              href="tel:112"
              className="p-3.5 sm:p-4 rounded-2xl bg-white border border-[#E5DEC9] shadow-xs hover:border-[#003625] transition flex flex-col sm:flex-row items-start sm:items-center gap-3 group"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#F4EFE6] text-[#003625] flex items-center justify-center shrink-0 group-hover:bg-[#003625] group-hover:text-white transition-colors">
                <ShieldAlert className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#003625]">पोलीस ठाणे</h4>
                <p className="text-xs font-black text-[#9e4300] font-mono">११२ (सिन्नर)</p>
                <span className="text-[10px] text-[#526056]">कायदा व सुव्यवस्था</span>
              </div>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}