"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle2,
  LoaderCircle,
  SendHorizonal,
  Sparkles,
} from "lucide-react";
import { useState, useTransition } from "react";
import { StatusBadge } from "@/components/ui/status-badge";
import { PrimaryButton } from "@/components/ui/primary-button";
import { Heading, Text } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

type FormStatus =
  | {
      type: "idle";
      message: string;
    }
  | {
      type: "success" | "error";
      message: string;
    };

type InquiryFormProps = {
  source: string;
  defaultInquiryType: string;
  submitLabel: string;
};

type ContactResponse = {
  message?: string;
};

const inquiryOptions = [
  "Portfolio website",
  "Brand refresh",
  "Product design",
  "Discovery call",
  "Something else",
];

const budgetOptions = [
  "Under $1k",
  "$1k - $3k",
  "$3k - $7k",
  "$7k+",
  "Let's discuss",
];

const timelineOptions = [
  "ASAP",
  "This month",
  "Next 1-2 months",
  "Flexible",
];

const responseOptions = [
  "Email",
  "WhatsApp",
  "Call",
  "No preference",
];

const ease = [0.22, 1, 0.36, 1] as const;

const inputClassName = cn(
  "w-full rounded-[1.45rem] border border-border-accent/70 bg-white/84 px-4 py-3.5",
  "text-[0.96rem] leading-6 text-text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.82),0_12px_28px_rgba(88,28,135,0.06)]",
  "outline-none transition-[transform,border-color,box-shadow,background-color] duration-200",
  "placeholder:text-text-secondary/72",
  "focus:-translate-y-0.5 focus:border-accent/42 focus:bg-white focus:shadow-[0_0_0_5px_rgba(168,85,247,0.08),0_18px_38px_rgba(88,28,135,0.10)]",
);

const fieldLabelClassName =
  "text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-text-primary/74";

