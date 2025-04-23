// import type { IncomingMessage } from "http";
// import type { WebSocketServer } from "ws";

// Ensure this runs on Node.js (not Edge)
export const config = { runtime: "nodejs" };

/**
 * Called whenever a client connects to /api/ws.
 * Incoming messages are expected to be JSON price updates.
 * For now we just log them to the server console.
 */
export function SOCKET(
  client: import("ws").WebSocket
  //   req: IncomingMessage,
  //   server: WebSocketServer
) {
  console.log("🟢 Price feed client connected");

  client.on("message", (data) => {
    try {
      // Assume incoming data is JSON: { symbol: string, price: number }
      const update = JSON.parse(data.toString());
      const { symbol, price } = update;
      console.log(`📈 Received price update for ${symbol}: $${price}`);
    } catch (err) {
      console.error("⚠️ Failed to parse incoming price data", err);
    }
  });

  client.on("close", () => {
    console.log("🔴 Price feed client disconnected");
  });
}
