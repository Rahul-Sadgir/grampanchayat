import { connectDB } from "@/lib/mongodb";
import { getSchemesAdmin } from "@/lib/actions/schemes";
import { SchemeManagerClient } from "@/components/admin/SchemeManagerClient";

export const dynamic = "force-dynamic";

export default async function AdminSchemesPage() {
  await connectDB();
  const schemes = await getSchemesAdmin();

  return (
    <div className="space-y-6">
      <SchemeManagerClient initialSchemes={schemes} />
    </div>
  );
}
