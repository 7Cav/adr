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

async function insertSnapshot(profileCount, rawJson, rosterType) {
  const res = await pool.query(
    'INSERT INTO snapshots (profile_count, raw_json, roster_type) VALUES ($1, $2, $3) RETURNING id',
    [profileCount, JSON.stringify(rawJson), rosterType]
  );
  return res.rows[0].id;
}

async function bulkInsertEvents(snapshotId, events) {
  if (!events.length) return;

  const cols = ['snapshot_id', 'event_type', 'profile_id', 'profile_name', 'rank_short', 'rank_image_url', 'old_value', 'new_value', 'record_date', 'detail'];
  const COLS_PER_ROW = cols.length;
  const CHUNK_SIZE = Math.floor(65000 / COLS_PER_ROW); // ~6500 rows per batch

  for (let offset = 0; offset < events.length; offset += CHUNK_SIZE) {
    const chunk = events.slice(offset, offset + CHUNK_SIZE);
    const placeholders = [];
    const values = [];
    let idx = 1;

    for (const e of chunk) {
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
}

async function latestSnapshot(rosterType = 'ROSTER_TYPE_COMBAT') {
  const res = await pool.query(
    'SELECT id, raw_json FROM snapshots WHERE raw_json IS NOT NULL AND roster_type = $1 ORDER BY fetched_at DESC LIMIT 1',
    [rosterType]
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

async function listDiffs(limit = 600) {
  const res = await pool.query(`
    SELECT s.id, s.fetched_at, s.roster_type, e.event_type, COUNT(*) as cnt
    FROM snapshots s
    JOIN diff_events e ON e.snapshot_id = s.id
    GROUP BY s.id, s.fetched_at, s.roster_type, e.event_type
    ORDER BY s.fetched_at DESC
    LIMIT $1
  `, [limit * 50]);

  const summaryMap = {};
  const order = [];

  for (const row of res.rows) {
    const sid = row.id;
    if (!summaryMap[sid]) {
      summaryMap[sid] = { snapshot_id: sid, fetched_at: row.fetched_at, roster_type: row.roster_type, counts: {} };
      order.push(sid);
    }
    summaryMap[sid].counts[row.event_type] = (summaryMap[sid].counts[row.event_type] || 0) + parseInt(row.cnt, 10);
  }

  return order.slice(0, limit).map(id => summaryMap[id]);
}

async function eventsForDate(dateStr, rosterType = null) {
  const result = await eventsForDateRange(dateStr, dateStr, rosterType);
  return { date: dateStr, counts: result.counts, events: result.events };
}

async function eventsForDateRange(fromStr, toStr, rosterType = null) {
  const to = new Date(toStr + 'T23:59:59.999Z');

  const params = [to];
  let fromClause = '';
  if (fromStr) {
    const from = new Date(fromStr + 'T00:00:00Z');
    params.unshift(from);
    fromClause = 's.fetched_at >= $1 AND ';
    // to is now $2
    params[1] = to;
    params.shift(); // rebuild cleanly below
  }

  // Build params cleanly
  const qParams = [];
  let fromCondition = '';
  if (fromStr) {
    qParams.push(new Date(fromStr + 'T00:00:00Z'));
    fromCondition = `s.fetched_at >= $${qParams.length} AND `;
  }
  qParams.push(to);
  const toCondition = `s.fetched_at <= $${qParams.length}`;

  let rosterClause = '';
  if (rosterType) {
    qParams.push(rosterType);
    rosterClause = `AND s.roster_type = $${qParams.length}`;
  }

  const res = await pool.query(`
    SELECT e.event_type, e.profile_id, e.profile_name, e.rank_short, e.rank_image_url,
           e.old_value, e.new_value,
           COALESCE(TO_CHAR(e.record_date, 'YYYY-MM-DD'), '') as record_date,
           e.detail,
           s.roster_type,
           TO_CHAR(s.fetched_at, 'YYYY-MM-DD') as snapshot_date
    FROM diff_events e
    JOIN snapshots s ON s.id = e.snapshot_id
    WHERE ${fromCondition}${toCondition}
    ${rosterClause}
    ORDER BY s.fetched_at DESC, e.event_type, e.profile_name
  `, qParams);

  const events = res.rows;
  const counts = {};
  for (const e of events) counts[e.event_type] = (counts[e.event_type] || 0) + 1;

  return { from: fromStr ?? null, to: toStr, counts, events };
}

module.exports = { initDatabase, getPool, insertSnapshot, bulkInsertEvents, latestSnapshot, purgeOldRawJson, listDiffs, eventsForDate, eventsForDateRange };
