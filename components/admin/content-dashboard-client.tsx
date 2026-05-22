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

function CountPill({
  children,
  tone = "muted",
  className,
}: {
  children: ReactNode;
  tone?: "muted" | "accent";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full px-1.5 text-[10px] font-semibold tabular-nums",
        tone === "accent"
          ? "bg-accent text-white"
          : "bg-muted text-muted-foreground",
        className,
      )}
    >
      {children}
    </span>
  );
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
    <div
      className={cn(
        "relative flex min-h-0 flex-col overflow-hidden rounded-2xl border border-border/70 bg-white/85 shadow-[0_6px_20px_rgba(15,23,42,0.04)] backdrop-blur-sm",
        className,
      )}
    >
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border/70 px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <LayoutPanelTopIcon className="size-4 shrink-0 text-muted-foreground" />
          <p className="truncate font-heading text-sm font-semibold tracking-[-0.01em] text-foreground">
            Sections
          </p>
          <CountPill>{blockCount}</CountPill>
        </div>
        {headerAction ? <div className="flex items-center gap-2">{headerAction}</div> : null}
      </div>

      <div className="shrink-0 border-b border-border/60 px-3 py-3">
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search sections..."
            className="h-9 pl-9"
          />
        </div>
      </div>

      <div
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain touch-pan-y"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {groupedBlocks.length ? (
          <ul className="flex flex-col">
            {groupedBlocks.map(([group, groupBlocks], groupIndex) => {
              const isOpen = deferredSearch.length > 0 || openGroups.has(group);
              const GroupIcon = GROUP_ICONS[group] ?? FolderIcon;
              const hasSelected = groupBlocks.some(
                (block) => block.key === selectedKey,
              );

              return (
                <li
                  key={group}
                  className={cn(
                    "relative",
                    groupIndex > 0 && "border-t border-border/50",
                  )}
                >
                  {hasSelected && !isOpen ? (
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-y-2 left-0 w-[3px] rounded-r-full bg-accent/70"
                    />
                  ) : null}

                  <button
                    type="button"
                    onClick={() => onToggleGroup(group)}
                    aria-expanded={isOpen ? "true" : "false"}
                    className={cn(
                      "flex w-full items-center justify-between gap-3 px-3 py-3 text-left transition-colors",
                      "hover:bg-muted/50",
                      isOpen && "bg-muted/30",
                    )}
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-2.5">
                      <span
                        className={cn(
                          "flex size-7 shrink-0 items-center justify-center rounded-lg transition-colors",
                          hasSelected
                            ? "bg-accent/12 text-accent"
                            : "bg-muted text-muted-foreground",
                        )}
                      >
                        <GroupIcon className="size-[15px]" strokeWidth={2} />
                      </span>
                      <span className="truncate text-sm font-semibold tracking-[-0.01em] text-foreground">
                        {GROUP_LABELS[group] ?? group}
                      </span>
                      <CountPill>{groupBlocks.length}</CountPill>
                    </div>
                    <ChevronDownIcon
                      className={cn(
                        "size-4 shrink-0 text-muted-foreground/70 transition-transform duration-200",
                        isOpen && "rotate-180 text-foreground",
                      )}
                      strokeWidth={2.2}
                    />
                  </button>

                  {isOpen ? (
                    <ul className="flex flex-col gap-px px-2 pb-2 pt-1">
                      {groupBlocks.map((block) => {
                        const definition = getSectionDefinition(block.key);
                        const isSelected = block.key === selectedKey;

                        return (
                          <li key={block.key} className="relative">
                            {isSelected ? (
                              <span
                                aria-hidden
                                className="pointer-events-none absolute inset-y-1.5 left-0 w-[3px] rounded-r-full bg-accent"
                              />
                            ) : null}
                            <button
                              type="button"
                              onClick={() => onSelectBlock(block)}
                              aria-current={isSelected ? "true" : undefined}
                              className={cn(
                                "group flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
                                isSelected
                                  ? "bg-accent/10"
                                  : "hover:bg-muted/60",
                              )}
                            >
                              <div className="min-w-0 flex-1">
                                <p
                                  className={cn(
                                    "truncate text-sm font-medium tracking-[-0.01em]",
                                    isSelected
                                      ? "text-foreground"
                                      : "text-foreground/90",
                                  )}
                                >
                                  {definition.label}
                                </p>
                                <p
                                  className={cn(
                                    "mt-0.5 line-clamp-1 text-xs leading-[1.5]",
                                    isSelected
                                      ? "text-foreground/65"
                                      : "text-muted-foreground",
                                  )}
                                >
                                  {definition.description}
                                </p>
                              </div>
                              <CountPill
                                tone={isSelected ? "accent" : "muted"}
                                className="mt-px"
                              >
                                {countBlockItems(block)}
                              </CountPill>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  ) : null}
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="m-3 rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
            No sections match this search yet.
          </div>
        )}
      </div>
    </div>
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
            className="absolute inset-y-3 right-3 flex min-h-0 w-[min(calc(100vw-1.5rem),22rem)] flex-col"
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
              className="min-h-0 flex-1 rounded-[1.6rem] bg-white/96 shadow-[0_28px_90px_rgba(15,23,42,0.18)]"
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
        {!isMobileSectionsOpen ? (
          <div className="sticky top-4 z-30 -mb-1 flex justify-end xl:hidden">
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Open sections menu"
              aria-expanded={isMobileSectionsOpen}
              aria-controls="dashboard-sections-menu"
              onClick={() => setIsMobileSectionsOpen(true)}
              className="size-11 rounded-full border-white/70 bg-white/94 shadow-[0_16px_36px_rgba(15,23,42,0.12)] backdrop-blur-sm"
            >
              <MenuIcon className="size-5" />
            </Button>
          </div>
        ) : null}
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
