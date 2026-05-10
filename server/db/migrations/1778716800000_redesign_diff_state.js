/**
 * Replace the per-tick blob `snapshots` table with a normalized "current state"
 * model:
 *   - snapshot_runs        : metadata-only run log (no JSONB).
 *   - diff_events          : same shape as before but FK retargeted at runs.
 *   - roster_profile_state : one row per (roster_type, profile_id), upserted
 *                            in place. Replaces what `raw_json` used to cache.
 *   - roster_profile_records / roster_profile_awards : set membership for
 *                            NEW_RECORD / NEW_AWARD detection.
 *
 * Old data is intentionally wiped — diff history was experimental and the prev
 * baseline regenerates on the first post-deploy tick.
 */

exports.up = (pgm) => {
  pgm.sql(`DROP TABLE IF EXISTS diff_events CASCADE`);
  pgm.sql(`DROP TABLE IF EXISTS snapshots CASCADE`);

  pgm.sql(`
    CREATE TABLE snapshot_runs (
      id            serial PRIMARY KEY,
      fetched_at    timestamptz NOT NULL DEFAULT NOW(),
      roster_type   text        NOT NULL,
      profile_count int         NOT NULL,
      status        text        NOT NULL,
      reason        text        NOT NULL DEFAULT ''
    )
  `);
  pgm.sql(
    `CREATE INDEX idx_snapshot_runs_fetched     ON snapshot_runs(fetched_at DESC)`,
  );
  pgm.sql(
    `CREATE INDEX idx_snapshot_runs_roster_type ON snapshot_runs(roster_type, fetched_at DESC)`,
  );

  pgm.sql(`
    CREATE TABLE diff_events (
      id              serial PRIMARY KEY,
      snapshot_run_id int  NOT NULL REFERENCES snapshot_runs(id) ON DELETE CASCADE,
      event_type      text NOT NULL,
      profile_id      text NOT NULL,
      profile_name    text NOT NULL,
      rank_short      text NOT NULL DEFAULT '',
      rank_image_url  text NOT NULL DEFAULT '',
      position_title  text NOT NULL DEFAULT '',
      old_value       text NOT NULL DEFAULT '',
      new_value       text NOT NULL DEFAULT '',
      record_date     date,
      detail          text NOT NULL DEFAULT '',
      created_at      timestamptz NOT NULL DEFAULT NOW()
    )
  `);
  pgm.sql(
    `CREATE INDEX idx_diff_events_run     ON diff_events(snapshot_run_id)`,
  );
  pgm.sql(`CREATE INDEX idx_diff_events_type    ON diff_events(event_type)`);
  pgm.sql(
    `CREATE INDEX idx_diff_events_created ON diff_events(created_at DESC)`,
  );

  pgm.sql(`
    CREATE TABLE roster_profile_state (
      roster_type    text NOT NULL,
      profile_id     text NOT NULL,
      rank_id        int,
      rank_short     text NOT NULL DEFAULT '',
      rank_full      text NOT NULL DEFAULT '',
      rank_image_url text NOT NULL DEFAULT '',
      position_id    int,
      position_title text NOT NULL DEFAULT '',
      real_name      text NOT NULL DEFAULT '',
      username       text NOT NULL DEFAULT '',
      updated_at     timestamptz NOT NULL DEFAULT NOW(),
      PRIMARY KEY (roster_type, profile_id)
    )
  `);

  pgm.sql(`
    CREATE TABLE roster_profile_records (
      roster_type text NOT NULL,
      profile_id  text NOT NULL,
      record_uid  text NOT NULL,
      PRIMARY KEY (roster_type, profile_id, record_uid)
    )
  `);

  pgm.sql(`
    CREATE TABLE roster_profile_awards (
      roster_type text NOT NULL,
      profile_id  text NOT NULL,
      award_uid   text NOT NULL,
      PRIMARY KEY (roster_type, profile_id, award_uid)
    )
  `);
};

exports.down = (pgm) => {
  pgm.sql(`DROP TABLE IF EXISTS roster_profile_awards`);
  pgm.sql(`DROP TABLE IF EXISTS roster_profile_records`);
  pgm.sql(`DROP TABLE IF EXISTS roster_profile_state`);
  pgm.sql(`DROP TABLE IF EXISTS diff_events CASCADE`);
  pgm.sql(`DROP TABLE IF EXISTS snapshot_runs CASCADE`);

  pgm.sql(`
    CREATE TABLE snapshots (
      id            serial PRIMARY KEY,
      fetched_at    timestamptz NOT NULL DEFAULT NOW(),
      profile_count int         NOT NULL,
      raw_json      jsonb,
      roster_type   text NOT NULL DEFAULT 'ROSTER_TYPE_COMBAT'
    )
  `);
  pgm.sql(
    `CREATE INDEX idx_snapshots_fetched     ON snapshots(fetched_at DESC)`,
  );
  pgm.sql(
    `CREATE INDEX idx_snapshots_roster_type ON snapshots(roster_type)`,
  );

  pgm.sql(`
    CREATE TABLE diff_events (
      id             serial PRIMARY KEY,
      snapshot_id    int NOT NULL REFERENCES snapshots(id) ON DELETE CASCADE,
      event_type     text NOT NULL,
      profile_id     text NOT NULL,
      profile_name   text NOT NULL,
      rank_short     text NOT NULL DEFAULT '',
      rank_image_url text NOT NULL DEFAULT '',
      old_value      text NOT NULL DEFAULT '',
      new_value      text NOT NULL DEFAULT '',
      record_date    date,
      detail         text NOT NULL DEFAULT '',
      position_title text NOT NULL DEFAULT '',
      created_at     timestamptz NOT NULL DEFAULT NOW()
    )
  `);
  pgm.sql(
    `CREATE INDEX idx_diff_events_snapshot ON diff_events(snapshot_id)`,
  );
  pgm.sql(`CREATE INDEX idx_diff_events_type     ON diff_events(event_type)`);
  pgm.sql(
    `CREATE INDEX idx_diff_events_created  ON diff_events(created_at DESC)`,
  );
};