export function InquiryForm({
  source,
  defaultInquiryType,
  submitLabel,
}: InquiryFormProps) {
  const [status, setStatus] = useState<FormStatus>({
    type: "idle",
    message: "Share the rough brief. The reply will focus on the sharpest next step.",
  });
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    startTransition(async () => {
      setStatus({
        type: "idle",
        message: "Sending your project note...",
      });

      try {
        const response = await fetch("/api/contact", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        const data = (await response.json().catch(() => null)) as ContactResponse | null;

        if (!response.ok) {
          setStatus({
            type: "error",
            message:
              data?.message ??
              "Something went wrong while sending the message. Please try again.",
          });
          return;
        }

        form.reset();
        setStatus({
          type: "success",
          message:
            data?.message ??
            "Your note is on the way. Expect a thoughtful reply in your inbox soon.",
        });
      } catch {
        setStatus({
          type: "error",
          message: "The request could not be completed. Please try again in a moment.",
        });
      }
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="page-surface page-reveal relative overflow-hidden p-6 sm:p-8 lg:p-9"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.72)_0%,transparent_30%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.16)_0%,transparent_42%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-8 top-8 h-32 w-32 rounded-full bg-[radial-gradient(circle,rgba(216,180,254,0.38)_0%,transparent_72%)] blur-2xl"
      />

      <div className="relative z-[1] page-stack">
        <div className="flex flex-col gap-5 border-b border-border-accent/55 pb-6 mb-6">
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge tone="#18181b" textColor="#fafafa" iconColor="#fafafa">
              Project Form
            </StatusBadge>
          </div>

          <div className="max-w-2xl">
            <Heading variant="h3" as="h2" className="text-balance">
              Tell me what you need.
            </Heading>
            <Text variant="p2" className="mt-4 max-w-2xl text-pretty">
              Share the scope, timeline, and goal. I will reply with the clearest next step.
            </Text>
          </div>
        </div>

        <input type="hidden" name="source" value={source} />
        <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" />

        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-3 mb-6">
            <Text as="span" variant="p3" className={fieldLabelClassName}>
              Name
            </Text>
            <input
              className={inputClassName}
              name="name"
              type="text"
              placeholder="Your name"
              autoComplete="name"
              required
            />
          </label>

          <label className="flex flex-col gap-3 mb-6">
            <Text as="span" variant="p3" className={fieldLabelClassName}>
              Email
            </Text>
            <input
              className={inputClassName}
              name="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-3">
            <Text as="span" variant="p3" className={fieldLabelClassName}>
              Brand or project
            </Text>
            <input
              className={inputClassName}
              name="brand"
              type="text"
              placeholder="Studio name, product, or idea"
            />
          </label>

          <label className="flex flex-col gap-3 mb-6">
            <Text as="span" variant="p3" className={fieldLabelClassName}>
              Inquiry type
            </Text>
            <select
              className={cn(inputClassName, "appearance-none")}
              name="inquiryType"
              defaultValue={defaultInquiryType}
              required
            >
              {inquiryOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <label className="flex flex-col gap-3 mb-6">
            <Text as="span" variant="p3" className={fieldLabelClassName}>
              Budget
            </Text>
            <select className={cn(inputClassName, "appearance-none")} name="budget" defaultValue="Let's discuss">
              {budgetOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-3 mb-6">
            <Text as="span" variant="p3" className={fieldLabelClassName}>
              Timeline
            </Text>
            <select className={cn(inputClassName, "appearance-none")} name="timeline" defaultValue="Flexible">
              {timelineOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-3 mb-6">
            <Text as="span" variant="p3" className={fieldLabelClassName}>
              Preferred reply
            </Text>
            <select
              className={cn(inputClassName, "appearance-none")}
              name="preferredContactMethod"
              defaultValue="Email"
            >
              {responseOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5 sm:flex-row sm:items-end sm:justify-between">
            <Text as="span" variant="p3" className={fieldLabelClassName}>
              Project brief
            </Text>
            <Text as="span" variant="p3" className="text-text-secondary/78">
              Scope, problem, and what success looks like.
            </Text>
          </div>
          <textarea
            className={cn(inputClassName, "min-h-[14rem] resize-y")}
            name="message"
            placeholder="Portfolio site, landing page, redesign, frontend build, or any other project details..."
            minLength={20}
            required
          />
        </label>

        <div className="grid gap-4 border-t border-border-accent/55 pt-6">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={`${status.type}-${status.message}`}
              initial={{ opacity: 0, y: 8, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -6, filter: "blur(8px)" }}
              transition={{ duration: 0.24, ease }}
              className="flex min-h-14 items-center gap-3 rounded-[1.4rem] border border-border-accent/55 bg-white/74 px-4 py-3 shadow-[0_10px_24px_rgba(88,28,135,0.05)]"
            >
              <span
                className={cn(
                  "inline-flex size-8 shrink-0 items-center justify-center rounded-full",
                  status.type === "success"
                    ? "bg-emerald-100 text-emerald-700"
                    : status.type === "error"
                      ? "bg-rose-100 text-rose-700"
                      : "bg-accent/10 text-accent",
                )}
              >
                {status.type === "success" ? (
                  <CheckCircle2 className="size-4.5" />
                ) : status.type === "error" ? (
                  <Sparkles className="size-4.5" />
                ) : (
                  <SendHorizonal className="size-4" />
                )}
              </span>
              <Text
                variant="p2"
                className={cn(
                  "flex-1 leading-6",
                  status.type === "success"
                    ? "text-emerald-800"
                    : status.type === "error"
                      ? "text-rose-700"
                      : "text-text-secondary",
                )}
              >
                {status.message}
              </Text>
            </motion.div>
          </AnimatePresence>

          <PrimaryButton
            type="submit"
            disabled={isPending}
            fullWidth
            label={isPending ? "Sending..." : submitLabel}
            Icon={isPending ? LoaderCircle : SendHorizonal}
            iconVisibility="always"
            iconClassName={isPending ? "animate-spin" : undefined}
          />
        </div>
      </div>
    </form>
  );
}
