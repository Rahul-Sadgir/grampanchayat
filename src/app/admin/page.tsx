import { getAdminSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminRootPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }
  redirect("/admin/dashboard");
}
