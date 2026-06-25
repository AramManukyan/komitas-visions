import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Copy, RotateCcw, Palette } from "lucide-react";
import { toast } from "sonner";

/**
 * Theme Generator
 * --------------------------------------------
 * Lists every theme CSS variable defined in `src/index.css` (:root),
 * lets you pick a color for each, and live-applies it to the document.
 *
 * Storage: keeps overrides in localStorage so navigating around the
 * app preserves your tweaks until you Reset.
 */

type TokenGroup = { label: string; tokens: { name: string; description?: string }[] };

const GROUPS: TokenGroup[] = [
  {
    label: "Base",
    tokens: [
      { name: "background" },
      { name: "foreground" },
      { name: "card" },
      { name: "card-foreground" },
      { name: "popover" },
      { name: "popover-foreground" },
      { name: "border" },
      { name: "input" },
      { name: "ring" },
    ],
  },
  {
    label: "Brand",
    tokens: [
      { name: "primary" },
      { name: "primary-foreground" },
      { name: "secondary" },
      { name: "secondary-foreground" },
      { name: "accent" },
      { name: "accent-foreground" },
      { name: "muted" },
      { name: "muted-foreground" },
      { name: "destructive" },
      { name: "destructive-foreground" },
    ],
  },
  {
    label: "Project palette",
    tokens: [
      { name: "warm-bg" },
      { name: "navy" },
      { name: "navy-light" },
      { name: "gold" },
      { name: "gold-light" },
      { name: "glass" },
    ],
  },
  {
    label: "Status",
    tokens: [
      { name: "status-available" },
      { name: "status-available-fg" },
      { name: "status-reserved" },
      { name: "status-reserved-fg" },
      { name: "status-sold" },
      { name: "status-sold-fg" },
    ],
  },
  {
    label: "Sidebar",
    tokens: [
      { name: "sidebar-background" },
      { name: "sidebar-foreground" },
      { name: "sidebar-primary" },
      { name: "sidebar-primary-foreground" },
      { name: "sidebar-accent" },
      { name: "sidebar-accent-foreground" },
      { name: "sidebar-border" },
      { name: "sidebar-ring" },
    ],
  },
];

const STORAGE_KEY = "ui-docs:theme-overrides";

// ---------- Color conversion helpers ----------
const clamp = (n: number, min = 0, max = 1) => Math.min(max, Math.max(min, n));

function hslStringToHex(hslStr: string): string {
  // Accepts "H S% L%" or "H, S%, L%" form
  const m = hslStr.trim().match(/(-?\d+(?:\.\d+)?)\s*,?\s*(-?\d+(?:\.\d+)?)%\s*,?\s*(-?\d+(?:\.\d+)?)%/);
  if (!m) return "#000000";
  const h = parseFloat(m[1]) / 360;
  const s = parseFloat(m[2]) / 100;
  const l = parseFloat(m[3]) / 100;
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  let r: number, g: number, b: number;
  if (s === 0) {
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  const toHex = (x: number) =>
    Math.round(clamp(x) * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function hexToHslString(hex: string): string {
  const m = hex.replace("#", "");
  const bigint = parseInt(
    m.length === 3 ? m.split("").map((c) => c + c).join("") : m,
    16,
  );
  const r = ((bigint >> 16) & 255) / 255;
  const g = ((bigint >> 8) & 255) / 255;
  const b = (bigint & 255) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

function readVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(`--${name}`).trim();
}

export default function ThemeGenerator() {
  const [overrides, setOverrides] = useState<Record<string, string>>({});
  const [defaults, setDefaults] = useState<Record<string, string>>({});

  // Capture original token values on mount; apply any stored overrides.
  useEffect(() => {
    const initial: Record<string, string> = {};
    GROUPS.forEach((g) => g.tokens.forEach((t) => (initial[t.name] = readVar(t.name))));
    setDefaults(initial);

    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      setOverrides(stored);
      Object.entries(stored).forEach(([k, v]) =>
        document.documentElement.style.setProperty(`--${k}`, v as string),
      );
    } catch {
      /* ignore */
    }
  }, []);

  const update = (name: string, hex: string) => {
    const hsl = hexToHslString(hex);
    document.documentElement.style.setProperty(`--${name}`, hsl);
    const next = { ...overrides, [name]: hsl };
    setOverrides(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  };

  const reset = () => {
    Object.keys(overrides).forEach((k) => document.documentElement.style.removeProperty(`--${k}`));
    setOverrides({});
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    toast.success("Theme reset to defaults");
  };

  const cssSnippet = useMemo(() => {
    const lines: string[] = [":root {"];
    GROUPS.forEach((g) => {
      g.tokens.forEach((t) => {
        const v = overrides[t.name] ?? defaults[t.name];
        if (v) lines.push(`  --${t.name}: ${v};`);
      });
    });
    lines.push("}");
    return lines.join("\n");
  }, [overrides, defaults]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(cssSnippet);
      toast.success("CSS copied to clipboard");
    } catch {
      toast.error("Copy failed");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4">
        <div className="flex items-center gap-2">
          <Palette className="h-4 w-4 text-primary" />
          <div>
            <p className="text-sm font-semibold text-foreground">Live theme generator</p>
            <p className="text-xs text-muted-foreground">
              Changes apply instantly across the whole app and persist in this browser.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={copy}>
            <Copy className="h-3.5 w-3.5 mr-1.5" /> Copy CSS
          </Button>
          <Button variant="outline" size="sm" onClick={reset}>
            <RotateCcw className="h-3.5 w-3.5 mr-1.5" /> Reset
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {GROUPS.map((group) => (
          <div key={group.label} className="rounded-xl border border-border bg-card p-4 space-y-3">
            <h4 className="text-sm font-semibold text-foreground">{group.label}</h4>
            <div className="space-y-2">
              {group.tokens.map((t) => {
                const value = overrides[t.name] ?? defaults[t.name] ?? "0 0% 0%";
                const hex = hslStringToHex(value);
                return (
                  <div key={t.name} className="flex items-center gap-3">
                    <input
                      type="color"
                      aria-label={`--${t.name}`}
                      value={hex}
                      onChange={(e) => update(t.name, e.target.value)}
                      className="h-9 w-12 cursor-pointer rounded-md border border-border bg-background p-0.5"
                    />
                    <div className="flex-1 min-w-0">
                      <Label className="text-xs font-mono text-foreground truncate block">
                        --{t.name}
                      </Label>
                      <p className="text-[10px] text-muted-foreground font-mono truncate">
                        {value}
                      </p>
                    </div>
                    <Input
                      value={hex}
                      onChange={(e) => /^#[0-9a-fA-F]{6}$/.test(e.target.value) && update(t.name, e.target.value)}
                      className="w-24 h-8 text-xs font-mono"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <h4 className="text-sm font-semibold text-foreground mb-2">Generated CSS</h4>
        <pre className="text-[11px] leading-relaxed bg-secondary text-foreground rounded-lg p-3 overflow-auto max-h-72">
          {cssSnippet}
        </pre>
      </div>
    </div>
  );
}
