"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
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
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  DEFAULT_AUTH_REDIRECT_PATH,
  getSafeRedirectPath,
} from "@/lib/auth/redirect";
import { cn } from "@/lib/utils";

export function LoginForm({
  className,
  nextPath,
  ...props
}: React.ComponentProps<"div"> & {
  nextPath?: string | null;
}) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const safeNextPath = getSafeRedirectPath(nextPath);
  const isChangePasswordFlow = safeNextPath === "/change-password";

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      setMessage("");

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.get("email"),
          password: formData.get("password"),
          next: safeNextPath,
        }),
      });
      const result = (await response.json()) as {
        message?: string;
        redirectTo?: string;
      };

      if (!response.ok) {
        setMessage(result.message ?? "Login failed.");
        return;
      }

      router.replace(result.redirectTo ?? DEFAULT_AUTH_REDIRECT_PATH);
      router.refresh();
    });
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="rounded-2xl bg-white/86 shadow-[0_24px_80px_rgba(88,28,135,0.12)]">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Admin login</CardTitle>
          <CardDescription>
            {isChangePasswordFlow
              ? "Sign in first, then we'll take you to change your password."
              : "Sign in to manage portfolio content."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="johndoe@gmail.com"
                  autoComplete="email"
                  required
                />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <Link
                    href="/change-password"
                    className="ml-auto text-sm underline-offset-4 hover:underline"
                  >
                    Change password
                  </Link>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                />
              </Field>
              <Field>
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Signing in..." : "Login"}
                </Button>
                {message ? (
                  <FieldDescription className="text-center text-rose-600">
                    {message}
                  </FieldDescription>
                ) : null}
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
