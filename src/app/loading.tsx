import Image from "next/image";

export default function RootLoading() {
  return (
    <div className="min-h-[70vh] w-full flex flex-col items-center justify-center p-6 text-center">
      <div className="relative flex flex-col items-center justify-center space-y-6">
        {/* Civic Glowing Rings */}
        <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-4 border-[#003625]/20 border-t-[#003625] animate-spin" />
          <div className="absolute inset-2 rounded-full border-4 border-[#9e4300]/20 border-b-[#9e4300] animate-spin [animation-duration:1.5s] [animation-direction:reverse]" />
          
          <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white shadow-md p-1.5 flex items-center justify-center">
            <Image
              src="/images/emblem.png"
              alt="महाराष्ट्र शासन बोधचिन्ह"
              width={40}
              height={40}
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* Loading Text & Subtle Badge */}
        <div className="space-y-2 max-w-sm">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F4EFE6] border border-[#E5DEC9] text-[#003625] text-xs font-bold shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-[#1E7E34] animate-pulse" />
            <span>डिजिटल ग्रामपंचायत महापोर्टल</span>
          </div>

          <h3 className="text-base sm:text-lg font-extrabold text-[#003625] tracking-tight">
            माहिती लोड होत आहे...
          </h3>

          <p className="text-xs text-[#526056] leading-relaxed">
            कृपया काही क्षण प्रतीक्षा करा, शासकीय सेवा व माहिती उपलब्ध केली जात आहे.
          </p>
        </div>

        {/* Civic Progress Bar Indicator */}
        <div className="w-48 h-1.5 bg-[#E5DEC9]/60 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-[#003625] via-[#F5D77F] to-[#9e4300] rounded-full animate-[loading_1.5s_infinite_ease-in-out]" />
        </div>
      </div>
    </div>
  );
}
