import { serve } from "bun";
import index from "./index.html";
import { basicRoutes } from "./api/routes/basic";

import { websocketHandler } from "./api/routes/websocket";

const server = serve({
  routes: {
    // Serve index.html for all unmatched routes.
    "/*": index,
    "/api/chat": (req, server) => {
        if (server.upgrade(req, {
            data: {
                createdAt: Date.now(),
                channelId: new URL(req.url).searchParams.get("channelId"),
            },
        })) {
            return undefined;
        }
        return new Response("Upgrade failed", { status: 500 });
    },
    ...basicRoutes,
  },
  websocket: websocketHandler,

  development: process.env.NODE_ENV !== "production" && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);
