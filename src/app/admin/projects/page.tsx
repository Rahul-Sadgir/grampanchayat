import { connectDB } from "@/lib/mongodb";
import { Village } from "@/models/Village";
import { getProjectsAdmin } from "@/lib/actions/projects";
import { ProjectManagerClient } from "@/components/admin/ProjectManagerClient";

export const dynamic = "force-dynamic";

export default async function AdminProjectsPage() {
  await connectDB();
  const [villages, projects] = await Promise.all([
    Village.find().sort({ name: 1 }).lean(),
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
