"use client";

import type { ComponentProps, ReactNode } from "react";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
