"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckCircle2Icon,
  CheckIcon,
  CopyIcon,
  KeyRoundIcon,
  Loader2Icon,
  MailIcon,
  QrCodeIcon,
  ShieldCheckIcon,
} from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface SetupPayload {
  email: string;
  paired: boolean;
  secret?: string;
  qrDataUrl?: string;
}

type SetupStatus = "loading" | "ready" | "error";
type Step = "init" | "email" | "scan" | "verify" | "password" | "done";

const PHASES = [
  { label: "Account", icon: MailIcon },
  { label: "Verify", icon: ShieldCheckIcon },
  { label: "Password", icon: KeyRoundIcon },
] as const;

function phaseIndex(step: Step) {
  if (step === "init" || step === "email" || step === "scan") {
    return 0;
  }
  if (step === "verify") {
    return 1;
  }
  if (step === "password") {
    return 2;
  }
  return 3;
}

export function PasswordChangePanel() {
  const [setup, setSetup] = useState<SetupPayload | null>(null);
  const [setupStatus, setSetupStatus] = useState<SetupStatus>("loading");
  const [setupRequestId, setSetupRequestId] = useState(0);
  const [step, setStep] = useState<Step>("init");
  const [emailInput, setEmailInput] = useState("");
  const [otp, setOtp] = useState("");
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isPending, startTransition] = useTransition();

  // On load, probe with no email. A live session resolves straight to the
  // authenticator step; otherwise the API asks us for an email first.
  useEffect(() => {
    let ignore = false;

    async function init() {
      setSetupStatus("loading");
      setMessage("");
      setIsError(false);

      const response = await fetch("/api/auth/password/setup", { cache: "no-store" });
      const result = (await response.json().catch(() => null)) as
        | (SetupPayload & { message?: string; needsEmail?: boolean })
        | null;

      if (ignore) {
        return;
      }

      if (response.status === 400 && result?.needsEmail) {
        setStep("email");
        setSetupStatus("ready");
        return;
      }

      if (!response.ok || !result) {
        setSetupStatus("error");
        setStep("email");
        setMessage(result?.message ?? "Authenticator setup could not be loaded.");
        setIsError(true);
        return;
      }

      setSetup(result);
      setSetupStatus("ready");
      setStep(result.qrDataUrl ? "scan" : "verify");
    }

    init();

    return () => {
      ignore = true;
    };
  }, [setupRequestId]);

  function notify(text: string, error = false) {
    setMessage(text);
    setIsError(error);
  }

  function submitEmail(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = emailInput.trim().toLowerCase();

    if (!value) {
      return;
    }

    startTransition(async () => {
      notify("");

      const response = await fetch(
        `/api/auth/password/setup?email=${encodeURIComponent(value)}`,
        { cache: "no-store" },
      );
      const result = (await response.json().catch(() => null)) as
        | (SetupPayload & { message?: string })
        | null;

      if (!response.ok || !result) {
        notify(result?.message ?? "We couldn't find an admin with that email.", true);
        return;
      }

      setSetup(result);
      setSetupStatus("ready");
      setStep(result.qrDataUrl ? "scan" : "verify");
    });
  }

  async function copySecret() {
    if (!setup?.secret) {
      return;
    }

    try {
      await navigator.clipboard.writeText(setup.secret);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      notify("Could not copy the key — select it manually.", true);
    }
  }

  function verifyOtp(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    startTransition(async () => {
      notify("");

      const response = await fetch("/api/auth/password/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp: otp.trim(), email: setup?.email }),
      });
      const result = (await response.json()) as { message?: string; verified?: boolean };

      if (!response.ok || !result.verified) {
        notify(result.message ?? "Authenticator code could not be verified.", true);
        return;
      }

      setStep("password");
      notify("Authenticator confirmed. Choose a new password.");
    });
  }

  function changePassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      notify("");

      const response = await fetch("/api/auth/password/change", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: setup?.email,
          password: formData.get("password"),
          confirmPassword: formData.get("confirmPassword"),
        }),
      });
      const result = (await response.json()) as { message?: string; changed?: boolean };

      if (!response.ok || !result.changed) {
        if (response.status === 403) {
          // Verification window lapsed — send them back to re-enter a code.
          setOtp("");
          setStep("verify");
        }

        notify(result.message ?? "Password could not be changed.", true);
        return;
      }

      form.reset();
      setOtp("");
      setStep("done");
      notify("");
    });
  }

  const activePhase = phaseIndex(step);

  return (
    <section className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 pb-24 pt-10 md:px-6">
      <header className="flex flex-col items-center gap-2 text-center">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-accent-surface text-accent-dark">
          <ShieldCheckIcon className="size-6" />
        </div>
        <h1 className="text-xl font-semibold text-text-primary">Change your password</h1>
        <p className="max-w-sm text-sm text-text-secondary">
          Confirm a code from your authenticator, then set a new password — no current
          password needed.
        </p>
      </header>

      {step !== "done" ? (
        <ol className="flex items-center justify-center gap-2">
          {PHASES.map((item, index) => {
            const isComplete = index < activePhase;
            const isCurrent = index === activePhase;
            const PhaseIcon = item.icon;

            return (
              <li key={item.label} className="flex items-center gap-2">
                <span
                  className={cn(
                    "flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                    isCurrent
                      ? "border-accent/40 bg-accent-surface text-accent-dark"
                      : isComplete
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-border bg-white/60 text-muted-foreground",
                  )}
                >
                  {isComplete ? (
                    <CheckIcon className="size-3.5" />
                  ) : (
                    <PhaseIcon className="size-3.5" />
                  )}
                  {item.label}
                </span>
                {index < PHASES.length - 1 ? (
                  <span
                    aria-hidden
                    className={cn(
                      "h-px w-4 transition-colors",
                      index < activePhase ? "bg-emerald-300" : "bg-border",
                    )}
                  />
                ) : null}
              </li>
            );
          })}
        </ol>
      ) : null}

      <Card className="rounded-2xl bg-white/86 shadow-[0_24px_80px_rgba(88,28,135,0.12)]">
        {step === "init" ? (
          <CardContent className="grid place-items-center gap-2 py-16 text-sm text-muted-foreground">
            <Loader2Icon className="size-5 animate-spin" />
            Checking your account...
          </CardContent>
        ) : null}

        {step === "email" ? (
          <>
            <CardHeader>
              <div className="flex size-10 items-center justify-center rounded-xl bg-accent-surface text-accent-dark">
                <MailIcon className="size-5" />
              </div>
              <CardTitle>Which account?</CardTitle>
              <CardDescription>
                Enter the admin email so we can match it to your authenticator.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={submitEmail}>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="email">Admin email</FieldLabel>
                    <Input
                      id="email"
                      type="email"
                      value={emailInput}
                      onChange={(event) => setEmailInput(event.target.value)}
                      placeholder="you@example.com"
                      autoComplete="email"
                      autoFocus
                      disabled={isPending}
                      required
                    />
                  </Field>
                  <Button type="submit" disabled={isPending || !emailInput.trim()}>
                    {isPending ? (
                      <>
                        <Loader2Icon className="size-4 animate-spin" />
                        Checking...
                      </>
                    ) : (
                      <>
                        Continue
                        <ArrowRightIcon data-icon="inline-end" className="size-4" />
                      </>
                    )}
                  </Button>
                </FieldGroup>
              </form>
            </CardContent>
          </>
        ) : null}

        {step === "scan" ? (
          <>
            <CardHeader>
              <div className="flex size-10 items-center justify-center rounded-xl bg-accent-surface text-accent-dark">
                <QrCodeIcon className="size-5" />
              </div>
              <CardTitle>Register your authenticator</CardTitle>
              <CardDescription>
                Scan this with Google Authenticator, 1Password, or Authy
                {setup?.email ? ` for ${setup.email}` : ""}.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid place-items-center rounded-2xl border border-border bg-white p-4">
                {setup?.qrDataUrl ? (
                  <Image
                    src={setup.qrDataUrl}
                    width={220}
                    height={220}
                    alt="Authenticator QR code"
                    unoptimized
                    className="size-56"
                  />
                ) : setupStatus === "error" ? (
                  <div className="grid gap-3 px-4 py-6 text-center text-sm text-rose-600">
                    <p>{message || "Authenticator setup could not be loaded."}</p>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setSetupRequestId((current) => current + 1)}
                    >
                      Retry
                    </Button>
                  </div>
                ) : (
                  <div className="grid size-56 place-items-center gap-2 text-sm text-muted-foreground">
                    <Loader2Icon className="size-5 animate-spin" />
                    Loading authenticator setup...
                  </div>
                )}
              </div>

              {setup?.secret ? (
                <div className="grid gap-1.5">
                  <FieldLabel>Can&apos;t scan? Enter this key</FieldLabel>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 truncate rounded-xl border border-border bg-white/70 px-3 py-2 font-mono text-xs text-text-secondary">
                      {setup.secret}
                    </code>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      aria-label="Copy setup key"
                      onClick={copySecret}
                    >
                      {copied ? (
                        <CheckIcon className="size-4 text-emerald-600" />
                      ) : (
                        <CopyIcon className="size-4" />
                      )}
                    </Button>
                  </div>
                </div>
              ) : null}

              <Button
                type="button"
                onClick={() => {
                  notify("");
                  setStep("verify");
                }}
              >
                I&apos;ve added it — continue
                <ArrowRightIcon data-icon="inline-end" className="size-4" />
              </Button>
            </CardContent>
          </>
        ) : null}

        {step === "verify" ? (
          <>
            <CardHeader>
              <div className="flex size-10 items-center justify-center rounded-xl bg-zinc-950 text-white">
                <ShieldCheckIcon className="size-5" />
              </div>
              <CardTitle>Confirm the connection</CardTitle>
              <CardDescription>
                Enter the 6-digit code your authenticator is showing right now
                {setup?.email ? ` for ${setup.email}` : ""}.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <form onSubmit={verifyOtp}>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="otp">Authenticator code</FieldLabel>
                    <Input
                      id="otp"
                      value={otp}
                      onChange={(event) =>
                        setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))
                      }
                      inputMode="numeric"
                      pattern="[0-9]*"
                      autoComplete="one-time-code"
                      placeholder="000000"
                      className="text-center font-mono text-lg tracking-[0.4em]"
                      autoFocus
                      disabled={isPending}
                      required
                    />
                  </Field>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        notify("");
                        setStep(setup?.qrDataUrl ? "scan" : "email");
                      }}
                    >
                      <ArrowLeftIcon data-icon="inline-start" className="size-4" />
                      Back
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1"
                      disabled={isPending || otp.length < 6}
                    >
                      {isPending ? (
                        <>
                          <Loader2Icon className="size-4 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        "Verify code"
                      )}
                    </Button>
                  </div>
                </FieldGroup>
              </form>
            </CardContent>
          </>
        ) : null}

        {step === "password" ? (
          <>
            <CardHeader>
              <div className="flex size-10 items-center justify-center rounded-xl bg-zinc-950 text-white">
                <KeyRoundIcon className="size-5" />
              </div>
              <CardTitle>Set a new password</CardTitle>
              <CardDescription>
                Use at least 8 characters. You&apos;ll sign in with this next time.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <form onSubmit={changePassword}>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="password">New password</FieldLabel>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="new-password"
                      minLength={8}
                      autoFocus
                      disabled={isPending}
                      required
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="confirmPassword">Confirm password</FieldLabel>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      minLength={8}
                      disabled={isPending}
                      required
                    />
                  </Field>
                  <Button type="submit" disabled={isPending}>
                    {isPending ? (
                      <>
                        <Loader2Icon className="size-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save new password"
                    )}
                  </Button>
                </FieldGroup>
              </form>
            </CardContent>
          </>
        ) : null}

        {step === "done" ? (
          <>
            <CardHeader className="text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <CheckCircle2Icon className="size-6" />
              </div>
              <CardTitle>Password updated</CardTitle>
              <CardDescription>
                Your new password is live. Keep your authenticator handy for next time.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              <Button asChild>
                <Link href="/login">Sign in with your new password</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/dashboard">Return to dashboard</Link>
              </Button>
            </CardContent>
          </>
        ) : null}

        {message && step !== "scan" ? (
          <CardContent className="pt-0">
            <FieldDescription
              className={cn(
                "rounded-xl border px-3 py-2",
                isError
                  ? "border-rose-200 bg-rose-50 text-rose-700"
                  : "border-emerald-200 bg-emerald-50 text-emerald-700",
              )}
            >
              {message}
            </FieldDescription>
          </CardContent>
        ) : null}
      </Card>
    </section>
  );
}
