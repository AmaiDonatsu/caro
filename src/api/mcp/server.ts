import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { registerTools } from "./tools";

/**
 * Map of sessionId -> transport for stateful session management.
 * Each session gets its own transport to maintain state.
 */
const transports: Map<string, WebStandardStreamableHTTPServerTransport> = new Map();

/**
 * Handle an incoming HTTP request to the /mcp endpoint.
 * Creates a new transport per session (stateful mode).
 */
export async function handleMcpRequest(req: Request): Promise<Response> {
  const sessionId = req.headers.get("mcp-session-id");

  // For POST requests with initialize method, create a new transport
  if (req.method === "POST") {
    // Try to get body to check if it's an initialize request
    const body = await req.json();
    const isInitialize = Array.isArray(body)
      ? body.some((msg: any) => msg.method === "initialize")
      : body.method === "initialize";

    if (isInitialize && !sessionId) {
      // New session - create a new server and transport
      const server = new McpServer({
        name: "caro-mcp-server",
        version: "1.0.0",
      });

      registerTools(server);

      const transport = new WebStandardStreamableHTTPServerTransport({
        sessionIdGenerator: () => crypto.randomUUID(),
        onsessioninitialized: (id) => {
          transports.set(id, transport);
          console.log(`[MCP] Session initialized: ${id}`);
        },
        onsessionclosed: (id) => {
          transports.delete(id);
          console.log(`[MCP] Session closed: ${id}`);
        },
      });

      await server.connect(transport);

      // Re-create the request since we already consumed the body
      const newReq = new Request(req.url, {
        method: req.method,
        headers: req.headers,
        body: JSON.stringify(body),
      });

      return transport.handleRequest(newReq, { parsedBody: body });
    }

    // Existing session
    if (sessionId) {
      const transport = transports.get(sessionId);
      if (!transport) {
        return new Response(
          JSON.stringify({ error: "Session not found" }),
          { status: 404, headers: { "Content-Type": "application/json" } }
        );
      }
      return transport.handleRequest(req, { parsedBody: body });
    }

    // POST without session ID and not initializing
    return new Response(
      JSON.stringify({ error: "Missing session ID" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // GET / DELETE requests need session ID
  if (req.method === "GET" || req.method === "DELETE") {
    if (!sessionId) {
      return new Response(
        JSON.stringify({ error: "Missing session ID" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    const transport = transports.get(sessionId);
    if (!transport) {
      return new Response(
        JSON.stringify({ error: "Session not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }
    return transport.handleRequest(req);
  }

  return new Response("Method not allowed", { status: 405 });
}
