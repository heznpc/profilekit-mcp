import { CATALOG as FALLBACK_CARDS, THEMES as FALLBACK_THEMES } from "./catalog.js";
import type { CardEntry } from "./catalog.js";

const DEFAULT_CATALOG_URL = "https://profilekit.vercel.app/api/catalog";

export interface ResolvedCatalog {
  cards: Record<string, CardEntry>;
  themes: string[];
  source: "remote" | "fallback";
  version?: string;
}

let cachedPromise: Promise<ResolvedCatalog> | null = null;

export function getCatalog(url: string = process.env.PROFILEKIT_CATALOG_URL ?? DEFAULT_CATALOG_URL): Promise<ResolvedCatalog> {
  if (!cachedPromise) {
    cachedPromise = loadCatalog(url);
  }
  return cachedPromise;
}

export function resetCatalogCache(): void {
  cachedPromise = null;
}

async function loadCatalog(url: string): Promise<ResolvedCatalog> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = (await res.json()) as {
      version?: string;
      cards?: Record<string, { description: string; required?: string[]; common_params?: string[] }>;
      themes?: string[];
    };
    if (!data.cards || typeof data.cards !== "object") {
      throw new Error("malformed catalog: missing `cards`");
    }
    const cards: Record<string, CardEntry> = {};
    for (const [name, raw] of Object.entries(data.cards)) {
      cards[name] = {
        description: raw.description ?? "",
        required: raw.required ?? [],
        common_params: raw.common_params ?? [],
      };
    }
    return {
      cards,
      themes: data.themes ?? FALLBACK_THEMES,
      source: "remote",
      version: data.version,
    };
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    process.stderr.write(`[profilekit-mcp] remote catalog fetch failed (${reason}); using bundled fallback\n`);
    return {
      cards: FALLBACK_CARDS,
      themes: FALLBACK_THEMES,
      source: "fallback",
    };
  }
}
