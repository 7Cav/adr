const express = require("express");
const router = express.Router();
const db = require("../db/database");
const { runSnapshot } = require("../controllers/diffPoller");

const VALID_ROSTER_TYPES = new Set([
  "ROSTER_TYPE_COMBAT",
  "ROSTER_TYPE_RESERVE",
  "ROSTER_TYPE_ELOA",
  "ROSTER_TYPE_WALL_OF_HONOR",
  "ROSTER_TYPE_ARLINGTON",
  "ROSTER_TYPE_PAST_MEMBERS",
]);

function parseRosterType(query) {
  const rt = query?.roster_type;
  if (!rt) return null;
  if (!VALID_ROSTER_TYPES.has(rt)) return "INVALID";
  return rt;
}

// GET /diffs — returns all roster types; frontend filters client-side
router.get("/diffs", async (req, res) => {
  try {
    const summaries = await db.listDiffs(600);
    res.json(summaries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /diffs/range?from=YYYY-MM-DD&to=YYYY-MM-DD[&roster_type=X]
// MUST be registered before /diffs/:date to avoid Express capturing "range" as the date param
router.get("/diffs/range", async (req, res) => {
  const { from, to } = req.query;
  if (!to) return res.status(400).json({ error: "to query param required" });
  const rosterType = parseRosterType(req.query);
  if (rosterType === "INVALID")
    return res.status(400).json({ error: "invalid roster_type" });
  try {
    const result = await db.eventsForDateRange(from ?? null, to, rosterType);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /diffs/:date[?roster_type=X]
router.get("/diffs/:date", async (req, res) => {
  const { date } = req.params;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date))
    return res.status(400).json({ error: "date must be YYYY-MM-DD" });
  const rosterType = parseRosterType(req.query);
  if (rosterType === "INVALID")
    return res.status(400).json({ error: "invalid roster_type" });
  try {
    const result = await db.eventsForDate(date, rosterType);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /ranks — rank images are now constructed directly from the DB; this endpoint
// returns an empty ranks array for backward compatibility with any cached clients.
router.get("/ranks", (req, res) => {
  res.set("Cache-Control", "public, max-age=3600").json({ ranks: [] });
});

// POST /admin/snapshot — trigger a manual snapshot fetch for all roster types
// In-flight guard: reject concurrent requests so the endpoint can't be spammed
let snapshotRunning = false;
router.post("/admin/snapshot", (req, res) => {
  if (snapshotRunning) {
    return res.status(429).json({ error: "snapshot already in progress" });
  }
  snapshotRunning = true;
  runSnapshot().finally(() => {
    snapshotRunning = false;
  });
  res.json({ status: "snapshot triggered" });
});

// GET /admin/runs?limit=N — recent snapshot runs (status, reason) for operator
// visibility into rejected/bootstrap/ok ticks. Default 50, hard cap 500.
router.get("/admin/runs", async (req, res) => {
  const raw = parseInt(req.query.limit, 10);
  const limit = Number.isFinite(raw) && raw > 0 ? Math.min(raw, 500) : 50;
  try {
    const rows = await db.recentRuns(limit);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/userSearch", async (req, res) => {
  const searchTerm = req.query.q;

  if (!searchTerm || searchTerm.length < 3) {
    return res.json([]);
  }

  let foundUsers = await db.searchUserTable(searchTerm);
  console.log(foundUsers);

  if (!foundUsers) {
    res.status(500).json({ error: "Search failed" });
  } else {
    res.json(foundUsers);
  }
});

module.exports = router;
