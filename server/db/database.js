const { Pool } = require('pg');
const path = require('path');
const { runner: migrate } = require('node-pg-migrate');

let pool;

async function initDatabase() {
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
  await pool.query('SELECT 1'); // ping

  await migrate({
    databaseUrl: process.env.DATABASE_URL,
    migrationsTable: 'pgmigrations',
    dir: path.join(__dirname, 'migrations'),
    direction: 'up',
    log: (msg) => console.log('[migrate]', msg),
  });

  console.log('Database ready.');
}

function getPool() {
  return pool;
}

async function insertSnapshot(profileCount, rawJson) {
  const res = await pool.query(
    'INSERT INTO snapshots (profile_count, raw_json) VALUES ($1, $2) RETURNING id',
    [profileCount, JSON.stringify(rawJson)]
  );
  return res.rows[0].id;
}

async function bulkInsertEvents(snapshotId, events) {
  if (!events.length) return;

  const cols = ['snapshot_id', 'event_type', 'profile_id', 'profile_name', 'rank_short', 'rank_image_url', 'old_value', 'new_value', 'record_date', 'detail'];
  const placeholders = [];
  const values = [];
  let idx = 1;

  for (const e of events) {
    const recordDate = e.record_date && e.record_date !== '' ? e.record_date : null;
    placeholders.push(`($${idx},$${idx+1},$${idx+2},$${idx+3},$${idx+4},$${idx+5},$${idx+6},$${idx+7},$${idx+8},$${idx+9})`);
    values.push(snapshotId, e.event_type, e.profile_id, e.profile_name, e.rank_short || '', e.rank_image_url || '', e.old_value || '', e.new_value || '', recordDate, e.detail || '');
    idx += 10;
  }

  await pool.query(
    `INSERT INTO diff_events (${cols.join(',')}) VALUES ${placeholders.join(',')}`,
    values
  );
}

async function latestSnapshot() {
  const res = await pool.query(
    'SELECT id, raw_json FROM snapshots WHERE raw_json IS NOT NULL ORDER BY fetched_at DESC LIMIT 1'
  );
  if (!res.rows.length) return null;
  const { id, raw_json } = res.rows[0];
  return { id, profiles: raw_json.profiles };
}

async function purgeOldRawJson(cutoffDate) {
  await pool.query(
    'UPDATE snapshots SET raw_json = NULL WHERE fetched_at < $1 AND raw_json IS NOT NULL',
    [cutoffDate]
  );
}

async function listDiffs(limit = 90) {
  const res = await pool.query(`
    SELECT s.id, s.fetched_at, e.event_type, COUNT(*) as cnt
    FROM snapshots s
    JOIN diff_events e ON e.snapshot_id = s.id
    GROUP BY s.id, s.fetched_at, e.event_type
    ORDER BY s.fetched_at DESC
    LIMIT $1
  `, [limit * 10]);

  const summaryMap = {};
  const order = [];

  for (const row of res.rows) {
    const sid = row.id;
    if (!summaryMap[sid]) {
      summaryMap[sid] = { snapshot_id: sid, fetched_at: row.fetched_at, counts: {} };
      order.push(sid);
    }
    summaryMap[sid].counts[row.event_type] = (summaryMap[sid].counts[row.event_type] || 0) + parseInt(row.cnt, 10);
  }

  return order.slice(0, limit).map(id => summaryMap[id]);
}

async function eventsForDate(dateStr) {
  const start = new Date(dateStr + 'T00:00:00Z');
  const end = new Date(dateStr + 'T23:59:59.999Z');
  // Return all events from every snapshot on this calendar day (matches Go behaviour)
  const result = await eventsForDateRange(dateStr, dateStr);
  return { date: dateStr, counts: result.counts, events: result.events };
}

async function eventsForDateRange(fromStr, toStr) {
  const from = new Date(fromStr + 'T00:00:00Z');
  const to = new Date(toStr + 'T23:59:59.999Z');

  const res = await pool.query(`
    SELECT e.event_type, e.profile_id, e.profile_name, e.rank_short, e.rank_image_url,
           e.old_value, e.new_value,
           COALESCE(TO_CHAR(e.record_date, 'YYYY-MM-DD'), '') as record_date,
           e.detail,
           TO_CHAR(s.fetched_at, 'YYYY-MM-DD') as snapshot_date
    FROM diff_events e
    JOIN snapshots s ON s.id = e.snapshot_id
    WHERE s.fetched_at >= $1 AND s.fetched_at <= $2
    ORDER BY s.fetched_at DESC, e.event_type, e.profile_name
  `, [from, to]);

  const events = res.rows;
  const counts = {};
  for (const e of events) counts[e.event_type] = (counts[e.event_type] || 0) + 1;

  return { from: fromStr, to: toStr, counts, events };
}

module.exports = { initDatabase, getPool, insertSnapshot, bulkInsertEvents, latestSnapshot, purgeOldRawJson, listDiffs, eventsForDate, eventsForDateRange };
