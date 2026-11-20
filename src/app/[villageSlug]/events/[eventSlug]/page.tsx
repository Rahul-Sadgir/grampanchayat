import { getVillageBySlug, getVillageEventBySlug, getVillageEvents } from "@/lib/data-provider";
import { formatMarathiDate } from "@/lib/date-utils";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Share2,
  Newspaper,
  ArrowRight,
  Sparkles,
  Building2,
} from "lucide-react";
import { EventGalleryClient } from "@/components/public/EventGalleryClient";

interface Props {
  params: Promise<{ villageSlug: string; eventSlug: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props) {
  const { villageSlug: rawVillageSlug, eventSlug: rawEventSlug } = await params;
  let villageSlug = rawVillageSlug;
  try {
    villageSlug = decodeURIComponent(rawVillageSlug);
  } catch {}
  let eventSlug = rawEventSlug;
  try {
    eventSlug = decodeURIComponent(rawEventSlug);
  } catch {}

  const village = await getVillageBySlug(villageSlug);
  if (!village) return {};

  const event = await getVillageEventBySlug(village.slug, eventSlug);
  if (!event) return { title: `घडामोड आढळली नाही | ग्रामपंचायत ${village.name}` };

  return {
    title: `${event.title} | ग्रामपंचायत ${village.name}`,
    description: event.summary || event.content?.slice(0, 160),
    openGraph: {
      title: event.title,
      description: event.summary || event.content?.slice(0, 160),
      images: event.coverImage ? [event.coverImage] : [],
    },
  };
}

export default async function SingleEventPostPage({ params }: Props) {
  const { villageSlug: rawVillageSlug, eventSlug: rawEventSlug } = await params;
  let villageSlug = rawVillageSlug;
  try {
    villageSlug = decodeURIComponent(rawVillageSlug);
  } catch {}
  let eventSlug = rawEventSlug;
  try {
    eventSlug = decodeURIComponent(rawEventSlug);
  } catch {}

  const village = await getVillageBySlug(villageSlug);
  if (!village) notFound();

  const event = await getVillageEventBySlug(village.slug, eventSlug);
  if (!event) notFound();

  // Fetch other recent events for recommendations
  const allEvents = await getVillageEvents(village.slug);
  const otherEvents = allEvents
    .filter((e: any) => e.id !== event.id && e.slug !== event.slug)
    .slice(0, 3);

  const rawDate = event.eventDate || event.event_date || event.publishedAt;
  const dateInfo = formatMarathiDate(rawDate);
  const images = event.images || [];

  // Split content into clean paragraphs
  const paragraphs = (event.content || "")
    .split(/\n\s*\n|\n/)
    .map((p: string) => p.trim())
    .filter((p: string) => p.length > 0);

  const shareText = `*${event.title}*\n\nग्रामपंचायत ${village.name} अधिकृत वृत्त:\n${event.summary || ""}\n\nसविस्तर वाचा:`;

  return (
    <article className="max-w-4xl mx-auto px-4 py-6 sm:py-10 space-y-8">
      {/* Navigation Breadcrumbs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href={`/${villageSlug}/events`}
          className="inline-flex items-center text-xs font-bold text-[#003625] gap-1.5 bg-white px-4 py-2 rounded-full border border-[#E5DEC9] shadow-xs hover:bg-[#F4EFE6] transition"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#9e4300]" />
          <span>सर्व घडामोडी व उपक्रमांकडे परत जा</span>
        </Link>

        <span className="text-xs font-bold text-[#526056] bg-[#F4EFE6] px-3.5 py-1.5 rounded-full border border-[#E5DEC9]">
          ग्रामपंचायत {village.name}
        </span>
      </div>

      {/* Main Blog Post Card */}
      <div className="bg-white rounded-3xl border border-[#E5DEC9] shadow-sm overflow-hidden p-6 sm:p-10 space-y-6">
        {/* Header Metadata */}
        <div className="space-y-3 border-b border-[#E5DEC9]/60 pb-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-[#F5D77F] text-[#1E2621] text-xs font-black shadow-xs">
              {event.category || "ग्राम उपक्रम"}
            </span>

            <span className="flex items-center gap-1.5 text-xs text-[#526056] bg-[#FBF9F5] px-3 py-1 rounded-full border border-[#E5DEC9]">
              <Calendar className="w-3.5 h-3.5 text-[#9e4300]" />
              <b>दिनांक:</b> {dateInfo.formatted}
            </span>

            {event.location && (
              <span className="flex items-center gap-1.5 text-xs text-[#526056] bg-[#FBF9F5] px-3 py-1 rounded-full border border-[#E5DEC9]">
                <MapPin className="w-3.5 h-3.5 text-[#003625]" />
                <span>{event.location}</span>
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#003625] leading-tight tracking-tight">
            {event.title}
          </h1>

          {event.summary && (
            <p className="text-sm sm:text-base text-[#526056] font-medium leading-relaxed bg-[#FBF9F5] p-4 rounded-2xl border-l-4 border-[#003625]">
              {event.summary}
            </p>
          )}
        </div>

        {/* Hero Cover Image (if available) */}
        {event.coverImage && (
          <div className="relative h-64 sm:h-96 w-full rounded-2xl overflow-hidden border border-[#E5DEC9]">
            <Image
              src={event.coverImage}
              alt={event.title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 896px) 100vw, 896px"
            />
          </div>
        )}

        {/* Blog Post Detailed Content */}
        <div className="space-y-4 text-[#1E2621] text-sm sm:text-base leading-relaxed font-sans">
          {paragraphs.map((p: string, idx: number) => (
            <p key={idx} className="whitespace-pre-line">
              {p}
            </p>
          ))}
        </div>

        {/* Multiple Images Gallery */}
        {images.length > 0 && (
          <div className="pt-6 border-t border-[#E5DEC9]">
            <EventGalleryClient images={images} title={event.title} />
          </div>
        )}

        {/* Share and Official Authority Footer */}
        <div className="pt-6 border-t border-[#E5DEC9] flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FBF9F5] -mx-6 sm:-mx-10 -mb-6 sm:-mb-10 p-6 sm:p-8">
          <div className="space-y-0.5">
            <p className="text-xs font-bold text-[#003625]">
              प्रसिद्धी: ग्रामपंचायत प्रशासन कार्यालय, {village.name}
            </p>
            <p className="text-[11px] text-[#526056]">
              सिन्नर, जिल्हा नाशिक • अधिकृत डिजिटल ग्राम पोर्टल
            </p>
          </div>

          <a
            href={`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-slate-950 font-black text-xs transition shadow-xs shrink-0 cursor-pointer"
          >
            <Share2 className="w-4 h-4 text-slate-950" />
            <span>व्हॉट्सॲपवर शेअर करा</span>
          </a>
        </div>
      </div>

      {/* Related Events Section */}
      {otherEvents.length > 0 && (
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-extrabold text-[#003625] flex items-center gap-1.5">
              <Newspaper className="w-4 h-4 text-[#9e4300]" />
              <span>गावातील इतर ताज्या घडामोडी</span>
            </h3>
            <Link
              href={`/${villageSlug}/events`}
              className="text-xs font-bold text-[#9e4300] hover:underline"
            >
              सर्व पहा →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {otherEvents.map((oe: any) => {
              const oDate = formatMarathiDate(oe.eventDate || oe.event_date);
              const cover = oe.coverImage || (oe.images && oe.images[0]?.url) || "/images/gallery/village-karyalay.webp";
              return (
                <Link
                  key={oe.id}
                  href={`/${villageSlug}/events/${oe.slug || oe.id}`}
                  className="bg-white rounded-2xl border border-[#E5DEC9] overflow-hidden shadow-2xs hover:shadow-md transition p-3.5 space-y-2.5 flex flex-col justify-between group"
                >
                  <div className="relative h-28 w-full rounded-xl overflow-hidden bg-slate-100">
                    <Image
                      src={cover}
                      alt={oe.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-[#707973] font-medium block">
                      {oDate.formatted}
                    </span>
                    <h4 className="font-bold text-xs text-[#003625] line-clamp-2 leading-snug group-hover:text-[#9e4300] transition-colors mt-0.5">
                      {oe.title}
                    </h4>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </article>
  );
}

