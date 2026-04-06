"use client";

import { useState, useTransition } from "react";
import { LoaderCircle, SendHorizonal } from "lucide-react";

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

export function InquiryForm({
  source,
  defaultInquiryType,
  submitLabel,
}: InquiryFormProps) {
  const [status, setStatus] = useState<FormStatus>({
    type: "idle",
    message: "Tell me the shape of the project and I will reply with the best next step.",
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
        message: "Sending your message...",
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
            "Your message is on the way. Expect a reply in your inbox soon.",
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
    <form onSubmit={handleSubmit} className="page-surface page-reveal p-7 md:p-8">
      <div className="page-stack">
        <div className="space-y-3">
          <span className="eyebrow-chip">Project Form</span>
          <h2 className="text-2xl font-semibold tracking-tight text-text-primary">
            Share the brief, not the polished version.
          </h2>
          <p className="text-sm leading-6 text-text-secondary md:text-base">
            Raw context is enough. Goals, rough scope, loose notes, and half-formed ideas are all
            welcome here.
          </p>
        </div>

        <input type="hidden" name="source" value={source} />

        <div className="grid gap-4 md:grid-cols-2">
          <label className="form-field">
            <span className="form-label">Name</span>
            <input
              className="form-input"
              name="name"
              type="text"
              placeholder="Your name"
              autoComplete="name"
              required
            />
          </label>

          <label className="form-field">
            <span className="form-label">Email</span>
            <input
              className="form-input"
              name="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="form-field">
            <span className="form-label">Brand or project</span>
            <input
              className="form-input"
              name="brand"
              type="text"
              placeholder="Studio name, product, or idea"
            />
          </label>

          <label className="form-field">
            <span className="form-label">Inquiry type</span>
            <select
              className="form-select"
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

        <div className="grid gap-4 md:grid-cols-2">
          <label className="form-field">
            <span className="form-label">Budget</span>
            <select className="form-select" name="budget" defaultValue="Let's discuss">
              {budgetOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="form-field">
            <span className="form-label">Timeline</span>
            <select className="form-select" name="timeline" defaultValue="Flexible">
              {timelineOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="form-field">
          <span className="form-label">What are we making?</span>
          <textarea
            className="form-textarea"
            name="message"
            placeholder="A landing page, portfolio refresh, product redesign, booking flow, design system, or something else..."
            minLength={20}
            required
          />
        </label>

        <div className="flex flex-col gap-3 pt-1 md:flex-row md:items-center md:justify-between">
          <p
            aria-live="polite"
            className={
              status.type === "error"
                ? "status-text status-error"
                : status.type === "success"
                  ? "status-text status-success"
                  : "status-text"
            }
          >
            {status.message}
          </p>

          <button className="primary-button" type="submit" disabled={isPending}>
            {isPending ? (
              <>
                <LoaderCircle className="h-4 w-4 animate-spin" />
                <span>Sending...</span>
              </>
            ) : (
              <>
                <span>{submitLabel}</span>
                <SendHorizonal className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
