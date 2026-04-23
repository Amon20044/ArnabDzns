import { ContentDashboardClient } from "@/components/admin/content-dashboard-client";
import { listContentBlocks } from "@/db/content";

export const runtime = "nodejs";

export default async function DashboardContentPage() {
  const blocks = await listContentBlocks();

  return <ContentDashboardClient initialBlocks={blocks} />;
}
