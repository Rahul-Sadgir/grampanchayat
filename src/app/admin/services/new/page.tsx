import { getAllVillages } from "@/lib/data-provider";
import { NewServiceFormClient } from "./NewServiceFormClient";
import { getAdminSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function NewServicePage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  const villagesRaw = await getAllVillages();
  const villageSlug = session.villageSlug || "komalwadi";
  const matching = villagesRaw.filter((v: any) => v.slug === villageSlug);
  const target = matching.length > 0 ? matching : [villagesRaw[0]];

  const villages = target.map((v: any) => ({
    _id: v._id.toString(),
    name: v.name,
    slug: v.slug,
  }));

  return <NewServiceFormClient villages={villages} />;
}