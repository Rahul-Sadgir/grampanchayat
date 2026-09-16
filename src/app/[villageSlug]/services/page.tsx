import { getVillageBySlug, getVillageServices } from "@/lib/data-provider";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { CitizenServicesTabbed } from "@/components/public/CitizenServicesTabbed";
import {
  ArrowLeft,
  BadgeCheck,
} from "lucide-react";

interface Props {
  params: Promise<{ villageSlug: string }>;
  searchParams: Promise<{ tab?: string; q?: string }>;
}

export const revalidate = 300;

export default async function ServicesPage({ params, searchParams }: Props) {
  const { villageSlug } = await params;
  const { tab, q } = await searchParams;

  const village = await getVillageBySlug(villageSlug);
  if (!village) notFound();

  const services = await getVillageServices(village._id, village.slug);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 sm:py-8 space-y-6 sm:space-y-8">
      {/* Top Navigation / Breadcrumb */}
      <div className="flex items-center justify-between gap-3">
        <Link
          href={`/${villageSlug}`}
          className="inline-flex items-center text-xs font-bold text-[#003625] gap-1.5 bg-white px-4 py-2 rounded-full border border-[#E5DEC9] shadow-2xs hover:bg-[#F4EFE6] transition active:scale-95"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#9e4300]" />
          <span>मुख्यपृष्ठावर परत जा</span>
        </Link>

        <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#526056]">
          <Link href={`/${villageSlug}`} className="hover:underline">
            {village.name}
          </Link>
          <span>/</span>
          <span className="font-bold text-[#003625]">नागरिक सेवा केंद्र</span>
        </div>
      </div>

      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#003625] tracking-tight">
          नागरिक सेवा
        </h1>
      </div>

      {/* Tabbed Interactive Service Center */}
      <Suspense
        fallback={
          <div className="p-8 text-center bg-white rounded-3xl border border-[#E5DEC9] text-[#526056] text-xs">
            सेवा लोड होत आहेत...
          </div>
        }
      >
        <CitizenServicesTabbed
          villageSlug={villageSlug}
          initialServices={JSON.parse(JSON.stringify(services))}
          initialTab={tab || "aarz"}
          initialQuery={q || ""}
        />
      </Suspense>
    </div>
  );
}