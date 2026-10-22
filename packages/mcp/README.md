# @pandus/mcp

A local (stdio) MCP server for [Pandus](https://pandus.online), the accessibility checker for
websites (WCAG 2.2 AA, European Accessibility Act, ADA). It forwards everything to the remote
Pandus MCP server at `https://pandus.online/mcp`, so MCP clients that only start local servers
get the same tools:

- **Free, no account:** `search_rules`, `explain_rule`, `explain_wcag_criterion` — any axe-core
  rule or WCAG 2.2 criterion in plain words, with fixes for code, Shopify, WooCommerce,
  PrestaShop and Shoptet.
- **With a Pandus API token (Pro and Agency plans):** `list_sites`, `what_to_fix`, `get_problem`,
  `get_report`, `compare_checks`, `check_status` and, with a "write" token, `start_check`.

If your client connects to remote MCP servers (Claude, ChatGPT, Claude Code, Cursor, VS Code,
Perplexity, Gemini CLI), you do not need this package: add `https://pandus.online/mcp` directly
and sign in to Pandus when the client asks. See
[the MCP page](https://pandus.online/en/accessibility-mcp-server).

## Usage

```json
{
    "mcpServers": {
        "pandus": {
            "command": "npx",
            "args": ["-y", "@pandus/mcp"],
            "env": { "PANDUS_API_TOKEN": "YOUR_TOKEN" }
        }
    }
}
```

Leave out `env` for the free rule reference. Create tokens in Pandus under **API and webhooks**.

Options: `--token <api token>` (or `PANDUS_API_TOKEN`), `--url <server>` (or `PANDUS_MCP_URL`,
default `https://pandus.online/mcp`), `--version`, `--help`. Node.js 18 or newer.

## As a library

```ts
import { createProxy } from '@pandus/mcp';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

const proxy = await createProxy({ token: process.env.PANDUS_API_TOKEN });
await proxy.server.connect(new StdioServerTransport());
```

## Data and safety

The proxy sends your requests, and the token if you set one, only to the server in `--url`.
HTML from checked pages comes back in fields ending in `_untrusted`: the Pandus server tells the
assistant to treat them as data, never as instructions. Results come from an automated check,
not a full audit, and are not legal advice.

MIT license. Source: https://github.com/Pandus-Online/mcp (folder `packages/mcp`).
