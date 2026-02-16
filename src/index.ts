import { serve } from "bun";
import index from "./index.html";
import { basicRoutes } from "./api/routes/basic";

const server = serve({
  routes: {
    // Serve index.html for all unmatched routes.
    "/*": index,
    ...basicRoutes,
  },

  development: process.env.NODE_ENV !== "production" && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);
