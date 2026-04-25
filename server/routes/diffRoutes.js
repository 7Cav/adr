const express = require('express');
const router = express.Router();
const axios = require('axios');
const db = require('../db/database');
const { runSnapshot } = require('../controllers/diffPoller');

const API_TOKEN = process.env.API_TOKEN;
const RANKS_URL = 'https://api.7cav.us/api/v1/milpacs/ranks';

let ranksCache = null;
let ranksCacheTime = 0;

// GET /diffs
router.get('/diffs', async (req, res) => {
  try {
    const summaries = await db.listDiffs(90);
    res.json(summaries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /diffs/range?from=YYYY-MM-DD&to=YYYY-MM-DD
// MUST be registered before /diffs/:date to avoid Express capturing "range" as the date param
router.get('/diffs/range', async (req, res) => {
  const { from, to } = req.query;
  if (!from || !to) return res.status(400).json({ error: 'from and to query params required' });
  try {
    const result = await db.eventsForDateRange(from, to);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /diffs/:date
router.get('/diffs/:date', async (req, res) => {
  const { date } = req.params;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return res.status(400).json({ error: 'date must be YYYY-MM-DD' });
  try {
    const result = await db.eventsForDate(date);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /ranks — proxy MILPACS ranks with 1h cache
router.get('/ranks', async (req, res) => {
  const now = Date.now();
  if (ranksCache && now - ranksCacheTime < 3600000) {
    return res.set('Cache-Control', 'public, max-age=3600').json(ranksCache);
  }
  try {
    const response = await axios(RANKS_URL, {
      headers: { Authorization: 'Bearer ' + API_TOKEN, Accept: 'application/json' },
      timeout: 15000,
    });
    ranksCache = response.data;
    ranksCacheTime = now;
    res.set('Cache-Control', 'public, max-age=3600').json(ranksCache);
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
});

// POST /admin/snapshot — trigger a manual snapshot fetch
router.post('/admin/snapshot', (req, res) => {
  runSnapshot(); // fire and forget
  res.json({ status: 'snapshot triggered' });
});

module.exports = router;
