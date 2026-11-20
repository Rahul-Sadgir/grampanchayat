"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Calendar,
  MapPin,
  ArrowRight,
  Search,
  Sparkles,
  Camera,
  Layers,
  ChevronRight,
  X,
} from "lucide-react";
import { formatMarathiDate } from "@/lib/date-utils";

interface EventItem {
  id: string;
  _id?: string;
  title: string;
  slug: string;
  category: string;
  summary?: string;
  content: string;
  location?: string;
  eventDate: string;
  event_date?: string;
  coverImage?: string;
  cover_image?: string;
  images?: Array<{ url: string; caption?: string }>;
  publishedAt?: string;
}

interface EventsExplorerClientProps {
  events: EventItem[];
  villageSlug: string;
  villageName: string;
}

export function EventsExplorerClient({
  events,
  villageSlug,
  villageName,
}: EventsExplorerClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("सर्व");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    events.forEach((e) => {
      if (e.category && e.category.trim()) {
        set.add(e.category.trim());
      }
    });
    return ["सर्व", ...Array.from(set)];
  }, [events]);

  // Filtered events based on search query & category
  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      const matchesCategory =
        selectedCategory === "सर्व" || e.category === selectedCategory;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        e.title.toLowerCase().includes(q) ||
        (e.summary && e.summary.toLowerCase().includes(q)) ||
        e.content.toLowerCase().includes(q) ||
        (e.location && e.location.toLowerCase().includes(q)) ||
        (e.category && e.category.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [events, selectedCategory, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Search and Category Filter Card */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 border border-[#E5DEC9] shadow-xs space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#707973] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="घडामोडी, उपक्रम, ग्रामसभा किंवा बातमी शोधा..."
            className="w-full pl-11 pr-10 py-3 rounded-2xl bg-[#FBF9F5] border border-[#E5DEC9] text-xs sm:text-sm text-[#003625] focus:outline-none focus:ring-2 focus:ring-[#003625] placeholder:text-[#88968d]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => {
            const count =
              cat === "सर्व"
                ? events.length
                : events.filter((e) => e.category === cat).length;
            const isSelected = selectedCategory === cat;

            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  isSelected
                    ? "bg-[#003625] text-white shadow-xs"
                    : "bg-[#F4EFE6] text-[#526056] hover:bg-[#EAE4D7] border border-[#E5DEC9]"
                }`}
              >
                <span>{cat}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isSelected ? "bg-white/20 text-[#F5D77F]" : "bg-white/80 text-[#526056]"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Count Header */}
      <div className="flex items-center justify-between text-xs text-[#526056] px-1">
        <span>
          एकूण <b>{filteredEvents.length}</b> घडामोडी उपलब्ध
          {selectedCategory !== "सर्व" && ` • वर्ग: ${selectedCategory}`}
        </span>
      </div>

      {/* Events Grid */}
      {filteredEvents.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 text-center border border-[#E5DEC9] space-y-3">
          <div className="w-12 h-12 rounded-full bg-[#F4EFE6] text-[#9e4300] flex items-center justify-center mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-[#003625] text-base">
            कोणतीही बातमी किंवा उपक्रम सापडला नाही
          </h3>
          <p className="text-xs text-[#526056] max-w-md mx-auto">
            कृपया वेगळा शब्द शोधून पहा किंवा वरील फिल्टरमधून &apos;सर्व&apos; पर्याय निवडा.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("सर्व");
            }}
            className="px-4 py-2 bg-[#003625] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-[#134e39] transition"
          >
            सर्व घडामोडी पहा
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredEvents.map((ev, idx) => {
            const rawDate = ev.eventDate || ev.event_date || ev.publishedAt;
            const dateInfo = formatMarathiDate(rawDate);
            const cover =
              ev.coverImage ||
              ev.cover_image ||
              (ev.images && ev.images[0]?.url) ||
              "/images/gallery/village-karyalay.webp";
            const imageCount = ev.images?.length || (ev.coverImage ? 1 : 0);

            return (
              <article
                key={ev.id || ev._id || idx}
                className="bg-white rounded-3xl border border-[#E5DEC9] overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between group"
              >
                {/* Image Cover */}
                <Link
                  href={`/${villageSlug}/events/${ev.slug || ev.id}`}
                  className="h-48 bg-[#F4EFE6] relative flex items-center justify-center text-[#003625] overflow-hidden block"
                >
                  <Image
                    src={cover}
                    alt={ev.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                  {/* Category Badge */}
                  <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-[#F5D77F] text-[#1E2621] text-[11px] font-extrabold shadow-sm">
                    {ev.category || "ग्राम उपक्रम"}
                  </div>

                  {/* Multiple Photos Badge */}
                  {imageCount > 1 && (
                    <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-black/65 backdrop-blur-xs text-white text-[11px] font-bold flex items-center gap-1 shadow-xs border border-white/20">
                      <Camera className="w-3.5 h-3.5 text-[#F5D77F]" />
                      <span>{imageCount} फोटो</span>
                    </div>
                  )}

                  {/* Date Badge */}
                  <div className="absolute bottom-3 left-3 flex items-center gap-1 text-[11px] font-medium text-white/95 bg-black/40 backdrop-blur-xs px-2.5 py-1 rounded-lg">
                    <Calendar className="w-3.5 h-3.5 text-[#F5D77F]" />
                    <span>{dateInfo.formatted}</span>
                  </div>
                </Link>

                {/* Content Area */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    {ev.location && (
                      <div className="flex items-center gap-1 text-[11px] text-[#9e4300] font-semibold">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{ev.location}</span>
                      </div>
                    )}

                    <Link href={`/${villageSlug}/events/${ev.slug || ev.id}`}>
                      <h3 className="font-extrabold text-base text-[#003625] leading-snug group-hover:text-[#9e4300] transition-colors line-clamp-2">
                        {ev.title}
                      </h3>
                    </Link>

                    <p className="text-xs text-[#526056] leading-relaxed line-clamp-3">
                      {ev.summary || ev.content}
                    </p>
                  </div>

                  {/* Footer Action */}
                  <div className="pt-3 border-t border-[#E5DEC9]/60 flex items-center justify-between">
                    <span className="text-[11px] text-[#707973] font-medium">
                      ग्रामपंचायत {villageName}
                    </span>

                    <Link
                      href={`/${villageSlug}/events/${ev.slug || ev.id}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#9e4300] hover:text-[#003625] transition"
                    >
                      <span>सविस्तर वाचा</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

