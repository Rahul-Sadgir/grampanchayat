import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Search, Sparkles, MapPin, Building2, CheckCircle2, ChevronRight, Info } from "lucide-react";

interface HeroProps {
  villageName: string;
  slug: string;
  taluka: string;
  district: string;
  coverImage?: string;
}

export function Hero({
  villageName,
  slug,
  taluka,
  district,
  coverImage = "/images/village-hero-banner.jpg",
}: HeroProps) {
  return (
    <div className="space-y-4 px-3 sm:px-4 pt-1 sm:pt-4 max-w-5xl mx-auto">
      {/* 16:9 ASPECT RATIO HERO CONTAINER (Matching Stitch UI Editorial Style) */}
      <section className="relative w-full aspect-[16/9] overflow-hidden rounded-2xl sm:rounded-3xl shadow-lg border border-[#E5DEC9] flex flex-col justify-between text-white bg-[#003625] group">
        {/* Full 16:9 Background Image */}
        <Image
          src={coverImage}
          alt={`${villageName} ग्रामपंचायत १६:९ निसर्ग देखावा`}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 1200px"
          className="object-cover object-center transform transition-transform duration-700 group-hover:scale-102 opacity-75"
        />

        {/* 
          Balanced Civic Overlay:
          A subtle gradient from primary deep green (#003625) preserving photo clarity and text contrast.
        */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#003625] via-[#003625]/45 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#003625]/80 via-[#003625]/40 to-transparent pointer-events-none" />

        {/* Top Header Floating Badge */}
        <div className="relative z-10 p-3 sm:p-6 flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#003625]/85 backdrop-blur-md border border-[#F5D77F]/40 text-[#F5D77F] text-[10px] sm:text-xs font-bold tracking-wide shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#F5D77F] animate-pulse" />
            <span>डिजिटल महाराष्ट्र • समृद्ध ग्राम अभियान</span>
          </span>

          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white/90 text-xs font-medium">
            <MapPin className="w-3.5 h-3.5 text-[#F5D77F]" />
            <span>ता. {taluka}, जि. {district}</span>
          </span>
        </div>

        {/* Bottom Info Overlay (scaled specifically for mobile 16:9 visibility) */}
        <div className="relative z-10 p-3.5 sm:p-7 md:p-9 flex flex-col justify-end space-y-1.5 sm:space-y-3">
          {/* Village Title & Tagline */}
          <div className="space-y-0.5 sm:space-y-1">
            <h1 className="text-lg sm:text-3xl md:text-5xl font-black tracking-tight leading-tight text-white drop-shadow">
              {villageName} ग्रामपंचायत
            </h1>
            <p className="text-xs sm:text-base md:text-lg text-[#F5D77F] font-bold drop-shadow-sm">
              आपलं गाव • आपली माहिती • आपल्या सेवा
            </p>
          </div>

          {/* Subtitle / Description */}
          <p className="hidden sm:block text-xs md:text-sm text-[#FBF9F5]/90 max-w-2xl line-clamp-2 leading-relaxed drop-shadow-sm">
            गावाची संपूर्ण माहिती, पारदर्शक शासकीय योजना आणि तत्पर नागरिक सेवा आता कोणत्याही मध्यस्थाशिवाय एकाच अधिकृत डिजिटल व्यासपीठावर उपलब्ध.
          </p>

          {/* Desktop/Tablet Action Buttons inside Hero */}
          <div className="hidden sm:flex items-center gap-3 pt-2">
            <a
              href="#services"
              className="px-5 py-2.5 bg-[#9e4300] hover:bg-[#692b00] text-white font-extrabold rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-2 text-xs md:text-sm"
            >
              <span>नागरिक सेवा पहा</span>
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="#about"
              className="px-4 py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-bold rounded-xl border border-white/30 shadow-xs transition-all active:scale-95 flex items-center gap-2 text-xs md:text-sm"
            >
              <Info className="w-4 h-4 text-[#F5D77F]" />
              <span>गावाबद्दल जाणून घ्या</span>
            </a>
          </div>
        </div>
      </section>

      {/* MOBILE ACTION DOCK (Ensures 16:9 hero image above remains 100% visible & uncluttered on mobile screens) */}
      <div className="sm:hidden grid grid-cols-2 gap-2">
        <a
          href="#services"
          className="p-2.5 bg-[#9e4300] text-white font-bold rounded-xl shadow-xs active:scale-95 flex items-center justify-center gap-1.5 text-xs text-center"
        >
          <span>नागरिक सेवा पहा</span>
          <ArrowRight className="w-3.5 h-3.5 shrink-0" />
        </a>
        <a
          href="#about"
          className="p-2.5 bg-white text-[#003625] border border-[#E5DEC9] font-bold rounded-xl shadow-xs active:scale-95 flex items-center justify-center gap-1.5 text-xs text-center"
        >
          <Info className="w-3.5 h-3.5 text-[#9e4300] shrink-0" />
          <span>गावाबद्दल माहिती</span>
        </a>
      </div>
    </div>
  );
}