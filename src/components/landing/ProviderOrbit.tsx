"use client";

import { useEffect, useMemo, useRef } from "react";
import { UniroMark } from "@/components/UniroMark";

const ROOT = "https://openrouter.ai";
const FAV = (url: string) =>
  `https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${encodeURIComponent(
    url
  )}&size=256`;

// ring 1 = inner (closer to core), ring 2 = outer.
// invert=true logos invert in dark mode (mono marks like OpenAI / z-ai).
interface Provider {
  name: string;
  ring: 1 | 2;
  src: string;
  invert?: boolean;
}

const PROVIDERS: Provider[] = [
  { name: "anthropic",   ring: 1, src: ROOT + "/images/icons/Anthropic.svg" },
  { name: "openai",      ring: 1, src: ROOT + "/images/icons/OpenAI.svg", invert: true },
  { name: "google",      ring: 1, src: ROOT + "/images/icons/GoogleGemini.svg" },
  { name: "meta",        ring: 1, src: ROOT + "/images/icons/Meta.png" },
  { name: "x-ai",        ring: 1, src: FAV("https://x.ai/") },
  { name: "microsoft",   ring: 1, src: ROOT + "/images/icons/Microsoft.svg" },
  { name: "deepseek",    ring: 1, src: ROOT + "/images/icons/DeepSeek.png" },
  { name: "qwen",        ring: 1, src: ROOT + "/images/icons/Qwen.png" },

  { name: "mistral",     ring: 2, src: ROOT + "/images/icons/Mistral.png" },
  { name: "cohere",      ring: 2, src: ROOT + "/images/icons/Cohere.png" },
  { name: "perplexity",  ring: 2, src: ROOT + "/images/icons/Perplexity.svg" },
  { name: "together",    ring: 2, src: FAV("https://www.together.ai/") },
  { name: "huggingface", ring: 2, src: FAV("https://huggingface.co/") },
  { name: "google ai",   ring: 2, src: ROOT + "/images/icons/GoogleAIStudio.svg" },
  { name: "nvidia",      ring: 2, src: FAV("https://nvidia.com/") },
  { name: "amazon",      ring: 2, src: FAV("https://nova.amazon.com/") },
  { name: "minimax",     ring: 2, src: FAV("https://minimaxi.com/") },
  { name: "moonshot",    ring: 2, src: FAV("https://moonshot.ai") },
  { name: "z-ai",        ring: 2, src: FAV("https://z.ai/"), invert: true },
  { name: "nous",        ring: 2, src: FAV("https://nousresearch.com/") },
  { name: "inflection",  ring: 2, src: FAV("https://inflection.ai/") },
  { name: "liquid",      ring: 2, src: FAV("https://www.liquid.ai/"), invert: true },
];

// Layout: 8 inner @ r1=22%, 14 outer @ r2=40% — using svg viewBox percentages
// so the orbit scales with its container's responsive size.
const VB = 560;
const CENTER = VB / 2;
const R1 = 0.22;
const R2 = 0.4;

interface PlacedProvider extends Provider {
  x: number;       // percent (0-100)
  y: number;       // percent (0-100)
  svgX: number;    // svg coords
  svgY: number;
}

function placeArc(arr: Provider[], r: number, phaseDeg: number): PlacedProvider[] {
  const n = arr.length;
  return arr.map((p, i) => {
    const a = (i / n) * Math.PI * 2 + (phaseDeg * Math.PI) / 180;
    const x = 50 + r * 100 * Math.cos(a);
    const y = 50 + r * 100 * Math.sin(a);
    return {
      ...p,
      x,
      y,
      svgX: (x / 100) * VB,
      svgY: (y / 100) * VB,
    };
  });
}

