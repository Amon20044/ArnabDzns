"use client";

import Image from "next/image";
import { CheckCircle2Icon, KeyRoundIcon, QrCodeIcon } from "lucide-react";
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

const CHANGE_PASSWORD_LOGIN_PATH = "/login?next=%2Fchange-password";

export function PasswordChangePanel() {
  const router = useRouter();
  const [setup, setSetup] = useState<SetupPayload | null>(null);
  const [setupStatus, setSetupStatus] = useState<SetupStatus>("loading");
  const [setupRequestId, setSetupRequestId] = useState(0);
  const [otp, setOtp] = useState("");
  const [verified, setVerified] = useState(false);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let ignore = false;

    async function loadSetup() {
      setSetupStatus("loading");
      setMessage("");

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
        setMessage("Your session expired. Redirecting to login...");
        router.replace(CHANGE_PASSWORD_LOGIN_PATH);
        router.refresh();
        return;
      }

      if (!response.ok || !result) {
        setSetupStatus("error");
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

  function verifyOtp(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    startTransition(async () => {
      setMessage("");

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
        setMessage(result.message ?? "Authenticator code could not be verified.");
        return;
      }

      setVerified(true);
      setMessage("Authenticator verified.");
    });
  }

  function changePassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      setMessage("");

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
          setVerified(false);
        }

        setMessage(result.message ?? "Password could not be changed.");
        return;
      }

      setMessage("Password changed. Use the new password the next time you sign in.");
      setVerified(false);
      setOtp("");
      event.currentTarget.reset();
    });
  }

  return (
    <section className="mx-auto grid w-full max-w-5xl gap-5 px-4 pb-24 pt-8 md:grid-cols-[22rem_1fr] md:px-6 lg:px-8">
      <Card className="rounded-2xl bg-white/82">
        <CardHeader>
          <div className="flex size-10 items-center justify-center rounded-xl bg-accent-surface text-accent-dark">
            <QrCodeIcon className="size-5" />
          </div>
          <CardTitle>Authenticator</CardTitle>
          <CardDescription>{setup?.email ?? "Admin account"}</CardDescription>
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
              <div className="grid size-56 place-items-center text-sm text-muted-foreground">
                Loading authenticator setup...
              </div>
            )}
          </div>
          <div className="rounded-xl border border-border bg-white/70 p-3 font-mono text-xs leading-5 text-text-secondary">
            {setupStatus === "ready" ? setup?.secret : "Loading secret..."}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl bg-white/86">
        <CardHeader>
          <div className="flex size-10 items-center justify-center rounded-xl bg-zinc-950 text-white">
            {verified ? (
              <CheckCircle2Icon className="size-5" />
            ) : (
              <KeyRoundIcon className="size-5" />
            )}
          </div>
          <CardTitle>Change password</CardTitle>
          <CardDescription>
            Verify a current Authenticator code before saving a new password.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5">
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
                  disabled={setupStatus !== "ready" || isPending}
                  required
                />
              </Field>
              <Button
                type="submit"
                disabled={setupStatus !== "ready" || isPending || otp.length < 6}
              >
                {verified ? "Verified" : "Verify code"}
              </Button>
            </FieldGroup>
          </form>

          <form
            onSubmit={changePassword}
            className={cn(
              "grid gap-4 rounded-2xl border border-border bg-white/70 p-4",
              !verified && "opacity-55",
            )}
          >
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="password">New password</FieldLabel>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  disabled={setupStatus !== "ready" || !verified || isPending}
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
                  disabled={setupStatus !== "ready" || !verified || isPending}
                  required
                />
              </Field>
              <Button
                type="submit"
                disabled={setupStatus !== "ready" || !verified || isPending}
              >
                Save password
              </Button>
            </FieldGroup>
          </form>

          {message ? (
            <FieldDescription
              className={cn(
                "rounded-xl border px-3 py-2",
                message.includes("changed") || message.includes("verified")
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-rose-200 bg-rose-50 text-rose-700",
              )}
            >
              {message}
            </FieldDescription>
          ) : null}
        </CardContent>
      </Card>
    </section>
  );
}
