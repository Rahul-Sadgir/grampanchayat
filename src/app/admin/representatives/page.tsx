import { getAllVillages, getVillageBySlug } from "@/lib/data-provider";
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
  const [villages, initialRepresentatives, currentVillage] = await Promise.all([
    getAllVillages(),
    getRepresentativesByVillage(villageSlug),
    getVillageBySlug(villageSlug),
  ]);

  return (
    <RepresentativeManagerClient
      initialRepresentatives={initialRepresentatives}
      villages={villages.map((v: any) => ({
        name: v.name,
        slug: v.slug,
      }))}
      selectedVillageSlug={villageSlug}
      initialGovernanceStatus={{
        isUnderAdministrativeRule: Boolean(
          currentVillage?.isUnderAdministrativeRule ?? currentVillage?.is_under_administrative_rule
        ),
        administratorName: currentVillage?.administratorName || "श्री. आर. एस. पाटील",
        administratorRole: currentVillage?.administratorRole || "शासन नियुक्त प्रशासक (विस्तार अधिकारी)",
        administratorPhone: currentVillage?.administratorPhone || "९८२३५५६६७७",
        administratorEmail: currentVillage?.administratorEmail || "gpkomalwadi@gmail.com",
        administratorOrderDetails:
          currentVillage?.administratorOrderDetails ||
          "महाराष्ट्र ग्रामपंचायत अधिनियम व जिल्हा परिषद नाशिक आदेशानुसार कोमलवाडी ग्रामपंचायतीचा कारभार प्रशासकामार्फत चालविला जात आहे.",
        administratorPhotoUrl: currentVillage?.administratorPhotoUrl || "/images/emblem.webp",
      }}
    />
  );
}