export default function ProviderOrbit() {
  const placed = useMemo<PlacedProvider[]>(() => {
    const inner = PROVIDERS.filter((p) => p.ring === 1);
    const outer = PROVIDERS.filter((p) => p.ring === 2);
    return [
      ...placeArc(inner, R1, -90),
      ...placeArc(outer, R2, -90 + 360 / (2 * outer.length)),
    ];
  }, []);

  const wiresRef = useRef<SVGGElement>(null);
  const pulsesRef = useRef<SVGGElement>(null);
  const centerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wiresEl = wiresRef.current;
    const pulsesEl = pulsesRef.current;
    if (!wiresEl || !pulsesEl) return;

    let alive = true;
    const wires = Array.from(wiresEl.querySelectorAll("line"));
    const cancellers: Array<() => void> = [];

    function spawnPulse() {
      if (!alive || !pulsesEl) return;
      const idx = Math.floor(Math.random() * placed.length);
      const p = placed[idx];

      const dot = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "circle"
      );
      dot.setAttribute("class", "uniro-orbit__pulse");
      dot.setAttribute("r", "2.4");
      pulsesEl.appendChild(dot);

      const lineEl = wires[idx];
      if (lineEl) {
        lineEl.style.transition = "opacity .25s, stroke .25s";
        lineEl.style.opacity = "0.7";
        lineEl.style.stroke = "currentColor";
      }

      const start = performance.now();
      const duration = 700 + Math.random() * 400;
      let raf = 0;
      const tick = (t: number) => {
        if (!alive) return;
        const k = Math.min(1, (t - start) / duration);
        const e = 1 - Math.pow(1 - k, 3); // easeOutCubic
        const x = p.svgX + (CENTER - p.svgX) * e;
        const y = p.svgY + (CENTER - p.svgY) * e;
        dot.setAttribute("cx", String(x));
        dot.setAttribute("cy", String(y));
        dot.setAttribute("opacity", String(1 - k * 0.4));
        if (k < 1) {
          raf = requestAnimationFrame(tick);
        } else {
          dot.remove();
          if (lineEl) {
            lineEl.style.opacity = "";
            lineEl.style.stroke = "";
          }
          // Brief "received" flash on the core mark.
          const center = centerRef.current?.querySelector<HTMLElement>(
            ".uniro-orbit__mark"
          );
          if (center) {
            center.style.filter =
              "drop-shadow(0 0 8px color-mix(in oklab, currentColor 35%, transparent))";
            setTimeout(() => {
              if (center) center.style.filter = "";
            }, 160);
          }
        }
      };
      raf = requestAnimationFrame(tick);
      cancellers.push(() => cancelAnimationFrame(raf));
    }

    const interval = setInterval(spawnPulse, 520);
    // Stagger initial pulses so the orbit isn't visually empty for the first
    // half-second.
    const initials = [0, 180, 360].map((delay) =>
      setTimeout(spawnPulse, delay)
    );

    return () => {
      alive = false;
      clearInterval(interval);
      initials.forEach(clearTimeout);
      cancellers.forEach((c) => c());
      pulsesEl.replaceChildren();
    };
  }, [placed]);

  return (
    <div className="uniro-orbit relative w-full mx-auto" aria-label="Uniro routes to 22 model providers">
      <svg
        viewBox={`0 0 ${VB} ${VB}`}
        preserveAspectRatio="xMidYMid meet"
        className="uniro-orbit__svg absolute inset-0 w-full h-full pointer-events-none"
        aria-hidden="true"
      >
        <circle className="uniro-orbit__ring" cx={CENTER} cy={CENTER} r={110} />
        <circle className="uniro-orbit__ring" cx={CENTER} cy={CENTER} r={180} />
        <circle className="uniro-orbit__ring" cx={CENTER} cy={CENTER} r={240} />
        <g ref={wiresRef}>
          {placed.map((p, i) => (
            <line
              key={`wire-${i}`}
              className="uniro-orbit__wire"
              x1={CENTER}
              y1={CENTER}
              x2={p.svgX}
              y2={p.svgY}
            />
          ))}
        </g>
        <g ref={pulsesRef} />
      </svg>

      {placed.map((p, i) => (
        <div
          key={`node-${p.name}-${i}`}
          className="uniro-orbit__node"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            animationDelay: `${i * 120}ms`,
          }}
          title={p.name}
        >
          <div className={"uniro-orbit__glyph" + (p.invert ? " is-invert" : "")}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={p.src}
              alt={p.name}
              loading="lazy"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.opacity = "0.2";
              }}
            />
          </div>
          <div className="uniro-orbit__label">{p.name}</div>
        </div>
      ))}

      <div
        ref={centerRef}
        className="uniro-orbit__center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        aria-label="Uniro core"
      >
        <div className="uniro-orbit__mark text-text-000">
          <UniroMark size={60} />
        </div>
      </div>
    </div>
  );
}
