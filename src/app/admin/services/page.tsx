import { connectDB } from "@/lib/mongodb";
import { Service } from "@/models/Service";
import { Village } from "@/models/Village";
import { ServiceManagerClient } from "@/components/admin/ServiceManagerClient";

export const dynamic = "force-dynamic";

export default async function AdminServicesPage() {
  await connectDB();

  let villages = await Village.find().select("name slug").lean();
  if (villages.length === 0) {
    villages = [
      { _id: "1", name: "कोमलवाडी", slug: "komalwadi" },
      { _id: "2", name: "गुळवंच", slug: "gulwanch" },
      { _id: "3", name: "माझगाव", slug: "mazagaon" },
    ] as any[];
  }

  const services = await Service.find()
    .populate("villageId", "name slug")
    .sort({ order: 1, createdAt: -1 })
    .lean();

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
