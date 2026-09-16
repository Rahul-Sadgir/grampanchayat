import Image from "next/image";

export default function VillageLoading() {
  return (
    <div className="min-h-[60vh] max-w-5xl mx-auto px-4 py-12 flex flex-col items-center justify-center text-center">
      <div className="bg-[#F4EFE6]/90 backdrop-blur-md rounded-3xl p-8 sm:p-12 border border-[#E5DEC9] shadow-sm max-w-md w-full flex flex-col items-center justify-center space-y-6">
        {/* Civic Glowing Emblem Spinner */}
        <div className="relative w-20 h-20 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-4 border-[#003625]/20 border-t-[#003625] animate-spin" />
          <div className="absolute inset-2 rounded-full border-4 border-[#9e4300]/20 border-b-[#9e4300] animate-spin [animation-duration:1.5s] [animation-direction:reverse]" />
          
          <div className="relative w-11 h-11 rounded-full bg-white shadow-md p-1.5 flex items-center justify-center">
            <Image
              src="/images/emblem.png"
              alt="महाराष्ट्र शासन"
              width={36}
              height={36}
              className="object-contain"
            />
          </div>
        </div>

        {/* Text Details */}
        <div className="space-y-1.5 text-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white border border-[#E5DEC9] text-[#9e4300] text-[11px] font-bold shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1E7E34] animate-pulse" />
            <span>ग्रामपंचायत ई-सेवा पोर्टल</span>
          </span>
          <h3 className="text-base sm:text-lg font-black text-[#003625]">
            पृष्ठ लोड होत आहे...
          </h3>
          <p className="text-xs text-[#526056] leading-relaxed">
            नागरी सेवा, परिपत्रके व योजनांचा तपशील तयार होत आहे...
          </p>
        </div>

        {/* Shimmer / Skeleton Placeholder Grid */}
        <div className="w-full space-y-2.5 pt-2">
          <div className="h-2 w-full bg-[#E5DEC9]/70 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#003625] via-[#F5D77F] to-[#9e4300] rounded-full animate-pulse" />
          </div>
          <div className="grid grid-cols-3 gap-2 pt-2">
            <div className="h-10 bg-white/80 rounded-xl border border-[#E5DEC9]/60 animate-pulse" />
            <div className="h-10 bg-white/80 rounded-xl border border-[#E5DEC9]/60 animate-pulse [animation-delay:0.2s]" />
            <div className="h-10 bg-white/80 rounded-xl border border-[#E5DEC9]/60 animate-pulse [animation-delay:0.4s]" />
          </div>
        </div>
      </div>
    </div>
  );
}
