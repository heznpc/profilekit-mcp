export const PROFILEKIT_BASE = "https://profilekit.vercel.app/api";

/** Escape for an HTML double-quoted attribute value. */
function escapeHtmlAttr(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Escape the characters that would break a Markdown image's alt text or URL. */
function escapeMarkdownAlt(s: string): string {
  return s.replace(/[\\[\]]/g, (c) => "\\" + c);
}

export function buildCardUrl(
  type: string,
  params: Record<string, string | number | boolean | null | undefined> = {}
): string {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === "") continue;
    qs.set(k, String(v));
  }
  // Encode the type as a single path segment. Card types are simple
  // identifiers (encodeURIComponent is a no-op for them), but the catalog is a
  // remote input — a key like `../health` must not produce a path-traversal URL.
  const segment = encodeURIComponent(type);
  const queryString = qs.toString();
  return queryString
    ? `${PROFILEKIT_BASE}/${segment}?${queryString}`
    : `${PROFILEKIT_BASE}/${segment}`;
}

export function buildMarkdownSnippet(
  type: string,
  url: string,
  alt?: string
): string {
  // alt may be caller-supplied; escape so `]`/`[`/`\` can't break out of the
  // image syntax. The URL itself is built by buildCardUrl, whose query is
  // form-urlencoded (parens/quotes/brackets already percent-encoded), so it is
  // safe inside `(...)` without further wrapping.
  const altText = escapeMarkdownAlt(alt ?? type);
  return `![${altText}](${url})`;
}

export function buildHtmlSnippet(
  type: string,
  url: string,
  width?: number | string
): string {
  // Both url and type land in double-quoted attributes. type comes from the
  // (remote) catalog, so a key containing `"` must not break out of alt="...".
  const widthAttr = width ? ` width="${escapeHtmlAttr(String(width))}"` : "";
  return `<img src="${escapeHtmlAttr(url)}" alt="${escapeHtmlAttr(type)}"${widthAttr} />`;
}
