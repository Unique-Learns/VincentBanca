import { useState, useEffect, useCallback } from "react";

export function useWebSocket() {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  
  useEffect(() => {
    // Create WebSocket connection
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const ws = new WebSocket(wsUrl);
    
    ws.addEventListener("open", () => {
      setIsConnected(true);
    });
    
    ws.addEventListener("close", () => {
      setIsConnected(false);
    });
    
    ws.addEventListener("error", (error) => {
      console.error("WebSocket error:", error);
      setIsConnected(false);
    });
    
    setSocket(ws);
    
    // Clean up
    return () => {
      ws.close();
    };
  }, []);
  
  // Function to send messages through the WebSocket
  const sendMessage = useCallback((data: any) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(data));
      return true;
    }
    return false;
  }, [socket]);
  
  return { socket, isConnected, sendMessage };
}
