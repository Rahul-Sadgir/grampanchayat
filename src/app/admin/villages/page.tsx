import { getAllVillages } from "@/lib/data-provider";
import { VillageManagerClient } from "@/components/admin/VillageManagerClient";
import { getAdminSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getRtiSpendings } from "@/lib/actions/rti";

export const dynamic = "force-dynamic";

export default async function AdminVillagesPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  const rawVillages = await getAllVillages();
  const villageSlug = session.villageSlug || "komalwadi";
  const initialRtiSpendings = await getRtiSpendings(villageSlug);

  // Filter strictly to the single logged-in village
  const matchingVillages = rawVillages.filter((v: any) => v.slug === villageSlug);
  const targetVillages = matchingVillages.length > 0 ? matchingVillages : [rawVillages[0]];

  const villages = targetVillages.map((v: any) => ({
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
    coverImage: v.coverImage
      ? v.coverImage.replace(/\.(png|jpg|jpeg)$/i, ".webp")
      : "/images/panoramic-landscape.webp",
    galleryImages: (v.galleryImages || []).map((img: any) =>
      typeof img === "string"
        ? img.replace(/\.(png|jpg|jpeg)$/i, ".webp")
        : { ...img, url: img.url?.replace(/\.(png|jpg|jpeg)$/i, ".webp") }
    ),
    // Demographics & Stats (Purely from database)
    population: v.population || "—",
    malePopulation: v.malePopulation || "—",
    femalePopulation: v.femalePopulation || "—",
    households: v.households || "—",
    wards: v.wards || "—",
    area: v.area || "—",
    literacyRate: v.literacyRate || "—",
    femaleLiteracy: v.femaleLiteracy || "—",
    schools: v.schools || "—",
    distanceFromTaluka: v.distanceFromTaluka || "—",
    distanceFromDistrict: v.distanceFromDistrict || "—",
    // Leadership & Pride
    sarpanchMessage: v.sarpanchMessage || "",
    speciality: v.speciality || "डिजिटल आदर्श स्मार्ट ग्राम",
    highlightNotice: v.highlightNotice || "",
    visionPoints: v.visionPoints || [],
    prideHighlights: v.prideHighlights || [],
  }));

  return (
    <div className="space-y-8">
      <VillageManagerClient
        villages={villages}
        initialRtiSpendings={initialRtiSpendings}
      />
    </div>
  );
}
