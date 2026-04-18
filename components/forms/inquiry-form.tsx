"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle2,
  LoaderCircle,
  MessageCircleMore,
  SendHorizonal,
  Sparkles,
  X,
} from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { StatusBadge } from "@/components/ui/status-badge";
import { PrimaryButton } from "@/components/ui/primary-button";
import { Heading, Text } from "@/components/ui/typography";
import { buildWhatsAppUrl, siteConfig } from "@/data/site";
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
  autoReplySent?: boolean;
};

const OTHER_INQUIRY_VALUE = "Other";

const inquiryOptions = [
  "Portfolio website",
  "Brand refresh",
  "Product design",
  "Discovery call",
  OTHER_INQUIRY_VALUE,
];

const ease = [0.22, 1, 0.36, 1] as const;

const inputClassName = cn(
  "w-full rounded-[1.45rem] border border-border-accent/70 bg-white/84 px-4 py-3.5",
  "text-[0.96rem] leading-6 text-text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.82),0_12px_28px_rgba(88,28,135,0.06)]",
  "outline-none transition-[transform,border-color,box-shadow,background-color] duration-200",
  "placeholder:text-text-secondary/72",
  "focus:-translate-y-0.5 focus:border-accent/42 focus:bg-white focus:shadow-[0_0_0_5px_rgba(168,85,247,0.08),0_18px_38px_rgba(88,28,135,0.10)]",
  "max-md:!shadow-none max-md:focus:!shadow-none",
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
  const [selectedInquiryType, setSelectedInquiryType] = useState(defaultInquiryType);
  const [customInquiryType, setCustomInquiryType] = useState("");
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const [autoReplySent, setAutoReplySent] = useState(false);
  const [lastWhatsAppUrl, setLastWhatsAppUrl] = useState(siteConfig.contact.whatsappUrl);
  const [isPending, startTransition] = useTransition();

  const isOtherInquiry = selectedInquiryType === OTHER_INQUIRY_VALUE;

  useEffect(() => {
    if (!showSuccessOverlay) {
      return;
    }

    let isCancelled = false;
    const timeoutIds: number[] = [];
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const launchCelebration = async () => {
      const confettiModule = await import("canvas-confetti");

      if (isCancelled) {
        return;
      }

      const confetti = confettiModule.default;
      const defaults = {
        disableForReducedMotion: true,
        resize: true,
        useWorker: true,
        zIndex: 150,
      } as const;

      const fire = (delay: number, options: Parameters<typeof confetti>[0]) => {
        const timeoutId = window.setTimeout(() => {
          void confetti({
            ...defaults,
            ...options,
          });
        }, delay);

        timeoutIds.push(timeoutId);
      };

      fire(0, {
        particleCount: 90,
        spread: 80,
        startVelocity: 48,
        scalar: 1.05,
        origin: { x: 0.5, y: 0.72 },
      });
      fire(140, {
        particleCount: 56,
        angle: 60,
        spread: 68,
        startVelocity: 54,
        origin: { x: 0, y: 0.74 },
      });
      fire(220, {
        particleCount: 56,
        angle: 120,
        spread: 68,
        startVelocity: 54,
        origin: { x: 1, y: 0.74 },
      });
      fire(360, {
        particleCount: 70,
        spread: 110,
        startVelocity: 42,
        decay: 0.92,
        scalar: 0.92,
        origin: { x: 0.5, y: 0.58 },
      });
    };

    void launchCelebration();

    return () => {
      isCancelled = true;
      document.body.style.overflow = previousOverflow;
      timeoutIds.forEach((timeoutId) => window.clearTimeout(timeoutId));
    };
  }, [showSuccessOverlay]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const submittedInquiryType = String(formData.get("inquiryType") ?? "").trim();
    const submittedCustomInquiryType = String(formData.get("customInquiryType") ?? "").trim();
    const resolvedInquiryType =
      submittedInquiryType === OTHER_INQUIRY_VALUE
        ? submittedCustomInquiryType
        : submittedInquiryType || submittedCustomInquiryType;
    const submissionSeed = {
      name: String(formData.get("name") ?? "").trim(),
      brand: String(formData.get("brand") ?? "").trim(),
      inquiryType: resolvedInquiryType,
      message: String(formData.get("message") ?? "").trim(),
      source,
    };
    const payload = Object.fromEntries(formData.entries());

    startTransition(async () => {
      setShowSuccessOverlay(false);
      setAutoReplySent(false);
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

        const confirmationSent = Boolean(data?.autoReplySent);

        form.reset();
        setSelectedInquiryType(defaultInquiryType);
        setCustomInquiryType("");
        setAutoReplySent(confirmationSent);
        setLastWhatsAppUrl(buildWhatsAppUrl(submissionSeed));
        setShowSuccessOverlay(true);
        setStatus({
          type: "success",
          message:
            data?.message ??
            (confirmationSent
              ? "Your note is in. A confirmation email is already on the way."
              : "Your note is in. I will reach out soon with the clearest next step."),
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
    <>
      <form
        onSubmit={handleSubmit}
        className="page-surface page-reveal relative overflow-hidden p-6 sm:p-8 lg:p-9 max-md:!rounded-none max-md:!border-transparent max-md:!bg-none max-md:!shadow-none max-md:!backdrop-blur-none max-md:!p-0"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.72)_0%,transparent_30%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.16)_0%,transparent_42%)] max-md:hidden"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute right-8 top-8 h-32 w-32 rounded-full bg-[radial-gradient(circle,rgba(216,180,254,0.38)_0%,transparent_72%)] blur-2xl max-md:hidden"
        />

        <div className="relative z-[1] page-stack max-md:px-6 max-md:pb-6">
          <div className="mb-6 flex flex-col gap-5 border-b border-border-accent/55 pb-6">
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
                Share the goal, context, and what you are trying to launch. I will reply with the
                clearest next step.
              </Text>
            </div>
          </div>

          <input type="hidden" name="source" value={source} />
          <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" />

          <div className="grid gap-4 md:grid-cols-2">
            <label className="mb-6 flex flex-col gap-3">
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

            <label className="mb-6 flex flex-col gap-3">
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

          <div className="grid gap-4 md:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
            <label className="mb-6 flex flex-col gap-3">
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

            <label className="mb-6 flex flex-col gap-3">
              <Text as="span" variant="p3" className={fieldLabelClassName}>
                Inquiry type
              </Text>
              <select
                className={cn(inputClassName, "appearance-none")}
                name="inquiryType"
                value={selectedInquiryType}
                onChange={(event) => {
                  const nextValue = event.target.value;

                  setSelectedInquiryType(nextValue);

                  if (nextValue !== OTHER_INQUIRY_VALUE) {
                    setCustomInquiryType("");
                  }
                }}
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

          <AnimatePresence initial={false}>
            {isOtherInquiry ? (
              <motion.label
                key="custom-inquiry"
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -8, height: 0 }}
                transition={{ duration: 0.28, ease }}
                className="mb-6 flex flex-col gap-3 overflow-hidden"
              >
                <Text as="span" variant="p3" className={fieldLabelClassName}>
                  Type your inquiry
                </Text>
                <input
                  className={inputClassName}
                  name="customInquiryType"
                  type="text"
                  placeholder="Tell me what this is about"
                  value={customInquiryType}
                  onChange={(event) => setCustomInquiryType(event.target.value)}
                  required={isOtherInquiry}
                />
              </motion.label>
            ) : null}
          </AnimatePresence>

          <label className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5 sm:flex-row sm:items-end sm:justify-between">
              <Text as="span" variant="p3" className={fieldLabelClassName}>
                Project brief
              </Text>
              <Text as="span" variant="p3" className="text-text-secondary/78">
                Scope, problem, and the kind of outcome you want.
              </Text>
            </div>
            <textarea
              className={cn(inputClassName, "min-h-[14rem] resize-y")}
              name="message"
              placeholder="What are you building, what matters most, and where do you want help?"
              minLength={20}
              required
            />
          </label>

          <div className="grid gap-4 border-t border-border-accent/55 pt-6 mt-6">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={`${status.type}-${status.message}`}
                initial={{ opacity: 0, y: 8, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -6, filter: "blur(8px)" }}
                transition={{ duration: 0.24, ease }}
                className="flex min-h-14 items-center gap-3 rounded-[1.4rem] border border-border-accent/55 bg-white/74 px-4 py-3 shadow-[0_10px_24px_rgba(88,28,135,0.05)] max-md:!shadow-none"
                role="status"
                aria-live="polite"
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

      <SuccessCelebrationOverlay
        open={showSuccessOverlay}
        autoReplySent={autoReplySent}
        whatsappUrl={lastWhatsAppUrl}
        onClose={() => setShowSuccessOverlay(false)}
      />
    </>
  );
}

