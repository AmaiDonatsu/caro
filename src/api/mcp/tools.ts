import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { myelinaBrowser } from "../logic/tools/myelina-browser";

/**
 * Registers all MCP tools on the given server instance.
 */
export function registerTools(server: McpServer): void {
  // ─── Hello World (existing) ──────────────────────────────────────

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

  // ─── Browser: New Tab ────────────────────────────────────────────

  server.tool(
    "browser_new_tab",
    "Creates a new browser tab. Returns the tab ID.",
    {},
    async () => {
      const tab = myelinaBrowser.newTab();
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({ tabId: tab.id, message: "New tab created" }),
          },
        ],
      };
    }
  );

  // ─── Browser: Close Tab ──────────────────────────────────────────

  server.tool(
    "browser_close_tab",
    "Closes an open browser tab by its ID.",
    {
      tabId: z.string().describe("The ID of the tab to close"),
    },
    async ({ tabId }) => {
      const closed = myelinaBrowser.closeTab(tabId);
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({
              success: closed,
              message: closed ? `Tab ${tabId} closed` : `Tab ${tabId} not found`,
            }),
          },
        ],
      };
    }
  );

  // ─── Browser: List Tabs ──────────────────────────────────────────

  server.tool(
    "browser_list_tabs",
    "Lists all open browser tabs with their summary (ID, current query, results count, current page).",
    {},
    async () => {
      const tabs = myelinaBrowser.listTabs();
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({
              tabCount: tabs.length,
              tabs,
            }),
          },
        ],
      };
    }
  );

  // ─── Browser: Search ─────────────────────────────────────────────

  server.tool(
    "browser_search",
    "Searches the web using keywords from a specific browser tab. Returns structured search results with title, resume, url, and relevance score.",
    {
      tabId: z.string().describe("The ID of the tab to search from"),
      keywords: z.string().describe("The search keywords or query"),
      page: z.number().optional().describe("Page number for pagination (default: 1)"),
    },
    async ({ tabId, keywords, page }) => {
      const tab = myelinaBrowser.getTab(tabId);
      if (!tab) {
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({ error: `Tab ${tabId} not found` }),
            },
          ],
          isError: true,
        };
      }

      try {
        const results = await tab.searchbar(keywords, page ?? 1);
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({
                query: keywords,
                page: page ?? 1,
                resultsCount: results.length,
                results,
              }),
            },
          ],
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({ error: error.message }),
            },
          ],
          isError: true,
        };
      }
    }
  );

  // ─── Browser: Navigate ───────────────────────────────────────────

  server.tool(
    "browser_navigate",
    "Navigates to a specific URL in a browser tab and extracts its content in markdown format. The previous page is saved to history.",
    {
      tabId: z.string().describe("The ID of the tab to navigate"),
      url: z.string().describe("The URL to navigate to"),
    },
    async ({ tabId, url }) => {
      const tab = myelinaBrowser.getTab(tabId);
      if (!tab) {
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({ error: `Tab ${tabId} not found` }),
            },
          ],
          isError: true,
        };
      }

      try {
        const page = await tab.navigate(url);
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({
                url: page.url,
                title: page.title,
                content: page.content,
                imagesCount: page.images.length,
              }),
            },
          ],
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({ error: error.message }),
            },
          ],
          isError: true,
        };
      }
    }
  );

  // ─── Browser: Back ───────────────────────────────────────────────

  server.tool(
    "browser_back",
    "Goes back to the previous page in a browser tab's history.",
    {
      tabId: z.string().describe("The ID of the tab to go back in"),
    },
    async ({ tabId }) => {
      const tab = myelinaBrowser.getTab(tabId);
      if (!tab) {
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({ error: `Tab ${tabId} not found` }),
            },
          ],
          isError: true,
        };
      }

      const page = tab.back();
      if (!page) {
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({ message: "No history available, already at the beginning" }),
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({
              url: page.url,
              title: page.title,
              content: page.content,
              imagesCount: page.images.length,
            }),
          },
        ],
      };
    }
  );
}
