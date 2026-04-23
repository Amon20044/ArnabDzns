import Link from "next/link";
import {
  ArrowRightIcon,
  DatabaseIcon,
  LayoutPanelTopIcon,
  ShieldCheckIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { listContentBlocks } from "@/db/content";
import {
  countBlockItems,
  getSectionDefinition,
  getSectionSummary,
} from "@/lib/admin/content-editor";
import { getCurrentAdminSession } from "@/lib/auth/current-user";

const GROUP_LABELS: Record<string, string> = {
  site: "Site",
  navigation: "Navigation",
  home: "Home",
  contact: "Contact",
};

export default async function DashboardPage() {
  const [session, blocks] = await Promise.all([
    getCurrentAdminSession(),
    listContentBlocks(),
  ]);

  const activeBlocks = blocks.filter((block) => block.active !== false);
  const overriddenBlocks = blocks.filter(
    (block) => block.source === "database" || block.source === "memory",
  );
  const totalEntries = blocks.reduce(
    (total, block) => total + countBlockItems(block),
    0,
  );

  return (
    <section className="grid gap-4">
      <Card className="rounded-2xl bg-white/88">
        <CardHeader className="border-b border-border/70">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="grid gap-2">
              <div className="flex items-center gap-2">
                <Badge variant="success">
                  <ShieldCheckIcon className="mr-1 size-3" />
                  Session active
                </Badge>
                <Badge variant="outline">{session?.email ?? "Admin"}</Badge>
              </div>
              <CardTitle className="text-xl">
                Structured content control center
              </CardTitle>
              <p className="max-w-3xl text-sm text-muted-foreground">
                The editor is now section-based, fully reusable, and wired to the
                content block model end to end. Jump into any section to update
                data without touching raw JSON.
              </p>
            </div>
            <Button asChild>
              <Link href="/dashboard/content">
                Open content editor
                <ArrowRightIcon />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid gap-3 md:grid-cols-4">
            <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Sections
              </p>
              <p className="mt-2 text-2xl font-semibold text-foreground">{blocks.length}</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Active
              </p>
              <p className="mt-2 text-2xl font-semibold text-foreground">
                {activeBlocks.length}
              </p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Overrides
              </p>
              <p className="mt-2 text-2xl font-semibold text-foreground">
                {overriddenBlocks.length}
              </p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Total entries
              </p>
              <p className="mt-2 text-2xl font-semibold text-foreground">
                {totalEntries}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="rounded-2xl bg-white/86">
          <CardHeader className="border-b border-border/70">
            <div className="flex items-center gap-2">
              <LayoutPanelTopIcon className="size-4 text-muted-foreground" />
              <CardTitle>Quick Access</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="grid gap-3 pt-4">
            {blocks.slice(0, 6).map((block) => {
              const definition = getSectionDefinition(block.key);

              return (
                <Link
                  key={block.key}
                  href={`/dashboard/content?section=${block.key}`}
                  className="rounded-2xl border border-border bg-background/70 px-4 py-3 transition hover:border-foreground/15 hover:bg-background"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {definition.label}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {getSectionSummary(block)}
                      </p>
                    </div>
                    <ArrowRightIcon className="size-4 text-muted-foreground" />
                  </div>
                </Link>
              );
            })}
          </CardContent>
        </Card>

        <Card className="rounded-2xl bg-white/86">
          <CardHeader className="border-b border-border/70">
            <div className="flex items-center gap-2">
              <DatabaseIcon className="size-4 text-muted-foreground" />
              <CardTitle>Section Groups</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="grid gap-3 pt-4">
            {Object.entries(
              blocks.reduce<Record<string, number>>((groups, block) => {
                groups[block.group] = (groups[block.group] ?? 0) + 1;
                return groups;
              }, {}),
            ).map(([group, count]) => (
              <div
                key={group}
                className="flex items-center justify-between rounded-2xl border border-border bg-background/70 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {GROUP_LABELS[group] ?? group}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Section group overview
                  </p>
                </div>
                <Badge variant="outline">{count}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
