import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

/**
 * Registers all MCP tools on the given server instance.
 */
export function registerTools(server: McpServer): void {
  server.tool(
    "hello_world",
    "Prints a hello world message to the server console",
    {
      name: z.string().optional().describe("An optional name to greet"),
    },
    async ({ name }) => {
      const greeting = name
        ? `Hello, ${name}! 🌍`
        : "Hello, World! 🌍";

      console.log(`[MCP Tool] ${greeting}`);

      return {
        content: [
          {
            type: "text" as const,
            text: greeting,
          },
        ],
      };
    }
  );
}
