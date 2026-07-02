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
// After a fallback result, back off briefly before re-fetching so a
// persistently-down remote is not hammered on every single tool call.
let nextRetryAt = 0;
const FALLBACK_RETRY_MS = 30_000;

export function getCatalog(url: string = process.env.PROFILEKIT_CATALOG_URL ?? DEFAULT_CATALOG_URL): Promise<ResolvedCatalog> {
  // Only a successful remote fetch is cached permanently. A fallback result
  // (transient network blip, timeout, or remote outage) is NOT pinned for the
  // life of the process: clear the cache once it resolves so a later call can
  // re-fetch and the server self-heals, subject to a short backoff.
  if (!cachedPromise && Date.now() >= nextRetryAt) {
    cachedPromise = loadCatalog(url).then((result) => {
      if (result.source === "fallback") {
        cachedPromise = null;
        nextRetryAt = Date.now() + FALLBACK_RETRY_MS;
      }
      return result;
    });
  }
  // During the backoff window (or while the in-flight promise is pending) serve
  // the current promise if present; otherwise fall back once without caching.
  return cachedPromise ?? loadCatalog(url);
}

export function resetCatalogCache(): void {
  cachedPromise = null;
  nextRetryAt = 0;
}

/** Coerce an unknown value into a string[], keeping only string elements. */
function toStringArray(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
}

async function loadCatalog(url: string): Promise<ResolvedCatalog> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    // Treat the parsed body as unknown shape — a 200 response is not a promise
    // of a well-typed catalog. Every field is validated/coerced below.
    const data = (await res.json()) as {
      version?: unknown;
      cards?: unknown;
      themes?: unknown;
    };
    if (!data.cards || typeof data.cards !== "object") {
      throw new Error("malformed catalog: missing `cards`");
    }
    // Normalize each entry by TYPE, not just by presence. A remote catalog
    // served with HTTP 200 can still carry wrong-typed fields (e.g. `required`
    // as a string after an API drift). Coercing with `?? default` only guards
    // `undefined`/`null` — a string would survive and later blow up
    // `entry.required.filter(...)` / `.join(...)` in the tool handlers. We
    // coerce to the expected shape and DROP only the individual entries that
    // are not objects, so one bad entry can't discard the whole live catalog.
    const cards: Record<string, CardEntry> = {};
    for (const [name, rawValue] of Object.entries(data.cards as Record<string, unknown>)) {
      if (!rawValue || typeof rawValue !== "object") continue; // skip null/garbage entries
      const raw = rawValue as { description?: unknown; required?: unknown; common_params?: unknown };
      cards[name] = {
        description: typeof raw.description === "string" ? raw.description : "",
        required: toStringArray(raw.required),
        common_params: toStringArray(raw.common_params),
      };
    }
    if (Object.keys(cards).length === 0) {
      throw new Error("malformed catalog: no usable card entries");
    }
    return {
      cards,
      themes: Array.isArray(data.themes) ? toStringArray(data.themes) : FALLBACK_THEMES,
      source: "remote",
      version: typeof data.version === "string" ? data.version : undefined,
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
