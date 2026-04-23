"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

export type ProfileCardStatus = "available" | "busy";

export interface ProfileCardRow {
  label: string | [string] | [string, string];
  value: string;
  valueColor?: string;
}

export interface ProfileCardProps {
  imageSrc: string;
  imageAlt?: string;
  rows: ProfileCardRow[];
  status?: ProfileCardStatus;
  statusLabel?: string;
  name: string;
  designation: string;
  className?: string;
  style?: CSSProperties;
}

const STATUS_THEME: Record<
  ProfileCardStatus,
  { dotColor: string; label: string }
> = {
  available: { dotColor: "#22c55e", label: "Available" },
  busy: { dotColor: "#b91c1c", label: "Busy" },
};

const toLabelLines = (label: ProfileCardRow["label"]): string[] =>
  Array.isArray(label) ? [...label] : [label];

export function ProfileCard({
  imageSrc,
  imageAlt = "",
  rows,
  status = "available",
  statusLabel,
  name,
  designation,
  className,
  style,
}: ProfileCardProps) {
  const theme = STATUS_THEME[status];

  return (
    <article
      className={cn(
        "relative mx-auto flex w-full max-w-[22rem] flex-col overflow-hidden rounded-[1.75rem] border-[2.5px] border-black bg-white shadow-[0_28px_60px_-18px_rgba(15,23,42,0.28)]",
        className,
      )}
      style={style}
    >
      <div className="grid grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <div className="relative aspect-[5/7] w-full overflow-hidden">
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            sizes="(max-width: 640px) 55vw, 260px"
            className="select-none object-cover object-bottom"
            priority={false}
            draggable={false}
          />
        </div>

        <ul className="flex flex-col justify-center px-[clamp(0.85rem,0.7rem+0.6vw,1.15rem)] py-[clamp(0.75rem,0.6rem+0.5vw,1rem)]">
          {rows.map((row, index) => {
            const lines = toLabelLines(row.label);
            return (
              <li
                key={`${row.value}-${index}`}
                className="flex items-center justify-between gap-2 border-t border-black/12 py-[clamp(0.6rem,0.45rem+0.55vw,0.95rem)] first:border-t-0 first:pt-0 last:pb-0"
              >
                <div className="min-w-0 text-[clamp(0.68rem,0.6rem+0.2vw,0.78rem)] font-medium leading-[1.15] tracking-[-0.01em] text-black/75">
                  {lines.map((line, lineIndex) => (
                    <span key={`${line}-${lineIndex}`} className="block truncate">
                      {line}
                    </span>
                  ))}
                </div>
                <span
                  className="shrink-0 font-bold leading-none tracking-[-0.04em] text-[clamp(1.35rem,1.1rem+0.8vw,1.85rem)]"
                  style={{ color: row.valueColor ?? "#000000" }}
                >
                  {row.value}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      <div aria-hidden className="h-px w-full bg-black/15" />

      <div className="flex items-center justify-between gap-3 px-[clamp(0.95rem,0.8rem+0.6vw,1.25rem)] py-[clamp(0.8rem,0.65rem+0.55vw,1.1rem)]">
        <div className="min-w-0">
          <p className="truncate text-[clamp(1rem,0.88rem+0.55vw,1.2rem)] font-bold leading-tight tracking-[-0.025em] text-black">
            {name}
          </p>
          <p className="truncate text-[clamp(0.72rem,0.65rem+0.25vw,0.85rem)] leading-tight text-black/60">
            {designation}
          </p>
        </div>

        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-black px-[clamp(0.6rem,0.5rem+0.3vw,0.8rem)] py-[clamp(0.3rem,0.25rem+0.1vw,0.4rem)]">
          <span
            aria-hidden
            className="size-[6px] rounded-full"
            style={{ backgroundColor: theme.dotColor }}
          />
          <span className="text-[clamp(0.68rem,0.62rem+0.2vw,0.78rem)] font-semibold text-black">
            {statusLabel ?? theme.label}
          </span>
        </span>
      </div>
    </article>
  );
}
