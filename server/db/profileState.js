const { getPool } = require("./database");

// Returns the previous "current state" per profile in the same nested shape
// computeDiff already consumes (rank.{rankId,rankShort,rankFull,rankImageUrl},
// primary.{positionId,positionTitle}, realName, user.username, records[],
// awards[]). Records/awards arrays carry only the uid — that's all the diff
// algorithm uses for set-membership checks.
async function loadProfileState(rosterType) {
  const pool = getPool();

  const [stateRes, recordsRes, awardsRes] = await Promise.all([
    pool.query(
      `SELECT profile_id, rank_id, rank_short, rank_full, rank_image_url,
              position_id, position_title, real_name, username
       FROM roster_profile_state
       WHERE roster_type = $1`,
      [rosterType],
    ),
    pool.query(
      `SELECT profile_id, record_uid
       FROM roster_profile_records
       WHERE roster_type = $1`,
      [rosterType],
    ),
    pool.query(
      `SELECT profile_id, award_uid
       FROM roster_profile_awards
       WHERE roster_type = $1`,
      [rosterType],
    ),
  ]);

  const profiles = {};
  for (const r of stateRes.rows) {
    profiles[r.profile_id] = {
      rank: {
        rankId: r.rank_id,
        rankShort: r.rank_short,
        rankFull: r.rank_full,
        rankImageUrl: r.rank_image_url,
      },
      primary: {
        positionId: r.position_id,
        positionTitle: r.position_title,
      },
      realName: r.real_name,
      user: { username: r.username },
      records: [],
      awards: [],
    };
  }

  for (const r of recordsRes.rows) {
    const p = profiles[r.profile_id];
    if (p) p.records.push({ recordUid: r.record_uid });
  }
  for (const r of awardsRes.rows) {
    const p = profiles[r.profile_id];
    if (p) p.awards.push({ awardUid: r.award_uid });
  }

  return profiles;
}

// Apply the current MariaDB fetch result as the new authoritative state for
// this roster. Runs inside the caller's transaction (`client` is a checked-out
// pg client wrapped in BEGIN/COMMIT by the caller).
async function applyProfileStateUpdate(
  client,
  rosterType,
  currProfiles,
  removedIds,
) {
  const currIds = Object.keys(currProfiles);

  if (currIds.length) {
    await upsertProfileStates(client, rosterType, currProfiles);
    await reconcileChildSet(
      client,
      rosterType,
      currProfiles,
      "roster_profile_records",
      "record_uid",
      "records",
      "recordUid",
    );
    await reconcileChildSet(
      client,
      rosterType,
      currProfiles,
      "roster_profile_awards",
      "award_uid",
      "awards",
      "awardUid",
    );
  }

  if (removedIds.length) {
    await client.query(
      `DELETE FROM roster_profile_state
       WHERE roster_type = $1 AND profile_id = ANY($2::text[])`,
      [rosterType, removedIds],
    );
    await client.query(
      `DELETE FROM roster_profile_records
       WHERE roster_type = $1 AND profile_id = ANY($2::text[])`,
      [rosterType, removedIds],
    );
    await client.query(
      `DELETE FROM roster_profile_awards
       WHERE roster_type = $1 AND profile_id = ANY($2::text[])`,
      [rosterType, removedIds],
    );
  }
}

