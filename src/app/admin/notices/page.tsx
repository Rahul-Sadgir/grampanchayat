import { connectDB } from "@/lib/mongodb";
import { Village } from "@/models/Village";
import { getNoticesAdmin } from "@/lib/actions/notices";
import { NoticeManagerClient } from "@/components/admin/NoticeManagerClient";

export const dynamic = "force-dynamic";

export default async function AdminNoticesPage() {
  await connectDB();

  let villages = await Village.find().select("name slug").lean();
  if (villages.length === 0) {
    villages = [
      { _id: "1", name: "कोमलवाडी", slug: "komalwadi" },
      { _id: "2", name: "गुळवंच", slug: "gulwanch" },
      { _id: "3", name: "माझगाव", slug: "mazagaon" },
    ] as any[];
  }

  const notices = await getNoticesAdmin("ALL");

  return (
    <NoticeManagerClient
      initialNotices={notices}
      villages={villages.map((v: any) => ({
        name: v.name,
        slug: v.slug,
      }))}
    />
  );
}
