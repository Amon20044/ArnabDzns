"use client";

import { SaveIcon, Trash2Icon, RotateCcwIcon } from "lucide-react";
import { useMemo, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { ContentBlockRecord } from "@/db/content";

type Draft = {
  title: string;
  desc: string;
  text: string;
  color: string;
  order: string;
  active: boolean;
  images: string;
  items: string;
  data: string;
};

function stringify(value: unknown) {
  return value === undefined ? "" : JSON.stringify(value, null, 2);
}

function createDraft(block: ContentBlockRecord): Draft {
  return {
    title: typeof block.title === "string" ? block.title : stringify(block.title),
    desc: block.desc ?? "",
    text: block.text ?? "",
    color: block.color ?? "",
    order: String(block.order ?? 0),
    active: block.active !== false,
    images: stringify(block.images ?? []),
    items: stringify(block.items ?? []),
    data: stringify(block.data ?? {}),
  };
}

function parseJsonField(label: string, value: string) {
  if (!value.trim()) {
    return undefined;
  }

  try {
    return JSON.parse(value);
  } catch {
    throw new Error(`${label} must be valid JSON.`);
  }
}

function parseTitle(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return "";
  }

  if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
    return JSON.parse(trimmed) as string | string[];
  }

  return value;
}

export function ContentDashboardClient({
  initialBlocks,
}: {
  initialBlocks: ContentBlockRecord[];
}) {
  const [blocks, setBlocks] = useState(initialBlocks);
  const [selectedKey, setSelectedKey] = useState(initialBlocks[0]?.key ?? "site");
  const selectedBlock = useMemo(
    () => blocks.find((block) => block.key === selectedKey) ?? blocks[0],
    [blocks, selectedKey],
  );
  const [draft, setDraft] = useState(() => createDraft(selectedBlock));
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function selectBlock(block: ContentBlockRecord) {
    setSelectedKey(block.key);
    setDraft(createDraft(block));
    setMessage("");
  }

  async function refreshBlocks(nextSelectedKey = selectedKey) {
    const response = await fetch("/api/content", { cache: "no-store" });
    const payload = (await response.json()) as { blocks: ContentBlockRecord[] };
    setBlocks(payload.blocks);

    const nextBlock =
      payload.blocks.find((block) => block.key === nextSelectedKey) ?? payload.blocks[0];

    if (nextBlock) {
      setSelectedKey(nextBlock.key);
      setDraft(createDraft(nextBlock));
    }
  }

  function updateDraft(field: keyof Draft, value: string | boolean) {
    setDraft((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function saveBlock() {
    if (!selectedBlock) {
      return;
    }

    startTransition(async () => {
      try {
        setMessage("");

        const payload = {
          title: parseTitle(draft.title),
          desc: draft.desc,
          text: draft.text,
          color: draft.color,
          order: Number(draft.order),
          active: draft.active,
          images: parseJsonField("Images", draft.images),
          items: parseJsonField("Items", draft.items),
          data: parseJsonField("Data", draft.data),
        };

        if (!Number.isFinite(payload.order)) {
          throw new Error("Order must be a number.");
        }

        const response = await fetch(`/api/content/${selectedBlock.key}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
        const result = (await response.json()) as { error?: string };

        if (!response.ok) {
          throw new Error(result.error ?? "Content could not be saved.");
        }

        await refreshBlocks(selectedBlock.key);
        setMessage("Saved.");
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Content could not be saved.");
      }
    });
  }

  function deleteOverride() {
    if (!selectedBlock) {
      return;
    }

    startTransition(async () => {
      try {
        setMessage("");

        const response = await fetch(`/api/content/${selectedBlock.key}`, {
          method: "DELETE",
        });
        const result = (await response.json()) as { error?: string };

        if (!response.ok) {
          throw new Error(result.error ?? "Content override could not be deleted.");
        }

        await refreshBlocks(selectedBlock.key);
        setMessage("Default restored.");
      } catch (error) {
        setMessage(
          error instanceof Error ? error.message : "Content override could not be deleted.",
        );
      }
    });
  }

  if (!selectedBlock) {
    return null;
  }

  return (
    <section className="grid gap-5 lg:grid-cols-[18rem_1fr]">
      <Card className="rounded-2xl bg-white/78">
        <CardHeader>
          <CardTitle>Content</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {blocks.map((block) => (
            <button
              key={block.key}
              type="button"
              onClick={() => selectBlock(block)}
              className={cn(
                "rounded-xl border px-3 py-2 text-left transition",
                selectedKey === block.key
                  ? "border-accent/40 bg-accent-surface text-text-primary"
                  : "border-border bg-white/60 text-text-secondary hover:bg-white",
              )}
            >
              <span className="block text-sm font-semibold">{block.key}</span>
              <span className="mt-1 block text-xs uppercase tracking-[0.14em]">
                {block.group} / {block.kind} / {block.source}
              </span>
            </button>
          ))}
        </CardContent>
      </Card>

      <Card className="rounded-2xl bg-white/82">
        <CardHeader className="border-b border-border">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>{selectedBlock.key}</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                {selectedBlock.group} / {selectedBlock.kind}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={isPending}
                onClick={() => refreshBlocks(selectedBlock.key)}
              >
                <RotateCcwIcon />
                Reload
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={isPending}
                onClick={deleteOverride}
              >
                <Trash2Icon />
                Restore
              </Button>
              <Button type="button" disabled={isPending} onClick={saveBlock}>
                <SaveIcon />
                Save
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 pt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium">
              Title
              <textarea
                value={draft.title}
                onChange={(event) => updateDraft("title", event.target.value)}
                className="min-h-24 rounded-xl border border-input bg-white/80 px-3 py-2 text-sm outline-none focus:border-ring focus:ring-3 focus:ring-ring/30"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium">
              Description / Markdown
              <textarea
                value={draft.desc}
                onChange={(event) => updateDraft("desc", event.target.value)}
                className="min-h-24 rounded-xl border border-input bg-white/80 px-3 py-2 text-sm outline-none focus:border-ring focus:ring-3 focus:ring-ring/30"
              />
            </label>
          </div>

          <label className="grid gap-2 text-sm font-medium">
            Text / Markdown
            <textarea
              value={draft.text}
              onChange={(event) => updateDraft("text", event.target.value)}
              className="min-h-24 rounded-xl border border-input bg-white/80 px-3 py-2 text-sm outline-none focus:border-ring focus:ring-3 focus:ring-ring/30"
            />
          </label>

          <div className="grid gap-4 md:grid-cols-[1fr_10rem_8rem_auto] md:items-end">
            <label className="grid gap-2 text-sm font-medium">
              Color
              <Input
                value={draft.color}
                onChange={(event) => updateDraft("color", event.target.value)}
                placeholder="#a855f7"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium">
              Order
              <Input
                value={draft.order}
                onChange={(event) => updateDraft("order", event.target.value)}
                inputMode="numeric"
              />
            </label>
            <label className="flex items-center gap-2 rounded-xl border border-border bg-white/70 px-3 py-2 text-sm font-medium">
              <input
                type="checkbox"
                checked={draft.active}
                onChange={(event) => updateDraft("active", event.target.checked)}
                className="size-4 accent-purple-600"
              />
              Active
            </label>
          </div>

          <div className="grid gap-4 xl:grid-cols-3">
            {(["images", "items", "data"] as const).map((field) => (
              <label key={field} className="grid gap-2 text-sm font-medium">
                {field.toUpperCase()} JSON
                <textarea
                  value={draft[field]}
                  onChange={(event) => updateDraft(field, event.target.value)}
                  spellCheck={false}
                  className="min-h-80 rounded-xl border border-input bg-zinc-950 px-3 py-2 font-mono text-xs leading-5 text-zinc-50 outline-none focus:border-ring focus:ring-3 focus:ring-ring/30"
                />
              </label>
            ))}
          </div>

          {message ? (
            <p
              className={cn(
                "rounded-xl border px-3 py-2 text-sm",
                message.includes("Saved") || message.includes("restored")
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-rose-200 bg-rose-50 text-rose-700",
              )}
            >
              {message}
            </p>
          ) : null}
        </CardContent>
      </Card>
    </section>
  );
}
