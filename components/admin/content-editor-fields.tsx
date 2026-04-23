"use client";

import { useEffect, useState, type ComponentProps, type ReactNode } from "react";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  LoaderCircleIcon,
  PaletteIcon,
  PlusIcon,
  SearchIcon,
  Trash2Icon,
} from "lucide-react";
import { EditorModal } from "@/components/admin/editor-modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  reactIconPackLoaders,
  staticIconRegistry,
  type ReactIconPack,
} from "@/lib/icons";
import { cn } from "@/lib/utils";

export function updateArrayItem<T>(
  items: T[],
  index: number,
  nextValue: T,
) {
  return items.map((item, itemIndex) =>
    itemIndex === index ? nextValue : item,
  );
}

export function removeArrayItem<T>(items: T[], index: number) {
  return items.filter((_, itemIndex) => itemIndex !== index);
}

export function moveArrayItem<T>(
  items: T[],
  index: number,
  direction: "up" | "down",
) {
  const targetIndex = direction === "up" ? index - 1 : index + 1;

  if (targetIndex < 0 || targetIndex >= items.length) {
    return items;
  }

  const nextItems = [...items];
  const [item] = nextItems.splice(index, 1);
  nextItems.splice(targetIndex, 0, item);
  return nextItems;
}

export function EditorSection({
  title,
  description,
  action,
  children,
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("rounded-2xl bg-white/86", className)}>
      <CardHeader className="border-b border-border/70">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            {description ? <CardDescription>{description}</CardDescription> : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      </CardHeader>
      <CardContent className="pt-4">{children}</CardContent>
    </Card>
  );
}

export function SectionGrid({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("grid gap-4 md:grid-cols-2", className)}>{children}</div>;
}

export function TextField({
  label,
  value,
  onChange,
  description,
  placeholder,
  type = "text",
  inputMode,
}: {
  label: string;
  value: string | number | undefined;
  onChange: (value: string) => void;
  description?: string;
  placeholder?: string;
  type?: ComponentProps<"input">["type"];
  inputMode?: ComponentProps<"input">["inputMode"];
}) {
  return (
    <Field>
      <FieldLabel>{label}</FieldLabel>
      <FieldContent>
        <Input
          type={type}
          inputMode={inputMode}
          value={value ?? ""}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
        />
        {description ? <FieldDescription>{description}</FieldDescription> : null}
      </FieldContent>
    </Field>
  );
}

function normalizeHexColor(value: string) {
  const trimmed = value.trim();
  const match = trimmed.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);

  if (!match) {
    return null;
  }

  const hex = match[1];

  if (hex.length === 6) {
    return `#${hex.toLowerCase()}`;
  }

  return `#${hex
    .split("")
    .map((char) => `${char}${char}`)
    .join("")
    .toLowerCase()}`;
}

function supportsColorPreview(value: string) {
  if (!value.trim()) {
    return false;
  }

  if (typeof window === "undefined") {
    return Boolean(normalizeHexColor(value));
  }

  return window.CSS?.supports?.("color", value.trim()) ?? Boolean(normalizeHexColor(value));
}

function getColorSwatchStyle(value: string) {
  if (supportsColorPreview(value)) {
    return {
      backgroundColor: value.trim(),
    };
  }

  return {
    backgroundImage:
      "linear-gradient(45deg,rgba(148,163,184,0.16) 25%,transparent 25%,transparent 50%,rgba(148,163,184,0.16) 50%,rgba(148,163,184,0.16) 75%,transparent 75%,transparent)",
    backgroundSize: "10px 10px",
    backgroundColor: "rgba(248,250,252,0.92)",
  };
}

const COMMON_ICON_VALUES = [...new Set(Object.keys(staticIconRegistry))]
  .filter((value) => !value.startsWith("si:"))
  .sort((left, right) => left.localeCompare(right));

