import { connectDB } from "@/lib/mongodb";
import { Service } from "@/models/Service";
import { getAllVillages, FALLBACK_SERVICES } from "@/lib/data-provider";
import { ServiceManagerClient } from "@/components/admin/ServiceManagerClient";

export const dynamic = "force-dynamic";

export default async function AdminServicesPage() {
  const conn = await connectDB();
  const villages = await getAllVillages();

  let services: any[] = [];
  if (conn) {
    try {
      services = await Service.find()
        .populate("villageId", "name slug")
        .sort({ order: 1, createdAt: -1 })
        .lean();
    } catch (e) {
      console.warn("[AdminServicesPage] DB query failed, using fallback:", e);
    }
  }

  if (services.length === 0) {
    services = FALLBACK_SERVICES.map((s) => ({
      _id: s.slug,
      name: s.name,
      slug: s.slug,
      description: s.description || "",
      category: s.category || "दाखले",
      tabCategory: "aarz",
      icon: s.icon || "FileText",
      fileUrl: "",
      fileName: "",
      isPdfOnly: false,
      order: 1,
      isActive: true,
      villageSlug: "komalwadi",
      villageName: "कोमलवाडी",
    }));
  }

  const formattedServices = services.map((s: any) => ({
    _id: s._id.toString(),
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
    villageSlug: s.villageSlug || s.villageId?.slug || "komalwadi",
    villageName: s.villageId?.name || s.villageSlug || "—",
  }));

  return (
    <ServiceManagerClient
      initialServices={formattedServices}
      villages={villages.map((v: any) => ({
        name: v.name,
        slug: v.slug,
      }))}
    />
  );
}
