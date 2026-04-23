"use client";

import {
  AlertCircleIcon,
  DatabaseIcon,
  LayoutPanelTopIcon,
  RefreshCcwIcon,
  SaveIcon,
  SearchIcon,
  ShieldCheckIcon,
  Trash2Icon,
} from "lucide-react";
import { useDeferredValue, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { StructuredSectionEditor } from "@/components/admin/content-section-editor";
import { EditorSection, SectionGrid, TextField, ToggleField } from "@/components/admin/content-editor-fields";
import type { ContentBlockRecord } from "@/db/content";
import type { ContentBlockKey } from "@/db/models/content-block";
import {
  buildContentUpdateFromDraft,
  CONTENT_SECTION_DEFINITIONS,
  countBlockItems,
  createStructuredContentDraft,
  getSectionDefinition,
  getSectionSummary,
  type StructuredContentDraft,
} from "@/lib/admin/content-editor";
import { cn } from "@/lib/utils";

const GROUP_LABELS: Record<string, string> = {
  site: "Site",
  navigation: "Navigation",
  home: "Home",
  contact: "Contact",
};

type DashboardNotice =
  | {
      kind: "success" | "error" | "info";
      message: string;
    }
  | null;

function getInitialSelectedKey(
  blocks: ContentBlockRecord[],
  initialSelectedKey?: ContentBlockKey,
) {
  if (initialSelectedKey && blocks.some((block) => block.key === initialSelectedKey)) {
    return initialSelectedKey;
  }

  return blocks[0]?.key ?? "site";
}

function formatTimestamp(value?: string) {
  if (!value) {
    return "Not saved yet";
  }

  const timestamp = new Date(value);

  if (Number.isNaN(timestamp.getTime())) {
    return value;
  }

  return timestamp.toLocaleString();
}

function safeSerializeDraft(
  block: ContentBlockRecord | undefined,
  draft: StructuredContentDraft | undefined,
) {
  if (!block || !draft) {
    return "";
  }

  try {
    return JSON.stringify(buildContentUpdateFromDraft(block.key, draft));
  } catch {
    return "__invalid__";
  }
}

export function ContentDashboardClient({
  initialBlocks,
  initialSelectedKey,
}: {
  initialBlocks: ContentBlockRecord[];
  initialSelectedKey?: ContentBlockKey;
}) {
  const router = useRouter();
  const [blocks, setBlocks] = useState(initialBlocks);
  const [selectedKey, setSelectedKey] = useState(() =>
    getInitialSelectedKey(initialBlocks, initialSelectedKey),
  );
  const [draft, setDraft] = useState<StructuredContentDraft | null>(() => {
    const initialBlock =
      initialBlocks.find((block) => block.key === getInitialSelectedKey(initialBlocks, initialSelectedKey)) ??
      initialBlocks[0];

    return initialBlock ? createStructuredContentDraft(initialBlock) : null;
  });
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search.trim().toLowerCase());
  const [notice, setNotice] = useState<DashboardNotice>(null);
  const [isPending, startTransition] = useTransition();

  const selectedBlock = useMemo(
    () => blocks.find((block) => block.key === selectedKey) ?? blocks[0],
    [blocks, selectedKey],
  );

  const filteredBlocks = useMemo(() => {
    if (!deferredSearch) {
      return blocks;
    }

    return blocks.filter((block) => {
      const definition = getSectionDefinition(block.key);
      const haystack = [
        block.key,
        block.group,
        definition.label,
        definition.description,
        getSectionSummary(block),
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(deferredSearch);
    });
  }, [blocks, deferredSearch]);

  const groupedBlocks = useMemo(() => {
    const groups = new Map<string, ContentBlockRecord[]>();

    for (const block of filteredBlocks) {
      const key = block.group;
      const current = groups.get(key) ?? [];
      current.push(block);
      groups.set(key, current);
    }

    return [...groups.entries()];
  }, [filteredBlocks]);

  const hasChanges = useMemo(() => {
    return (
      safeSerializeDraft(selectedBlock, draft ?? undefined) !==
      safeSerializeDraft(
        selectedBlock,
        selectedBlock ? createStructuredContentDraft(selectedBlock) : undefined,
      )
    );
  }, [draft, selectedBlock]);

  const canRestore = selectedBlock?.source === "database" || selectedBlock?.source === "memory";

  async function requestBlocks() {
    const response = await fetch("/api/content", {
      cache: "no-store",
      credentials: "same-origin",
    });

    if (response.status === 401) {
      router.replace("/login");
      router.refresh();
      throw new Error("Your admin session expired. Please sign in again.");
    }

    const payload = (await response.json()) as {
      blocks?: ContentBlockRecord[];
      error?: string;
    };

    if (!response.ok || !payload.blocks) {
      throw new Error(payload.error ?? "Content blocks could not be loaded.");
    }

    return payload.blocks;
  }

  function selectBlock(block: ContentBlockRecord) {
    setSelectedKey(block.key);
    setDraft(createStructuredContentDraft(block));
    setNotice(null);
  }

  async function refreshBlocks(nextSelectedKey = selectedKey) {
    const nextBlocks = await requestBlocks();
    setBlocks(nextBlocks);

    const nextBlock =
      nextBlocks.find((block) => block.key === nextSelectedKey) ?? nextBlocks[0];

    if (nextBlock) {
      setSelectedKey(nextBlock.key);
      setDraft(createStructuredContentDraft(nextBlock));
    }
  }

  function updateDraftData(nextData: unknown) {
    setDraft((current) => (current ? { ...current, data: nextData } : current));
  }

  function saveSelectedBlock() {
    if (!selectedBlock || !draft) {
      return;
    }

    startTransition(async () => {
      try {
        setNotice({ kind: "info", message: "Saving changes..." });

        const payload = buildContentUpdateFromDraft(selectedBlock.key, draft);
        const response = await fetch(`/api/content/${selectedBlock.key}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "same-origin",
          body: JSON.stringify(payload),
        });
        const result = (await response.json()) as { error?: string };

        if (response.status === 401) {
          router.replace("/login");
          router.refresh();
          throw new Error("Your admin session expired. Please sign in again.");
        }

        if (!response.ok) {
          throw new Error(result.error ?? "Content could not be saved.");
        }

        await refreshBlocks(selectedBlock.key);
        setNotice({ kind: "success", message: "Section saved successfully." });
      } catch (error) {
        setNotice({
          kind: "error",
          message:
            error instanceof Error ? error.message : "Content could not be saved.",
        });
      }
    });
  }

  function restoreSelectedBlock() {
    if (!selectedBlock) {
      return;
    }

    startTransition(async () => {
      try {
        setNotice({ kind: "info", message: "Restoring default content..." });

        const response = await fetch(`/api/content/${selectedBlock.key}`, {
          method: "DELETE",
          credentials: "same-origin",
        });
        const result = (await response.json()) as { error?: string };

        if (response.status === 401) {
          router.replace("/login");
          router.refresh();
          throw new Error("Your admin session expired. Please sign in again.");
        }

        if (!response.ok) {
          throw new Error(result.error ?? "Content override could not be deleted.");
        }

        await refreshBlocks(selectedBlock.key);
        setNotice({
          kind: "success",
          message: "Default content restored for this section.",
        });
      } catch (error) {
        setNotice({
          kind: "error",
          message:
            error instanceof Error
              ? error.message
              : "Content override could not be deleted.",
        });
      }
    });
  }

  function reloadSelectedBlock() {
    startTransition(async () => {
      try {
        setNotice({ kind: "info", message: "Reloading latest content..." });
        await refreshBlocks(selectedKey);
        setNotice({ kind: "success", message: "Latest content loaded." });
      } catch (error) {
        setNotice({
          kind: "error",
          message:
            error instanceof Error ? error.message : "Content could not be reloaded.",
        });
      }
    });
  }

  if (!selectedBlock || !draft) {
    return (
      <Card className="rounded-2xl bg-white/86">
        <CardHeader>
          <CardTitle>No editable sections found</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Seed or create at least one content block to start editing.
        </CardContent>
      </Card>
    );
  }

  const selectedDefinition = CONTENT_SECTION_DEFINITIONS[selectedBlock.key];

  return (
    <section className="grid gap-5 xl:grid-cols-[20rem_minmax(0,1fr)]">
      <Card className="rounded-2xl bg-white/84 xl:sticky xl:top-6 xl:h-[calc(100vh-10rem)]">
        <CardHeader className="border-b border-border/70">
          <div className="flex items-center gap-2">
            <LayoutPanelTopIcon className="size-4 text-muted-foreground" />
            <CardTitle>Sections</CardTitle>
          </div>
          <p className="text-sm text-muted-foreground">
            Search by section, group, or label and jump straight into editing.
          </p>
        </CardHeader>
        <CardContent className="flex h-full flex-col gap-4 pt-4">
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search sections..."
              className="pl-9"
            />
          </div>

          <div className="grid gap-4 overflow-y-auto pr-1">
            {groupedBlocks.length ? (
              groupedBlocks.map(([group, groupBlocks]) => (
                <div key={group} className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      {GROUP_LABELS[group] ?? group}
                    </p>
                    <Badge variant="outline">{groupBlocks.length}</Badge>
                  </div>
                  {groupBlocks.map((block) => {
                    const definition = getSectionDefinition(block.key);
                    const isSelected = block.key === selectedKey;

                    return (
                      <button
                        key={block.key}
                        type="button"
                        onClick={() => selectBlock(block)}
                        className={cn(
                          "rounded-2xl border px-3 py-3 text-left transition",
                          isSelected
                            ? "border-primary bg-primary text-primary-foreground shadow-lg shadow-black/10"
                            : "border-border bg-background/70 hover:border-foreground/15 hover:bg-background",
                        )}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold">{definition.label}</p>
                            <p
                              className={cn(
                                "mt-1 text-xs leading-5",
                                isSelected ? "text-primary-foreground/75" : "text-muted-foreground",
                              )}
                            >
                              {definition.description}
                            </p>
                          </div>
                          <Badge variant={isSelected ? "secondary" : "outline"}>
                            {countBlockItems(block)}
                          </Badge>
                        </div>
                        <div
                          className={cn(
                            "mt-3 flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.12em]",
                            isSelected ? "text-primary-foreground/75" : "text-muted-foreground",
                          )}
                        >
                          <span>{block.kind}</span>
                          <span>{block.source}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-border px-4 py-8 text-sm text-muted-foreground">
                No sections match this search yet.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        <Card className="rounded-2xl bg-white/88">
          <CardHeader className="border-b border-border/70">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="grid gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">{GROUP_LABELS[selectedBlock.group] ?? selectedBlock.group}</Badge>
                  <Badge variant="outline">{selectedBlock.kind}</Badge>
                  <Badge variant={selectedBlock.active !== false ? "success" : "warning"}>
                    {selectedBlock.active !== false ? "Active" : "Hidden"}
                  </Badge>
                  {hasChanges ? <Badge variant="warning">Unsaved changes</Badge> : null}
                </div>
                <div>
                  <CardTitle className="text-xl">{selectedDefinition.label}</CardTitle>
                  <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
                    {selectedDefinition.description}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isPending}
                  onClick={reloadSelectedBlock}
                >
                  <RefreshCcwIcon />
                  Reload
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={isPending || !canRestore}
                  onClick={restoreSelectedBlock}
                >
                  <Trash2Icon />
                  Restore
                </Button>
                <Button
                  type="button"
                  disabled={isPending || !hasChanges}
                  onClick={saveSelectedBlock}
                >
                  <SaveIcon />
                  Save
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Section Key
                </p>
                <p className="mt-2 text-sm font-semibold text-foreground">{selectedBlock.key}</p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Item Count
                </p>
                <p className="mt-2 text-sm font-semibold text-foreground">
                  {countBlockItems(selectedBlock)}
                </p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Last Updated
                </p>
                <p className="mt-2 text-sm font-semibold text-foreground">
                  {formatTimestamp(selectedBlock.updatedAt)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {notice ? (
          <div
            className={cn(
              "flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm",
              notice.kind === "success" &&
                "border-emerald-200 bg-emerald-50 text-emerald-800",
              notice.kind === "error" &&
                "border-rose-200 bg-rose-50 text-rose-800",
              notice.kind === "info" &&
                "border-sky-200 bg-sky-50 text-sky-800",
            )}
          >
            {notice.kind === "error" ? (
              <AlertCircleIcon className="mt-0.5 size-4 shrink-0" />
            ) : notice.kind === "success" ? (
              <ShieldCheckIcon className="mt-0.5 size-4 shrink-0" />
            ) : (
              <DatabaseIcon className="mt-0.5 size-4 shrink-0" />
            )}
            <p>{notice.message}</p>
          </div>
        ) : null}

        <EditorSection
          title="Section Meta"
          description="Shared controls reused across every content section."
        >
          <div className="grid gap-4">
            <SectionGrid>
              <TextField
                label="Order"
                value={draft.order}
                onChange={(order) =>
                  setDraft((current) => (current ? { ...current, order } : current))
                }
                description="Lower numbers appear earlier in section ordering."
                inputMode="numeric"
              />
              <ToggleField
                label="Section is active"
                checked={draft.active}
                onCheckedChange={(active) =>
                  setDraft((current) => (current ? { ...current, active } : current))
                }
                description="Disable this to hide the section without deleting its content."
              />
            </SectionGrid>
          </div>
        </EditorSection>

        <StructuredSectionEditor
          blockKey={selectedBlock.key}
          value={draft.data}
          onChange={updateDraftData}
        />
      </div>
    </section>
  );
}
