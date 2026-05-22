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
  QrCodeIcon,
  ShieldCheckIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface SetupPayload {
  email: string;
  secret: string;
  qrDataUrl: string;
}

type SetupStatus = "loading" | "ready" | "error";
type Step = "scan" | "verify" | "password" | "done";

const CHANGE_PASSWORD_LOGIN_PATH = "/login?next=%2Fchange-password";

const STEPS = [
  { key: "scan", label: "Scan", icon: QrCodeIcon },
  { key: "verify", label: "Verify", icon: ShieldCheckIcon },
  { key: "password", label: "Password", icon: KeyRoundIcon },
] as const;

function stepIndex(step: Step) {
  const order: Step[] = ["scan", "verify", "password", "done"];
  return order.indexOf(step);
}

export function PasswordChangePanel() {
  const router = useRouter();
  const [setup, setSetup] = useState<SetupPayload | null>(null);
  const [setupStatus, setSetupStatus] = useState<SetupStatus>("loading");
  const [setupRequestId, setSetupRequestId] = useState(0);
  const [step, setStep] = useState<Step>("scan");
  const [otp, setOtp] = useState("");
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let ignore = false;

    async function loadSetup() {
      setSetupStatus("loading");
      setMessage("");
      setIsError(false);

      const response = await fetch("/api/auth/password/setup", {
        cache: "no-store",
      });
      const result = (await response.json().catch(() => null)) as
        | (SetupPayload & { message?: string })
        | null;

      if (ignore) {
        return;
      }

      if (response.status === 401) {
        setSetupStatus("error");
        setIsError(true);
        setMessage("Your session expired. Redirecting to login...");
        router.replace(CHANGE_PASSWORD_LOGIN_PATH);
        router.refresh();
        return;
      }

      if (!response.ok || !result) {
        setSetupStatus("error");
        setIsError(true);
        setMessage(result?.message ?? "Authenticator setup could not be loaded.");
        return;
      }

      setSetup(result);
      setSetupStatus("ready");
    }

    loadSetup();

    return () => {
      ignore = true;
    };
  }, [router, setupRequestId]);

  function notify(text: string, error = false) {
    setMessage(text);
    setIsError(error);
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ otp: otp.trim() }),
      });
      const result = (await response.json()) as { message?: string; verified?: boolean };

      if (response.status === 401) {
        router.replace(CHANGE_PASSWORD_LOGIN_PATH);
        router.refresh();
        return;
      }

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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password: formData.get("password"),
          confirmPassword: formData.get("confirmPassword"),
        }),
      });
      const result = (await response.json()) as { message?: string; changed?: boolean };

      if (response.status === 401) {
        router.replace(CHANGE_PASSWORD_LOGIN_PATH);
        router.refresh();
        return;
      }

      if (!response.ok || !result.changed) {
        if (response.status === 403) {
          // Verification window lapsed — send them back to re-verify.
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

  const activeIndex = stepIndex(step);

  return (
    <section className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 pb-24 pt-10 md:px-6">
      <header className="flex flex-col items-center gap-2 text-center">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-accent-surface text-accent-dark">
          <ShieldCheckIcon className="size-6" />
        </div>
        <h1 className="text-xl font-semibold text-text-primary">Secure password change</h1>
        <p className="max-w-sm text-sm text-text-secondary">
          Pair an authenticator app, confirm a code, then set your new password.
        </p>
      </header>

      {step !== "done" ? (
        <ol className="flex items-center justify-center gap-2">
          {STEPS.map((item, index) => {
            const isComplete = index < activeIndex;
            const isCurrent = index === activeIndex;
            const StepIcon = item.icon;

            return (
              <li key={item.key} className="flex items-center gap-2">
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
                    <StepIcon className="size-3.5" />
                  )}
                  {item.label}
                </span>
                {index < STEPS.length - 1 ? (
                  <span
                    aria-hidden
                    className={cn(
                      "h-px w-4 transition-colors",
                      index < activeIndex ? "bg-emerald-300" : "bg-border",
                    )}
                  />
                ) : null}
              </li>
            );
          })}
        </ol>
      ) : null}

      <Card className="rounded-2xl bg-white/86 shadow-[0_24px_80px_rgba(88,28,135,0.12)]">
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
                {setupStatus === "ready" && setup?.qrDataUrl ? (
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

              <div className="grid gap-1.5">
                <FieldLabel>Can&apos;t scan? Enter this key</FieldLabel>
                <div className="flex items-center gap-2">
                  <code className="flex-1 truncate rounded-xl border border-border bg-white/70 px-3 py-2 font-mono text-xs text-text-secondary">
                    {setupStatus === "ready" ? setup?.secret : "Loading key..."}
                  </code>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-label="Copy setup key"
                    disabled={setupStatus !== "ready"}
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

              <Button
                type="button"
                disabled={setupStatus !== "ready"}
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
                Enter the 6-digit code your authenticator is showing right now.
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
                        setStep("scan");
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
                <Link href="/dashboard">Return to dashboard</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/login">Sign in again</Link>
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
