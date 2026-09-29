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
    coverImage: (v.coverImage ? v.coverImage.replace(/\.(png|jpg|jpeg)$/i, ".webp") : "/images/panoramic-landscape.webp"),
    galleryImages: (v.galleryImages || []).map((img: string) => img.replace(/\.(png|jpg|jpeg)$/i, ".webp")),
  }));

  return (
    <div className="space-y-8">
      <VillageManagerClient villages={villages} />
    </div>
  );
}