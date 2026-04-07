"use client";

import { motion, type Variants } from "framer-motion";
import { ArrowRight, Building2, Star } from "lucide-react";
import { PrimaryButton } from "@/components/ui/primary-button";
import { StatusBadge } from "@/components/ui/status-badge";
import { typography } from "@/lib/style";
import { cn } from "@/lib/utils";

const ease = [0.22, 1, 0.36, 1] as const;

const blurUp: Variants = {
  hidden: { opacity: 0, y: 28, filter: "blur(18px)" },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.95,
      delay: 0.08 + i * 0.12,
      ease,
    },
  }),
};

export const Hero = () => {
  return (
    <section className="relative flex min-h-[60vh] w-full flex-col items-center justify-center py-16 text-center sm:py-20">
      {/* ---- Stat pills row ---- */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <motion.div
          custom={0}
          initial="hidden"
          animate="visible"
          variants={blurUp}
        >
          <StatusBadge
            tone="#a855f7"
            iconColor="#f5e1ff"
            leading={
              <span className="flex items-center gap-0.5">
                {[0, 1, 2, 3, 4].map((i) => (
                  <Star
                    key={i}
                    className="size-[14px] fill-current stroke-current"
                    strokeWidth={1.5}
                  />
                ))}
              </span>
            }
          >
            200+ Satisfied Customers
          </StatusBadge>
        </motion.div>

        <motion.div
          custom={1}
          initial="hidden"
          animate="visible"
          variants={blurUp}
        >
          <StatusBadge
            tone="#2563eb"
            iconColor="#dbeafe"
            leading={
              <span className="flex size-[18px] items-center justify-center rounded-full bg-white/14">
                <Building2 className="size-[11px]" strokeWidth={2.4} />
              </span>
            }
          >
            10+ Satisfied Orgs
          </StatusBadge>
        </motion.div>
      </div>

      {/* ---- Headline ---- */}
      <motion.h1
        custom={2}
        initial="hidden"
        animate="visible"
        variants={blurUp}
        className={cn(typography.heading.h1, "mt-9 text-text-primary")}
      >
        Your Vision
        <br />
        My creativity
      </motion.h1>

      {/* ---- Subtitle ---- */}
      <motion.p
        custom={3}
        initial="hidden"
        animate="visible"
        variants={blurUp}
        className={cn(typography.text.p1, "mt-7 max-w-md text-text-secondary")}
      >
        Let&apos;s turn ideas into stunning designs.
      </motion.p>

      {/* ---- CTA ---- */}
      <motion.div
        custom={4}
        initial="hidden"
        animate="visible"
        variants={blurUp}
        className="mt-10"
      >
        <PrimaryButton
          label="Get in Touch"
          href="/contact"
          Icon={ArrowRight}
          iconVisibility="hover"
        />
      </motion.div>

      {/* ---- Soft accent halos behind the content ---- */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute left-1/2 top-1/2 size-[640px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(168,85,247,0.10)_0%,transparent_60%)] blur-2xl" />
      </div>
    </section>
  );
};
