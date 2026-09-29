import { getAllVillages } from "@/lib/data-provider";
import { getProjectsAdmin } from "@/lib/actions/projects";
import { ProjectManagerClient } from "@/components/admin/ProjectManagerClient";

export const dynamic = "force-dynamic";

export default async function AdminProjectsPage() {
  const [villages, projects] = await Promise.all([
    getAllVillages(),
    getProjectsAdmin(),
  ]);

  return (
    <div className="space-y-6">
      <ProjectManagerClient
        initialProjects={projects}
        villages={JSON.parse(JSON.stringify(villages))}
      />
    </div>
  );
}
