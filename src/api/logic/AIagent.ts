import { generateText, tool, type CoreMessage } from "ai";
import { google } from "@ai-sdk/google";
import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

type ModelProvider = "google" | "anthropic";

const MODELS = {
  google: google("gemini-2.0-flash"),
  anthropic: anthropic("claude-sonnet-4-20250514"),
} as const;

/**
 * Default MCP server URL (local server)
 */
const MCP_SERVER_URL = "http://localhost:3000/mcp";

/**
 * Creates an MCP client connected to the local MCP server.
 * Returns the client and a cleanup function.
 */
async function createMcpClient(): Promise<{
  client: Client;
  close: () => Promise<void>;
}> {
  const transport = new StreamableHTTPClientTransport(
    new URL(MCP_SERVER_URL)
  );

  const client = new Client({
    name: "caro-ai-agent",
    version: "1.0.0",
  });

  await client.connect(transport);
  console.log("[AI Agent] Connected to MCP server");

  return {
    client,
    close: async () => {
      await client.close();
      console.log("[AI Agent] Disconnected from MCP server");
    },
  };
}

/**
 * Discovers tools from the MCP server and converts them
 * to Vercel AI SDK tool format for use with generateText.
 */
async function getMcpToolsAsAiTools(mcpClient: Client) {
  const { tools: mcpTools } = await mcpClient.listTools();
  console.log(
    `[AI Agent] Discovered ${mcpTools.length} MCP tools:`,
    mcpTools.map((t) => t.name)
  );

  const aiTools: Record<string, ReturnType<typeof tool>> = {};

  for (const mcpTool of mcpTools) {
    // Build a zod schema from the MCP tool's inputSchema
    const inputSchema = mcpTool.inputSchema;
    let zodSchema: z.ZodTypeAny = z.object({});

    if (inputSchema && inputSchema.properties) {
      const shape: Record<string, z.ZodTypeAny> = {};
      for (const [key, prop] of Object.entries(
        inputSchema.properties as Record<string, any>
      )) {
        let fieldSchema: z.ZodTypeAny;
        switch (prop.type) {
          case "string":
            fieldSchema = z.string();
            break;
          case "number":
            fieldSchema = z.number();
            break;
          case "boolean":
            fieldSchema = z.boolean();
            break;
          default:
            fieldSchema = z.any();
        }
        if (prop.description) {
          fieldSchema = fieldSchema.describe(prop.description);
        }
        // Check if the field is required
        const required = inputSchema.required as string[] | undefined;
        if (!required || !required.includes(key)) {
          fieldSchema = fieldSchema.optional();
        }
        shape[key] = fieldSchema;
      }
      zodSchema = z.object(shape);
    }

    const toolName = mcpTool.name;
    aiTools[toolName] = tool({
      description: mcpTool.description || toolName,
      parameters: zodSchema,
      execute: async (args: any) => {
        console.log(`[AI Agent] Calling MCP tool: ${toolName}`, args);
        const result = await mcpClient.callTool({
          name: toolName,
          arguments: args,
        });
        console.log(`[AI Agent] Tool result:`, result);
        return result;
      },
    });
  }

  return aiTools;
}

export class AIagent {
  private model: ModelProvider;

  constructor(model: ModelProvider = "google") {
    this.model = model;
  }

  /**
   * Execute a prompt using the AI model with MCP tools available.
   */
  async execute(prompt: string): Promise<string> {
    const { client, close } = await createMcpClient();

    try {
      const mcpTools = await getMcpToolsAsAiTools(client);

      const result = await generateText({
        model: MODELS[this.model],
        tools: mcpTools,
        maxSteps: 5,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      return result.text || "[No text response]";
    } finally {
      await close();
    }
  }
}

export const aiAgent = new AIagent();
