import assert from "node:assert/strict";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const catalog = {
  version: "smoke",
  cards: {
    stats: {
      description: "GitHub stats",
      required: ["username"],
      common_params: ["theme"],
    },
  },
  themes: ["dark", "tokyo_night"],
};

const transport = new StdioClientTransport({
  command: process.execPath,
  args: ["dist/bin.js"],
  cwd: root,
  env: {
    PROFILEKIT_CATALOG_URL: `data:application/json,${encodeURIComponent(JSON.stringify(catalog))}`,
  },
  stderr: "pipe",
});

const client = new Client(
  { name: "profilekit-mcp-smoke", version: "0.0.0" },
  { capabilities: {} }
);

try {
  await client.connect(transport);

  const tools = await client.listTools();
  assert.deepEqual(
    tools.tools.map((tool) => tool.name).sort(),
    ["list_cards", "list_themes", "render"]
  );

  const renderTool = tools.tools.find((tool) => tool.name === "render");
  assert.equal(renderTool?.inputSchema.required?.includes("type"), true);

  const rendered = await client.callTool({
    name: "render",
    arguments: {
      type: "stats",
      params: { username: "heznpc", theme: "tokyo_night" },
    },
  });
  const text = rendered.content[0]?.type === "text" ? rendered.content[0].text : "";
  assert.match(text, /https:\/\/profilekit\.vercel\.app\/api\/stats\?username=heznpc&theme=tokyo_night/);
  assert.match(text, /Markdown:/);
  assert.match(text, /HTML:/);

  await assert.rejects(
    client.callTool({
      name: "render",
      arguments: { type: "stats", params: {} },
    }),
    /requires: username/
  );
} finally {
  await transport.close();
}
