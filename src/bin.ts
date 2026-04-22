#!/usr/bin/env node
import { runServer } from "./server.js";

const [, , cmd] = process.argv;

async function main() {
  switch (cmd) {
    case undefined:
    case "mcp":
    case "serve":
      await runServer();
      break;
    case "help":
    case "--help":
    case "-h":
      printUsage();
      process.exit(0);
      break;
    default:
      console.error(`Unknown command: ${cmd}\n`);
      printUsage();
      process.exit(1);
  }
}

function printUsage() {
  console.log("profilekit-mcp — MCP server for ProfileKit card generation\n");
  console.log("Usage:");
  console.log("  profilekit-mcp          Run the MCP server over stdio (default)");
  console.log("  profilekit-mcp mcp      Same as above");
  console.log("  profilekit-mcp help     Show this help");
  console.log("");
  console.log("Register in your MCP-capable agent:");
  console.log("");
  console.log("Claude Code  (.claude/settings.json):");
  console.log('  { "mcpServers": { "profilekit": { "command": "profilekit-mcp" } } }');
  console.log("");
  console.log("Codex CLI    (~/.codex/config.toml):");
  console.log('  [mcp_servers.profilekit]');
  console.log('  command = "profilekit-mcp"');
  console.log("");
  console.log("See examples/ in the package for ready-to-paste configs.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
