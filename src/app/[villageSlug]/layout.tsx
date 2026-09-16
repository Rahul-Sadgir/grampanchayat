import { getVillageBySlug } from "@/lib/data-provider";
import { notFound } from "next/navigation";
import { Header } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";
import { MobileBottomNav } from "@/components/public/MobileBottomNav";

export const dynamic = "force-dynamic";

export default async function VillageLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ villageSlug: string }>;
}) {
  const { villageSlug } = await params;
  const village = await getVillageBySlug(villageSlug);

  if (!village) notFound();

  return (
    <div className="min-h-screen flex flex-col bg-transparent text-slate-900">
      <Header
        village={{
          name: village.name,
          slug: village.slug,
          taluka: village.taluka,
          district: village.district,
          phone: village.phone,
        }}
      />
      <main className="flex-1">{children}</main>
      <Footer
        village={{
          name: village.name,
          slug: village.slug,
          taluka: village.taluka,
          district: village.district,
          address: village.address,
          phone: village.phone,
          email: village.email,
        }}
      />
      <MobileBottomNav villageSlug={village.slug} />
    </div>
  );
}