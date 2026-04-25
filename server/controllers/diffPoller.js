const axios = require('axios');
const cron = require('node-cron');
const db = require('../db/database');
const { computeDiff } = require('./diffEngine');

const API_TOKEN = process.env.API_TOKEN;
const ROSTER_URL = 'https://api.7cav.us/api/v1/roster/1';
const RETAIN_DAYS = parseInt(process.env.DIFF_SNAPSHOT_RETAIN_DAYS || '95', 10);

async function runSnapshot() {
  console.log('diffPoller: fetching roster snapshot');
  try {
    const response = await axios(ROSTER_URL, {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + API_TOKEN,
        'Accept-Encoding': 'gzip',
      },
      timeout: 60000,
    });

    const rawData = response.data;
    const currProfiles = rawData.profiles || {};
    const profileCount = Object.keys(currProfiles).length;

    const prev = await db.latestSnapshot();
    const snapshotId = await db.insertSnapshot(profileCount, rawData);

    if (prev) {
      const events = computeDiff(prev.profiles, currProfiles);
      await db.bulkInsertEvents(snapshotId, events);
      console.log(`diffPoller: snapshot ${snapshotId} stored, ${events.length} events computed`);
    } else {
      console.log(`diffPoller: snapshot ${snapshotId} stored (first snapshot, no diff computed)`);
    }

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - RETAIN_DAYS);
    await db.purgeOldRawJson(cutoff);
  } catch (err) {
    console.error('diffPoller error:', err.message || err);
  }
}

function startPoller(schedule) {
  if (!cron.validate(schedule)) {
    console.error(`diffPoller: invalid cron schedule "${schedule}", falling back to "0 2 * * *"`);
    schedule = '0 2 * * *';
  }
  cron.schedule(schedule, runSnapshot);
  console.log(`diffPoller: started with schedule "${schedule}"`);
  runSnapshot(); // run immediately on startup
}

module.exports = { startPoller, runSnapshot };
