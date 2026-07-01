# Security guidance

This file is read by Anthropic's Claude Code Security Guidance Plugin as an
in-session guard while Claude writes code. It complements the
`claude-code-security-review` GitHub Action and the repo-level
`audit_security` check.

## Universal rules

- Never log secrets, tokens, cookies, or raw request headers.
- Never use `eval`, `Function()`, dynamic imports of untrusted strings, or
  shell execution for tool input.
- Validate all MCP tool input with explicit schemas before using it.
- HTTP fetches must use an AbortController timeout. No unbounded waits.
- Keep `.env*` files out of git. Use examples with placeholder values only.
- Publish with OIDC trusted publishing only; do not add long-lived npm tokens.

## MCP rules

- Every tool must declare safe annotations that match its behavior.
- Reject arbitrary URL fragments, protocol changes, and host overrides unless a
  reviewed allowlist is added.
- Return structured MCP errors for failed ProfileKit calls. Do not leak stack
  traces or upstream response bodies that may contain sensitive data.
- Published package contents must stay limited to the files listed in
  `package.json`.
