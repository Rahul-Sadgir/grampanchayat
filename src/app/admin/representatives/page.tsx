import { getAllVillages } from "@/lib/data-provider";
import { getRepresentativesByVillage } from "@/lib/actions/representatives";
import { RepresentativeManagerClient } from "@/components/admin/RepresentativeManagerClient";

export const dynamic = "force-dynamic";

export default async function AdminRepresentativesPage() {
  const [villages, initialRepresentatives] = await Promise.all([
    getAllVillages(),
    getRepresentativesByVillage("ALL"),
  ]);

  return (
    <RepresentativeManagerClient
      initialRepresentatives={initialRepresentatives}
      villages={villages.map((v: any) => ({
        name: v.name,
        slug: v.slug,
      }))}
      selectedVillageSlug="ALL"
    />
  );
}
