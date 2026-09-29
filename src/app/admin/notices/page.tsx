import { getAllVillages } from "@/lib/data-provider";
import { getNoticesAdmin } from "@/lib/actions/notices";
import { NoticeManagerClient } from "@/components/admin/NoticeManagerClient";

export const dynamic = "force-dynamic";

export default async function AdminNoticesPage() {
  const [villages, notices] = await Promise.all([
    getAllVillages(),
    getNoticesAdmin("ALL"),
  ]);

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
