import { getVillageBySlug, getVillageEvents } from "@/lib/data-provider";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Newspaper, Calendar, Sparkles } from "lucide-react";
import { EventsExplorerClient } from "@/components/public/EventsExplorerClient";

interface Props {
  params: Promise<{ villageSlug: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props) {
  const { villageSlug: rawSlug } = await params;
  let villageSlug = rawSlug;
  try {
    villageSlug = decodeURIComponent(rawSlug);
  } catch {}
  const village = await getVillageBySlug(villageSlug);
  if (!village) return {};

  return {
    title: `गावातील घडामोडी, उपक्रम व कार्यक्रम | ग्रामपंचायत ${village.name}`,
    description: `ग्रामपंचायत ${village.name} मधील सर्व ताज्या घडामोडी, वार्षिक ग्रामसभा, विकास उपक्रम, आरोग्य शिबिरे व सण-उत्सवांची सविस्तर माहिती.`,
  };
}

export default async function VillageEventsPage({ params }: Props) {
  const { villageSlug: rawSlug } = await params;
  let villageSlug = rawSlug;
  try {
    villageSlug = decodeURIComponent(rawSlug);
  } catch {}
  const village = await getVillageBySlug(villageSlug);
  if (!village) notFound();

  const events = await getVillageEvents(village.slug);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 sm:py-10 space-y-8">
      {/* Back Button */}
      <div className="flex items-center justify-between">
        <Link
          href={`/${villageSlug}`}
          className="inline-flex items-center text-xs font-bold text-[#003625] gap-1.5 bg-white px-4 py-2 rounded-full border border-[#E5DEC9] shadow-xs hover:bg-[#F4EFE6] transition"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#9e4300]" />
          <span>मुख्यपृष्ठावर परत जा</span>
        </Link>

        <span className="text-xs font-bold text-[#526056] bg-[#F4EFE6] px-3 py-1 rounded-full border border-[#E5DEC9]">
          गाव: {village.name}
        </span>
      </div>

      {/* Hero Header Banner */}
      <div className="bg-gradient-to-r from-[#003625] to-[#134e39] text-white p-6 sm:p-10 rounded-3xl shadow-sm border border-[#00261a] space-y-3 relative overflow-hidden">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F5D77F]/20 text-[#F5D77F] text-xs font-bold border border-[#F5D77F]/30">
          <Newspaper className="w-3.5 h-3.5 text-[#F5D77F]" />
          <span>अधिकृत वृत्त व लोकसहभाग मंच</span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
          गावातील हालचाली, उपक्रम व कार्यक्रम
        </h1>

        <p className="text-xs sm:text-sm text-emerald-100 max-w-2xl leading-relaxed">
          ग्रामपंचायत {village.name} द्वारे राबवले जाणारे लोकोपयोगी विकास उपक्रम, ग्रामसभांचे ठराव, सामाजिक उपक्रम, आरोग्य शिबिरे व सण-उत्सवांचा संपूर्ण सचित्र वृत्तांत.
        </p>

        {/* Ambient Decorative Graphic */}
        <div className="absolute right-4 -bottom-6 opacity-10 pointer-events-none">
          <Sparkles className="w-48 h-48 text-[#F5D77F]" />
        </div>
      </div>

      {/* Client-side Explorer with Search & Category Filters */}
      <EventsExplorerClient
        events={events}
        villageSlug={village.slug}
        villageName={village.name}
      />
    </div>
  );
}

