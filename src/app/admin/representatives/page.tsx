import { connectDB } from "@/lib/mongodb";
import { Village } from "@/models/Village";
import { getRepresentativesByVillage } from "@/lib/actions/representatives";
import { RepresentativeManagerClient } from "@/components/admin/RepresentativeManagerClient";
import { getVillageBySlug } from "@/lib/data-provider";

export const dynamic = "force-dynamic";

export default async function AdminRepresentativesPage() {
  await connectDB();

  let villages = await Village.find().select("name slug").lean();

  if (villages.length === 0) {
    villages = [
      { _id: "1", name: "कोमलवाडी", slug: "komalwadi" },
      { _id: "2", name: "गुळवंच", slug: "gulwanch" },
      { _id: "3", name: "माझगाव", slug: "mazagaon" },
    ] as any[];
  }

  const initialRepresentatives = await getRepresentativesByVillage("ALL");

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
