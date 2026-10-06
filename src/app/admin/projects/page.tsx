import { getAllVillages } from "@/lib/data-provider";
import { getProjectsAdmin } from "@/lib/actions/projects";
import { ProjectManagerClient } from "@/components/admin/ProjectManagerClient";
import { getAdminSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminProjectsPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  const villageSlug = session.villageSlug || "komalwadi";
  const [villages, projects] = await Promise.all([
    getAllVillages(),
    getProjectsAdmin(villageSlug),
  ]);

  return (
    <div className="space-y-6">
      <ProjectManagerClient
        initialProjects={projects}
        villages={JSON.parse(JSON.stringify(villages))}
        selectedVillageSlug={villageSlug}
      />
    </div>
  );
}
