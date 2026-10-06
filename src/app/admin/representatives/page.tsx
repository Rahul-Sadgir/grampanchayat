import { getAllVillages } from "@/lib/data-provider";
import { getRepresentativesByVillage } from "@/lib/actions/representatives";
import { RepresentativeManagerClient } from "@/components/admin/RepresentativeManagerClient";
import { getAdminSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminRepresentativesPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  const villageSlug = session.villageSlug || "komalwadi";
  const [villages, initialRepresentatives] = await Promise.all([
    getAllVillages(),
    getRepresentativesByVillage(villageSlug),
  ]);

  return (
    <RepresentativeManagerClient
      initialRepresentatives={initialRepresentatives}
      villages={villages.map((v: any) => ({
        name: v.name,
        slug: v.slug,
      }))}
      selectedVillageSlug={villageSlug}
    />
  );
}
