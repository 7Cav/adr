import { EVENT_SORT_ORDER } from "./constants";

export function groupAndSortEvents(events, rankOrder) {
  const rankVal = (rankShort) => rankOrder?.get(rankShort) ?? 9999;

  const notable = events
    .filter((e) => e.event_type !== "NEW_RECORD")
    .sort((a, b) => {
      const orderDiff =
        (EVENT_SORT_ORDER[a.event_type] ?? 99) -
        (EVENT_SORT_ORDER[b.event_type] ?? 99);
      if (orderDiff !== 0) return orderDiff;
      const rankDiff = rankVal(a.rank_short) - rankVal(b.rank_short);
      if (rankDiff !== 0) return rankDiff;
      return a.profile_name.localeCompare(b.profile_name);
    });

  const byPerson = new Map();
  for (const e of events.filter((e) => e.event_type === "NEW_RECORD")) {
    if (!byPerson.has(e.profile_id)) {
      byPerson.set(e.profile_id, {
        profileId: e.profile_id,
        profileName: e.profile_name,
        records: [],
      });
    }
    byPerson.get(e.profile_id).records.push(e);
  }

  const recordGroups = Array.from(byPerson.values()).sort((a, b) => {
    const rankDiff =
      rankVal(a.records[0]?.rank_short ?? "") -
      rankVal(b.records[0]?.rank_short ?? "");
    if (rankDiff !== 0) return rankDiff;
    return a.profileName.localeCompare(b.profileName);
  });

  return { notable, recordGroups };
}
