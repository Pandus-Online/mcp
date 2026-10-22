/**
 * `npx @pandus/mcp`: a stdio MCP server for the Pandus accessibility server.
 * PANDUS_API_TOKEN (or --token) gives the assistant your own sites; without it, the rule reference.
 * PANDUS_MCP_URL (or --url) points at another server, for example a staging one.
 */
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createProxy, DEFAULT_URL, VERSION } from './index.js';

function option(name: string): string | undefined {
    const index = process.argv.indexOf(`--${name}`);
    if (index !== -1) return process.argv[index + 1];
    const inline = process.argv.find((arg) => arg.startsWith(`--${name}=`));
    return inline?.slice(name.length + 3);
}

if (process.argv.includes('--help') || process.argv.includes('-h')) {
    console.log(`@pandus/mcp ${VERSION}: local MCP server for ${DEFAULT_URL}
Usage: pandus-mcp [--token <api token>] [--url <server url>]
Environment: PANDUS_API_TOKEN, PANDUS_MCP_URL`);
    process.exit(0);
}
if (process.argv.includes('--version') || process.argv.includes('-v')) {
    console.log(VERSION);
    process.exit(0);
}

const proxy = await createProxy({
    url: option('url') ?? process.env.PANDUS_MCP_URL ?? DEFAULT_URL,
    token: option('token') ?? process.env.PANDUS_API_TOKEN ?? null,
}).catch((error: unknown) => {
    console.error(
        `Could not reach the Pandus MCP server: ${error instanceof Error ? error.message : String(error)}`,
    );
    process.exit(1);
});

await proxy.server.connect(new StdioServerTransport());
for (const signal of ['SIGINT', 'SIGTERM'] as const) {
    process.on(signal, () => {
        void proxy.close().finally(() => process.exit(0));
    });
}
