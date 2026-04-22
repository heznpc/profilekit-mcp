export const PROFILEKIT_BASE = "https://profilekit.vercel.app/api";

export function buildCardUrl(
  type: string,
  params: Record<string, string | number | boolean | null | undefined> = {}
): string {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === "") continue;
    qs.set(k, String(v));
  }
  const queryString = qs.toString();
  return queryString
    ? `${PROFILEKIT_BASE}/${type}?${queryString}`
    : `${PROFILEKIT_BASE}/${type}`;
}

export function buildMarkdownSnippet(
  type: string,
  url: string,
  alt?: string
): string {
  const altText = alt ?? type;
  return `![${altText}](${url})`;
}

export function buildHtmlSnippet(
  type: string,
  url: string,
  width?: number | string
): string {
  const widthAttr = width ? ` width="${width}"` : "";
  return `<img src="${url}" alt="${type}"${widthAttr} />`;
}
