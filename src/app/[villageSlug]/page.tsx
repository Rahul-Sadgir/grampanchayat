import {
  getVillageBySlug,
  getVillageServices,
  getVillageNotices,
  getVillageSchemes,
  getVillageProjects,
  getVillageDetailsData,
  getVillageRepresentatives,
  getVillageHappenings,
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
  ShieldCheck,
  Ambulance,
  PhoneForwarded,
  HeartCrack,
  BadgeCheck,
  Building2,
  Newspaper,
  Compass,
  CheckCircle,
  ChevronRight,
  Megaphone,
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

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function VillageHomePage({ params }: Props) {
  const { villageSlug } = await params;
  const village = await getVillageBySlug(villageSlug);
  if (!village) notFound();

  const [services, notices, schemes, projects, happenings, representatives] = await Promise.all([
    getVillageServices(village._id, village.slug),
    getVillageNotices(village._id, 4, village.slug),
    getVillageSchemes(village._id, 4, village.slug),
    getVillageProjects(village._id, 4, village.slug),
    getVillageHappenings(village._id, 3, village.slug),
    getVillageRepresentatives(village.slug),
  ]);

  const taluka = village.taluka || "सिन्नर";
  const district = village.district || "नाशिक";

  const details = getVillageDetailsData(village.slug, village);
  const sarpanch = representatives.find((r: any) => r.isSarpanch) || representatives[0];
  const upasarpanch = representatives.find((r: any) => r.isUpasarpanch);
  const vdo = representatives.find((r: any) => r.isOfficer);
  const otherMembers = representatives.filter((r: any) => !r.isSarpanch);
  const isUnderAdminRule = Boolean(village.isUnderAdministrativeRule || village.is_under_administrative_rule);

  return (
    <div className="space-y-12 sm:space-y-16">
      {/* 00 — SCROLLING URGENT NOTICE (प्रशासकीय ठळक धावती सूचना) */}
      {village.highlightNotice && village.highlightNotice.trim().length > 0 && (
        <section className="max-w-5xl mx-auto px-4">
          <div className="bg-[#9e4300] text-white rounded-2xl p-2.5 sm:p-3 shadow-sm border border-[#E5DEC9] flex items-center gap-3 overflow-hidden">
            <div className="flex items-center gap-1.5 shrink-0 bg-white/20 px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider text-[#F5D77F]">
              <Megaphone className="w-3.5 h-3.5 animate-pulse" />
              <span>महत्त्वाची सूचना:</span>
            </div>
            <div className="overflow-hidden whitespace-nowrap flex-1 text-xs sm:text-sm font-bold">
              <div className="animate-marquee">{village.highlightNotice}</div>
            </div>
          </div>
        </section>
      )}

      {/* 01 — HERO SECTION (Strict 16:9 Aspect Ratio on both Desktop & Mobile) */}
      <Hero
        villageName={village.name}
        slug={village.slug}
        taluka={taluka}
        district={district}
        coverImage={village.coverImage || "/images/panoramic-landscape.webp"}
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
                <span>सर्व योजना पहा</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {schemes.slice(0, 4).map((s: any) => {
                const schemeSlug = s.slug || s._id.toString();
                const detailUrl = `/${village.slug}/schemes/${schemeSlug}`;
                const imageUrl = s.imageUrl || "/images/schemes/pmay-gharkul.webp";

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
                            <div className="min-w-0 flex-1 py-0.5">
                              <span className="text-[10px] font-bold text-[#9e4300] block uppercase">अनुदान / लाभ:</span>
                              <strong className="text-xs text-[#003625] font-black break-words leading-[1.4] block py-0.5">
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
                  src={village.coverImage || "/images/panoramic-landscape.webp"}
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
          {isUnderAdminRule ? (
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#9e4300] text-white text-xs font-black uppercase tracking-wider shadow-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-[#F5D77F]" />
                <span>प्रशासकीय राजवटीखालील ग्रामपंचायत</span>
              </div>
              <h2 className="text-xl sm:text-3xl font-extrabold text-[#003625] leading-snug">
                ग्रामपंचायतीचा कारभार शासन नियुक्त प्रशासकामार्फत चालविण्यात येत आहे.
              </h2>
              <p className="text-xs sm:text-sm text-[#526056] leading-relaxed">
                स्थानिक स्वराज्य संस्था अधिनियम व शासकीय आदेशानुसार ग्रामपंचायतीचा दैनंदिन कारभार व नागरी सेवा प्रशासकीय अधिकाऱ्यांमार्फत सुरळीतपणे सुरू आहेत.
              </p>
            </div>
          ) : (
            <div className="text-center max-w-2xl mx-auto space-y-1">
              <div className="inline-flex items-center gap-1.5 text-[#9e4300] text-xs font-bold uppercase tracking-wider">
                <Users className="w-3.5 h-3.5" />
                <span>लोकप्रतिनिधी व प्रशासन</span>
              </div>
              <h2 className="text-xl sm:text-3xl font-extrabold text-[#003625]">
                आपले ग्रामपंचायत प्रतिनिधी
              </h2>
            </div>
          )}

          {isUnderAdminRule ? (
            /* Administrator Profile Card */
            <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-[#9e4300]/25 shadow-xs max-w-3xl mx-auto space-y-6">
              <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-6">
                <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-[#F4EFE6] border-2 border-[#E5DEC9] text-[#003625] font-black flex items-center justify-center shadow-xs shrink-0 text-center overflow-hidden">
                  <Image
                    src={village.administratorPhotoUrl || "/images/emblem.webp"}
                    alt="महाराष्ट्र शासन प्रशासक"
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="flex-1 text-center sm:text-left space-y-2">
                  <div className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-amber-100 text-[#9e4300] text-[11px] font-bold border border-amber-200">
                    <Landmark className="w-3 h-3 text-[#9e4300]" />
                    <span>महाराष्ट्र शासन • ग्रामविकास विभाग</span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-black text-[#003625]">
                    {village.administratorName || "श्री. आर. एस. पाटील"}
                  </h3>

                  <p className="text-xs sm:text-sm text-[#9e4300] font-bold">
                    {village.administratorRole || "शासन नियुक्त प्रशासक (विस्तार अधिकारी)"} • ग्रामपंचायत {village.name}
                  </p>

                  <blockquote className="text-xs sm:text-sm text-[#526056] italic leading-relaxed bg-[#FBF9F5] p-3 rounded-xl border border-[#E5DEC9]/80">
                    “{village.administratorOrderDetails || "ग्रामपंचायतीचा दैनंदिन कारभार, पाणीपुरवठा, स्वच्छता व नागरिकांना लागणारे सर्व दाखले नियमित कार्यालयीन वेळेत विनाअडथळा सुरू आहेत."}”
                  </blockquote>

                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-2">
                    {village.administratorPhone && (
                      <a
                        href={`tel:${village.administratorPhone}`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#003625] text-white font-bold text-xs hover:bg-[#134e39] transition shadow-xs"
                      >
                        <Phone className="w-3.5 h-3.5 text-[#F5D77F]" />
                        <span>प्रशासक संपर्क: {village.administratorPhone}</span>
                      </a>
                    )}
                    {village.phone && village.phone !== village.administratorPhone && (
                      <a
                        href={`tel:${village.phone}`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#F4EFE6] text-[#003625] border border-[#E5DEC9] font-bold text-xs hover:bg-[#E5DEC9] transition shadow-xs"
                      >
                        <Phone className="w-3.5 h-3.5 text-[#9e4300]" />
                        <span>कार्यालय संपर्क: {village.phone}</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Administrative Reassurance Banner */}
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-start gap-3 text-xs text-emerald-950">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">नागरिकांसाठी महत्त्वाची सूचना:</span>
                  <span>सर्व शासकीय दाखले (जन्म, मृत्यू, रहिवासी, कर पावती) व योजनांचे अर्ज ग्रामपंचायत कार्यालयात नियमित वेळेत सुरू आहेत.</span>
                </div>
              </div>
            </div>
          ) : representatives.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 border border-[#E5DEC9] text-center text-[#526056] text-xs font-medium">
              ग्रामपंचायत पदाधिकारी व सदस्यांची माहिती लवकरच अद्यतनित केली जाईल.
            </div>
          ) : (
            <>
              {/* Featured Sarpanch Card */}
              {sarpanch && (
                <div className="bg-white rounded-3xl p-5 sm:p-8 border border-[#E5DEC9] shadow-xs max-w-3xl mx-auto">
                  <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-6">
                    <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-[#F4EFE6] border-2 border-[#E5DEC9] text-[#003625] font-black flex items-center justify-center text-2xl sm:text-4xl shadow-xs shrink-0 text-center overflow-hidden">
                      {sarpanch.photoUrl ? (
                        <Image
                          src={sarpanch.photoUrl}
                          alt={sarpanch.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        sarpanch.name.split(" ").slice(0, 2).map((n: string) => n[0]).join("") || "स"
                      )}
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
                        “{village.sarpanchMessage || `गावातील शेवटच्या घटकापर्यंत शासकीय योजना पोहोचवणे आणि आधुनिक लोकसहभागातून समृद्ध, डिजिटल ${village.name} घडवणे हेच आमचे ध्येय आहे.`}”
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
              )}

              {/* Representatives Grid */}
              {otherMembers.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {otherMembers.slice(0, 8).map((rep: any, idx: number) => (
                    <div
                      key={rep._id || idx}
                      className="bg-white rounded-2xl p-4 text-center border border-[#E5DEC9] shadow-xs flex flex-col justify-between"
                    >
                      <div>
                        <div className="relative w-12 h-12 sm:w-14 sm:h-14 mx-auto rounded-full bg-[#F4EFE6] border border-[#E5DEC9] text-[#003625] font-bold flex items-center justify-center text-sm sm:text-base mb-2 overflow-hidden">
                          {rep.photoUrl ? (
                            <Image
                              src={rep.photoUrl}
                              alt={rep.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            rep.name.split(" ").slice(0, 2).map((w: string) => w[0]).join("") || "स"
                          )}
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
              )}
            </>
          )}
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
            <Link
              href={`/${village.slug}/events`}
              className="text-xs font-bold text-[#9e4300] hover:underline flex items-center gap-1 shrink-0 bg-white px-3.5 py-1.5 rounded-full border border-[#E5DEC9] shadow-2xs hover:bg-[#FBF9F5]"
            >
              <span>सर्व घडामोडी पहा ({happenings.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {happenings.length === 0 ? (
              <div className="col-span-full p-8 text-center bg-white rounded-2xl border border-[#E5DEC9] text-[#526056] text-xs font-medium space-y-1">
                <p>सध्या कोणतीही नवीन बातमी किंवा उपक्रम नोंदवलेला नाही.</p>
                <p className="text-[11px] text-slate-400">ग्रामपंचायत प्रशासनाकडून लवकरच घडामोडी प्रसिद्ध केल्या जातील.</p>
              </div>
            ) : (
              happenings.map((init: any, idx: number) => {
                const dateInfo = formatMarathiDate(init.publishedAt);
                return (
                  <article
                    key={init._id ? init._id.toString() : idx}
                    className="bg-white rounded-2xl border border-[#E5DEC9] overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between group"
                  >
                    <Link
                      href={`/${village.slug}/events/${init.slug || init.id}`}
                      className="h-44 bg-[#F4EFE6] relative flex items-center justify-center text-[#003625] overflow-hidden block"
                    >
                      {init.imageUrl ? (
                        <Image
                          src={init.imageUrl}
                          alt={init.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : idx === 0 ? (
                        <Users className="w-12 h-12 text-[#003625] opacity-40" />
                      ) : idx === 1 ? (
                        <Construction className="w-12 h-12 text-[#9e4300] opacity-40" />
                      ) : (
                        <Droplets className="w-12 h-12 text-[#134e39] opacity-40" />
                      )}
                      <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-[#F5D77F] text-[#1E2621] text-[10px] font-bold shadow-xs">
                        {init.category || "ग्राम घडामोडी"}
                      </div>
                      {init.images && init.images.length > 1 && (
                        <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold flex items-center gap-1">
                          <span>📷 {init.images.length} फोटो</span>
                        </div>
                      )}
                    </Link>
                    <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <span className="text-[10px] text-[#526056] font-medium block mb-1">
                          {dateInfo.formatted} • ग्रामपंचायत {village.name}
                        </span>
                        <Link href={`/${village.slug}/events/${init.slug || init.id}`}>
                          <h3 className="font-extrabold text-sm text-[#003625] leading-snug group-hover:text-[#9e4300] transition-colors line-clamp-2">
                            {init.title}
                          </h3>
                        </Link>
                        <p className="text-xs text-[#526056] mt-1.5 line-clamp-3 leading-relaxed">
                          {init.summary || init.content}
                        </p>
                      </div>
                      <Link
                        href={`/${village.slug}/events/${init.slug || init.id}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-[#9e4300] hover:underline pt-2 border-t border-[#E5DEC9]/40"
                      >
                        <span>सविस्तर वाचा</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* 08 — VILLAGE DEVELOPMENT PROGRESS (गावाचा विकास प्रकल्प अहवाल) */}
      {projects && projects.length > 0 && (
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
                <span>सर्व प्रकल्प पहा ({projects.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-4">
              {/* Featured Development Work Card (projects[0]) */}
              {(() => {
                const p = projects[0];
                const isCompleted = p.status === "COMPLETED";
                const isOngoing = p.status === "ONGOING";
                const hasImage = Array.isArray(p.images) && p.images.length > 0 && p.images[0];

                return (
                  <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E5DEC9] shadow-xs space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-md bg-[#003625] text-white text-[10px] font-bold">
                          {p.category || "पायाभूत सुविधा"}
                        </span>
                        {p.year && (
                          <span className="px-2.5 py-0.5 rounded-md bg-[#F5D77F] text-[#1E2621] text-[10px] font-bold">
                            {p.year}
                          </span>
                        )}
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                          isCompleted
                            ? "bg-[#E8F5E9] text-[#1E7E34] border border-[#1E7E34]/30"
                            : isOngoing
                            ? "bg-[#FFF3E0] text-[#9e4300] border border-[#9e4300]/30"
                            : "bg-[#FBF9F5] text-[#003625] border border-[#E5DEC9]"
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isCompleted ? "bg-[#1E7E34]" : isOngoing ? "bg-[#9e4300]" : "bg-[#003625]"
                          }`}
                        />
                        {isCompleted
                          ? "काम पूर्ण झाले"
                          : isOngoing
                          ? "काम प्रगतीपथावर आहे"
                          : "नियोजित काम"}
                      </span>
                    </div>

                    {hasImage && (
                      <div className="relative h-44 sm:h-56 w-full rounded-2xl overflow-hidden border border-[#E5DEC9] bg-slate-100">
                        <Image
                          src={p.images[0]}
                          alt={p.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}

                    <div>
                      <h3 className="text-base sm:text-xl font-extrabold text-[#003625]">
                        {p.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-[#526056] mt-1 leading-relaxed">
                        {p.description}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-[#E5DEC9] text-xs">
                      {p.budget != null && (
                        <div>
                          <span className="text-[#526056] text-[10px] block">मंजूर निधी:</span>
                          <strong className="text-[#1E2621] font-mono font-bold">
                            ₹{Number(p.budget).toLocaleString("en-IN")}
                          </strong>
                        </div>
                      )}
                      {p.agency && (
                        <div>
                          <span className="text-[#526056] text-[10px] block">पर्यवेक्षण / यंत्रणा:</span>
                          <strong className="text-[#1E2621]">{p.agency}</strong>
                        </div>
                      )}
                      {p.location && (
                        <div>
                          <span className="text-[#526056] text-[10px] block">स्थान / परिसर:</span>
                          <strong className="text-[#1E2621]">{p.location}</strong>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Secondary Projects Grid (projects[1] and projects[2]) */}
              {projects.length > 1 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  {projects.slice(1, 3).map((p: any) => (
                    <div
                      key={p._id ? p._id.toString() : p.title}
                      className="bg-white rounded-2xl p-4 border border-[#E5DEC9] shadow-xs space-y-2 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 text-[10px] font-bold">
                          <span className="text-[#003625] bg-[#F4EFE6] px-2 py-0.5 rounded-md border border-[#E5DEC9]">
                            {p.category}
                          </span>
                          <span className="text-[#526056]">
                            {p.status === "COMPLETED" ? "पूर्ण" : p.status === "ONGOING" ? "प्रगतीपथावर" : "नियोजित"}
                          </span>
                        </div>
                        <h4 className="font-extrabold text-xs sm:text-sm text-[#003625] mt-1.5 line-clamp-1">
                          {p.title}
                        </h4>
                        <p className="text-xs text-[#526056] mt-1 line-clamp-2">
                          {p.description}
                        </p>
                      </div>
                      {p.budget != null && (
                        <div className="pt-2 border-t border-[#E5DEC9] flex items-center justify-between text-xs font-mono font-bold text-[#9e4300]">
                          <span className="text-[10px] font-normal text-[#526056]">निधी:</span>
                          <span>₹{Number(p.budget).toLocaleString("en-IN")}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* 09 — VILLAGE PRIDE (गावाचा अभिमान / गौरव) */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="bg-[#F4EFE6] rounded-3xl p-5 sm:p-8 border border-[#E5DEC9] space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <div className="inline-flex items-center gap-1.5 text-[#9e4300] font-bold text-xs uppercase tracking-wider mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>गौरवशाली परंपरा व सन्मान</span>
              </div>
              <h2 className="text-xl sm:text-3xl font-extrabold text-[#003625]">
                {village.name}चा अभिमान
              </h2>
            </div>
          </div>

          {details.prideHighlights && details.prideHighlights.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {details.prideHighlights.map((item: any, idx: number) => (
                <div
                  key={idx}
                  className="relative overflow-hidden rounded-2xl bg-[#003625] text-white p-5 sm:p-6 shadow-md border border-[#E5DEC9] flex flex-col justify-between"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#F5D77F] text-[#003625] font-black flex items-center justify-center shrink-0 shadow-md">
                      <Award className="w-6 h-6 text-[#9e4300]" />
                    </div>
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F5D77F]/30 text-[#F5D77F] border border-[#F5D77F]/40">
                          ★ विशेष गौरव
                        </span>
                        {item.year && (
                          <span className="text-[10px] font-mono font-bold text-slate-300">
                            {item.year}
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-extrabold text-white leading-snug">
                        {item.title}
                      </h3>
                      <p className="text-xs text-[#FBF9F5]/90 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-emerald-900/80 flex items-center justify-between text-[11px] text-[#F5D77F]">
                    <span>ग्रामपंचायत {village.name} व समस्त ग्रामस्थ</span>
                    <span className="font-bold">सस्नेह गौरव ✦</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-8 border border-[#E5DEC9] text-center text-[#526056] text-xs font-medium">
              गावातील अभिमानास्पद कामगिरी व पुरस्कारांची नोंद लवकरच प्रसिद्ध केली जाईल.
            </div>
          )}
        </div>
      </section>

      {/* 10 — PUBLIC FACILITIES & MAP (भौगोलिक स्थान व सुविधा) */}
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
              तालुका शहरापासून अंतर: {details.stats.distanceFromTaluka !== "—" ? details.stats.distanceFromTaluka : `ता. ${taluka}`}
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
              href={village.phone ? `tel:${village.phone}` : "#"}
              className="p-3.5 sm:p-4 rounded-2xl bg-white border border-[#E5DEC9] shadow-xs hover:border-[#003625] transition flex flex-col sm:flex-row items-start sm:items-center gap-3 group"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#F4EFE6] text-[#003625] flex items-center justify-center shrink-0 group-hover:bg-[#003625] group-hover:text-white transition-colors">
                <Building className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#003625]">ग्रामपंचायत</h4>
                <p className="text-xs font-black text-[#9e4300] font-mono">{village.phone || "—"}</p>
                <span className="text-[10px] text-[#526056]">कार्यालयीन वेळ</span>
              </div>
            </a>

            {/* Sarpanch / VDO */}
            <a
              href={vdo?.phone || sarpanch?.phone || village.phone ? `tel:${vdo?.phone || sarpanch?.phone || village.phone}` : "#"}
              className="p-3.5 sm:p-4 rounded-2xl bg-white border border-[#E5DEC9] shadow-xs hover:border-[#003625] transition flex flex-col sm:flex-row items-start sm:items-center gap-3 group"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#F4EFE6] text-[#003625] flex items-center justify-center shrink-0 group-hover:bg-[#003625] group-hover:text-white transition-colors">
                <UserCheck className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#003625]">ग्रामसेवक थेट</h4>
                <p className="text-xs font-black text-[#9e4300] font-mono">{vdo?.phone || sarpanch?.phone || village.phone || "—"}</p>
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