async function upsertProfileStates(client, rosterType, currProfiles) {
  const cols = [
    "roster_type",
    "profile_id",
    "rank_id",
    "rank_short",
    "rank_full",
    "rank_image_url",
    "position_id",
    "position_title",
    "real_name",
    "username",
    "updated_at",
  ];
  const COLS_PER_ROW = cols.length;
  const CHUNK_SIZE = Math.floor(65000 / COLS_PER_ROW);

  const ids = Object.keys(currProfiles);
  for (let offset = 0; offset < ids.length; offset += CHUNK_SIZE) {
    const chunk = ids.slice(offset, offset + CHUNK_SIZE);
    const placeholders = [];
    const values = [];
    let idx = 1;

    for (const id of chunk) {
      const p = currProfiles[id];
      placeholders.push(
        `($${idx},$${idx + 1},$${idx + 2},$${idx + 3},$${idx + 4},$${idx + 5},$${idx + 6},$${idx + 7},$${idx + 8},$${idx + 9},NOW())`,
      );
      values.push(
        rosterType,
        id,
        p.rank?.rankId ?? null,
        p.rank?.rankShort ?? "",
        p.rank?.rankFull ?? "",
        p.rank?.rankImageUrl ?? "",
        p.primary?.positionId ?? null,
        p.primary?.positionTitle ?? "",
        p.realName ?? "",
        p.user?.username ?? "",
      );
      idx += COLS_PER_ROW - 1; // updated_at uses NOW(), not a placeholder
    }

    await client.query(
      `INSERT INTO roster_profile_state (${cols.join(",")})
       VALUES ${placeholders.join(",")}
       ON CONFLICT (roster_type, profile_id) DO UPDATE SET
         rank_id        = EXCLUDED.rank_id,
         rank_short     = EXCLUDED.rank_short,
         rank_full      = EXCLUDED.rank_full,
         rank_image_url = EXCLUDED.rank_image_url,
         position_id    = EXCLUDED.position_id,
         position_title = EXCLUDED.position_title,
         real_name      = EXCLUDED.real_name,
         username       = EXCLUDED.username,
         updated_at     = NOW()`,
      values,
    );
  }
}

// Reconcile a child set table (records or awards) against current state.
// Inserts uids that are new for each profile; deletes uids that vanished.
async function reconcileChildSet(
  client,
  rosterType,
  currProfiles,
  tableName,
  uidColumn,
  arrayKey,
  uidKey,
) {
  const profileIds = Object.keys(currProfiles);
  if (!profileIds.length) return;

  // Fetch existing uids for all profiles in one query.
  const existingRes = await client.query(
    `SELECT profile_id, ${uidColumn}
     FROM ${tableName}
     WHERE roster_type = $1 AND profile_id = ANY($2::text[])`,
    [rosterType, profileIds],
  );

  const existingByProfile = {};
  for (const row of existingRes.rows) {
    (existingByProfile[row.profile_id] ??= new Set()).add(row[uidColumn]);
  }

  const toInsert = []; // [profile_id, uid]
  const toDelete = []; // [profile_id, uid]

  for (const id of profileIds) {
    const currentUids = new Set(
      (currProfiles[id][arrayKey] ?? []).map((x) => x[uidKey]).filter(Boolean),
    );
    const existingUids = existingByProfile[id] ?? new Set();

    for (const uid of currentUids) {
      if (!existingUids.has(uid)) toInsert.push([id, uid]);
    }
    for (const uid of existingUids) {
      if (!currentUids.has(uid)) toDelete.push([id, uid]);
    }
  }

  if (toInsert.length) {
    const COLS_PER_ROW = 3;
    const CHUNK_SIZE = Math.floor(65000 / COLS_PER_ROW);
    for (let offset = 0; offset < toInsert.length; offset += CHUNK_SIZE) {
      const chunk = toInsert.slice(offset, offset + CHUNK_SIZE);
      const placeholders = [];
      const values = [];
      let idx = 1;
      for (const [pid, uid] of chunk) {
        placeholders.push(`($${idx},$${idx + 1},$${idx + 2})`);
        values.push(rosterType, pid, uid);
        idx += COLS_PER_ROW;
      }
      await client.query(
        `INSERT INTO ${tableName} (roster_type, profile_id, ${uidColumn})
         VALUES ${placeholders.join(",")}
         ON CONFLICT DO NOTHING`,
        values,
      );
    }
  }

  if (toDelete.length) {
    // Group deletes by profile_id so the WHERE uses one ANY() per profile.
    const byProfile = {};
    for (const [pid, uid] of toDelete) (byProfile[pid] ??= []).push(uid);
    for (const [pid, uids] of Object.entries(byProfile)) {
      await client.query(
        `DELETE FROM ${tableName}
         WHERE roster_type = $1 AND profile_id = $2 AND ${uidColumn} = ANY($3::text[])`,
        [rosterType, pid, uids],
      );
    }
  }
}

module.exports = { loadProfileState, applyProfileStateUpdate };
