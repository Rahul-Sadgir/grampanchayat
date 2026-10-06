import { connectDB } from "@/lib/mongodb";
import { getSchemesAdmin } from "@/lib/actions/schemes";
import { SchemeManagerClient } from "@/components/admin/SchemeManagerClient";
import { getAdminSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminSchemesPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  await connectDB();
  const schemes = await getSchemesAdmin();

  return (
    <div className="space-y-6">
      <SchemeManagerClient initialSchemes={schemes} />
    </div>
  );
}
