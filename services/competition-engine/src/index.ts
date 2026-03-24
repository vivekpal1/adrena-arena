/**
 * Competition Engine — main entry point
 *
 * Express server providing:
 * - REST API for leaderboards, player profiles, tournaments
 * - WebSocket for real-time leaderboard updates
 * - Bull queue workers for crank jobs
 */

import express from "express";
import { WebSocketServer } from "ws";
import { createServer } from "http";
import { LeaderboardService } from "./leaderboard/redis.js";

const PORT = parseInt(process.env.PORT ?? "3001", 10);
const REDIS_URL = process.env.REDIS_URL ?? "redis://localhost:6379";

const app = express();
app.use(express.json());

// Initialize services
const leaderboard = new LeaderboardService(REDIS_URL);

// ── Health Check ──────────────────────────────────────────────────

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "competition-engine" });
});

// ── League Leaderboard API ────────────────────────────────────────

app.get("/api/leaderboard/league/:season/:week/:tier", async (req, res) => {
  try {
    const { season, week, tier } = req.params;
    const offset = parseInt(req.query.offset as string) || 0;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);

    const rankings = await leaderboard.getLeagueRankings(
      parseInt(season),
      parseInt(week),
      parseInt(tier),
      offset,
      limit,
    );

    const total = await leaderboard.getTierCount(
      parseInt(season),
      parseInt(week),
      parseInt(tier),
    );

    res.json({ rankings, total, offset, limit });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
});

// ── Agent Leaderboard API ─────────────────────────────────────────

app.get("/api/leaderboard/agents/:season", async (req, res) => {
  try {
    const { season } = req.params;
    const offset = parseInt(req.query.offset as string) || 0;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);

    const rankings = await leaderboard.getAgentRankings(
      parseInt(season),
      offset,
      limit,
    );

    res.json({ rankings, offset, limit });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch agent leaderboard" });
  }
});

// ── Squad Leaderboard API ─────────────────────────────────────────

app.get("/api/leaderboard/squads/:season/:week", async (req, res) => {
  try {
    const { season, week } = req.params;
    const offset = parseInt(req.query.offset as string) || 0;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);

    const rankings = await leaderboard.getSquadRankings(
      parseInt(season),
      parseInt(week),
      offset,
      limit,
    );

    res.json({ rankings, offset, limit });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch squad leaderboard" });
  }
});

// ── Player Profile API ────────────────────────────────────────────

app.get("/api/player/:wallet", async (req, res) => {
  try {
    const { wallet } = req.params;
    // In production, this would query PostgreSQL via Prisma
    // For now, return mock structure
    res.json({
      wallet,
      tier: 0,
      leagueScore: 0,
      mutagen: 0,
      streak: 0,
      rank: null,
      message: "Connect to PostgreSQL for full data",
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch player" });
  }
});

// ── Tournament API ────────────────────────────────────────────────

app.get("/api/tournaments", async (_req, res) => {
  // In production, query PostgreSQL
  res.json({ tournaments: [], message: "Connect to PostgreSQL for full data" });
});

app.get("/api/tournament/:id/bracket", async (req, res) => {
  res.json({
    tournamentId: req.params.id,
    bracket: null,
    message: "Connect to PostgreSQL for full data",
  });
});

// ── Start Server ──────────────────────────────────────────────────

const server = createServer(app);

// WebSocket server for real-time updates
const wss = new WebSocketServer({ server, path: "/ws" });

wss.on("connection", (ws) => {
  ws.send(JSON.stringify({ type: "connected", message: "Adrena Arena WS" }));

  ws.on("message", (data) => {
    try {
      const msg = JSON.parse(data.toString());
      // Handle subscription requests
      if (msg.type === "subscribe") {
        // In production, add to subscription groups
        ws.send(JSON.stringify({ type: "subscribed", channel: msg.channel }));
      }
    } catch {
      // Ignore malformed messages
    }
  });
});

server.listen(PORT, () => {
  console.log(`Competition engine running on port ${PORT}`);
  console.log(`WebSocket available at ws://localhost:${PORT}/ws`);
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  await leaderboard.disconnect();
  server.close();
  process.exit(0);
});
