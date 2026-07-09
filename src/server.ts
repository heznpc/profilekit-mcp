import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { getCatalog } from "./fetch-catalog.js";
import type { ResolvedCatalog } from "./fetch-catalog.js";
import {
  buildCardUrl,
  buildMarkdownSnippet,
  buildHtmlSnippet,
} from "./url.js";

// Read version from package.json at runtime so it never drifts from the
// canonical source. Works for both `dist/server.js` (npm install) and
// `src/server.ts` (tsx dev) because in both cases the file lives exactly one
// directory below the package root. npm always ships package.json regardless
// of the `files` allowlist.
function readPackageVersion(): string {
  try {
    const here = dirname(fileURLToPath(import.meta.url));
    const pkg = JSON.parse(readFileSync(join(here, "..", "package.json"), "utf8")) as {
      version?: string;
    };
    return pkg.version ?? "0.0.0-dev";
  } catch {
    return "0.0.0-dev";
  }
}
const SERVER_VERSION = readPackageVersion();

type TextToolResult = {
  content: Array<{ type: "text"; text: string }>;
};

type RenderInput = {
  type?: string;
  params?: Record<string, string | number | boolean>;
  alt?: string;
};

const TOOL_DEFINITIONS = [
  {
    name: "list_cards",
    description:
      "List every ProfileKit card type (stats, hero, snake, ...) with a one-line description and the required params for each. " +
      "Use this before calling `render` when the user asks what cards exist or which to use. " +
      "Catalog is fetched live from ProfileKit on first call and cached per process.",
    inputSchema: {
      type: "object",
      properties: {},
    },
    annotations: {
      title: "List ProfileKit card types",
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
  },
  {
    name: "list_themes",
    description:
      "List built-in ProfileKit themes (dark, tokyo_night, kanagawa, rose_pine, ...). " +
      "Any card accepts `?theme=<name>`. For fully custom palettes use `?theme_url=` pointing to a JSON gist.",
    inputSchema: {
      type: "object",
      properties: {},
    },
    annotations: {
      title: "List ProfileKit themes",
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
  },
  {
    name: "render",
    description:
      "Build a ProfileKit card URL plus ready-to-paste markdown and HTML snippets for the given card type and params. " +
      "Does NOT fetch the SVG itself — the URL is what consumers embed. " +
      "Call `list_cards` first if unsure which type or what params the user's card accepts.",
    inputSchema: {
      type: "object",
      properties: {
        type: {
          type: "string",
          description:
            "Card type (e.g. 'stats', 'hero', 'snake'). Must be one of the keys returned by list_cards.",
        },
        params: {
          type: "object",
          description:
            "Card-specific parameters as key/value pairs (e.g. {username: 'heznpc', theme: 'tokyo_night'}). " +
            "See list_cards output for common params per type. Values are stringified and URL-encoded.",
          additionalProperties: {
            type: ["string", "number", "boolean"],
          },
        },
        alt: {
          type: "string",
          description:
            "Optional alt text for the markdown image. Defaults to the card type.",
        },
      },
      required: ["type"],
    },
    annotations: {
      title: "Render ProfileKit card URL",
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
  },
];

function textResult(text: string): TextToolResult {
  return { content: [{ type: "text", text }] };
}

function formatCards(catalog: ResolvedCatalog): string {
  const lines = Object.entries(catalog.cards)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([type, entry]) => {
      const requiredNote = entry.required.length
        ? `  [required: ${entry.required.join(", ")}]`
        : "";
      return `${type}: ${entry.description}${requiredNote}`;
    });
  const footer = catalog.source === "fallback"
    ? "\n\n(Using bundled fallback catalog — remote fetch failed.)"
    : catalog.version
      ? `\n\n(Catalog version: ${catalog.version}, live)`
      : "";
  return lines.join("\n") + footer;
}

async function handleListCards(): Promise<TextToolResult> {
  const catalog = await getCatalog();
  return textResult(formatCards(catalog));
}

async function handleListThemes(): Promise<TextToolResult> {
  const catalog = await getCatalog();
  return textResult(
    catalog.themes.join(", ") +
      "\n\nUsage: append `?theme=tokyo_night` to any card URL. " +
      "For custom palettes pass `?theme_url=<gist-raw-url>` pointing to a JSON theme (supported on /stats and /stack as of ProfileKit v1)."
  );
}

async function handleRender(args: unknown): Promise<TextToolResult> {
  const catalog = await getCatalog();
  const input = (args ?? {}) as RenderInput;
  const type = input.type;
  if (!type || !(type in catalog.cards)) {
    throw new Error(
      `Unknown card type: ${type ?? "(missing)"}. Call list_cards for available types.`
    );
  }
  const entry = catalog.cards[type];
  const params = input.params ?? {};
  const missing = entry.required.filter(
    (r) => params[r] === undefined || params[r] === null || params[r] === ""
  );
  if (missing.length) {
    throw new Error(
      `Card '${type}' requires: ${missing.join(", ")}. Got: ${Object.keys(params).join(", ") || "(none)"}`
    );
  }

  const url = buildCardUrl(type, params);
  const markdown = buildMarkdownSnippet(type, url, input.alt);
  const html = buildHtmlSnippet(type, url);

  return textResult(`URL:\n${url}\n\nMarkdown:\n${markdown}\n\nHTML:\n${html}`);
}

const TOOL_HANDLERS: Record<string, (args: unknown) => Promise<TextToolResult>> = {
  list_cards: handleListCards,
  list_themes: handleListThemes,
  render: handleRender,
};

export async function runServer() {
  const server = new Server(
    { name: "profilekit", version: SERVER_VERSION },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: TOOL_DEFINITIONS,
  }));

  server.setRequestHandler(CallToolRequestSchema, async (req) => {
    const { name, arguments: args } = req.params;
    const handler = TOOL_HANDLERS[name];
    if (!handler) {
      throw new Error(`Unknown tool: ${name}`);
    }
    return handler(args);
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
}
