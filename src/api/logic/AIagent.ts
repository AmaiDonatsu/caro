import { generateText, tool, type CoreMessage } from "ai";
import { google } from "@ai-sdk/google";
import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

type ModelProvider = "google" | "anthropic";

const MODELS = {
  google: google("gemini-3-pro-preview"),
  anthropic: anthropic("claude-sonnet-4-20250514"),
} as const;

/**
 * Default MCP server URL (local server)
 */
const MCP_SERVER_URL = "http://localhost:3000/mcp";

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
  private mcpClient: Client | null = null;
  private cachedTools: Record<string, ReturnType<typeof tool>> | null = null;

  constructor(model: ModelProvider = "google") {
    this.model = model;
  }

  /**
   * Lazily connects to the MCP server and caches the client + tools.
   * Reuses the existing connection if already connected.
   */
  private async ensureConnected(): Promise<Record<string, ReturnType<typeof tool>>> {
    if (this.mcpClient && this.cachedTools) {
      return this.cachedTools;
    }

    console.log("[AI Agent] Establishing persistent MCP connection...");

    const transport = new StreamableHTTPClientTransport(
      new URL(MCP_SERVER_URL)
    );

    this.mcpClient = new Client({
      name: "caro-ai-agent",
      version: "1.0.0",
    });

    await this.mcpClient.connect(transport);
    console.log("[AI Agent] Connected to MCP server (persistent)");

    this.cachedTools = await getMcpToolsAsAiTools(this.mcpClient);
    return this.cachedTools;
  }

  /**
   * Execute a prompt using the AI model with MCP tools available.
   * Reuses the persistent MCP connection.
   */
  async execute(prompt: string): Promise<string> {
    try {
      const mcpTools = await this.ensureConnected();

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
    } catch (error) {
      // If connection failed, reset state so next call retries
      console.error("[AI Agent] Error during execution, resetting connection:", error);
      await this.close();
      throw error;
    }
  }

  /**
   * Explicitly close the MCP connection (for cleanup).
   */
  async close(): Promise<void> {
    if (this.mcpClient) {
      await this.mcpClient.close();
      console.log("[AI Agent] Disconnected from MCP server");
      this.mcpClient = null;
      this.cachedTools = null;
    }
  }
}

export const aiAgent = new AIagent();

