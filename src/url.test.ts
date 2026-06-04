import { test } from "node:test";
import assert from "node:assert/strict";
import {
  buildCardUrl,
  buildMarkdownSnippet,
  buildHtmlSnippet,
  PROFILEKIT_BASE,
} from "./url.js";

test("buildCardUrl keeps falsy-but-valid values (false, 0) and drops empty/undefined", () => {
  const url = buildCardUrl("stats", {
    username: "h",
    hide_border: false,
    langs_count: 0,
    theme: "",
    extra: undefined,
    other: null,
  });
  assert.ok(url.includes("hide_border=false"), "false must be kept");
  assert.ok(url.includes("langs_count=0"), "0 must be kept");
  assert.ok(!url.includes("theme="), "empty string must be dropped");
  assert.ok(!url.includes("extra="), "undefined must be dropped");
  assert.ok(!url.includes("other="), "null must be dropped");
});

test("buildCardUrl is a no-op encode for simple card types (documented output preserved)", () => {
  assert.equal(
    buildCardUrl("stats", { username: "heznpc" }),
    `${PROFILEKIT_BASE}/stats?username=heznpc`
  );
});

test("buildCardUrl encodes the type segment so a catalog key cannot path-traverse", () => {
  const url = buildCardUrl("../health", { username: "h" });
  assert.ok(!url.includes("/../"), `must not contain raw traversal: ${url}`);
  assert.ok(url.includes("..%2Fhealth"), `expected encoded segment: ${url}`);
});

test("buildHtmlSnippet escapes a card type containing a double quote (no attribute injection)", () => {
  const out = buildHtmlSnippet('x" onerror="alert(1)', "https://x/y");
  assert.ok(!out.includes('" onerror="alert(1)'), `injection survived: ${out}`);
  assert.ok(out.includes("&quot;"), `expected escaped quote: ${out}`);
});

test("buildHtmlSnippet leaves a normal type untouched (documented output preserved)", () => {
  assert.equal(
    buildHtmlSnippet("stats", "https://x/y"),
    '<img src="https://x/y" alt="stats" />'
  );
});

test("buildMarkdownSnippet escapes ] in alt so it cannot break out of the image syntax", () => {
  const out = buildMarkdownSnippet("stats", "https://x/y", "a]b[c");
  assert.ok(out.includes("a\\]b\\[c"), `expected escaped brackets: ${out}`);
});

test("buildMarkdownSnippet leaves a normal alt untouched (documented output preserved)", () => {
  assert.equal(
    buildMarkdownSnippet("pin", "https://x/y", undefined),
    "![pin](https://x/y)"
  );
});
