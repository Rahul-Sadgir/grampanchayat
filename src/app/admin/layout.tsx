import { getAdminSession, logoutAdminAction } from "@/lib/auth";
import { queryOne } from "@/lib/db";
import { AdminSidebarClient } from "@/components/admin/AdminSidebarClient";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();

  // If unauthenticated (e.g., on /admin/login), render children without the sidebar
  if (!session) {
    return (
      <div className="min-h-screen bg-slate-100 text-slate-900 font-sans">
        {children}
      </div>
    );
  }

  const villageSlug = session.villageSlug || "komalwadi";
  const villageName = session.villageName || "कोमलवाडी";

  let pendingCount = 0;
  try {
    const res = await queryOne(
      `SELECT COUNT(*) as cnt 
       FROM applications 
       WHERE LOWER(village_slug) = LOWER($1) 
         AND status IN ('SUBMITTED', 'UNDER_REVIEW')`,
      [villageSlug]
    );
    pendingCount = Number(res?.cnt || 0);
  } catch {
    pendingCount = 0;
  }

  return (
    <AdminSidebarClient
      session={{
        name: session.name,
        email: session.email,
        role: session.role,
        villageSlug,
        villageName,
      }}
      pendingCount={pendingCount}
      logoutAction={logoutAdminAction}
    >
      {children}
    </AdminSidebarClient>
  );
}
