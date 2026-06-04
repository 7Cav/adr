exports.up = (pgm) => {
  pgm.addColumn('snapshots', {
    roster_type: { type: 'text', notNull: true, default: 'ROSTER_TYPE_COMBAT' },
  });
  pgm.sql('CREATE INDEX IF NOT EXISTS idx_snapshots_roster_type ON snapshots(roster_type)');
};

exports.down = (pgm) => {
  pgm.dropColumn('snapshots', 'roster_type');
};