function SuccessCelebrationOverlay({
  open,
  autoReplySent,
  whatsappUrl,
  onClose,
}: {
  open: boolean;
  autoReplySent: boolean;
  whatsappUrl: string;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
        >
          <motion.button
            type="button"
            aria-label="Close success message"
            className="absolute inset-0 bg-[rgba(9,9,11,0.46)] backdrop-blur-xl"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="contact-success-title"
            aria-describedby="contact-success-description"
            className="page-surface relative z-[1] w-full max-w-2xl overflow-hidden rounded-[2rem] border-white/70 p-6 shadow-[0_30px_100px_rgba(15,23,42,0.22)] max-md:!shadow-none sm:p-8"
            initial={{ opacity: 0, y: 28, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.98 }}
            transition={{ duration: 0.34, ease }}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.72)_0%,transparent_30%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.22)_0%,transparent_42%)]"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(216,180,254,0.42)_0%,transparent_72%)] blur-3xl"
            />

            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 inline-flex size-10 items-center justify-center rounded-full border border-border-accent/60 bg-white/82 text-text-primary shadow-[0_12px_28px_rgba(88,28,135,0.08)] transition-transform duration-200 hover:-translate-y-0.5 hover:text-accent max-md:!shadow-none"
            >
              <X className="size-4.5" />
            </button>

            <div className="relative z-[1]">
              <StatusBadge tone="#059669" textColor="#ecfdf5" iconColor="#bbf7d0">
                Inquiry sent
              </StatusBadge>

              <Heading
                variant="h3"
                as="h2"
                id="contact-success-title"
                className="mt-5 text-balance"
              >
                Your brief is in. I will reach out soon.
              </Heading>

              <Text
                variant="p2"
                id="contact-success-description"
                className="mt-4 max-w-xl text-pretty text-text-secondary"
              >
                Thanks for taking the time to write it out. The next reply you get from me should
                feel useful, specific, and worth the wait.
              </Text>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[1.5rem] border border-white/70 bg-white/78 p-4 shadow-[0_16px_38px_rgba(88,28,135,0.08)] max-md:!shadow-none">
                  <Text as="span" variant="p3" className="text-text-secondary/74">
                    What just happened
                  </Text>
                  <Heading variant="h5" as="h3" className="mt-2">
                    Your message landed successfully.
                  </Heading>
                  <Text variant="p2" className="mt-2 text-text-secondary">
                    {autoReplySent
                      ? "A confirmation email is also on its way, so you have a clean paper trail."
                      : "Your submission is secured, and I will follow up from the inbox you used."}
                  </Text>
                </div>

                <div className="rounded-[1.5rem] border border-white/70 bg-[linear-gradient(180deg,rgba(250,245,255,0.92)_0%,rgba(255,255,255,0.88)_100%)] p-4 shadow-[0_16px_38px_rgba(88,28,135,0.08)] max-md:!shadow-none">
                  <Text as="span" variant="p3" className="text-text-secondary/74">
                    Need faster alignment? Feel free to reach out on WhatsApp.
                  </Text>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <PrimaryButton
                  label="Back to the page"
                  onClick={onClose}
                  Icon={CheckCircle2}
                  className="w-full"
                  fullWidth
                />
                <PrimaryButton
                  label={`WhatsApp ${siteConfig.contact.whatsappDisplay}`}
                  href={whatsappUrl}
                  external
                  Icon={MessageCircleMore}
                  tone="whatsapp"
                  className="w-full"
                  fullWidth
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
