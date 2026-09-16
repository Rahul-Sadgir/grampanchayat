import Link from "next/link";
import Image from "next/image";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  ExternalLink,
  ArrowRight,
  ShieldCheck,
  Landmark,
} from "lucide-react";

interface FooterProps {
  village: {
    name: string;
    slug: string;
    taluka?: string;
    district?: string;
    address?: string;
    phone?: string;
    email?: string;
  };
}

export function Footer({ village }: FooterProps) {
  const taluka = village.taluka || "सिन्नर";
  const district = village.district || "नाशिक";

  return (
    <footer
      className="w-full relative footer-bg text-[#1E2621] mt-4 sm:mt-6 border-t border-[#E5DEC9] shadow-[0_-1px_6px_rgba(0,0,0,0.03)] overflow-hidden"
      suppressHydrationWarning
    >
      {/* Translucent layer to let the scenic rural illustration shine through with high text legibility */}
      <div className="w-full bg-[#FBF9F5]/88 backdrop-blur-[0.5px] pt-6 sm:pt-12 pb-20 sm:pb-8">
        <div className="max-w-6xl mx-auto px-4">
          {/* Grid: 4 columns on desktop, only Contact column on mobile */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mb-6 md:mb-10">
            {/* Col 1: Village Identity & Emblem (Desktop Only) */}
            <div className="hidden md:block space-y-3">
              <div className="flex items-center gap-2.5">
                <Image
                  src="/images/emblem.png"
                  alt="महाराष्ट्र शासन ग्रामपंचायत अधिकृत बोधचिन्ह"
                  width={36}
                  height={36}
                  className="h-9 w-9 object-contain shrink-0"
                />
                <span className="font-extrabold text-[#003625] text-base">
                  ग्रामपंचायत {village.name}
                </span>
              </div>
              <p className="text-xs text-[#526056] leading-relaxed">
                तालुका: {taluka}, जिल्हा: {district}, महाराष्ट्र - ४२२१०३. ग्रामविकासाची आधुनिक लोकशाही प्रणाली व पारदर्शक डिजिटल सेवा केंद्र.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#1E7E34] animate-pulse" />
                <span className="text-[11px] font-bold text-[#526056]">
                  ई-प्रशासन प्रणाली २४/७ कार्यान्वित
                </span>
              </div>
            </div>

            {/* Col 2: महत्त्वाचे दुवे (Important Links - Desktop Only) */}
            <div className="hidden md:block space-y-3">
              <h4 className="font-bold text-[#003625] text-sm tracking-tight">
                महत्त्वाचे दुवे
              </h4>
              <ul className="space-y-2 text-xs text-[#526056]">
                <li>
                  <Link
                    href={`/${village.slug}/services`}
                    className="hover:text-[#003625] transition-colors flex items-center gap-1.5"
                  >
                    <ArrowRight className="w-3.5 h-3.5 text-[#9e4300]" />
                    <span>जन्म-मृत्यू प्रमाणपत्र नोंदणी</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href={`/${village.slug}/services/namuna-8-extract/apply`}
                    className="hover:text-[#003625] transition-colors flex items-center gap-1.5"
                  >
                    <ArrowRight className="w-3.5 h-3.5 text-[#9e4300]" />
                    <span>घरपट्टी व पाणीपट्टी कर भरणा</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href={`/${village.slug}/notices`}
                    className="hover:text-[#003625] transition-colors flex items-center gap-1.5"
                  >
                    <ArrowRight className="w-3.5 h-3.5 text-[#9e4300]" />
                    <span>ग्रामसभा ठराव व इतिवृत्त</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href={`/${village.slug}/schemes`}
                    className="hover:text-[#003625] transition-colors flex items-center gap-1.5"
                  >
                    <ArrowRight className="w-3.5 h-3.5 text-[#9e4300]" />
                    <span>शासकीय योजना व अनुदान</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href={`/${village.slug}/development`}
                    className="hover:text-[#003625] transition-colors flex items-center gap-1.5"
                  >
                    <ArrowRight className="w-3.5 h-3.5 text-[#9e4300]" />
                    <span>गावाचा विकास प्रकल्प अहवाल</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 3: शासकीय संकेतस्थळे (Govt Portals - Desktop Only) */}
            <div className="hidden md:block space-y-3">
              <h4 className="font-bold text-[#003625] text-sm tracking-tight">
                शासकीय संकेतस्थळे
              </h4>
              <ul className="space-y-2 text-xs text-[#526056]">
                <li>
                  <a
                    href="https://aaplesarkar.mahaonline.gov.in"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#003625] transition-colors flex items-center gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-[#003625]" />
                    <span>आपले सरकार (Aaple Sarkar)</span>
                  </a>
                </li>
                <li>
                  <a
                    href="https://mahadbt.maharashtra.gov.in"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#003625] transition-colors flex items-center gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-[#003625]" />
                    <span>महाडीबीटी पोर्टल (MahaDBT)</span>
                  </a>
                </li>
                <li>
                  <a
                    href="https://egramswaraj.gov.in"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#003625] transition-colors flex items-center gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-[#003625]" />
                    <span>ई-ग्रामस्वराज (e-GramSwaraj)</span>
                  </a>
                </li>
                <li>
                  <a
                    href="https://panchayat.gov.in"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#003625] transition-colors flex items-center gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-[#003625]" />
                    <span>राष्ट्रीय पंचायत राज मंत्रालय</span>
                  </a>
                </li>
              </ul>
            </div>

            {/* Col 4: कार्यालयीन संपर्क (Office Contact - Visible on both Mobile & Desktop) */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Image
                  src="/images/emblem.png"
                  alt="महाराष्ट्र शासन ग्रामपंचायत अधिकृत बोधचिन्ह"
                  width={24}
                  height={24}
                  className="h-6 w-6 object-contain shrink-0 md:hidden"
                />
                <h4 className="font-bold text-[#003625] text-sm tracking-tight">
                  <span className="md:hidden">ग्रामपंचायत {village.name} - </span>कार्यालयीन संपर्क
                </h4>
              </div>
              <div className="space-y-2 text-xs text-[#526056]">
                <p className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-[#003625] shrink-0 mt-0.5" />
                  <span>
                    {village.address || `ग्रामपंचायत कार्यालय, मुख्य चौक, मु. पो. ${village.name}, ता. ${taluka}, जि. ${district}`}
                  </span>
                </p>
                {village.phone && (
                  <p className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-[#003625] shrink-0" />
                    <a href={`tel:${village.phone}`} className="hover:text-[#003625] font-mono font-bold">
                      {village.phone}
                    </a>
                  </p>
                )}
                {village.email && (
                  <p className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-[#003625] shrink-0" />
                    <a href={`mailto:${village.email}`} className="hover:text-[#003625] truncate">
                      {village.email}
                    </a>
                  </p>
                )}
                <p className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#003625] shrink-0" />
                  <span>सोमवार ते शनिवार: स. ९:४५ ते सायं. ६:१५</span>
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Strip: 2026 Copyright (Always Visible) & Secondary Badges (Desktop Only) */}
          <div className="pt-4 md:pt-5 border-t border-[#E5DEC9] flex flex-col md:flex-row items-center justify-between gap-3 text-[11px] text-[#526056] text-center md:text-left">
            <div className="font-medium text-slate-700">
              © {new Date().getFullYear()} ग्रामपंचायत {village.name}, {taluka}, {district}. सर्व हक्क राखीव.
            </div>
            <div className="hidden md:flex items-center gap-4 sm:gap-6 flex-wrap justify-center">
              <span className="flex items-center gap-1 text-[#003625] font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-[#1E7E34]" />
                GIGW २.० सुगम्यता निकष प्रमाणित
              </span>
              <Link href={`/${village.slug}/about`} className="hover:text-[#003625] transition-colors">
                गोपनीयता धोरण
              </Link>
              <Link href={`/${village.slug}/about`} className="hover:text-[#003625] transition-colors">
                वापराच्या अटी
              </Link>
              <Link href="/admin" className="text-[#9e4300] hover:underline font-bold">
                प्रशासक लॉगिन
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Developed By & Tech Partner Strip */}
      <div className="w-full bg-[#00271b] text-white py-3 px-4 border-t border-emerald-950 text-xs">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#F5D77F] animate-pulse" />
            <span className="text-slate-300 text-[11px] sm:text-xs">
              Designed & Developed by{" "}
              <strong className="text-[#F5D77F] font-bold">AWAK Tech Solutions</strong>
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-[11px] sm:text-xs">
            <a
              href="mailto:awak.techsol@gmail.com"
              className="inline-flex items-center gap-1.5 text-slate-300 hover:text-[#F5D77F] transition-colors"
            >
              <Mail className="w-3.5 h-3.5 text-[#F5D77F]" />
              <span>awak.techsol@gmail.com</span>
            </a>
            <span className="text-emerald-800 hidden sm:inline">•</span>
            <a
              href="tel:+917887663038"
              className="inline-flex items-center gap-1.5 text-slate-300 hover:text-[#F5D77F] font-mono transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-[#F5D77F]" />
              <span>+91 7887663038</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}