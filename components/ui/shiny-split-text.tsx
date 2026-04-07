"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import {
  animate,
  motion,
  useMotionValue,
  type MotionStyle,
  type MotionValue,
} from "motion/react";
import {
  type CSSProperties,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { cn } from "@/lib/utils";

gsap.registerPlugin(useGSAP);

type ShinyDirection = "left" | "right";
type SplitType = "chars" | "words" | "lines";

type TextPart = {
  id: string;
  value: string;
  whitespace?: boolean;
};

type MotionCSSVariableStyle = MotionStyle &
  CSSProperties &
  Record<`--${string}`, string | number | MotionValue<number>>;

type StaticCSSVariableStyle = MotionStyle &
  CSSProperties &
  Record<`--${string}`, string | number>;

export interface ShinySplitTextProps {
  text: string;
  className?: string;
  style?: CSSProperties;
  delay?: number;
  duration?: number;
  ease?: string;
  splitType?: SplitType;
  from?: gsap.TweenVars;
  to?: gsap.TweenVars;
  threshold?: number;
  rootMargin?: string;
  textAlign?: CSSProperties["textAlign"];
  onLetterAnimationComplete?: () => void;
  showCallback?: boolean;
  speed?: number;
  shineDelay?: number;
  color?: string;
  shineColor?: string;
  spread?: number;
  direction?: ShinyDirection;
  yoyo?: boolean;
  pauseOnHover?: boolean;
  disabled?: boolean;
}

const defaultFrom: gsap.TweenVars = { opacity: 0, y: 32 };
const defaultTo: gsap.TweenVars = { opacity: 1, y: 0 };

function splitText(text: string, splitType: SplitType) {
  if (splitType === "words") {
    return text.split(/(\s+)/).map<TextPart>((value, index) => ({
      id: `word-${index}`,
      value,
      whitespace: /^\s+$/.test(value),
    }));
  }

  if (splitType === "lines") {
    return text.split(/\r?\n/).flatMap<TextPart>((value, index, lines) => {
      const parts: TextPart[] = [
        {
          id: `line-${index}`,
          value,
        },
      ];

      if (index < lines.length - 1) {
        parts.push({
          id: `break-${index}`,
          value: "\n",
          whitespace: true,
        });
      }

      return parts;
    });
  }

  return Array.from(text).map<TextPart>((value, index) => ({
    id: `char-${index}`,
    value,
    whitespace: value === " ",
  }));
}

export function ShinySplitText({
  text,
  className,
  style,
  delay = 45,
  duration = 1.15,
  ease = "power3.out",
  splitType = "chars",
  from = defaultFrom,
  to = defaultTo,
  threshold = 0.12,
  rootMargin = "-80px",
  textAlign = "left",
  onLetterAnimationComplete,
  showCallback = false,
  speed = 2.2,
  shineDelay = 0,
  color = "var(--text-primary)",
  shineColor = "rgba(255, 255, 255, 0.96)",
  spread = 120,
  direction = "right",
  yoyo = false,
  pauseOnHover = false,
  disabled = false,
}: ShinySplitTextProps) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const glyphRefs = useRef<HTMLSpanElement[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const shinePosition = useMotionValue(direction === "left" ? 145 : -145);
  const shouldAnimateIn = disabled || isVisible;

  const parts = useMemo(() => splitText(text, splitType), [text, splitType]);
  const animationKey = useMemo(
    () =>
      JSON.stringify({
        delay,
        disabled,
        duration,
        ease,
        from,
        splitType,
        text,
        to,
      }),
    [delay, disabled, duration, ease, from, splitType, text, to],
  );

  const shineBand = Math.max(10, Math.min(spread / 8, 24));
  const rootStyle = useMemo<MotionCSSVariableStyle>(
    () => ({
      ...style,
      textAlign,
      "--shine-position": shinePosition,
    }),
    [shinePosition, style, textAlign],
  );

  const shinyGlyphStyle = useMemo<StaticCSSVariableStyle>(
    () => ({
      "--shiny-band": `${shineBand}%`,
      "--shiny-color": color,
      "--shiny-highlight": shineColor,
    }),
    [color, shineBand, shineColor],
  );

  useEffect(() => {
    if (disabled) return;

    const node = containerRef.current;

    if (!node) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) {
          return;
        }

        setIsVisible(true);
        observer.disconnect();
      },
      {
        threshold,
        rootMargin,
      },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [disabled, rootMargin, threshold]);

  useEffect(() => {
    if (disabled || (pauseOnHover && isHovered)) {
      return;
    }

    const start = direction === "left" ? 145 : -145;
    const end = direction === "left" ? -145 : 145;

    shinePosition.set(start);

    const controls = animate(shinePosition, end, {
      delay: shineDelay,
      duration: speed,
      ease: "linear",
      repeat: Number.POSITIVE_INFINITY,
      repeatType: yoyo ? "reverse" : "loop",
    });

    return () => controls.stop();
  }, [direction, disabled, isHovered, pauseOnHover, shineDelay, shinePosition, speed, yoyo]);

  useGSAP(
    () => {
      const targets = glyphRefs.current.filter(Boolean);

      if (!targets.length) {
        return;
      }

      if (disabled) {
        gsap.set(targets, { clearProps: "all", opacity: 1, x: 0, y: 0 });
        return;
      }

      gsap.set(targets, from);

      if (!shouldAnimateIn) {
        return;
      }

      const tween = gsap.to(targets, {
        ...to,
        delay: 0,
        duration,
        ease,
        stagger: delay / 1000,
        overwrite: "auto",
        onComplete: () => {
          onLetterAnimationComplete?.();

          if (showCallback && !onLetterAnimationComplete) {
            console.log("ShinySplitText animation completed.");
          }
        },
      });

      return () => tween.kill();
    },
    {
      dependencies: [
        animationKey,
        shouldAnimateIn,
        onLetterAnimationComplete,
        showCallback,
      ],
      revertOnUpdate: true,
      scope: containerRef,
    },
  );

  return (
    <motion.span
      ref={containerRef}
      className={cn(
        "inline-block text-balance text-4xl font-semibold leading-[0.95] tracking-tight text-text-primary md:text-6xl",
        className,
      )}
      style={rootStyle}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label={text}
    >
      <span aria-hidden="true" className="inline whitespace-pre-wrap">
        {parts.map((part, index) => {
          if (part.value === "\n") {
            return <br key={part.id} />;
          }

          if (part.whitespace) {
            return (
              <span key={part.id} className="whitespace-pre-wrap">
                {part.value}
              </span>
            );
          }

          return (
            <span
              key={part.id}
              ref={(node) => {
                if (node) {
                  glyphRefs.current[index] = node;
                  return;
                }

                delete glyphRefs.current[index];
              }}
              className="inline-block will-change-transform"
            >
              <span
                className="inline-block bg-clip-text text-transparent"
                style={{
                  ...shinyGlyphStyle,
                  backgroundImage:
                    "linear-gradient(120deg, var(--shiny-color) 0%, var(--shiny-color) calc(50% - var(--shiny-band)), var(--shiny-highlight) 50%, var(--shiny-color) calc(50% + var(--shiny-band)), var(--shiny-color) 100%)",
                  backgroundPosition: "var(--shine-position) 50%",
                  backgroundSize: "240% 100%",
                }}
              >
                {part.value}
              </span>
            </span>
          );
        })}
      </span>
    </motion.span>
  );
}
