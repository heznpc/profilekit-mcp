# profilekit-mcp

MCP stdio server for rendering ProfileKit cards from agent clients.

## Run this repo

```bash
npm ci --ignore-scripts
npm run build
npm test
node dist/bin.js help
```

## Structure

```
src/
  bin.ts              -> CLI entrypoint
  server.ts           -> MCP server registration
  fetch-catalog.ts    -> ProfileKit catalog loading
  url.ts              -> URL/query construction
examples/             -> example client configs
dist/                 -> generated build output, published to npm
```

## Invariants

- Keep tool inputs schema-validated and explicit. Do not accept arbitrary URL
  fragments from tool callers.
- Treat ProfileKit network calls as open-world work: use timeouts and return
  clear MCP errors instead of throwing raw exceptions.
- Preserve the unscoped npm package name `profilekit-mcp` unless the release
  plan explicitly changes it.
- Published package contents must stay limited to `dist/`, `examples/`,
  `README.md`, `SECURITY.md`, and `LICENSE`.
- No long-lived npm token in CI. Release stays OIDC trusted publishing only.
