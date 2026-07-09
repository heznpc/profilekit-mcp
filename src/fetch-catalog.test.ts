import { test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { getCatalog, resetCatalogCache } from "./fetch-catalog.js";

const realFetch = globalThis.fetch;
const URL = "http://catalog.test/api/catalog";

/** Replace global fetch with a stub returning the given body / status. */
function mockFetch(
  body: unknown,
  { ok = true, status = 200, nonJson = false }: { ok?: boolean; status?: number; nonJson?: boolean } = {}
) {
  globalThis.fetch = (async () => ({
    ok,
    status,
    async json() {
      if (nonJson) throw new SyntaxError("Unexpected token '<'");
      return body;
    },
  })) as unknown as typeof fetch;
}

beforeEach(() => resetCatalogCache());
afterEach(() => {
  globalThis.fetch = realFetch;
});

test("well-formed catalog → remote source, version preserved, required parsed", async () => {
  mockFetch({
    version: "v9",
    cards: { stats: { description: "GH stats", required: ["username"], common_params: ["theme"] } },
    themes: ["dark", "tokyo_night"],
  });
  const c = await getCatalog(URL);
  assert.equal(c.source, "remote");
  assert.equal(c.version, "v9");
  assert.deepEqual(c.cards.stats.required, ["username"]);
  assert.deepEqual(c.themes, ["dark", "tokyo_night"]);
});

test("regression (CASE B): required as a STRING does not crash — coerced to []", async () => {
  mockFetch({ cards: { stats: { description: "x", required: "username", common_params: "theme" } }, themes: "dark" });
  const c = await getCatalog(URL);
  assert.equal(c.source, "remote");
  assert.deepEqual(c.cards.stats.required, [], "string required must coerce to []");
  assert.deepEqual(c.cards.stats.common_params, []);
  // A non-array `themes` is untrusted → bundled themes, never a crash.
  assert.ok(Array.isArray(c.themes) && c.themes.length > 0);
});

test("regression (CASE C): one null entry is dropped, the rest of the live catalog is kept", async () => {
  mockFetch({ cards: { stats: null, hero: { description: "Hero banner" } }, themes: ["dark"] });
  const c = await getCatalog(URL);
  assert.equal(c.source, "remote", "must NOT discard the whole remote catalog");
  assert.ok(!("stats" in c.cards), "null entry must be dropped");
  assert.ok("hero" in c.cards, "good entry must survive");
});

test("required array with non-string elements is filtered to strings only", async () => {
  mockFetch({ cards: { stats: { description: "x", required: ["username", 5, null, "repo"] } }, themes: ["dark"] });
  const c = await getCatalog(URL);
  assert.deepEqual(c.cards.stats.required, ["username", "repo"]);
});

test("catalog whose every entry is invalid → falls back to bundled", async () => {
  mockFetch({ cards: { a: null, b: 42 }, themes: ["dark"] });
  const c = await getCatalog(URL);
  assert.equal(c.source, "fallback");
});

test("HTTP 500 → bundled fallback", async () => {
  mockFetch({}, { ok: false, status: 500 });
  const c = await getCatalog(URL);
  assert.equal(c.source, "fallback");
  assert.ok(c.cards.stats, "bundled catalog has stats");
});

test("missing `cards` key → bundled fallback", async () => {
  mockFetch({ themes: ["dark"] });
  const c = await getCatalog(URL);
  assert.equal(c.source, "fallback");
});

test("non-JSON body → bundled fallback (no throw escapes)", async () => {
  mockFetch(undefined, { nonJson: true });
  const c = await getCatalog(URL);
  assert.equal(c.source, "fallback");
});

test("timeout covers a stalled JSON body, not only the initial fetch", async () => {
  globalThis.fetch = (async (_url: RequestInfo | URL, init?: RequestInit) => {
    const signal = init?.signal;
    assert.ok(signal, "fetch should receive an AbortSignal");
    return {
      ok: true,
      status: 200,
      async json() {
        return new Promise((_resolve, reject) => {
          if (signal.aborted) {
            reject(new Error("already aborted"));
            return;
          }
          signal.addEventListener("abort", () => reject(new Error("aborted body")), { once: true });
        });
      },
    };
  }) as unknown as typeof fetch;

  const c = await Promise.race([
    getCatalog(URL),
    new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error("catalog timeout did not cover body read")), 4_000);
    }),
  ]);
  assert.equal(c.source, "fallback");
});

test("fallback result is reused during retry backoff", async () => {
  let calls = 0;
  globalThis.fetch = (async () => {
    calls++;
    return { ok: false, status: 500, async json() { return {}; } };
  }) as unknown as typeof fetch;

  const first = await getCatalog(URL);
  const second = await getCatalog(URL);

  assert.equal(first.source, "fallback");
  assert.equal(second.source, "fallback");
  assert.equal(calls, 1, "backoff window must not re-fetch immediately after fallback");
});

test("getCatalog memoizes within a process (one fetch, cached result)", async () => {
  let calls = 0;
  globalThis.fetch = (async () => {
    calls++;
    return { ok: true, status: 200, async json() { return { cards: { stats: { description: "x" } }, themes: ["dark"] }; } };
  }) as unknown as typeof fetch;
  await getCatalog(URL);
  await getCatalog(URL);
  assert.equal(calls, 1, "second call must hit the cache");
});
