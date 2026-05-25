"use client";

import { ArrowLeft, Bell, ShoppingBag } from "lucide-react";
import { PrimaryButton } from "@/components/ui/primary-button";
import { StatusBadge } from "@/components/ui/status-badge";

export function ShopHero() {
  return (
    <div className="max-w-2xl">
      <StatusBadge
        compact
        tone="#a855f7"
        iconColor="#ffffff"
        leading={<ShoppingBag className="size-3.5" />}
      >
        Digital Shop
      </StatusBadge>

      <h1 className="mt-5 max-w-[10ch] text-[clamp(2.65rem,14vw,6.5rem)] font-semibold leading-[0.88] tracking-normal text-text-primary">
        Template drops are loading.
      </h1>

      <p className="mt-5 max-w-xl text-base leading-7 text-text-secondary sm:text-lg">
        Editable design systems, launch graphics, and creator-ready packs are being prepared for the first release.
      </p>

      <div className="mt-7 flex flex-wrap items-center gap-3">
        <PrimaryButton
          label="Notify me"
          href="/contact"
          Icon={Bell}
          size="compact"
          iconVisibility="always"
        />
        <PrimaryButton
          label="Back home"
          href="/"
          Icon={ArrowLeft}
          size="compact"
          iconVisibility="always"
          tone="white"
        />
      </div>
    </div>
  );
}
