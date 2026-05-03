const cron = require("node-cron");
const db = require("../db/database");
const { fetchRosterProfiles, fetchUsernames } = require("../db/milpacDb");
const { computeDiff, correlateTransfers } = require("./diffEngine");

const RETAIN_DAYS = parseInt(process.env.DIFF_SNAPSHOT_RETAIN_DAYS || "95", 10);

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

  // Collect { snapshotId, events } from each roster so we can correlate transfers
  // before inserting — _snapshotId is a temporary tag removed before insert.
  const pendingInserts = []; // [{ snapshotId, events[] }]
  const allEvents = []; // flat list across all rosters (carries _snapshotId tag)

  for (const rosterType of ROSTER_TYPES) {
    try {
      console.log(`diffPoller [${rosterType}]: fetching from DB`);
      const currProfiles = await fetchRosterProfiles(ROSTER_ID_MAP[rosterType]);
      const profileCount = Object.keys(currProfiles).length;

      const prev = await db.latestSnapshot(rosterType);
      const snapshotId = await db.insertSnapshot(
        profileCount,
        { profiles: currProfiles },
        rosterType,
      );

      if (prev) {
        const events = computeDiff(prev.profiles, currProfiles);
        // Tag each event with its snapshot and roster so correlateTransfers can use them
        for (const e of events) {
          e.roster_type = rosterType;
          e._snapshotId = snapshotId;
        }
        pendingInserts.push({ snapshotId, events });
        allEvents.push(...events);
        console.log(
          `diffPoller [${rosterType}]: snapshot ${snapshotId} stored, ${events.length} raw events`,
        );
      } else {
        console.log(
          `diffPoller [${rosterType}]: snapshot ${snapshotId} stored (first snapshot, no diff computed)`,
        );
      }
    } catch (err) {
      console.error(`diffPoller [${rosterType}] error:`, err.message || err);
    }
  }

  // Correlate transfers across all rosters, then insert
  if (allEvents.length) {
    const correlated = correlateTransfers(allEvents);

    // Re-group correlated events back by snapshotId for bulk insert
    const bySnapshot = {};
    for (const e of correlated) {
      const sid = e._snapshotId;
      (bySnapshot[sid] ??= []).push(e);
    }

    for (const { snapshotId } of pendingInserts) {
      const events = bySnapshot[snapshotId] ?? [];
      // Strip internal tag before storing
      const clean = events.map(({ _snapshotId, ...rest }) => rest);
      if (clean.length) await db.bulkInsertEvents(snapshotId, clean);
    }

    const TRANSFER_TYPES = new Set([
      "ROSTER_TRANSFER",
      "DISCHARGE",
      "RETURN_TO_ACTIVE",
      "TRANSFER_RESERVE",
      "TRANSFER_ELOA",
      "FALLEN",
      "WALL_OF_HONOR_INDUCTION",
    ]);
    const totalRaw = allEvents.length;
    const totalCorrelated = correlated.length;
    const transfers = correlated.filter(
      (e) => TRANSFER_TYPES.has(e.event_type) && e.old_value,
    ).length;
    console.log(
      `diffPoller: ${totalRaw} raw events → ${totalCorrelated} after correlation (${transfers} transfers)`,
    );
  }

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - RETAIN_DAYS);
  await db.purgeOldRawJson(cutoff);

  console.log("diffPoller: run complete");
}

async function makeUserCache() {
  //This wont be too complicated considering its usecase.
  const currentUsers = await fetchUsernames();
  db.writeUserTable(currentUsers);
  console.log("searchPoller: run complete");
}

function startPoller(schedule) {
  //CRON functions for Roster History module

  if (!cron.validate(schedule)) {
    console.error(
      `diffPoller: invalid cron schedule "${schedule}", falling back to "*/15 * * * *"`,
    );
    schedule = "*/15 * * * *";
  }
  cron.schedule(schedule, runSnapshot);
  console.log(`diffPoller: started with schedule "${schedule}"`);
  runSnapshot();

  //CRON functions for Uniform Builder search function

  if (!cron.validate(schedule)) {
    console.error(
      `searchPoller: invalid cron schedule "${schedule}", falling back to "*/15 * * * *"`,
    );
    schedule = "*/15 * * * *";
  }
  cron.schedule(schedule, makeUserCache);
  console.log(`searchPoller: started with schedule "${schedule}"`);
  makeUserCache();
}

module.exports = { startPoller, runSnapshot };
