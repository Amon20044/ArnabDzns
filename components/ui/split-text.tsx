"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import {
  type CSSProperties,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { cn } from "@/lib/utils";

gsap.registerPlugin(useGSAP);

type SplitType = "chars" | "words" | "lines";

type TextPart = {
  id: string;
  value: string;
  whitespace?: boolean;
};

export interface SplitTextProps {
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
  disabled?: boolean;
}

const defaultFrom: gsap.TweenVars = { opacity: 0, y: 40 };
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
      const parts: TextPart[] = [{ id: `line-${index}`, value }];

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

export default function SplitText({
  text,
  className,
  style,
  delay = 50,
  duration = 1.25,
  ease = "power3.out",
  splitType = "chars",
  from = defaultFrom,
  to = defaultTo,
  threshold = 0.1,
  rootMargin = "-100px",
  textAlign = "left",
  onLetterAnimationComplete,
  showCallback = false,
  disabled = false,
}: SplitTextProps) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const glyphRefs = useRef<HTMLSpanElement[]>([]);
  const [isVisible, setIsVisible] = useState(disabled);

  const parts = useMemo(() => splitText(text, splitType), [text, splitType]);

  useEffect(() => {
    glyphRefs.current = [];
  }, [parts]);

  useEffect(() => {
    if (disabled) {
      setIsVisible(true);
      return;
    }

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

  useGSAP(
    () => {
      const targets = glyphRefs.current.filter(Boolean);

      if (!targets.length) {
        return;
      }

      if (disabled) {
        gsap.set(targets, { clearProps: "opacity,transform", opacity: 1, y: 0 });
        return;
      }

      gsap.set(targets, from);

      if (!isVisible) {
        return;
      }

      const tween = gsap.to(targets, {
        ...to,
        duration,
        ease,
        stagger: delay / 1000,
        overwrite: "auto",
        onComplete: () => {
          onLetterAnimationComplete?.();

          if (showCallback && !onLetterAnimationComplete) {
            console.log("All letters have animated!");
          }
        },
      });

      return () => tween.kill();
    },
    {
      dependencies: [
        delay,
        disabled,
        duration,
        ease,
        from,
        isVisible,
        onLetterAnimationComplete,
        showCallback,
        text,
        to,
      ],
      revertOnUpdate: true,
      scope: containerRef,
    },
  );

  return (
    <span
      ref={containerRef}
      className={cn(
        "inline-block text-balance text-4xl font-semibold leading-[0.95] tracking-tight text-text-primary md:text-6xl",
        className,
      )}
      style={{ ...style, textAlign }}
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
              {part.value}
            </span>
          );
        })}
      </span>
    </span>
  );
}
