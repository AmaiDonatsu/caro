import type { ServerWebSocket } from "bun";
import { aiAgent } from "../logic/AIagent";

export const websocketHandler = {
  async open(ws: ServerWebSocket<unknown>) {
    console.log("WebSocket connected");
    ws.send(JSON.stringify({ role: "system", content: "Connected to AI Agent" }));
  },
  async message(ws: ServerWebSocket<unknown>, message: string | Buffer) {
    console.log(`Received message: ${message}`);
    try {
      const response = await aiAgent.execute(message.toString());
      ws.send(JSON.stringify({ role: "assistant", content: response }));
    } catch (error) {
      console.error("Error processing message:", error);
      ws.send(JSON.stringify({ role: "system", content: "Error processing message" }));
    }
  },
  async close(ws: ServerWebSocket<unknown>) {
    console.log("WebSocket closed");
  },
};