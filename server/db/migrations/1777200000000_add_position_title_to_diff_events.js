exports.up = (pgm) => {
  pgm.addColumn('diff_events', {
    position_title: { type: 'text', notNull: true, default: '' },
  });
};

exports.down = (pgm) => {
  pgm.dropColumn('diff_events', 'position_title');
};
