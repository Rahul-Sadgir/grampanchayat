import { getAllVillages } from "@/lib/data-provider";
import { getEventsAdmin } from "@/lib/actions/events";
import { EventManagerClient } from "@/components/admin/EventManagerClient";
import { getAdminSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminEventsPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  const villageSlug = session.villageSlug || "komalwadi";
  const [villages, events] = await Promise.all([
    getAllVillages(),
    getEventsAdmin(villageSlug),
  ]);

  return (
    <EventManagerClient
      initialEvents={events}
      villages={villages.map((v: any) => ({
        name: v.name,
        slug: v.slug,
      }))}
      selectedVillageSlug={villageSlug}
    />
  );
}

