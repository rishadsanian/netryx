const WebSocket = require("ws");
const fs = require("fs");
const http = require("http");
const path = require("path");

const HOST = process.env.WS_HOST || "127.0.0.1";
const PORT = Number.parseInt(process.env.PORT || process.env.WS_PORT || "55455", 10);
const BUILD_DIR = path.join(__dirname, "build");

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
};

const server = http.createServer((req, res) => {
  const buildExists = fs.existsSync(BUILD_DIR);

  if (!buildExists) {
    res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Netryx WebSocket server is running. Run npm run build to serve the app from this process.\n");
    return;
  }

  const requestPath = new URL(req.url, `http://${req.headers.host}`).pathname;
  const requestedFile = path.resolve(BUILD_DIR, `.${decodeURIComponent(requestPath)}`);
  const relativePath = path.relative(BUILD_DIR, requestedFile);
  const safeFile =
    relativePath && !relativePath.startsWith("..") && !path.isAbsolute(relativePath)
      ? requestedFile
      : path.join(BUILD_DIR, "index.html");
  const filePath =
    fs.existsSync(safeFile) && fs.statSync(safeFile).isFile()
      ? safeFile
      : path.join(BUILD_DIR, "index.html");
  const ext = path.extname(filePath);

  res.writeHead(200, {
    "Content-Type": contentTypes[ext] || "application/octet-stream",
    "X-Content-Type-Options": "nosniff",
  });
  fs.createReadStream(filePath).pipe(res);
});

const wss = new WebSocket.Server({ server });

server.listen(PORT, HOST, () => {
  console.log(`Netryx server started on http://${HOST}:${PORT}`);
  console.log(`WebSocket latency stream available on ws://${HOST}:${PORT}`);
});

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
