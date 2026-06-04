const cron = require("node-cron");
const db = require("../db/database");
const { fetchRosterProfiles, fetchUsernames } = require("../db/milpacDb");
const {
  loadProfileState,
  applyProfileStateUpdate,
} = require("../db/profileState");
const { computeDiff, correlateTransfers } = require("./diffEngine");

// Sanity gates — applied per roster before any state mutates.
// Reject the tick if MariaDB looks like it returned bad/partial data.
const MIN_PROFILES_FOR_GATE = 5; // floor — small rosters shouldn't trip the ratio gate
const MAX_PROFILE_DROP_RATIO = 0.5; // 50% drop with absolute floor → reject

const ROSTER_TYPES = [
  "ROSTER_TYPE_COMBAT",
  "ROSTER_TYPE_RESERVE",
  "ROSTER_TYPE_ELOA",
  "ROSTER_TYPE_WALL_OF_HONOR",
  "ROSTER_TYPE_ARLINGTON",
  "ROSTER_TYPE_PAST_MEMBERS",
];

const ROSTER_ID_MAP = {
  ROSTER_TYPE_COMBAT: 1,
  ROSTER_TYPE_RESERVE: 2,
  ROSTER_TYPE_ELOA: 3,
  ROSTER_TYPE_WALL_OF_HONOR: 4,
  ROSTER_TYPE_ARLINGTON: 5,
  ROSTER_TYPE_PAST_MEMBERS: 6,
};

async function runSnapshot() {
  console.log("diffPoller: starting snapshot run for all roster types");

  // Phase 1 — fetch + load prev state per roster (read-only, no transaction).
  const fetched = []; // { rosterType, curr, prev }
  const rejected = []; // { rosterType, profileCount, reason }

  for (const rosterType of ROSTER_TYPES) {
    try {
      const curr = await fetchRosterProfiles(ROSTER_ID_MAP[rosterType]);
      const prev = await loadProfileState(rosterType);
      fetched.push({ rosterType, curr, prev });
    } catch (err) {
      console.error(
        `diffPoller [${rosterType}]: fetch error:`,
        err.message || err,
      );
      rejected.push({
        rosterType,
        profileCount: 0,
        reason: `fetch error: ${err.message || err}`,
      });
    }
  }

  // Phase 2 — sanity gate. Anything that fails is rejected without mutating state.
  const active = [];
  for (const entry of fetched) {
    const currCount = Object.keys(entry.curr).length;
    const prevCount = Object.keys(entry.prev).length;

    if (prevCount > 0) {
      if (currCount === 0) {
        console.warn(
          `diffPoller [${entry.rosterType}]: REJECT — empty fetch (had ${prevCount} profiles)`,
        );
        rejected.push({
          rosterType: entry.rosterType,
          profileCount: 0,
          reason: `empty fetch (had ${prevCount} profiles)`,
        });
        continue;
      }
      const drop = (prevCount - currCount) / prevCount;
      if (
        drop > MAX_PROFILE_DROP_RATIO &&
        prevCount - currCount >= MIN_PROFILES_FOR_GATE
      ) {
        console.warn(
          `diffPoller [${entry.rosterType}]: REJECT — profile_count dropped ${prevCount} → ${currCount}`,
        );
        rejected.push({
          rosterType: entry.rosterType,
          profileCount: currCount,
          reason: `profile_count dropped ${prevCount} → ${currCount}`,
        });
        continue;
      }
    }

    active.push(entry);
  }

  // Phase 3 — compute diffs and cross-roster correlate (still read-only).
  const allEvents = [];
  for (const entry of active) {
    entry.bootstrap = Object.keys(entry.prev).length === 0;
    if (entry.bootstrap) {
      entry.events = [];
      continue;
    }
    const events = computeDiff(entry.prev, entry.curr);
    for (const e of events) e.roster_type = entry.rosterType;
    entry.events = events;
    allEvents.push(...events);
  }

  if (allEvents.length) {
    const correlated = correlateTransfers(allEvents);
    const byRoster = {};
    for (const e of correlated) (byRoster[e.roster_type] ??= []).push(e);
    for (const entry of active) {
      if (!entry.bootstrap) {
        entry.events = byRoster[entry.rosterType] ?? [];
      }
    }
  }

  // Phase 4 — single transaction: insert run rows, events, and apply state.
  // Atomic across all rosters so cross-roster transfer events stay consistent
  // with the state they imply (e.g. a TRANSFER_RESERVE event always matches
  // the move of that profile out of the source roster's state table).
  await db.withTransaction(async (client) => {
    for (const r of rejected) {
      await db.insertSnapshotRun(client, {
        rosterType: r.rosterType,
        profileCount: r.profileCount,
        status: "rejected",
        reason: r.reason,
      });
    }

    for (const entry of active) {
      const profileCount = Object.keys(entry.curr).length;
      const runId = await db.insertSnapshotRun(client, {
        rosterType: entry.rosterType,
        profileCount,
        status: entry.bootstrap ? "bootstrap" : "ok",
        reason: "",
      });

      if (entry.events.length) {
        await db.bulkInsertEvents(client, runId, entry.events);
      }

      const removedIds = entry.bootstrap
        ? []
        : Object.keys(entry.prev).filter((id) => !entry.curr[id]);

      await applyProfileStateUpdate(
        client,
        entry.rosterType,
        entry.curr,
        removedIds,
      );
    }
  });

  // Logging summary
  const TRANSFER_TYPES = new Set([
    "ROSTER_TRANSFER",
    "DISCHARGE",
    "RETURN_TO_ACTIVE",
    "TRANSFER_RESERVE",
    "TRANSFER_ELOA",
    "FALLEN",
    "WALL_OF_HONOR_INDUCTION",
  ]);
  const totalEvents = active.reduce((n, e) => n + e.events.length, 0);
  const transfers = active
    .flatMap((e) => e.events)
    .filter((e) => TRANSFER_TYPES.has(e.event_type) && e.old_value).length;
  console.log(
    `diffPoller: ${active.length} rosters processed (${
      active.filter((e) => e.bootstrap).length
    } bootstrap), ${rejected.length} rejected, ${totalEvents} events (${transfers} transfers)`,
  );
}

async function makeUserCache() {
  const currentUsers = await fetchUsernames();
  await db.writeUserTable(currentUsers);
  console.log("searchPoller: run complete");
}

function startPoller(schedule) {
  if (!cron.validate(schedule)) {
    console.error(
      `diffPoller: invalid cron schedule "${schedule}", falling back to "*/15 * * * *"`,
    );
    schedule = "*/15 * * * *";
  }
  cron.schedule(schedule, () =>
    runSnapshot().catch((err) =>
      console.error("diffPoller: scheduled run failed:", err.message || err),
    ),
  );
  console.log(`diffPoller: started with schedule "${schedule}"`);
  runSnapshot().catch((err) =>
    console.error("diffPoller: initial run failed:", err.message || err),
  );

  cron.schedule(schedule, () =>
    makeUserCache().catch((err) =>
      console.error("searchPoller: scheduled run failed:", err.message || err),
    ),
  );
  console.log(`searchPoller: started with schedule "${schedule}"`);
  makeUserCache().catch((err) =>
    console.error("searchPoller: initial run failed:", err.message || err),
  );
}

module.exports = { startPoller, runSnapshot };
