const express = require("express");
const http = require("http");
const QRCode = require("qrcode");
const { WebSocketServer } = require("ws");
const crypto = require("crypto");

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });
const PORT = Number(process.env.PORT || 3000);
const PUBLIC_URL = (process.env.PUBLIC_URL || "").replace(/\/+$/, "");
const ADMIN_KEY = process.env.ADMIN_KEY || "change-this-admin-key";

const counts = { heart: 0, like: 0, cool: 0 };
const recent = new Map(); // connection/session -> timestamp
const clients = new Set();

app.use(express.json({ limit: "16kb" }));
app.use(express.static("public"));

function publicBase(req) {
  if (PUBLIC_URL) return PUBLIC_URL;
  const proto = req.headers["x-forwarded-proto"] || req.protocol;
  const host = req.headers["x-forwarded-host"] || req.get("host");
  return `${proto}://${host}`;
}

function broadcast(payload) {
  const msg = JSON.stringify(payload);
  for (const ws of clients) {
    if (ws.readyState === 1) ws.send(msg);
  }
}

function adminOK(req) {
  return req.headers["x-admin-key"] === ADMIN_KEY ||
         req.query.key === ADMIN_KEY;
}

app.get("/api/config", (req, res) => {
  res.json({ publicUrl: publicBase(req), counts });
});

app.get("/qr", async (req, res) => {
  try {
    const url = `${publicBase(req)}/`;
    const png = await QRCode.toBuffer(url, { width: 800, margin: 2, errorCorrectionLevel: "H" });
    res.type("png").send(png);
  } catch {
    res.status(500).send("QR generation failed");
  }
});

app.post("/api/react", (req, res) => {
  const type = req.body?.type;
  if (!["heart", "like", "cool"].includes(type)) {
    return res.status(400).json({ ok: false });
  }

  const key = String(req.ip || "unknown");
  const now = Date.now();
  const last = recent.get(key) || 0;

  // Basic anti-spam: max one reaction per IP every 250ms.
  if (now - last < 250) return res.status(429).json({ ok: false, rateLimited: true });
  recent.set(key, now);

  counts[type] += 1;
  broadcast({ event: "reaction", type, count: counts[type], counts });
  res.json({ ok: true, counts });
});

app.post("/api/reset", (req, res) => {
  if (!adminOK(req)) return res.status(401).json({ ok: false });
  counts.heart = counts.like = counts.cool = 0;
  broadcast({ event: "reset", counts });
  res.json({ ok: true, counts });
});

wss.on("connection", (ws) => {
  clients.add(ws);
  ws.send(JSON.stringify({ event: "snapshot", counts }));
  ws.on("close", () => clients.delete(ws));
});

setInterval(() => {
  const cutoff = Date.now() - 60_000;
  for (const [key, ts] of recent) if (ts < cutoff) recent.delete(key);
}, 60_000);

app.get("/health", (req, res) => res.json({ ok: true, clients: clients.size }));

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Reaction server listening on port ${PORT}`);
  if (PUBLIC_URL) console.log(`Public URL: ${PUBLIC_URL}`);
});
