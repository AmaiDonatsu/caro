export class ChatWebSocket {
  private ws: WebSocket | null = null;
  private url: string;
  private onMessage: (message: any) => void;
  private onStatusChange?: (status: "connected" | "disconnected" | "connecting") => void;

  constructor(
    url: string,
    onMessage: (message: any) => void,
    onStatusChange?: (status: "connected" | "disconnected" | "connecting") => void
  ) {
    this.url = url;
    this.onMessage = onMessage;
    this.onStatusChange = onStatusChange;
  }

  connect() {
    this.onStatusChange?.("connecting");
    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      console.log("Connected to WebSocket");
      this.onStatusChange?.("connected");
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.onMessage(data);
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    this.ws.onclose = () => {
      console.log("Disconnected from WebSocket");
      this.onStatusChange?.("disconnected");
      this.ws = null;
      // Auto-reconnect after 3 seconds
      setTimeout(() => this.connect(), 3000);
    };

    this.ws.onerror = (error) => {
      console.error("WebSocket error:", JSON.stringify(error));
      this.ws?.close();
    };
  }

  sendMessage(message: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(message);
    } else {
      console.warn("WebSocket is not connected. Message not sent.");
    }
  }

  close() {
    this.ws?.close();
  }
}
