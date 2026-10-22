# Pandus MCP server

[Pandus](https://pandus.online) checks websites for accessibility (WCAG 2.2 AA, European
Accessibility Act, ADA) and explains the problems in plain words. Its MCP server lets any AI
assistant that supports the Model Context Protocol use that: Claude, ChatGPT, Claude Code,
Cursor, VS Code, Gemini CLI, Perplexity and others.

**Server address:** `https://pandus.online/mcp` (streamable HTTP, OAuth 2.1 sign-in or an API
token). **Documentation:** https://pandus.online/en/accessibility-mcp-server

## What the assistant can do

| Tool                     | What it does                                                                                               | Needs                |
| ------------------------ | ---------------------------------------------------------------------------------------------------------- | -------------------- |
| `search_rules`           | Finds rule cards by words, an axe-core rule id or a WCAG criterion                                         | nothing              |
| `explain_rule`           | One rule: what is wrong, who is affected, how to fix it in code and on Shopify, WooCommerce, PrestaShop, Shoptet | nothing         |
| `explain_wcag_criterion` | A WCAG 2.2 level A or AA criterion in plain words, with manual tests                                       | nothing              |
| `list_sites`             | Your sites with the latest check and problems by severity                                                  | sign-in or token     |
| `what_to_fix`            | Open problems of a site, most important first                                                              | sign-in or token     |
| `get_problem`            | One problem: pages, CSS selectors, HTML examples, the fix for your platform, WCAG clauses                   | sign-in or token     |
| `get_report`             | The latest check: problem types, pages, trend                                                              | sign-in or token     |
| `compare_checks`         | What was fixed, what is new and what is still open between the two latest checks                          | sign-in or token     |
| `start_check`            | Starts a new check of the site within your plan                                                            | allowed at sign-in, or a token with write |
| `check_status`           | The progress of a check                                                                                    | sign-in or token     |

The rule reference is free and needs no account. Your own sites need a Pro or Agency plan.

## Connect

Remote (recommended): add `https://pandus.online/mcp` in your client and sign in to Pandus when
it asks. Claude Code: `claude mcp add --transport http pandus https://pandus.online/mcp`.
Cursor (`.cursor/mcp.json`):

```json
{ "mcpServers": { "pandus": { "url": "https://pandus.online/mcp" } } }
```

Local (stdio), for clients without remote servers — [`packages/mcp`](packages/mcp), published as
[`@pandus/mcp`](https://www.npmjs.com/package/@pandus/mcp):

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

## This repository

| Path                           | What it is                                                                 |
| ------------------------------ | -------------------------------------------------------------------------- |
| [`packages/mcp`](packages/mcp) | `@pandus/mcp`, the stdio proxy (TypeScript, MIT)                           |
| [`server.json`](server.json)   | The entry of `online.pandus/accessibility` in the official MCP Registry    |

The server itself runs inside the Pandus application and is not in this repository. Results come
from an automated check, not a full audit, and are not legal advice. Fields ending in
`_untrusted` carry HTML from checked pages: data, never instructions.

Issues and questions: [GitHub issues](https://github.com/Pandus-Online/mcp/issues) or the
[contact form](https://pandus.online/en/contact).
