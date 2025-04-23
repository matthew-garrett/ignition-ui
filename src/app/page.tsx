"use client";

import { CubeTransparentIcon } from "@heroicons/react/24/solid";
import { useEffect, useRef, useState, useCallback } from "react";

export default function Home() {
  const [prices, setPrices] = useState<Record<string, number>>({});
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const MAX_RECONNECT_ATTEMPTS = 5;
  const RECONNECT_DELAY = 3000;

  const connectWebSocket = useCallback(() => {
    // Clean up previous connection if exists
    if (wsRef.current) {
      wsRef.current.close();
    }

    const ws = new WebSocket("wss://ws.coinapi.io/v1/");
    wsRef.current = ws;

    ws.addEventListener("open", () => {
      console.log("🔗 WebSocket connected for price feed");
      reconnectAttempts.current = 0; // Reset reconnect attempts on successful connection

      // Send authentication message with API key
      const apiKey = "15f02f61-f1fe-498d-a19a-c041d345eb9d"; // Replace with your actual API key
      ws.send(
        JSON.stringify({
          type: "hello",
          apikey: apiKey,
          heartbeat: true, // Enable heartbeat
          subscribe_data_type: ["trade"],
        })
      );

      // Subscribe to specific cryptocurrencies after connection
      setTimeout(() => {
        ["BTC", "ETH", "SOL"].forEach((symbol) => {
          ws.send(
            JSON.stringify({
              type: "subscribe",
              assets: [`${symbol}USD`],
              subscribe_data_type: ["trade"],
              subscribe_filter_symbol_id: [`COINBASE_SPOT_${symbol}_USD$`],
            })
          );
          console.log(`🔔 Subscribed to ${symbol}`);
        });
      }, 1000);
    });

    // Set up heartbeat ping to keep connection alive
    const pingInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "ping" }));
        console.log("🔄 Sending ping to keep connection alive");
      }
    }, 5000); // Send ping every 5 seconds

    ws.addEventListener("message", (event) => {
      try {
        const data = JSON.parse(event.data);

        // Handle different message types from CoinAPI
        if (data.type === "trade") {
          const symbol = data.symbol_id.split("_").slice(-2)[0]; // Extract symbol from COINBASE_SPOT_BTC_USD
          const price = data.price;

          console.log(`📈 ${symbol}: $${price}`);

          // Update the price map
          setPrices((prev) => ({
            ...prev,
            [symbol]: price,
          }));
        } else {
          console.log("Other message type:", data.type, data);
        }
      } catch (err) {
        console.error("⚠️ Invalid price update payload", err);
      }
    });

    ws.addEventListener("close", () => {
      console.log("⚡️ WebSocket disconnected");
      clearInterval(pingInterval);

      // Try to reconnect if we haven't exceeded max attempts
      if (reconnectAttempts.current < MAX_RECONNECT_ATTEMPTS) {
        console.log(
          `🔄 Attempting to reconnect (${
            reconnectAttempts.current + 1
          }/${MAX_RECONNECT_ATTEMPTS})...`
        );
        reconnectAttempts.current += 1;

        reconnectTimeoutRef.current = setTimeout(() => {
          connectWebSocket();
        }, RECONNECT_DELAY);
      } else {
        console.error(
          "❌ Maximum reconnection attempts reached. Please refresh the page."
        );
      }
    });

    ws.addEventListener("error", (error) => {
      console.error("WebSocket Error:", error);
    });

    return () => {
      clearInterval(pingInterval);
      ws.close();
      // Clean up reconnect timeout if it exists
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connectWebSocket]);

  // const sendSubscribe = (symbol: string) => {
  //   if (wsRef.current?.readyState === WebSocket.OPEN) {
  //     wsRef.current.send(
  //       JSON.stringify({
  //         type: "subscribe",
  //         assets: [`${symbol}USD`],
  //         subscribe_data_type: ["trade"],
  //         subscribe_filter_symbol_id: [`COINBASE_SPOT_${symbol}_USD$`],
  //       })
  //     );
  //   }
  // };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <CubeTransparentIcon className="size-12 text-black" />
      <main className="p-4">
        <h1 className="text-2xl font-semibold mb-4">Live Price Feed</h1>

        {/* <div className="flex space-x-2 mb-4">
          {["BTC", "ETH", "SOL"].map((sym) => (
            <button
              key={sym}
              className="px-3 py-1 rounded bg-blue-600 text-white"
              onClick={() => sendSubscribe(sym)}
            >
              Subscribe {sym}
            </button>
          ))}
        </div> */}

        <ul className="space-y-2">
          {Object.entries(prices)
            .filter(([symbol]) => ["BTC", "ETH", "SOL"].includes(symbol))
            .map(([symbol, price]) => (
              <li key={symbol} className="flex justify-between border-b pb-1">
                <span>{symbol}</span>
                <span>${price.toFixed(2)}</span>
              </li>
            ))}
          {Object.entries(prices).filter(([symbol]) =>
            ["BTC", "ETH", "SOL"].includes(symbol)
          ).length === 0 && (
            <li className="text-gray-500">
              No crypto price data yet. Click subscribe buttons above.
            </li>
          )}
        </ul>
      </main>
    </div>
  );
}
