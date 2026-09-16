import { getAllVillages } from "@/lib/data-provider";
import { VillageManagerClient } from "@/components/admin/VillageManagerClient";

export const dynamic = "force-dynamic";

export default async function AdminVillagesPage() {
  const rawVillages = await getAllVillages();

  const villages = rawVillages.map((v: any) => ({
    _id: v._id.toString(),
    name: v.name,
    slug: v.slug,
    taluka: v.taluka,
    district: v.district,
    state: v.state,
    description: v.description,
    phone: v.phone,
    email: v.email,
    address: v.address,
    coverImage: v.coverImage || "/images/panoramic-landscape.png",
    galleryImages: v.galleryImages || [],
  }));

  return (
    <div className="space-y-8">
      <VillageManagerClient villages={villages} />
    </div>
  );
}