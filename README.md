# profilekit-mcp

**MCP server for [ProfileKit](https://github.com/newtria/ProfileKit).** Build GitHub profile SVG cards through conversation — from Claude Code, Codex CLI, ChatGPT Apps, or any other MCP-capable agent.

> ProfileKit is the human craft layer on top of AI-generated defaults. This MCP server is how you reach it from inside a coding agent.

---

## Why MCP

Since OpenAI and Anthropic co-announced [MCP Apps](https://blog.modelcontextprotocol.io/posts/2026-01-26-mcp-apps/) in late 2025, a single MCP server covers **Claude Code + Codex CLI + ChatGPT** natively. No per-platform adapters.

## Install

```bash
npm install -g @heznpc/profilekit-mcp
```

## Register with your agent

**Claude Code** — add to `.claude/settings.json` in your repo:

```json
{
  "mcpServers": {
    "profilekit": { "command": "profilekit-mcp" }
  }
}
```

**Codex CLI** — add to `~/.codex/config.toml`:

```toml
[mcp_servers.profilekit]
command = "profilekit-mcp"
```

**ChatGPT Apps** — (Apps SDK MCP adapter; see the [Apps SDK docs](https://developers.openai.com/apps-sdk/concepts/mcp-server) for wire-up)

## Usage

Inside any registered agent, just ask:

```
> What ProfileKit cards exist?
> Render a tokyo_night stats card for heznpc.
> Give me a hero banner saying "heznpc" with subtitle "Building the ecosystem AI lives in", wave background, space-grotesk font.
> Build a kanagawa-themed pin card for heznpc/ProfileKit.
```

The agent will invoke `list_cards` / `list_themes` / `render` under the hood and hand you back a URL + markdown snippet ready to paste into your README.

## Tools

| Tool | Description |
|---|---|
| `list_cards` | Enumerate all 28 card types with one-line descriptions and required params |
| `list_themes` | List the 17 built-in themes |
| `render` | Build a card URL + markdown + HTML snippet for a given type and params |

`render` does **not** fetch the SVG. It returns the URL and snippets so you can embed the live image wherever external `<img>` tags are allowed (GitHub README, dev.to, Hashnode, Notion cover, slide cover).

## Example conversation

```
You: Render a pin card for heznpc/anvil using the rose_pine theme.

Agent: [calls render(type="pin", params={username: "heznpc", repo: "anvil", theme: "rose_pine"})]

URL:
https://profilekit.vercel.app/api/pin?username=heznpc&repo=anvil&theme=rose_pine

Markdown:
![pin](https://profilekit.vercel.app/api/pin?username=heznpc&repo=anvil&theme=rose_pine)

HTML:
<img src="https://profilekit.vercel.app/api/pin?username=heznpc&repo=anvil&theme=rose_pine" alt="pin" />
```

## Roadmap

- **v0.2** — Dynamic catalog sync from a ProfileKit `/api/catalog` endpoint (drop-in updates when new cards ship)
- **v0.3** — `compose_readme(sections)` tool — return a full blog-layout README snippet in one call
- **v0.4** — Optional SVG inlining (fetch card content into the response) for agents that want to reason over the markup
- **v1.0** — Palette suggestion tool backed by the caller's own vision/LLM capability (no built-in model calls)

## License

MIT © heznpc
