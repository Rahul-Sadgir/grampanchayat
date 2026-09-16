"use client";

import Link from "next/link";
import {
  FileEdit,
  Receipt,
  FileCheck2,
  Award,
  MessageSquareText,
  ArrowRight,
  BadgeCheck,
  FileText,
  Sparkles,
} from "lucide-react";
import { CITIZEN_TABS } from "@/data/citizen-services";

interface CitizenServicesHomeGatewayProps {
  villageSlug: string;
}

const ICON_MAP: Record<string, any> = {
  FileEdit,
  Receipt,
  FileCheck2,
  Award,
  MessageSquareText,
  FileText,
};

const TAB_COUNT_BADGES: Record<string, string> = {
  aarz: "१० अर्ज",
  tax: "ऑनलाइन",
  declarations: "नमुने",
  certificates: "दाखले",
  grievances: "मदत",
};

export function CitizenServicesHomeGateway({
  villageSlug,
}: CitizenServicesHomeGatewayProps) {
  return (
    <section
      id="citizen-services-section"
      className="max-w-5xl mx-auto px-4"
      aria-labelledby="citizen-services-heading"
    >
      <div className="bg-[#F4EFE6] rounded-3xl p-5 sm:p-8 border border-[#E5DEC9] space-y-6">
        {/* SECTION HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-[#E5DEC9]/60 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[#9e4300] font-bold text-xs uppercase tracking-wider mb-1">
              <BadgeCheck className="w-4 h-4 text-[#9e4300]" />
              <span>नागरिक ई-सेवा केंद्र</span>
            </div>
            <h2
              id="citizen-services-heading"
              className="text-2xl sm:text-3xl font-extrabold text-[#003625] tracking-tight"
            >
              नागरिक सेवा
            </h2>
          </div>

          <Link
            href={`/${villageSlug}/services?tab=aarz`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#9e4300] hover:text-[#692b00] transition-colors shrink-0 group self-start sm:self-end bg-white px-3.5 py-1.5 rounded-full border border-[#E5DEC9] shadow-2xs hover:bg-[#FBF9F5]"
          >
            <span>सर्व सेवा दालन उघडा</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* HORIZONTAL TABS ROW (Self-contained scroll, no page overflow) */}
        <div className="relative w-full max-w-full overflow-hidden">
        <div
          role="tablist"
          aria-label="नागरिक सेवा वर्गवारी"
          className="flex items-center gap-2 sm:gap-3 overflow-x-auto no-scrollbar py-1 px-1 scroll-smooth snap-x snap-mandatory"
        >
          {CITIZEN_TABS.map((cat) => {
            const TabIcon = ICON_MAP[cat.iconName] || FileText;
            const countBadge = TAB_COUNT_BADGES[cat.slug];
            const isAarz = cat.slug === "aarz";

            return (
              <Link
                key={cat.id}
                href={`/${villageSlug}/services?tab=${cat.slug}`}
                className={`
                  shrink-0 snap-start flex items-center justify-between gap-2.5 sm:gap-3
                  px-4 sm:px-5 py-3 sm:py-3.5 rounded-2xl border text-left transition-all duration-200
                  min-h-[52px] cursor-pointer select-none group shadow-2xs hover:shadow-md
                  flex-1 min-w-[130px] sm:min-w-0
                  ${
                    isAarz
                      ? "bg-gradient-to-r from-white to-[#F4EFE6] border-[#003625]/40 hover:border-[#003625]"
                      : "bg-white border-[#E5DEC9] hover:bg-[#F4EFE6] hover:border-[#003625]/40"
                  }
                `}
              >
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                  <div
                    className={`
                      w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors
                      ${
                        isAarz
                          ? "bg-[#003625] text-white shadow-xs"
                          : "bg-[#F4EFE6] text-[#003625] group-hover:bg-[#003625] group-hover:text-white"
                      }
                    `}
                  >
                    <TabIcon className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                  </div>

                  <div className="min-w-0">
                    <span className="text-xs sm:text-sm font-bold text-[#003625] group-hover:text-[#9e4300] transition-colors truncate block leading-tight">
                      {cat.shortLabel || cat.label}
                    </span>
                    <span className="text-[10px] text-[#707973] font-medium hidden sm:block truncate mt-0.5">
                      {cat.slug === "aarz" ? "१० ऑनलाइन अर्ज" : cat.actionDefault}
                    </span>
                  </div>
                </div>

                {countBadge && (
                  <span
                    className={`
                      text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 border hidden xs:inline-block
                      ${
                        isAarz
                          ? "bg-[#E8F5E9] text-[#1E7E34] border-[#1E7E34]/30"
                          : "bg-[#FBF9F5] text-[#707973] border-[#E5DEC9] group-hover:bg-white"
                      }
                    `}
                  >
                    {countBadge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
    </section>
  );
}
