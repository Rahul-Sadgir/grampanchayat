import { getAllVillages } from "@/lib/data-provider";
import { NewServiceFormClient } from "./NewServiceFormClient";

export const dynamic = "force-dynamic";

export default async function NewServicePage() {
  const villagesRaw = await getAllVillages();
  
  const villages = villagesRaw.map((v: any) => ({
    _id: v._id.toString(),
    name: v.name,
    slug: v.slug,
  }));

  return <NewServiceFormClient villages={villages} />;
}