function formatIconLabel(value: string) {
  return value
    .replace(/^react-icons\//i, "")
    .replace(/^lucide:/i, "")
    .replace(/:/g, " ")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function resolveInitialIconPack(value?: string): ReactIconPack {
  const prefix = value?.split(":")[0]?.toLowerCase();
  const normalizedPrefix = prefix?.replace(/^react-icons\//, "");

  if (normalizedPrefix && normalizedPrefix in reactIconPackLoaders) {
    return normalizedPrefix as ReactIconPack;
  }

  return "fa6";
}

export function ColorField({
  label,
  value,
  onChange,
  description,
  placeholder = "#18181b",
}: {
  label: string;
  value: string | undefined;
  onChange: (value: string) => void;
  description?: string;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [draftValue, setDraftValue] = useState(value ?? "");

  useEffect(() => {
    if (!open) {
      setDraftValue(value ?? "");
    }
  }, [open, value]);

  const colorInputValue = normalizeHexColor(draftValue) ?? "#18181b";

  return (
    <>
      <Field>
        <FieldLabel>{label}</FieldLabel>
        <FieldContent>
          <div className="relative">
            <Input
              value={value ?? ""}
              placeholder={placeholder}
              onChange={(event) => onChange(event.target.value)}
              className="pr-12"
            />
            <button
              type="button"
              aria-label={`Open ${label} picker`}
              onClick={() => setOpen(true)}
              className="absolute inset-y-1.5 right-1.5 inline-flex w-9 items-center justify-center rounded-md border border-black/10 bg-white/90 transition hover:bg-white"
            >
              <span
                aria-hidden
                className="size-5 rounded-full border border-black/10 shadow-sm"
                style={getColorSwatchStyle(value ?? "")}
              />
            </button>
          </div>
          {description ? <FieldDescription>{description}</FieldDescription> : null}
        </FieldContent>
      </Field>

      <EditorModal
        open={open}
        onClose={() => setOpen(false)}
        title={`${label} picker`}
        description="Pick a color visually, then apply it back into the dashboard field."
        size="md"
      >
        <div className="grid gap-4">
          <div className="rounded-2xl border border-border/70 bg-white/80 p-4">
            <p className="text-sm font-semibold text-foreground">Preview</p>
            <div className="mt-3 flex items-center gap-4">
              <div
                className="size-20 rounded-2xl border border-black/10 shadow-sm"
                style={getColorSwatchStyle(draftValue)}
              />
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">
                  {draftValue.trim() || "No color value yet"}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  You can paste a color string directly or use the native color picker.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border/70 bg-white/80 p-4">
            <p className="text-sm font-semibold text-foreground">Color value</p>
            <div className="mt-3">
              <Input
                value={draftValue}
                placeholder={placeholder}
                onChange={(event) => setDraftValue(event.target.value)}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-border/70 bg-white/80 p-4">
            <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <PaletteIcon className="size-4 text-muted-foreground" />
              Visual picker
            </p>
            <div className="mt-3">
              <input
                type="color"
                value={colorInputValue}
                onChange={(event) => setDraftValue(event.target.value)}
                className="h-12 w-full cursor-pointer rounded-xl border border-border/70 bg-white px-2"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setDraftValue("");
                onChange("");
                setOpen(false);
              }}
            >
              Clear
            </Button>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => {
                  onChange(draftValue);
                  setOpen(false);
                }}
              >
                Apply color
              </Button>
            </div>
          </div>
        </div>
      </EditorModal>
    </>
  );
}

export function IconField({
  label,
  value,
  onChange,
  description,
  placeholder = "sparkles",
}: {
  label: string;
  value: string | undefined;
  onChange: (value: string) => void;
  description?: string;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [draftValue, setDraftValue] = useState(value ?? "");
  const [iconPack, setIconPack] = useState<ReactIconPack>(
    resolveInitialIconPack(value),
  );
  const [reactIconQuery, setReactIconQuery] = useState("");
  const [packIcons, setPackIcons] = useState<string[]>([]);
  const [packError, setPackError] = useState("");
  const [isPackLoading, setIsPackLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      setDraftValue(value ?? "");
      setIconPack(resolveInitialIconPack(value));
      setReactIconQuery("");
      setPackError("");
    }
  }, [open, value]);

  useEffect(() => {
    if (!open) {
      return;
    }

    let active = true;
    setIsPackLoading(true);
    setPackError("");

    reactIconPackLoaders[iconPack]()
      .then((module) => {
        if (!active) {
          return;
        }

        const nextIcons = Object.keys(
          module as Record<string, unknown>,
        )
          .filter((key) => /^[A-Z]/.test(key))
          .sort((left, right) => left.localeCompare(right));

        setPackIcons(nextIcons);
      })
      .catch(() => {
        if (!active) {
          return;
        }

        setPackIcons([]);
        setPackError(`Could not load the ${iconPack} icon pack right now.`);
      })
      .finally(() => {
        if (active) {
          setIsPackLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [iconPack, open]);

  const normalizedSearch = reactIconQuery.trim().toLowerCase();
  const filteredCommonIcons = COMMON_ICON_VALUES.filter((iconKey) => {
    if (!normalizedSearch) {
      return true;
    }

    const haystack = `${iconKey} ${formatIconLabel(iconKey)}`.toLowerCase();
    return haystack.includes(normalizedSearch);
  }).slice(0, 36);
  const filteredPackIcons = packIcons
    .filter((iconName) => {
      if (!normalizedSearch) {
        return true;
      }

      return iconName.toLowerCase().includes(normalizedSearch);
    })
    .slice(0, 60);

  function applyAndClose(nextValue: string) {
    onChange(nextValue);
    setDraftValue(nextValue);
    setOpen(false);
  }

  return (
    <>
      <Field>
        <FieldLabel>{label}</FieldLabel>
        <FieldContent>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-1.5 left-1.5 inline-flex w-9 items-center justify-center rounded-md border border-black/10 bg-white/90 text-foreground shadow-sm">
              <Icon
                name={value}
                className="size-4"
                fallback={<span className="text-xs font-semibold text-muted-foreground">?</span>}
              />
            </span>
            <Input
              value={value ?? ""}
              placeholder={placeholder}
              onChange={(event) => onChange(event.target.value)}
              className="pl-12 pr-12"
            />
            <button
              type="button"
              aria-label={`Open ${label} picker`}
              onClick={() => setOpen(true)}
              className="absolute inset-y-1.5 right-1.5 inline-flex w-9 items-center justify-center rounded-md border border-black/10 bg-white/90 text-muted-foreground transition hover:bg-white hover:text-foreground"
            >
              <SearchIcon className="size-4" />
            </button>
          </div>
          {description ? <FieldDescription>{description}</FieldDescription> : null}
        </FieldContent>
      </Field>

      <EditorModal
        open={open}
        onClose={() => setOpen(false)}
        title={`${label} picker`}
        description="Choose a common icon, browse a react-icons pack, or paste an icon string directly."
        size="lg"
      >
        <div className="grid gap-4">
          <div className="rounded-2xl border border-border/70 bg-white/80 p-4">
            <p className="text-sm font-semibold text-foreground">Current icon</p>
            <div className="mt-3 flex items-center gap-4">
              <div className="inline-flex size-16 items-center justify-center rounded-2xl border border-black/10 bg-white text-foreground shadow-sm">
                <Icon
                  name={draftValue}
                  className="size-7"
                  fallback={<span className="text-xs font-semibold text-muted-foreground">None</span>}
                />
              </div>
              <div className="min-w-0">
                <p className="break-all text-sm font-medium text-foreground">
                  {draftValue.trim() || "No icon selected yet"}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Manual value still works if you want to paste a custom icon string.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border/70 bg-white/80 p-4">
            <p className="text-sm font-semibold text-foreground">Manual icon value</p>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row">
              <Input
                value={draftValue}
                placeholder={placeholder}
                onChange={(event) => setDraftValue(event.target.value)}
                className="flex-1"
              />
              <Button type="button" variant="outline" onClick={() => applyAndClose(draftValue)}>
                Apply
              </Button>
            </div>
          </div>

          <div className="rounded-2xl border border-border/70 bg-white/80 p-4">
            <p className="text-sm font-semibold text-foreground">Search icons</p>
            <div className="mt-3">
              <Input
                value={reactIconQuery}
                onChange={(event) => setReactIconQuery(event.target.value)}
                placeholder="Search common or react-icons names..."
              />
            </div>
          </div>

          <div className="rounded-2xl border border-border/70 bg-white/80 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-foreground">Common icons</p>
              <Badge variant="outline">{filteredCommonIcons.length}</Badge>
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {filteredCommonIcons.map((iconKey) => (
                <button
                  key={iconKey}
                  type="button"
                  onClick={() => applyAndClose(iconKey)}
                  className="flex items-center gap-3 rounded-xl border border-border/70 bg-white px-3 py-2 text-left transition hover:border-foreground/15 hover:bg-background"
                >
                  <span className="inline-flex size-9 items-center justify-center rounded-lg border border-black/10 bg-background text-foreground">
                    <Icon name={iconKey} className="size-[18px]" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-foreground">
                      {formatIconLabel(iconKey) || iconKey}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {iconKey}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border/70 bg-white/80 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">React Icons browser</p>
                <p className="text-sm text-muted-foreground">
                  Pick a pack, then choose from the matching exported component names.
                </p>
              </div>
              <select
                value={iconPack}
                onChange={(event) => setIconPack(event.target.value as ReactIconPack)}
                className="h-9 rounded-lg border border-input bg-white px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {Object.keys(reactIconPackLoaders).map((pack) => (
                  <option key={pack} value={pack}>
                    {pack.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            {isPackLoading ? (
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-border/70 bg-background/70 px-4 py-3 text-sm text-muted-foreground">
                <LoaderCircleIcon className="size-4 animate-spin" />
                Loading icon pack...
              </div>
            ) : packError ? (
              <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {packError}
              </div>
            ) : (
              <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {filteredPackIcons.map((iconName) => {
                  const iconValue = `${iconPack}:${iconName}`;

                  return (
                    <button
                      key={iconValue}
                      type="button"
                      onClick={() => applyAndClose(iconValue)}
                      className="flex items-center gap-3 rounded-xl border border-border/70 bg-white px-3 py-2 text-left transition hover:border-foreground/15 hover:bg-background"
                    >
                      <span className="inline-flex size-9 items-center justify-center rounded-lg border border-black/10 bg-background text-foreground">
                        <Icon name={iconValue} className="size-[18px]" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-foreground">
                          {iconName}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {iconValue}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </EditorModal>
    </>
  );
}

export function NumberField({
  label,
  value,
  onChange,
  description,
  placeholder,
}: {
  label: string;
  value: number | undefined;
  onChange: (value: number) => void;
  description?: string;
  placeholder?: string;
}) {
  return (
    <TextField
      label={label}
      value={value ?? ""}
      onChange={(nextValue) => onChange(nextValue ? Number(nextValue) : 0)}
      description={description}
      placeholder={placeholder}
      inputMode="decimal"
    />
  );
}

export function LongTextField({
  label,
  value,
  onChange,
  description,
  placeholder,
  rows = 5,
}: {
  label: string;
  value: string | undefined;
  onChange: (value: string) => void;
  description?: string;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <Field>
      <FieldLabel>{label}</FieldLabel>
      <FieldContent>
        <Textarea
          rows={rows}
          value={value ?? ""}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
        />
        {description ? <FieldDescription>{description}</FieldDescription> : null}
      </FieldContent>
    </Field>
  );
}

export function SelectField({
  label,
  value,
  onChange,
  options,
  description,
}: {
  label: string;
  value: string | undefined;
  onChange: (value: string) => void;
  options: Array<{ label: string; value: string }>;
  description?: string;
}) {
  return (
    <Field>
      <FieldLabel>{label}</FieldLabel>
      <FieldContent>
        <select
          value={value ?? ""}
          onChange={(event) => onChange(event.target.value)}
          className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {description ? <FieldDescription>{description}</FieldDescription> : null}
      </FieldContent>
    </Field>
  );
}

export function ToggleField({
  label,
  checked,
  onCheckedChange,
  description,
}: {
  label: string;
  checked: boolean;
  onCheckedChange: (value: boolean) => void;
  description?: string;
}) {
  return (
    <label className="flex items-start gap-3 rounded-xl border border-border bg-background/70 px-3 py-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onCheckedChange(event.target.checked)}
        className="mt-0.5 size-4 accent-black"
      />
      <span className="grid gap-1">
        <span className="text-sm font-medium text-foreground">{label}</span>
        {description ? (
          <span className="text-sm text-muted-foreground">{description}</span>
        ) : null}
      </span>
    </label>
  );
}

export function ArrayMeta({
  count,
  label,
}: {
  count: number;
  label: string;
}) {
  return <Badge variant="outline">{count} {label}</Badge>;
}

export function StringListEditor({
  title,
  description,
  values,
  onChange,
  addLabel = "Add item",
  placeholder = "New item",
}: {
  title: string;
  description?: string;
  values: string[];
  onChange: (values: string[]) => void;
  addLabel?: string;
  placeholder?: string;
}) {
  return (
    <EditorSection
      title={title}
      description={description}
      action={<ArrayMeta count={values.length} label={values.length === 1 ? "item" : "items"} />}
    >
      <FieldGroup>
        {values.map((value, index) => (
          <div key={`${title}-${index}`} className="flex items-center gap-2">
            <Input
              value={value}
              placeholder={placeholder}
              onChange={(event) =>
                onChange(updateArrayItem(values, index, event.target.value))
              }
            />
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              onClick={() => onChange(removeArrayItem(values, index))}
            >
              <Trash2Icon />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          onClick={() => onChange([...values, ""])}
        >
          <PlusIcon />
          {addLabel}
        </Button>
      </FieldGroup>
    </EditorSection>
  );
}

export function CollectionEditor<T>({
  title,
  description,
  items,
  onChange,
  createItem,
  addLabel,
  emptyText,
  getItemLabel,
  renderItem,
}: {
  title: string;
  description?: string;
  items: T[];
  onChange: (items: T[]) => void;
  createItem: () => T;
  addLabel: string;
  emptyText: string;
  getItemLabel: (item: T, index: number) => string;
  renderItem: (
    item: T,
    index: number,
    onItemChange: (nextValue: T) => void,
  ) => ReactNode;
}) {
  return (
    <EditorSection
      title={title}
      description={description}
      action={<ArrayMeta count={items.length} label={items.length === 1 ? "entry" : "entries"} />}
    >
      <div className="grid gap-4">
        {items.length ? (
          items.map((item, index) => (
            <Card key={`${title}-${index}`} className="rounded-xl border border-border/80 bg-background/70">
              <CardHeader className="border-b border-border/60">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <CardTitle className="text-sm">{getItemLabel(item, index)}</CardTitle>
                    <CardDescription>Entry {index + 1}</CardDescription>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={index === 0}
                      onClick={() => onChange(moveArrayItem(items, index, "up"))}
                    >
                      <ArrowUpIcon />
                      Up
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={index === items.length - 1}
                      onClick={() => onChange(moveArrayItem(items, index, "down"))}
                    >
                      <ArrowDownIcon />
                      Down
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => onChange(removeArrayItem(items, index))}
                    >
                      <Trash2Icon />
                      Remove
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                {renderItem(item, index, (nextValue) =>
                  onChange(updateArrayItem(items, index, nextValue)),
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="rounded-xl border border-dashed border-border px-4 py-6 text-sm text-muted-foreground">
            {emptyText}
          </div>
        )}
        <Button type="button" variant="outline" onClick={() => onChange([...items, createItem()])}>
          <PlusIcon />
          {addLabel}
        </Button>
      </div>
    </EditorSection>
  );
}
