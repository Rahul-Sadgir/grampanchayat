import { queryMany } from "@/lib/db";
import { getAllVillages } from "@/lib/data-provider";
import { ServiceManagerClient } from "@/components/admin/ServiceManagerClient";
import { getAdminSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminServicesPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  const villages = await getAllVillages();
  const villageSlug = session.villageSlug || "komalwadi";

  let services: any[] = [];
  try {
    services = await queryMany(
      `SELECT s.*, v.name as village_name, v.slug as village_slug_resolved
       FROM services s
       LEFT JOIN villages v ON s.village_id = v.id
       WHERE LOWER(s.village_slug) = LOWER($1)
       ORDER BY s.created_at ASC`,
      [villageSlug]
    );
  } catch (e) {
    console.warn("[AdminServicesPage] PostgreSQL DB query failed:", e);
  }

  const formattedServices = services.map((s: any) => ({
    _id: (s.id || s._id).toString(),
    id: (s.id || s._id).toString(),
    name: s.name,
    slug: s.slug,
    description: s.description || "",
    category: s.category || "दाखले",
    tabCategory: s.tabCategory || "aarz",
    icon: s.icon || "FileText",
    fileUrl: s.fileUrl || "",
    fileName: s.fileName || "",
    isPdfOnly: Boolean(s.isPdfOnly),
    order: s.order || 0,
    isActive: s.isActive !== false,
    villageSlug: s.villageSlug || s.villageSlugResolved || "komalwadi",
    villageName: s.villageName || "—",
  }));

  return (
    <ServiceManagerClient
      initialServices={formattedServices}
      villages={villages.map((v: any) => ({
        name: v.name,
        slug: v.slug,
      }))}
      selectedVillageSlug={villageSlug}
    />
  );
}
