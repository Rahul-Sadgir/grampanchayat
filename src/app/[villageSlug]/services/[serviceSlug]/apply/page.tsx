import { getVillageBySlug, getServiceAndForm } from "@/lib/data-provider";
import { notFound } from "next/navigation";
import { DynamicFormRenderer } from "@/components/public/DynamicFormRenderer";
import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";

interface Props {
  params: Promise<{ villageSlug: string; serviceSlug: string }>;
}

export const dynamic = "force-dynamic";

export default async function ApplyServicePage({ params }: Props) {
  const { villageSlug, serviceSlug } = await params;

  const village = await getVillageBySlug(villageSlug);
  if (!village) notFound();

  const { service, schema } = await getServiceAndForm(village._id, serviceSlug);
  if (!service || !schema) notFound();

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      <Link
        href={`/${villageSlug}/services`}
        className="inline-flex items-center text-xs font-bold text-[#003625] gap-1.5 bg-white px-4 py-2 rounded-full border border-[#E5DEC9] shadow-xs hover:bg-[#F4EFE6] transition"
      >
        <ArrowLeft className="w-3.5 h-3.5 text-[#9e4300]" />
        <span>सर्व सेवांकडे परत जा</span>
      </Link>

      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#9e4300] bg-[#F4EFE6] px-2.5 py-0.5 rounded-full border border-[#E5DEC9]">
          <FileText className="w-3.5 h-3.5" />
          <span>{village.name} ग्रामपंचायत ऑनलाइन अर्ज</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#003625]">{service.name}</h2>
        <p className="text-xs sm:text-sm text-[#526056]">{service.description}</p>
      </div>

      <DynamicFormRenderer
        villageSlug={villageSlug}
        serviceSlug={serviceSlug}
        schema={schema}
      />
    </div>
  );
}