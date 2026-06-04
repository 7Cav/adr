/**
 * Initial schema — snapshots + diff_events for the roster history feature.
 * Uses IF NOT EXISTS throughout so it's safe to run against an existing DB.
 */

exports.up = (pgm) => {
  pgm.createTable(
    "snapshots",
    {
      id: { type: "serial", primaryKey: true },
      fetched_at: {
        type: "timestamptz",
        notNull: true,
        default: pgm.func("NOW()"),
      },
      profile_count: { type: "int", notNull: true },
      raw_json: { type: "jsonb" },
    },
    { ifNotExists: true },
  );

  pgm.createTable(
    "diff_events",
    {
      id: { type: "serial", primaryKey: true },
      snapshot_id: {
        type: "int",
        notNull: true,
        references: '"snapshots"',
        onDelete: "CASCADE",
      },
      event_type: { type: "text", notNull: true },
      profile_id: { type: "text", notNull: true },
      profile_name: { type: "text", notNull: true },
      rank_short: { type: "text", notNull: true, default: "" },
      rank_image_url: { type: "text", notNull: true, default: "" },
      old_value: { type: "text", notNull: true, default: "" },
      new_value: { type: "text", notNull: true, default: "" },
      record_date: { type: "date" },
      detail: { type: "text", notNull: true, default: "" },
      created_at: {
        type: "timestamptz",
        notNull: true,
        default: pgm.func("NOW()"),
      },
    },
    { ifNotExists: true },
  );

  pgm.sql(
    "CREATE INDEX IF NOT EXISTS idx_diff_events_snapshot ON diff_events(snapshot_id)",
  );
  pgm.sql(
    "CREATE INDEX IF NOT EXISTS idx_diff_events_type     ON diff_events(event_type)",
  );
  pgm.sql(
    "CREATE INDEX IF NOT EXISTS idx_diff_events_created  ON diff_events(created_at DESC)",
  );
  pgm.sql(
    "CREATE INDEX IF NOT EXISTS idx_snapshots_fetched    ON snapshots(fetched_at DESC)",
  );
};

exports.down = (pgm) => {
  pgm.dropTable("diff_events", { cascade: true });
  pgm.dropTable("snapshots", { cascade: true });
};
