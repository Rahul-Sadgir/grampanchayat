import { getVillageBySlug, getVillageDetailsData, getVillageRepresentatives } from "@/lib/data-provider";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { VillageGallerySection } from "@/components/public/VillageGallerySection";
import { getRtiSpendings } from "@/lib/actions/rti";
import { RtiSpendingsSection } from "@/components/public/RtiSpendingsSection";
import {
  ArrowLeft,
  MapPin,
  Building,
  Users,
  School,
  HeartPulse,
  Landmark,
  ShieldCheck,
  Phone,
  Mail,
  BadgeCheck,
  Compass,
  Target,
  UserCheck,
  FileCheck2,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

interface Props {
  params: Promise<{ villageSlug: string }>;
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AboutVillagePage({ params }: Props) {
  const { villageSlug } = await params;
  const village = await getVillageBySlug(villageSlug);
  if (!village) notFound();

  const details = getVillageDetailsData(villageSlug, village);
  const representatives = await getVillageRepresentatives(villageSlug);
  const rtiSpendings = await getRtiSpendings(villageSlug);
  const galleryImages = village.galleryImages || [];
  const isUnderAdminRule = Boolean(village.isUnderAdministrativeRule || village.is_under_administrative_rule);
  const staffMembers = representatives.filter(
    (r: any) =>
      !r.isSarpanch &&
      !r.isUpasarpanch &&
      r.role &&
      !r.role.includes("सदस्य") &&
      !r.role.includes("सदस्या")
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      <Link
        href={`/${villageSlug}`}
        className="inline-flex items-center text-xs font-bold text-[#003625] gap-1.5 bg-white px-4 py-2 rounded-full border border-[#E5DEC9] shadow-xs hover:bg-[#F4EFE6] transition"
      >
        <ArrowLeft className="w-3.5 h-3.5 text-[#9e4300]" />
        <span>मुख्यपृष्ठावर परत जा</span>
      </Link>

      <div className="bg-white p-6 sm:p-10 rounded-3xl shadow-xs border border-[#E5DEC9] space-y-8">
        {/* Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#9e4300] bg-[#F4EFE6] px-3 py-1 rounded-full border border-[#E5DEC9]">
            <Landmark className="w-3.5 h-3.5" />
            <span>गावाचा परिचय व इतिहास</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#003625] leading-[1.45] tracking-normal py-0.5">
            {village.name} ग्रामपंचायत
          </h1>
          <p className="text-xs sm:text-sm text-[#526056] font-medium leading-[1.4]">
            मु. {village.name}, पो. वडांगळी, ता. {village.taluka || "सिन्नर"}, जि. {village.district || "नाशिक"}, महाराष्ट्र - ४२२१०३
          </p>

          {/* Slogan banner */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-[#003625] text-[#F5D77F] text-center font-bold text-xs sm:text-sm shadow-xs border border-[#E5DEC9] leading-[1.4]">
            || डिजिटल इंडिया, डिजिटल ग्राम, हेच आमचे स्वप्न, हेच आमचे काम ||
          </div>
        </div>

        {/* Detailed Description */}
        <div className="text-[#1E2621] leading-relaxed border-t border-[#E5DEC9] pt-6 space-y-3">
          <p className="text-sm sm:text-base font-medium">{village.description}</p>
          <p className="text-xs sm:text-sm text-[#526056] leading-relaxed">
            ग्रामपंचायत {village.name} ही संविधानाने प्रदत्त स्थानिक स्वराज्य संस्थेच्या चौकटीत कार्यरत असून ग्रामविकास, जनकल्याण व पारदर्शक प्रशासन या तत्त्वांवर आधारित आहे. शासनाच्या विविध कल्याणकारी योजनांची प्रभावी अंमलबजावणी करून गावातील प्रत्येक घटकाचा सामाजिक व आर्थिक स्तर उंचावणे हेच मुख्य उद्दिष्ट आहे.
          </p>
        </div>

        {/* Village Photo Gallery Component */}
        <VillageGallerySection
          villageName={village.name}
          images={galleryImages}
        />

        {/* Census 2011 & Demographic Statistics Grid */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm sm:text-base font-extrabold text-[#003625] flex items-center gap-2">
              <Users className="w-4 h-4 text-[#9e4300]" />
              <span>गावाची अधिकृत सांख्यिकी (जनगणना अहवाल)</span>
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 bg-[#FBF9F5] rounded-2xl border border-[#E5DEC9] text-center">
              <span className="text-[11px] text-[#526056] font-medium block">एकूण लोकसंख्या</span>
              <span className="text-lg sm:text-2xl font-black text-[#003625] font-mono mt-1 block">
                {details.stats.population}
              </span>
              <span className="text-[9px] text-[#526056]">
                {details.stats.malePopulation !== "—" && details.stats.femalePopulation !== "—"
                  ? `पुरुष: ${details.stats.malePopulation} | महिला: ${details.stats.femalePopulation}`
                  : "अधिकृत नोंद"}
              </span>
            </div>

            <div className="p-4 bg-[#FBF9F5] rounded-2xl border border-[#E5DEC9] text-center">
              <span className="text-[11px] text-[#526056] font-medium block">एकूण कुटुंबे</span>
              <span className="text-lg sm:text-2xl font-black text-[#9e4300] font-mono mt-1 block">
                {details.stats.households}
              </span>
              <span className="text-[9px] text-[#526056]">गावातील एकूण घरे</span>
            </div>

            <div className="p-4 bg-[#FBF9F5] rounded-2xl border border-[#E5DEC9] text-center">
              <span className="text-[11px] text-[#526056] font-medium block">साक्षरता दर</span>
              <span className="text-lg sm:text-2xl font-black text-[#003625] font-mono mt-1 block">
                {details.stats.literacyRate}
              </span>
              <span className="text-[9px] text-[#526056]">
                {details.stats.femaleLiteracy !== "—"
                  ? `महिला साक्षरता: ${details.stats.femaleLiteracy}`
                  : "एकूण साक्षरता"}
              </span>
            </div>

            <div className="p-4 bg-[#FBF9F5] rounded-2xl border border-[#E5DEC9] text-center">
              <span className="text-[11px] text-[#526056] font-medium block">ग्राम क्षेत्र / वॉर्ड</span>
              <span className="text-lg sm:text-2xl font-black text-[#9e4300] font-mono mt-1 block">
                {details.stats.area !== "—" ? details.stats.area : details.stats.wards !== "—" ? `${details.stats.wards} वॉर्ड` : "—"}
              </span>
              <span className="text-[9px] text-[#526056]">
                {details.stats.wards !== "—" ? `एकूण ${details.stats.wards} प्रभाग / वॉर्ड` : "क्षेत्रफळ व प्रभाग"}
              </span>
            </div>
          </div>
        </div>

        {/* Geographic Distances */}
        <div className="space-y-3 pt-2">
          <h2 className="text-sm sm:text-base font-extrabold text-[#003625] flex items-center gap-2">
            <Compass className="w-4 h-4 text-[#9e4300]" />
            <span>भौगोलिक स्थान व प्रमुख शहरांचे अंतर</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 bg-[#FBF9F5] rounded-2xl border border-[#E5DEC9] text-center">
              <span className="text-xs text-[#526056]">तालुका {village.taluka || "सिन्नर"}</span>
              <p className="text-base font-black text-[#003625] mt-0.5">{details.stats.distanceFromTaluka}</p>
            </div>
            <div className="p-3.5 bg-[#FBF9F5] rounded-2xl border border-[#E5DEC9] text-center">
              <span className="text-xs text-[#526056]">जिल्हा {village.district || "नाशिक"}</span>
              <p className="text-base font-black text-[#003625] mt-0.5">{details.stats.distanceFromDistrict}</p>
            </div>
          </div>
        </div>

        {/* Vision & Objectives (आमचे ध्येय) */}
        <div className="space-y-3 pt-2">
          <h2 className="text-sm sm:text-base font-extrabold text-[#003625] flex items-center gap-2">
            <Target className="w-4 h-4 text-[#9e4300]" />
            <span>ग्रामपंचायतीचे ध्येय व उद्दिष्टे</span>
          </h2>
          <div className="space-y-2.5">
            {details.visionPoints.map((pt: string, idx: number) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-[#FBF9F5] border border-[#E5DEC9] flex items-start gap-3"
              >
                <div className="w-6 h-6 rounded-full bg-[#003625] text-[#F5D77F] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </div>
                <p className="text-xs sm:text-sm text-[#1E2621] leading-relaxed">
                  {pt}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right to Information (RTI) Spending Disclosures (माहितीचा अधिकार - खर्च व हिशोब) */}
        <RtiSpendingsSection
          spendings={rtiSpendings}
          villageName={village.name}
        />

        {/* Complete Elected Representatives & Staff Directory (Switches with Governance Mode) */}
        {isUnderAdminRule ? (
          <div className="space-y-4 pt-2">
            <div className="bg-[#F4EFE6] rounded-3xl p-5 sm:p-7 border border-[#E5DEC9] space-y-4">
              {/* Header Badge & Title */}
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#9e4300] text-white text-xs font-black uppercase tracking-wider shadow-xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#F5D77F]" />
                  <span>प्रशासकीय राजवटीखालील ग्रामपंचायत</span>
                </div>
                <h2 className="text-lg sm:text-2xl font-extrabold text-[#003625] leading-snug">
                  ग्रामपंचायतीचा कारभार शासन नियुक्त प्रशासकामार्फत चालविण्यात येत आहे.
                </h2>
                <p className="text-xs sm:text-sm text-[#526056] leading-relaxed">
                  स्थानिक स्वराज्य संस्था अधिनियम व शासकीय आदेशानुसार ग्रामपंचायतीचा दैनंदिन कारभार, विकासकामे व नागरी सेवा प्रशासकीय अधिकाऱ्यांमार्फत सुरळीतपणे सुरू आहेत.
                </p>
              </div>

              {/* Administrator Profile Card */}
              <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E5DEC9] shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5">
                  <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-[#F4EFE6] border-2 border-[#E5DEC9] text-[#003625] font-black flex items-center justify-center shadow-xs shrink-0 text-center overflow-hidden">
                    <Image
                      src={village.administratorPhotoUrl || "/images/emblem.webp"}
                      alt="महाराष्ट्र शासन प्रशासक"
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1 text-center sm:text-left space-y-2">
                    <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-[#9e4300] text-[10px] font-bold border border-amber-200">
                      <Landmark className="w-3 h-3 text-[#9e4300]" />
                      <span>महाराष्ट्र शासन • ग्रामविकास विभाग</span>
                    </div>

                    <h3 className="text-lg sm:text-xl font-black text-[#003625]">
                      {village.administratorName || "श्री. आर. एस. पाटील"}
                    </h3>

                    <p className="text-xs sm:text-sm text-[#9e4300] font-bold">
                      {village.administratorRole || "शासन नियुक्त प्रशासक (विस्तार अधिकारी)"} • ग्रामपंचायत {village.name}
                    </p>

                    <blockquote className="text-xs text-[#526056] italic leading-relaxed bg-[#FBF9F5] p-3 rounded-xl border border-[#E5DEC9]/80">
                      “{village.administratorOrderDetails || "ग्रामपंचायतीचा दैनंदिन कारभार, पाणीपुरवठा, स्वच्छता व नागरिकांना लागणारे सर्व दाखले नियमित कार्यालयीन वेळेत विनाअडथळा सुरू आहेत."}”
                    </blockquote>

                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                      {village.administratorPhone && (
                        <a
                          href={`tel:${village.administratorPhone}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#003625] text-white font-bold text-xs hover:bg-[#134e39] transition shadow-xs"
                        >
                          <Phone className="w-3 h-3 text-[#F5D77F]" />
                          <span>प्रशासक संपर्क: {village.administratorPhone}</span>
                        </a>
                      )}
                      {village.administratorEmail && (
                        <a
                          href={`mailto:${village.administratorEmail}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-[#003625] border border-[#E5DEC9] font-bold text-xs hover:bg-[#FBF9F5] transition shadow-xs"
                        >
                          <Mail className="w-3 h-3 text-[#9e4300]" />
                          <span>{village.administratorEmail}</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Important Governance Reassurance Notice */}
                <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl flex items-start gap-2.5 text-xs text-emerald-950">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">नागरिकांसाठी महत्त्वाची नोंद:</span>
                    <span>ग्रामपंचायतीवर प्रशासकीय राजवट लागू असल्यामुळे पूर्वीचे लोकनियुक्त प्रतिनिधी मंडळ (सरपंच/सदस्य) सध्या कार्यरत नाही. ग्रामपंचायतीच्या कार्यालयीन सेवा, पाणीपुरवठा, स्वच्छता व दाखले वितरण प्रशासकामार्फत विनाविलंब सुरू आहे.</span>
                  </div>
                </div>
              </div>

              {/* Administrative Staff Directory (If staff members exist) */}
              {staffMembers.length > 0 && (
                <div className="space-y-3 pt-2">
                  <h3 className="text-xs sm:text-sm font-extrabold text-[#003625] flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-[#9e4300]" />
                    <span>ग्रामपंचायत प्रशासकीय कर्मचारी निर्देशिका</span>
                  </h3>

                  <div className="overflow-x-auto rounded-2xl border border-[#E5DEC9] bg-white">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-[#003625] text-white">
                          <th className="p-3 font-bold">अ.क्र.</th>
                          <th className="p-3 font-bold">कर्मचाऱ्याचे नाव</th>
                          <th className="p-3 font-bold">पद / जबाबदारी</th>
                          <th className="p-3 font-bold">संपर्क क्रमांक</th>
                          <th className="p-3 font-bold">ईमेल</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E5DEC9]">
                        {staffMembers.map((rep: any, idx: number) => (
                          <tr key={idx} className="hover:bg-[#FBF9F5]/80 transition">
                            <td className="p-3 text-[#526056]">{idx + 1}</td>
                            <td className="p-3 text-[#003625] font-bold">{rep.name}</td>
                            <td className="p-3 text-[#9e4300] font-semibold">{rep.role}</td>
                            <td className="p-3">
                              {rep.phone ? (
                                <a href={`tel:${rep.phone}`} className="font-mono text-[#003625] hover:underline">
                                  {rep.phone}
                                </a>
                              ) : (
                                "—"
                              )}
                            </td>
                            <td className="p-3 text-[#526056] font-mono">
                              {rep.email ? (
                                <a href={`mailto:${rep.email}`} className="hover:underline text-[#003625]">
                                  {rep.email}
                                </a>
                              ) : (
                                "—"
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Normal Elected Representatives & Staff Directory */
          <div className="space-y-4 pt-2">
            <h2 className="text-sm sm:text-base font-extrabold text-[#003625] flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-[#9e4300]" />
              <span>ग्रामपंचायत लोकप्रतिनिधी व कर्मचारी निर्देशिका</span>
            </h2>

            <div className="overflow-x-auto rounded-2xl border border-[#E5DEC9]">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#003625] text-white">
                    <th className="p-3 font-bold">अ.क्र.</th>
                    <th className="p-3 font-bold">नाव</th>
                    <th className="p-3 font-bold">पद / प्रभाग</th>
                    <th className="p-3 font-bold">संपर्क क्रमांक</th>
                    <th className="p-3 font-bold">ईमेल</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5DEC9]">
                  {representatives.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-[#526056] text-xs">
                        ग्रामपंचायत प्रतिनिधींची माहिती लवकरच अद्यतनित केली जाईल.
                      </td>
                    </tr>
                  ) : (
                    representatives.map((rep: any, idx: number) => (
                      <tr
                        key={idx}
                        className={
                          rep.isSarpanch
                            ? "bg-[#F5D77F]/20 font-bold"
                            : rep.isUpasarpanch || rep.isOfficer
                            ? "bg-[#FBF9F5] font-semibold"
                            : "hover:bg-[#FBF9F5]/60 transition"
                        }
                      >
                        <td className="p-3 text-[#526056]">{idx + 1}</td>
                        <td className="p-3 text-[#003625] font-bold">
                          {rep.name}
                          {rep.isSarpanch && (
                            <span className="ml-2 px-2 py-0.5 rounded-full bg-[#003625] text-[#F5D77F] text-[10px]">
                              सरपंच
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-[#9e4300]">
                          {rep.role} {rep.ward ? `(${rep.ward})` : ""}
                        </td>
                        <td className="p-3">
                          {rep.phone ? (
                            <a
                              href={`tel:${rep.phone}`}
                              className="font-mono text-[#003625] hover:underline"
                            >
                              {rep.phone}
                            </a>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="p-3 text-[#526056] font-mono">
                          {rep.email ? (
                            <a
                              href={`mailto:${rep.email}`}
                              className="hover:underline text-[#003625]"
                            >
                              {rep.email}
                            </a>
                          ) : (
                            "—"
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Contact Strip */}
        <div className="p-5 bg-[#F4EFE6] rounded-2xl border border-[#E5DEC9] flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-[#003625] shrink-0" />
            <div>
              <span className="text-xs font-bold text-[#003625] block">ग्रामपंचायत कार्यालय पत्ता:</span>
              <span className="text-xs text-[#1E2621]">{village.address}</span>
            </div>
          </div>
          {village.phone && (
            <a
              href={`tel:${village.phone}`}
              className="px-4 py-2 rounded-xl bg-[#003625] text-white text-xs font-bold hover:bg-[#134e39] transition shadow-xs shrink-0"
            >
              📞 थेट संपर्क: {village.phone}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}