const WebSocket = require("ws");

const wss = new WebSocket.Server({ port: 55455 });

console.log("WebSocket server started on ws://localhost:55455");

wss.on("connection", (ws) => {
  console.log("Client connected");

  // Send a timestamp every second
  const interval = setInterval(() => {
    const timestamp = Date.now();
    ws.send(timestamp.toString());
  }, 1000);

  ws.on("close", () => {
    console.log("Client disconnected");
    clearInterval(interval);
  });
});
