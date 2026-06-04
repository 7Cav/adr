function computeDiff(prevProfiles, currProfiles) {
  const events = [];

  for (const [id, cp] of Object.entries(currProfiles)) {
    const name = displayName(cp);
    const pp = prevProfiles[id];

    const currPos = cp.primary?.positionTitle || "";

    if (!pp) {
      events.push({
        event_type: "NEW_MEMBER",
        profile_id: id,
        profile_name: name,
        rank_short: cp.rank?.rankShort || "",
        rank_image_url: cp.rank?.rankImageUrl || "",
        position_title: currPos,
        detail: `Joined as ${cp.rank?.rankFull || ""}`,
      });
      continue;
    }

    if (cp.rank?.rankId !== pp.rank?.rankId) {
      events.push({
        event_type: "PROMOTION",
        profile_id: id,
        profile_name: name,
        rank_short: cp.rank?.rankShort || "",
        rank_image_url: cp.rank?.rankImageUrl || "",
        position_title: currPos,
        old_value: pp.rank?.rankShort || "",
        new_value: cp.rank?.rankShort || "",
        detail: `Promoted from ${pp.rank?.rankFull || ""} to ${cp.rank?.rankFull || ""}`,
      });
    }

    if (cp.primary?.positionId !== pp.primary?.positionId) {
      events.push({
        event_type: "POSITION_CHANGE",
        profile_id: id,
        profile_name: name,
        rank_short: cp.rank?.rankShort || "",
        rank_image_url: cp.rank?.rankImageUrl || "",
        position_title: currPos,
        old_value: pp.primary?.positionTitle || "",
        new_value: cp.primary?.positionTitle || "",
        detail: `Reassigned from ${pp.primary?.positionTitle || ""} to ${cp.primary?.positionTitle || ""}`,
      });
    }

    if (cp.realName !== pp.realName) {
      events.push({
        event_type: "NAME_CHANGE",
        profile_id: id,
        profile_name: name,
        rank_short: cp.rank?.rankShort || "",
        rank_image_url: cp.rank?.rankImageUrl || "",
        position_title: currPos,
        old_value: pp.realName || "",
        new_value: cp.realName || "",
      });
    }

    const hadPromotion = cp.rank?.rankId !== pp.rank?.rankId;
    const prevRecords = recordSet(pp.records || []);
    for (const r of cp.records || []) {
      if (!prevRecords.has(r.recordUid)) {
        // Skip promotion service records when a rank change was already detected —
        // the PROMOTION event covers it and showing both is duplicate noise.
        if (hadPromotion && r.recordType === "Promotion") continue;
        events.push({
          event_type: "NEW_RECORD",
          profile_id: id,
          profile_name: name,
          rank_short: cp.rank?.rankShort || "",
          rank_image_url: cp.rank?.rankImageUrl || "",
          position_title: currPos,
          new_value: r.recordType || "",
          record_date: r.recordDate || "",
          detail: r.recordDetails || "",
        });
      }
    }

    const prevAwards = awardSet(pp.awards || []);
    for (const a of cp.awards || []) {
      if (!prevAwards.has(a.awardUid)) {
        events.push({
          event_type: "NEW_AWARD",
          profile_id: id,
          profile_name: name,
          rank_short: cp.rank?.rankShort || "",
          rank_image_url: cp.rank?.rankImageUrl || "",
          position_title: currPos,
          new_value: a.awardName || "",
          record_date: a.awardDate || "",
          detail: a.awardDetails || "",
        });
      }
    }
  }

  for (const [id, pp] of Object.entries(prevProfiles)) {
    if (!currProfiles[id]) {
      const name = displayName(pp);
      events.push({
        event_type: "DISCHARGE",
        profile_id: id,
        profile_name: name,
        rank_short: pp.rank?.rankShort || "",
        rank_image_url: pp.rank?.rankImageUrl || "",
        position_title: pp.primary?.positionTitle || "",
        detail: `${pp.rank?.rankFull || ""} removed from roster`,
      });
    }
  }

  return events;
}

function displayName(p) {
  const rankShort = p.rank?.rankShort || "";
  const name = p.realName || p.user?.username || "";
  return `${rankShort} ${name}`.trim();
}

function recordSet(records) {
  return new Set(records.map((r) => r.recordUid).filter(Boolean));
}

function awardSet(awards) {
  return new Set(awards.map((a) => a.awardUid).filter(Boolean));
}

// Roster type → human label (mirrors ROSTER_TYPE_LABELS on the frontend)
const ROSTER_LABELS = {
  ROSTER_TYPE_COMBAT: "Combat",
  ROSTER_TYPE_RESERVE: "Reserve",
  ROSTER_TYPE_ELOA: "ELOA",
  ROSTER_TYPE_WALL_OF_HONOR: "Wall of Honor",
  ROSTER_TYPE_ARLINGTON: "Arlington",
  ROSTER_TYPE_PAST_MEMBERS: "Past Members",
};

// Maps destination roster → the event type emitted for that cross-roster move.
// DISCHARGE reuses the existing type since the semantic is identical.
const DESTINATION_EVENT_TYPE = {
  ROSTER_TYPE_PAST_MEMBERS: "DISCHARGE",
  ROSTER_TYPE_COMBAT: "RETURN_TO_ACTIVE",
  ROSTER_TYPE_RESERVE: "TRANSFER_RESERVE",
  ROSTER_TYPE_ELOA: "TRANSFER_ELOA",
  ROSTER_TYPE_ARLINGTON: "FALLEN",
  ROSTER_TYPE_WALL_OF_HONOR: "WALL_OF_HONOR_INDUCTION",
};

// After computing per-roster diffs, collapse same-run DISCHARGE + NEW_MEMBER pairs
// for the same profile_id into a single context-aware transfer event.
// Events that are ambiguous (multiple discharges or arrivals for the same person) are left as-is.
function correlateTransfers(allEvents) {
  const discharges = {};
  const arrivals = {};

  for (const e of allEvents) {
    if (e.event_type === "DISCHARGE") (discharges[e.profile_id] ??= []).push(e);
    if (e.event_type === "NEW_MEMBER") (arrivals[e.profile_id] ??= []).push(e);
  }

  const removeSet = new Set();
  const transfers = [];

  for (const profileId of Object.keys(discharges)) {
    const ds = discharges[profileId];
    const as = arrivals[profileId];
    if (!as || ds.length !== 1 || as.length !== 1) continue; // ambiguous — leave as-is

    const d = ds[0];
    const a = as[0];
    const fromLabel = ROSTER_LABELS[d.roster_type] ?? d.roster_type;
    const toLabel = ROSTER_LABELS[a.roster_type] ?? a.roster_type;
    const eventType =
      DESTINATION_EVENT_TYPE[a.roster_type] ?? "ROSTER_TRANSFER";

    removeSet.add(d);
    removeSet.add(a);

    transfers.push({
      event_type: eventType,
      profile_id: profileId,
      profile_name: d.profile_name,
      rank_short: d.rank_short,
      rank_image_url: d.rank_image_url,
      position_title: d.position_title || "",
      old_value: fromLabel,
      new_value: toLabel,
      detail: `Transferred from ${fromLabel} to ${toLabel}`,
      roster_type: d.roster_type, // source roster — caller groups by this for persistence
    });
  }

  const result = allEvents.filter((e) => !removeSet.has(e));
  // Unpaired discharges are true deletions (duplicate removal etc.), not roster moves
  for (const e of result) {
    if (e.event_type === "DISCHARGE") e.event_type = "REMOVED";
  }
  result.push(...transfers);
  return result;
}

module.exports = { computeDiff, correlateTransfers };
