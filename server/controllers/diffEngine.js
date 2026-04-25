function computeDiff(prevProfiles, currProfiles) {
  const events = [];

  for (const [id, cp] of Object.entries(currProfiles)) {
    const name = displayName(cp);
    const pp = prevProfiles[id];

    if (!pp) {
      events.push({
        event_type: 'NEW_MEMBER',
        profile_id: id,
        profile_name: name,
        rank_short: cp.rank?.rankShort || '',
        rank_image_url: cp.rank?.rankImageUrl || '',
        detail: `Joined as ${cp.rank?.rankFull || ''}`,
      });
      continue;
    }

    if (cp.rank?.rankId !== pp.rank?.rankId) {
      events.push({
        event_type: 'PROMOTION',
        profile_id: id,
        profile_name: name,
        rank_short: cp.rank?.rankShort || '',
        rank_image_url: cp.rank?.rankImageUrl || '',
        old_value: pp.rank?.rankShort || '',
        new_value: cp.rank?.rankShort || '',
        detail: `Promoted from ${pp.rank?.rankFull || ''} to ${cp.rank?.rankFull || ''}`,
      });
    }

    if (cp.primary?.positionId !== pp.primary?.positionId) {
      events.push({
        event_type: 'POSITION_CHANGE',
        profile_id: id,
        profile_name: name,
        rank_short: cp.rank?.rankShort || '',
        rank_image_url: cp.rank?.rankImageUrl || '',
        old_value: pp.primary?.positionTitle || '',
        new_value: cp.primary?.positionTitle || '',
        detail: `Reassigned from ${pp.primary?.positionTitle || ''} to ${cp.primary?.positionTitle || ''}`,
      });
    }

    if (cp.realName !== pp.realName) {
      events.push({
        event_type: 'NAME_CHANGE',
        profile_id: id,
        profile_name: name,
        rank_short: cp.rank?.rankShort || '',
        rank_image_url: cp.rank?.rankImageUrl || '',
        old_value: pp.realName || '',
        new_value: cp.realName || '',
      });
    }

    const prevRecords = recordSet(pp.records || []);
    for (const r of (cp.records || [])) {
      if (!prevRecords.has(r.recordUid)) {
        events.push({
          event_type: 'NEW_RECORD',
          profile_id: id,
          profile_name: name,
          rank_short: cp.rank?.rankShort || '',
          rank_image_url: cp.rank?.rankImageUrl || '',
          new_value: r.recordType || '',
          record_date: r.recordDate || '',
          detail: r.recordDetails || '',
        });
      }
    }

    const prevAwards = awardSet(pp.awards || []);
    for (const a of (cp.awards || [])) {
      if (!prevAwards.has(a.awardUid)) {
        events.push({
          event_type: 'NEW_AWARD',
          profile_id: id,
          profile_name: name,
          rank_short: cp.rank?.rankShort || '',
          rank_image_url: cp.rank?.rankImageUrl || '',
          new_value: a.awardName || '',
          record_date: a.awardDate || '',
          detail: a.awardDetails || '',
        });
      }
    }
  }

  for (const [id, pp] of Object.entries(prevProfiles)) {
    if (!currProfiles[id]) {
      const name = displayName(pp);
      events.push({
        event_type: 'DISCHARGE',
        profile_id: id,
        profile_name: name,
        rank_short: pp.rank?.rankShort || '',
        rank_image_url: pp.rank?.rankImageUrl || '',
        detail: `${pp.rank?.rankFull || ''} removed from roster`,
      });
    }
  }

  return events;
}

function displayName(p) {
  const rankShort = p.rank?.rankShort || '';
  const name = p.realName || p.user?.username || '';
  return `${rankShort} ${name}`.trim();
}

function recordSet(records) {
  return new Set(records.map(r => r.recordUid).filter(Boolean));
}

function awardSet(awards) {
  return new Set(awards.map(a => a.awardUid).filter(Boolean));
}

module.exports = { computeDiff };
