"use client";

import {
  AlertCircleIcon,
  ChevronDownIcon,
  CompassIcon,
  DatabaseIcon,
  FolderIcon,
  GlobeIcon,
  HomeIcon,
  LayoutPanelTopIcon,
  MailIcon,
  MenuIcon,
  RefreshCcwIcon,
  SaveIcon,
  SearchIcon,
  ShieldCheckIcon,
  XIcon,
  type LucideIcon,
} from "lucide-react";
import {
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
  useTransition,
  type ReactNode,
} from "react";
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

const GROUP_ICONS: Record<string, LucideIcon> = {
  site: GlobeIcon,
  navigation: CompassIcon,
  home: HomeIcon,
  contact: MailIcon,
};

type DashboardNotice =
  | {
      kind: "success" | "error" | "info";
      message: string;
    }
  | null;

type PersistDraftOptions = {
  pendingMessage?: string;
  successMessage?: string;
  errorMessage?: string;
  skipSuccessNotice?: boolean;
};

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

function hasPersistableStructuredData(value: unknown) {
  return value !== null && value !== undefined;
}

function SectionsNavigationPanel({
  blockCount,
  search,
  onSearchChange,
  groupedBlocks,
  deferredSearch,
  openGroups,
  selectedKey,
  onToggleGroup,
  onSelectBlock,
  className,
  headerAction,
}: {
  blockCount: number;
  search: string;
  onSearchChange: (value: string) => void;
  groupedBlocks: Array<[string, ContentBlockRecord[]]>;
  deferredSearch: string;
  openGroups: Set<string>;
  selectedKey: ContentBlockKey;
  onToggleGroup: (group: string) => void;
  onSelectBlock: (block: ContentBlockRecord) => void;
  className?: string;
  headerAction?: ReactNode;
}) {
  return (
    <Card className={cn("rounded-2xl bg-white/84", className)}>
      <CardHeader className="border-b border-border/70 pb-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <LayoutPanelTopIcon className="size-4 text-muted-foreground" />
            <CardTitle>Sections</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{blockCount}</Badge>
            {headerAction}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden pt-3">
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search sections..."
            className="pl-9"
          />
        </div>

        <div className="-mx-1 flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-1 pb-2">
          {groupedBlocks.length ? (
            groupedBlocks.map(([group, groupBlocks]) => {
              const isOpen = deferredSearch.length > 0 || openGroups.has(group);
              const GroupIcon = GROUP_ICONS[group] ?? FolderIcon;
              const hasSelected = groupBlocks.some(
                (block) => block.key === selectedKey,
              );

              return (
                <div
                  key={group}
                  className={cn(
                    "overflow-hidden rounded-xl border bg-white/70 transition",
                    hasSelected
                      ? "border-foreground/15 shadow-[0_4px_14px_rgba(15,23,42,0.05)]"
                      : "border-border/70",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => onToggleGroup(group)}
                    aria-expanded={isOpen ? "true" : "false"}
                    className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left transition hover:bg-background/80"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <GroupIcon className="size-4 shrink-0 text-muted-foreground" />
                      <span className="truncate text-sm font-semibold text-foreground">
                        {GROUP_LABELS[group] ?? group}
                      </span>
                      <Badge variant="outline" className="shrink-0">
                        {groupBlocks.length}
                      </Badge>
                    </div>
                    <ChevronDownIcon
                      className={cn(
                        "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
                        isOpen && "rotate-180",
                      )}
                    />
                  </button>

                  {isOpen ? (
                    <div className="grid gap-1 border-t border-border/60 bg-background/40 p-1.5">
                      {groupBlocks.map((block) => {
                        const definition = getSectionDefinition(block.key);
                        const isSelected = block.key === selectedKey;

                        return (
                          <button
                            key={block.key}
                            type="button"
                            onClick={() => onSelectBlock(block)}
                            className={cn(
                              "group flex items-start gap-2.5 rounded-lg px-2.5 py-2 text-left transition",
                              isSelected
                                ? "bg-foreground text-background shadow-sm"
                                : "hover:bg-white",
                            )}
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5">
                                <p className="truncate text-sm font-medium">
                                  {definition.label}
                                </p>
                              </div>
                              <p
                                className={cn(
                                  "mt-0.5 line-clamp-1 text-xs leading-5",
                                  isSelected
                                    ? "text-background/70"
                                    : "text-muted-foreground",
                                )}
                              >
                                {definition.description}
                              </p>
                            </div>
                            <span
                              className={cn(
                                "mt-0.5 inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full px-1.5 text-[10px] font-semibold",
                                isSelected
                                  ? "bg-background/20 text-background"
                                  : "bg-muted text-muted-foreground",
                              )}
                            >
                              {countBlockItems(block)}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              );
            })
          ) : (
            <div className="rounded-2xl border border-dashed border-border px-4 py-8 text-sm text-muted-foreground">
              No sections match this search yet.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
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
  const [isMobileSectionsOpen, setIsMobileSectionsOpen] = useState(false);

  const selectedBlock = useMemo(
    () => blocks.find((block) => block.key === selectedKey) ?? blocks[0],
    [blocks, selectedKey],
  );
  const selectedGroup = selectedBlock?.group;

  const [openGroups, setOpenGroups] = useState<Set<string>>(() => {
    const initialGroup = initialBlocks.find(
      (block) => block.key === getInitialSelectedKey(initialBlocks, initialSelectedKey),
    )?.group;
    return new Set(initialGroup ? [initialGroup] : []);
  });

  useEffect(() => {
    if (!selectedGroup) {
      return;
    }
    setOpenGroups((prev) => {
      if (prev.has(selectedGroup)) {
        return prev;
      }
      const next = new Set(prev);
      next.add(selectedGroup);
      return next;
    });
  }, [selectedGroup]);

  function toggleGroup(group: string) {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(group)) {
        next.delete(group);
      } else {
        next.add(group);
      }
      return next;
    });
  }

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
    setIsMobileSectionsOpen(false);
  }

  useEffect(() => {
    if (!isMobileSectionsOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMobileSectionsOpen(false);
      }
    };

    const handleResize = () => {
      if (window.innerWidth >= 1280) {
        setIsMobileSectionsOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleResize);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleResize);
    };
  }, [isMobileSectionsOpen]);

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

  async function persistDraft(
    nextDraft: StructuredContentDraft,
    options: PersistDraftOptions = {},
  ) {
    if (!selectedBlock) {
      return false;
    }

    const {
      pendingMessage = "Saving changes...",
      successMessage = "Section saved successfully.",
      errorMessage = "Content could not be saved.",
      skipSuccessNotice = false,
    } = options;

    try {
      setNotice({ kind: "info", message: pendingMessage });

      const payload = buildContentUpdateFromDraft(selectedBlock.key, nextDraft);
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
        throw new Error(result.error ?? errorMessage);
      }

      await refreshBlocks(selectedBlock.key);

      if (!skipSuccessNotice) {
        setNotice({ kind: "success", message: successMessage });
      }

      return true;
    } catch (error) {
      setNotice({
        kind: "error",
        message: error instanceof Error ? error.message : errorMessage,
      });
      return false;
    }
  }

  async function persistDraftData(
    nextData: unknown,
    options?: PersistDraftOptions,
  ) {
    if (!draft) {
      return false;
    }

    return persistDraft(
      {
        ...draft,
        data: nextData,
      },
      options,
    );
  }

  function saveSelectedBlock() {
    if (!selectedBlock || !draft) {
      return;
    }

    if (!hasPersistableStructuredData(draft.data)) {
      setNotice({
        kind: "error",
        message:
          "This section has no structured Mongo payload yet. Seed or save the section in Mongo before editing it here.",
      });
      return;
    }

    startTransition(() => {
      void persistDraft(draft, {
        pendingMessage: "Saving changes...",
        successMessage: "Section saved successfully.",
        errorMessage: "Content could not be saved.",
      });
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
  const hasStructuredData = hasPersistableStructuredData(draft.data);

  return (
    <section className="grid gap-5 xl:grid-cols-[20rem_minmax(0,1fr)]">
      {isMobileSectionsOpen ? (
        <div className="fixed inset-0 z-50 xl:hidden">
          <button
            type="button"
            aria-label="Close sections menu"
            className="absolute inset-0 bg-black/35 backdrop-blur-[6px]"
            onClick={() => setIsMobileSectionsOpen(false)}
          />
          <div
            id="dashboard-sections-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Dashboard sections"
            className="absolute inset-y-3 right-3 w-[min(calc(100vw-1.5rem),22rem)]"
          >
            <SectionsNavigationPanel
              blockCount={blocks.length}
              search={search}
              onSearchChange={setSearch}
              groupedBlocks={groupedBlocks}
              deferredSearch={deferredSearch}
              openGroups={openGroups}
              selectedKey={selectedKey}
              onToggleGroup={toggleGroup}
              onSelectBlock={selectBlock}
              className="h-full rounded-[1.6rem] bg-white/96 shadow-[0_28px_90px_rgba(15,23,42,0.18)]"
              headerAction={
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  aria-label="Close sections menu"
                  onClick={() => setIsMobileSectionsOpen(false)}
                >
                  <XIcon />
                </Button>
              }
            />
          </div>
        </div>
      ) : null}

      <SectionsNavigationPanel
        blockCount={blocks.length}
        search={search}
        onSearchChange={setSearch}
        groupedBlocks={groupedBlocks}
        deferredSearch={deferredSearch}
        openGroups={openGroups}
        selectedKey={selectedKey}
        onToggleGroup={toggleGroup}
        onSelectBlock={selectBlock}
        className="hidden xl:sticky xl:top-6 xl:flex xl:h-[calc(100vh-10rem)]"
      />

      <div className="grid gap-4">
        <div className="xl:hidden">
          <div className="flex items-center justify-between gap-3 rounded-[1.35rem] border border-border/70 bg-white/88 px-4 py-3 shadow-[0_12px_30px_rgba(15,23,42,0.06)] backdrop-blur-sm">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Sections
              </p>
              <p className="truncate text-sm font-semibold text-foreground">
                {selectedDefinition.label}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Open sections menu"
              aria-expanded={isMobileSectionsOpen}
              aria-controls="dashboard-sections-menu"
              onClick={() => setIsMobileSectionsOpen(true)}
              className="shrink-0 rounded-full"
            >
              <MenuIcon />
            </Button>
          </div>
        </div>
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
                  disabled={isPending || !hasChanges || !hasStructuredData}
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

        {hasStructuredData ? (
          <StructuredSectionEditor
            blockKey={selectedBlock.key}
            value={draft.data}
            onChange={updateDraftData}
            onPersist={persistDraftData}
          />
        ) : (
          <Card className="rounded-2xl border-amber-200 bg-amber-50/90">
            <CardContent className="pt-6 text-sm text-amber-900">
              This section does not currently have structured content in MongoDB.
              The dashboard will not pull local fallback data anymore. Seed this
              section in Mongo, then reload the editor.
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  );
}
