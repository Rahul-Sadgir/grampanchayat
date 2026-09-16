"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, ArrowRight, Sparkles } from "lucide-react";

interface Props {
  villageSlug: string;
}

const QUICK_CHIPS = [
  { label: "जन्म प्रमाणपत्र", link: "/services/birth-certificate/apply" },
  { label: "रहिवासी दाखला", link: "/services/residence-certificate/apply" },
  { label: "शासकीय योजना", link: "/schemes" },
  { label: "नवीन पाणी जोडणी", link: "/services/water-connection/apply" },
  { label: "नमुना ८ उतारा", link: "/services/namuna-8-extract/apply" },
  { label: "बांधकाम परवानगी", link: "/services/construction-permission/apply" },
  { label: "फेरफार नोंदणी", link: "/services/property-mutation/apply" },
  { label: "रोजगार हमी मागणी", link: "/services/mgnrega-work-demand/apply" },
];

export function QuickSearchSection({ villageSlug }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/${villageSlug}/services?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <section className="w-full relative z-20 px-2 sm:px-4 max-w-5xl mx-auto -mt-6 sm:-mt-10">
      <div className="bg-white rounded-2xl p-5 sm:p-7 shadow-md border border-[#E5DEC9]">
        <div className="max-w-2xl mx-auto text-center mb-4">
          <h2 className="text-lg sm:text-2xl font-extrabold text-[#003625]">
            तुम्हाला काय हवे आहे?
          </h2>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="max-w-2xl mx-auto relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#707973] w-5 h-5 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="जन्म प्रमाणपत्र, घरकुल योजना, पाणी जोडणी, नमुना ८..."
            className="w-full h-12 sm:h-14 pl-12 pr-24 rounded-xl bg-[#FBF9F5] text-[#1E2621] text-xs sm:text-sm border border-[#E5DEC9] focus:outline-none focus:ring-2 focus:ring-[#003625] focus:bg-white transition-all shadow-inner"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 h-9 sm:h-11 px-4 sm:px-5 rounded-lg bg-[#003625] hover:bg-[#134e39] text-white font-bold text-xs transition-colors shadow-xs"
          >
            शोधा
          </button>
        </form>

        {/* Quick Recommendation Chips */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 max-w-3xl mx-auto">
          <span className="text-[11px] font-bold text-[#526056] mr-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#9e4300]" />
            <span>त्वरित शोध:</span>
          </span>
          {QUICK_CHIPS.map((chip, idx) => (
            <Link
              key={idx}
              href={`/${villageSlug}${chip.link}`}
              className="px-3 py-1 rounded-full bg-[#F4EFE6] hover:bg-[#F5D77F]/60 text-[#1E2621] font-semibold text-[11px] sm:text-xs border border-[#E5DEC9] transition active:scale-95"
            >
              {chip.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
