import { ContentDashboardClient } from "@/components/admin/content-dashboard-client";
import { isContentBlockKey, listContentBlocks } from "@/db/content";
import type { ContentBlockKey } from "@/db/models/content-block";

export const runtime = "nodejs";

type DashboardContentPageProps = {
  searchParams: Promise<{
    section?: string | string[];
  }>;
};

export default async function DashboardContentPage(
  props: DashboardContentPageProps,
) {
  const searchParams = await props.searchParams;
  const blocks = await listContentBlocks();
  const sectionParam = Array.isArray(searchParams.section)
    ? searchParams.section[0]
    : searchParams.section;
  let initialSelectedKey: ContentBlockKey | undefined;

  if (sectionParam && isContentBlockKey(sectionParam)) {
    initialSelectedKey = sectionParam;
  }

  return (
    <ContentDashboardClient
      initialBlocks={blocks}
      initialSelectedKey={initialSelectedKey}
    />
  );
}
