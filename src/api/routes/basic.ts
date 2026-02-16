import { handleMcpRequest } from "../mcp/server";

export const basicRoutes = {
  "/api/hello": {
    async GET(req: any) {
      return Response.json({
        message: "Hello, world!",
        method: "GET",
      });
    },
    async PUT(req: any) {
      return Response.json({
        message: "Hello, world!",
        method: "PUT",
      });
    },
  },

  "/api/hello/:name": async (req: any) => {
    const name = req.params.name;
    return Response.json({
      message: `Hello, ${name}!`,
    });
  },

  "/mcp": {
    async POST(req: Request) {
      return handleMcpRequest(req);
    },
    async GET(req: Request) {
      return handleMcpRequest(req);
    },
    async DELETE(req: Request) {
      return handleMcpRequest(req);
    },
  },
};
