"use client";

import { useState, useId, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Receipt,
  FileText,
  FileEdit,
  FileCheck2,
  Award,
  MessageSquareText,
  Baby,
  Home,
  Droplets,
  Heart,
  Building,
  Store,
  ArrowRight,
  BadgeCheck,
  Clock,
  ShieldCheck,
  Download,
  FileSpreadsheet,
  Search,
  Sparkles,
  Users,
  Briefcase,
  CheckCircle2,
  Eye,
  ExternalLink,
  X,
  Maximize2,
} from "lucide-react";
import {
  CITIZEN_TABS,
  ALL_CITIZEN_SERVICES,
  APPLICATION_SERVICES,
  ALL_CITIZEN_PDFS,
  CitizenServiceItem,
  getTabBySlugOrId,
} from "@/data/citizen-services";

interface CitizenServicesTabbedProps {
  villageSlug: string;
  initialServices?: CitizenServiceItem[];
  initialTab?: string;
  initialQuery?: string;
}

const ICON_MAP: Record<string, any> = {
  Receipt,
  FileText,
  FileEdit,
  FileCheck2,
  Award,
  MessageSquareText,
  Baby,
  Home,
  Droplets,
  Heart,
  Building,
  Store,
  Users,
  Briefcase,
};

export function CitizenServicesTabbed({
  villageSlug,
  initialServices,
  initialTab = "aarz",
  initialQuery = "",
}: CitizenServicesTabbedProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabListId = useId();

  // Resolve initial tab from prop or URL
  const resolvedTabConfig = getTabBySlugOrId(
    searchParams?.get("tab") || initialTab
  );
  const [activeTabId, setActiveTabId] = useState<string>(resolvedTabConfig.id);
  const [searchQuery, setSearchQuery] = useState<string>(
    searchParams?.get("q") || initialQuery
  );

  // PDF Preview Modal state
  const [previewPdf, setPreviewPdf] = useState<{
    title: string;
    fileUrl: string;
    code?: string;
    description?: string;
  } | null>(null);

  // Sync state if URL query param changes
  useEffect(() => {
    const tabParam = searchParams?.get("tab");
    if (tabParam) {
      const tabConfig = getTabBySlugOrId(tabParam);
      setActiveTabId(tabConfig.id);
    }
  }, [searchParams]);

  const handleTabChange = (cat: typeof CITIZEN_TABS[0]) => {
    setActiveTabId(cat.id);
    const params = new URLSearchParams(searchParams?.toString() || "");
    params.set("tab", cat.slug);
    if (!searchQuery) params.delete("q");
    router.replace(`/${villageSlug}/services?${params.toString()}`, {
      scroll: false,
    });
  };

  const allServices =
    initialServices && initialServices.length > 0
      ? initialServices
      : ALL_CITIZEN_SERVICES;

  const currentCategoryMeta =
    CITIZEN_TABS.find((c) => c.id === activeTabId) || CITIZEN_TABS[0];
  const CategoryTabIcon = ICON_MAP[currentCategoryMeta.iconName] || FileText;

  // Filter services by active category & search query
  const activeServices = allServices.filter((svc) => {
    // Check if the service is one of our 10 official online application forms
    const isAppService = APPLICATION_SERVICES.some((a) => a.slug === svc.slug);

    let matchesCategory = false;
    if (activeTabId === "अर्ज") {
      matchesCategory = svc.category === "अर्ज" || !svc.category || isAppService;
    } else {
      matchesCategory = (svc.category === activeTabId || svc.category === currentCategoryMeta.label) && !isAppService;
    }

    if (!matchesCategory) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = svc.name?.toLowerCase().includes(q);
      const matchDesc = svc.description?.toLowerCase().includes(q);
      const matchSlug = svc.slug?.toLowerCase().includes(q);
      return matchName || matchDesc || matchSlug;
    }
    return true;
  });

  // Filter downloadable PDFs for active category
  const categoryPdfs = ALL_CITIZEN_PDFS.filter((p: any) => {
    if (activeTabId === "अर्ज") {
      return p.category === "अर्ज" || !p.category;
    }
    if (activeTabId === "कर भरणा") return p.category === "कर भरणा";
    if (activeTabId === "स्वयं घोषणापत्र") return p.category === "स्वयं घोषणापत्र" || p.category === "स्वयंघोषणापत्र";
    if (activeTabId === "दाखले") return p.category === "दाखले" || p.category === "दाखले नमुने";
    if (activeTabId === "तक्रार / सूचना") return p.category === "तक्रार / सूचना";
    return false;
  });

  return (
    <section
      id="citizen-services-section"
      className="space-y-6"
      aria-labelledby="citizen-services-heading"
    >
      {/* SEARCH AND FILTER BAR */}
      <div className="bg-[#F4EFE6] rounded-2xl p-4 border border-[#E5DEC9] flex flex-col sm:flex-row items-center gap-3 justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#707973] w-4 h-4 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="सेवा किंवा अर्ज शोधा (उदा. जन्म, बांधकाम, नमुना ८)..."
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-white text-xs border border-[#E5DEC9] focus:outline-none focus:ring-2 focus:ring-[#003625] text-[#1E2621] transition shadow-xs"
          />
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <span className="text-xs font-bold text-[#003625] bg-white px-3 py-2 rounded-xl border border-[#E5DEC9] flex items-center gap-1.5 shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#1E7E34]" />
            <span>
              {activeServices.length} {currentCategoryMeta.shortLabel} सेवा उपलब्ध
            </span>
          </span>
        </div>
      </div>

      {/* HORIZONTAL TABS ROW (Self-contained scroll, no page overflow) */}
      <div className="relative w-full max-w-full overflow-hidden">
        <div
          role="tablist"
          aria-label="नागरिक सेवा वर्गवारी"
          className="flex items-center gap-2 sm:gap-2.5 overflow-x-auto no-scrollbar py-1 px-1 scroll-smooth snap-x snap-mandatory"
        >
          {CITIZEN_TABS.map((cat, idx) => {
            const isActive = activeTabId === cat.id;
            const TabIcon = ICON_MAP[cat.iconName] || FileText;

            return (
              <button
                key={cat.id}
                role="tab"
                id={`tab-${tabListId}-${idx}`}
                aria-selected={isActive}
                aria-controls={`panel-${tabListId}-${idx}`}
                tabIndex={isActive ? 0 : -1}
                onClick={() => handleTabChange(cat)}
                className={`
                  shrink-0 snap-start flex items-center justify-center gap-2 sm:gap-2.5 
                  px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl border text-center transition-all duration-200
                  min-h-[46px] cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#003625] focus-visible:ring-offset-2
                  ${
                    isActive
                      ? "bg-[#003625] border-[#003625] text-white shadow-sm shadow-[#003625]/25 flex-1 min-w-[125px] sm:min-w-0 font-extrabold"
                      : "bg-white border-[#E5DEC9] text-[#1E2621] hover:bg-[#F4EFE6] hover:border-[#003625]/40 flex-1 min-w-[115px] sm:min-w-0 shadow-2xs font-bold"
                  }
                `}
              >
                <div
                  className={`
                    w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors
                    ${
                      isActive
                        ? "bg-white/15 text-[#F5D77F]"
                        : "bg-[#F4EFE6] text-[#003625]"
                    }
                  `}
                >
                  <TabIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>

                <span
                  className={`
                    text-xs sm:text-sm truncate leading-none
                    ${isActive ? "text-white font-extrabold" : "text-[#003625]"}
                  `}
                >
                  {cat.shortLabel || cat.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB CONTENT PANEL */}
      <div
        role="tabpanel"
        id={`panel-${tabListId}`}
        aria-labelledby={`tab-${tabListId}`}
        className="space-y-6 pt-1 focus:outline-none"
      >
        {/* Empty State when NEITHER online services nor PDFs exist */}
        {activeServices.length === 0 && categoryPdfs.length === 0 && (
          <div className="bg-white rounded-3xl p-8 sm:p-10 text-center border border-[#E5DEC9] shadow-xs space-y-4 animate-in fade-in-50 duration-200">
            <div className="w-14 h-14 rounded-2xl bg-[#F4EFE6] text-[#9e4300] flex items-center justify-center mx-auto">
              <CategoryTabIcon className="w-7 h-7" />
            </div>
            <div className="space-y-1 max-w-md mx-auto">
              <h4 className="text-base font-extrabold text-[#003625]">
                {searchQuery
                  ? "शोध परिणामात कोणतीही सेवा सापडली नाही"
                  : `${currentCategoryMeta.label} सेवा लवकरच उपलब्ध होत आहे`}
              </h4>
              <p className="text-xs text-[#526056] leading-relaxed">
                {searchQuery
                  ? `"${searchQuery}" शी जुळणारा अर्ज सापडला नाही. कृपया इतर शब्द वापरून शोधा.`
                  : "सदर विभागातील सेवा व अर्ज प्रणाली लवकरच सक्रिय केली जाईल. उपलब्ध अर्जांसाठी कृपया \"अर्ज\" टॅब तपासा."}
              </p>
            </div>
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery("")}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#003625] text-white text-xs font-bold hover:bg-[#00261a] transition cursor-pointer"
              >
                <span>सर्व सेवा दाखवा</span>
              </button>
            ) : (
              <button
                onClick={() => handleTabChange(CITIZEN_TABS[0])}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#003625] text-white text-xs font-bold hover:bg-[#00261a] transition shadow-xs cursor-pointer"
              >
                <span>उपलब्ध १० ऑनलाइन अर्ज पहा</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {/* 1. ONLINE DYNAMIC APPLICATION SERVICES */}
        {activeServices.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm sm:text-base font-extrabold text-[#003625] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#1E7E34]" />
                <span>
                  {currentCategoryMeta.label} - ऑनलाइन अर्ज ({activeServices.length})
                </span>
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3.5 sm:gap-4">
              {activeServices.map((svc) => {
                const IconComponent = ICON_MAP[svc.icon || ""] || FileText;
                const actionLabel =
                  svc.actionText || currentCategoryMeta.actionDefault || "ऑनलाइन अर्ज करा";

                return (
                  <div
                    key={svc._id?.toString() || svc.slug}
                    className="bg-white rounded-2xl p-4 sm:p-4.5 border border-[#E5DEC9] shadow-2xs hover:shadow-md hover:border-[#003625] transition-all duration-200 flex items-center justify-between gap-3 sm:gap-4 group relative overflow-hidden"
                  >
                    <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
                      {/* Icon container */}
                      <div className="w-11 h-11 rounded-xl bg-[#F4EFE6] text-[#003625] flex items-center justify-center shrink-0 group-hover:bg-[#003625] group-hover:text-white transition-colors shadow-2xs">
                        <IconComponent className="w-5 h-5" />
                      </div>

                      {/* Form Name Only */}
                      <h4 className="font-extrabold text-sm sm:text-base text-[#003625] leading-snug truncate">
                        {svc.name}
                      </h4>
                    </div>

                    {/* Action Button */}
                    <Link
                      href={`/${villageSlug}/services/${svc.slug}/apply`}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#9e4300] hover:bg-[#692b00] text-white text-xs font-bold transition-all shadow-xs group/btn active:scale-95 shrink-0"
                    >
                      <span>{actionLabel}</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 2. DOWNLOADABLE & PREVIEWABLE PDF TEMPLATES & FORMS */}
        {categoryPdfs.length > 0 && (
          <div className={`space-y-4 ${activeServices.length > 0 ? "pt-6 border-t border-[#E5DEC9]" : ""}`}>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="text-sm sm:text-base font-extrabold text-[#003625] flex items-center gap-2">
                <Download className="w-4 h-4 text-[#9e4300]" />
                <span>
                  {currentCategoryMeta.label} - विहित नमुना अर्ज व अधिकृत पीडीएफ फाइल्स ({categoryPdfs.length})
                </span>
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {categoryPdfs.map((pdf: any, idx: number) => {
                return (
                  <div
                    key={idx}
                    className="p-4 bg-white rounded-2xl border border-[#E5DEC9] shadow-2xs flex items-center justify-between gap-3 hover:border-[#003625] hover:shadow-md transition group/pdf relative"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-[#F4EFE6] text-[#003625] flex items-center justify-center shrink-0 group-hover/pdf:bg-[#003625] group-hover/pdf:text-white transition-colors">
                        <FileSpreadsheet className="w-5 h-5" />
                      </div>
                      <h5 className="font-extrabold text-xs sm:text-sm text-[#003625] leading-snug line-clamp-2">
                        {pdf.title}
                      </h5>
                    </div>

                    {/* Action Buttons: View in modal & Download */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() =>
                          setPreviewPdf({
                            title: pdf.title,
                            fileUrl: pdf.fileUrl,
                            code: pdf.code,
                          })
                        }
                        className="inline-flex items-center gap-1 text-xs font-bold text-[#003625] hover:text-[#9e4300] bg-[#F4EFE6] hover:bg-[#E5DEC9] px-2.5 sm:px-3 py-1.5 rounded-lg transition active:scale-95 cursor-pointer"
                        title="स्क्रीनवर पीडीएफ पहा"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#003625]" />
                        <span>पहा</span>
                      </button>

                      <a
                        href={pdf.fileUrl || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg text-[#526056] hover:text-[#003625] hover:bg-[#F4EFE6] transition"
                        title="नवीन विंडोमध्ये उघडा"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>

                      <a
                        href={`${pdf.fileUrl}${pdf.fileUrl?.includes("?") ? "&" : "?"}download=true`}
                        download
                        className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-lg bg-[#9e4300] hover:bg-[#692b00] text-white text-xs font-bold transition shadow-2xs active:scale-95"
                        title="पीडीएफ डाऊनलोड करा"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span className="hidden xs:inline">डाऊनलोड</span>
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* PDF PREVIEW MODAL */}
      {previewPdf && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in-50 duration-200"
          onClick={() => setPreviewPdf(null)}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-4xl h-[85vh] max-h-[850px] shadow-2xl border border-[#E5DEC9] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-[#E5DEC9] bg-[#F4EFE6] flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-[#003625] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-extrabold text-sm sm:text-base text-[#003625] truncate">
                    {previewPdf.title}
                  </h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-mono text-[#707973] uppercase">
                      {previewPdf.code || "PDF DOCUMENT"}
                    </span>
                    <span className="text-[10px] text-[#1E7E34] font-bold">
                      • ग्रामपंचायत अधिकृत नमुना
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={previewPdf.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#003625] bg-white px-3 py-1.5 rounded-xl border border-[#E5DEC9] hover:bg-[#FBF9F5] transition shadow-2xs"
                  title="नवीन टॅबमध्ये उघडा"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">नवीन टॅब</span>
                </a>

                <a
                  href={`${previewPdf.fileUrl}${previewPdf.fileUrl.includes("?") ? "&" : "?"}download=true`}
                  download
                  className="inline-flex items-center gap-1 text-xs font-bold text-white bg-[#9e4300] hover:bg-[#692b00] px-3.5 py-1.5 rounded-xl transition shadow-xs"
                  title="डाऊनलोड करा"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>डाऊनलोड</span>
                </a>

                <button
                  type="button"
                  onClick={() => setPreviewPdf(null)}
                  className="w-8 h-8 rounded-full bg-white hover:bg-red-50 text-[#1E2621] hover:text-red-600 border border-[#E5DEC9] flex items-center justify-center transition cursor-pointer"
                  title="बंद करा"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Body: PDF Iframe Viewer */}
            <div className="flex-1 bg-[#2C3437] relative flex flex-col">
              <iframe
                src={`${previewPdf.fileUrl}#toolbar=1&navpanes=0`}
                className="w-full h-full flex-1 border-0"
                title={previewPdf.title}
              />
              
              {/* Fallback bar if PDF iframe is blocked by mobile browsers */}
              <div className="bg-[#1E2621] text-white p-2.5 text-center text-xs flex items-center justify-center gap-3">
                <span className="text-[#A2ADA5]">
                  मोबाईलवर पीडीएफ लोड होत नसल्यास थेट उघडा:
                </span>
                <a
                  href={previewPdf.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#F5D77F] font-bold hover:underline inline-flex items-center gap-1"
                >
                  <span>थेट उघडा (Direct View)</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
