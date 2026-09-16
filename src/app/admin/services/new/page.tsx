import { connectDB } from "@/lib/mongodb";
import { Village } from "@/models/Village";
import { NewServiceFormClient } from "./NewServiceFormClient";

export const dynamic = "force-dynamic";

export default async function NewServicePage() {
  await connectDB();
  const villagesRaw = await Village.find().sort({ name: 1 }).lean();
  
  const villages = villagesRaw.map((v: any) => ({
    _id: v._id.toString(),
    name: v.name,
    slug: v.slug,
  }));

  return <NewServiceFormClient villages={villages} />;
}