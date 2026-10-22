/**
 * A local MCP server that forwards everything to the Pandus accessibility MCP server over
 * streamable HTTP. For clients that only start local (stdio) servers; clients that connect to
 * remote servers can use https://pandus.online/mcp directly, with a Pandus sign-in (OAuth) or
 * an API token.
 */
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
    CallToolRequestSchema,
    CallToolResultSchema,
    GetPromptRequestSchema,
    GetPromptResultSchema,
    ListPromptsRequestSchema,
    ListPromptsResultSchema,
    ListResourcesRequestSchema,
    ListResourcesResultSchema,
    ListResourceTemplatesRequestSchema,
    ListResourceTemplatesResultSchema,
    ListToolsRequestSchema,
    ListToolsResultSchema,
    ReadResourceRequestSchema,
    ReadResourceResultSchema,
    type ServerCapabilities,
} from '@modelcontextprotocol/sdk/types.js';

export const VERSION = '1.0.0';

export const DEFAULT_URL = 'https://pandus.online/mcp';

export type ProxyOptions = {
    /** The remote MCP server; the Pandus server by default. */
    url?: string;
    /** A Pandus API token (Pro and Agency plans) for your own sites; without it, the rule reference. */
    token?: string | null;
    /** A fetch implementation, for tests. */
    fetch?: typeof fetch;
};

export type Proxy = {
    /** The local server a client talks to; connect it to a transport (stdio, in-memory). */
    server: Server;
    /** The connection to the remote server. */
    client: Client;
    close: () => Promise<void>;
};

/** Connects to the remote server and returns a local server that forwards every request to it. */
export async function createProxy(options: ProxyOptions = {}): Promise<Proxy> {
    const client = new Client({ name: '@pandus/mcp', version: VERSION });
    const transport = new StreamableHTTPClientTransport(
        new URL(options.url ?? DEFAULT_URL),
        {
            requestInit: options.token
                ? { headers: { Authorization: `Bearer ${options.token}` } }
                : undefined,
            fetch: options.fetch,
        },
    );
    await client.connect(transport);

    const remote = client.getServerCapabilities() ?? {};
    const capabilities: ServerCapabilities = {};
    if (remote.tools) capabilities.tools = {};
    if (remote.prompts) capabilities.prompts = {};
    if (remote.resources) capabilities.resources = {};

    const server = new Server(
        { name: 'Pandus', version: VERSION },
        { capabilities, instructions: client.getInstructions() },
    );
    const forward =
        <T>(schema: { parse: (value: unknown) => T }) =>
        (request: { method: string; params?: Record<string, unknown> }) =>
            client.request(
                { method: request.method, params: request.params },
                schema as never,
            ) as Promise<T>;

    if (remote.tools) {
        server.setRequestHandler(
            ListToolsRequestSchema,
            forward(ListToolsResultSchema),
        );
        server.setRequestHandler(
            CallToolRequestSchema,
            forward(CallToolResultSchema),
        );
    }
    if (remote.prompts) {
        server.setRequestHandler(
            ListPromptsRequestSchema,
            forward(ListPromptsResultSchema),
        );
        server.setRequestHandler(
            GetPromptRequestSchema,
            forward(GetPromptResultSchema),
        );
    }
    if (remote.resources) {
        server.setRequestHandler(
            ListResourcesRequestSchema,
            forward(ListResourcesResultSchema),
        );
        server.setRequestHandler(
            ListResourceTemplatesRequestSchema,
            forward(ListResourceTemplatesResultSchema),
        );
        server.setRequestHandler(
            ReadResourceRequestSchema,
            forward(ReadResourceResultSchema),
        );
    }

    return {
        server,
        client,
        close: async () => {
            await server.close();
            await client.close();
        },
    };
}
