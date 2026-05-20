# profilekit-mcp

**MCP server for [ProfileKit](https://github.com/newtria/ProfileKit).** Build GitHub profile SVG cards through conversation — from Claude Code, Codex CLI, ChatGPT Apps, or any other MCP-capable agent.

---

## Currently implemented

- **3 tools** over stdio MCP: `list_cards`, `list_themes`, `render`.
- **28 card types** covering data (stats, pin, leetcode, …), blog layout (hero, section, timeline, …), animations (typing, snake, matrix, …), composition (`stack`), and utility (`health`).
- **17 built-in themes** (`tokyo_night`, `kanagawa`, `rose_pine`, `dracula`, `nord`, …) — pass `?theme=<name>` to any card.
- **Dynamic catalog sync** from `https://profilekit.vercel.app/api/catalog`, cached per process; falls back to a bundled snapshot if the fetch fails.
- **Custom palettes** via `?theme_url=<gist-raw-url>` (supported on `/stats` and `/stack` as of ProfileKit v1).
- Published as `@heznpc/profilekit-mcp` on npm (v0.2.1).

## Planned

- **`compose_readme(sections)` tool** — return a full blog-layout README snippet in one call.
- **Palette suggestion tool** backed by the *caller's* own vision/LLM capability — no built-in model calls.

## Design intent

- **URL-only, never inlines SVG.** `render` returns a URL plus markdown / HTML snippets; the SVG is fetched by the eventual `<img>` consumer (GitHub, dev.to, Notion, …). Tool responses stay small, side-effect-free, and embeddable anywhere external images are allowed.
- **One MCP server, three agents.** After OpenAI and Anthropic co-announced [MCP Apps](https://blog.modelcontextprotocol.io/posts/2026-01-26-mcp-apps/) in late 2025, a single stdio server covers Claude Code + Codex CLI + ChatGPT Apps natively — no per-platform adapter.
- **Live catalog over hardcoded list.** Card definitions live in ProfileKit's `/api/catalog`, so when ProfileKit ships a new card the MCP server picks it up without a republish. The bundled fallback exists only so cold/offline starts still work.
- **No ranking, composable presentation.** Mirrors ProfileKit's stance — every card is an independent SVG that the user composes, not a leaderboard.

## Non-goals

- **Inlining card SVG into tool responses.** The MCP server intentionally does not fetch card content. Agents that need to reason over the markup can fetch the URL themselves.
- **Built-in model calls.** Future "suggest a palette" or "describe this card" features delegate to the calling agent's own LLM — this server never makes outbound LLM API calls.
- **Ranking, leaderboards, or rendering opinions** in the tool surface.

## Redacted

(none for this repo)

---

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
| `list_cards` | Enumerate every card type returned by the live catalog, with descriptions and required params |
| `list_themes` | List the built-in themes |
| `render` | Build a card URL + markdown + HTML snippet for a given type and params |

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

## License

MIT © heznpc
