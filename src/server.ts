import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { getCatalog } from "./fetch-catalog.js";
import {
  buildCardUrl,
  buildMarkdownSnippet,
  buildHtmlSnippet,
} from "./url.js";

export async function runServer() {
  const server = new Server(
    { name: "profilekit", version: "0.2.0" },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
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
      },
    ],
  }));

  server.setRequestHandler(CallToolRequestSchema, async (req) => {
    const { name, arguments: args } = req.params;
    const catalog = await getCatalog();

    if (name === "list_cards") {
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
      return {
        content: [{ type: "text", text: lines.join("\n") + footer }],
      };
    }

    if (name === "list_themes") {
      return {
        content: [
          {
            type: "text",
            text:
              catalog.themes.join(", ") +
              "\n\nUsage: append `?theme=tokyo_night` to any card URL. " +
              "For custom palettes pass `?theme_url=<gist-raw-url>` pointing to a JSON theme (supported on /stats and /stack as of ProfileKit v1).",
          },
        ],
      };
    }

    if (name === "render") {
      const input = (args ?? {}) as {
        type?: string;
        params?: Record<string, string | number | boolean>;
        alt?: string;
      };
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

      return {
        content: [
          {
            type: "text",
            text: `URL:\n${url}\n\nMarkdown:\n${markdown}\n\nHTML:\n${html}`,
          },
        ],
      };
    }

    throw new Error(`Unknown tool: ${name}`);
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
}
