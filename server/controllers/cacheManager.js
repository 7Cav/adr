const axios = require("axios");
const axiosRetry = require("axios-retry").default || require("axios-retry");
const { API_TOKEN } = require("../credentials/token");

let cacheStatus = {
  combat: false,
  reserve: false,
  individual: false,
};

let cachedCombatRoster;
let cachedReserveRoster;
let cachedIndividual;
let cacheTime = {};

axiosRetry(axios, {
  retries: 5,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    return axiosRetry.isNetworkOrIdempotentRequestError(error);
  },
});

const updateCombatRosterCache = async () => {
  try {
    const response = await axios("https://api.7cav.us/api/v1/roster/1", {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + API_TOKEN,
        "Accept-Encoding": "gzip",
      },
    });
    cachedCombatRoster = response.data;
    cacheTime["combat"] = Date.now();
    cacheStatus.combat = true;
  } catch (error) {
    console.error("Failed to update combat cache:", error);
    cacheStatus.combat = false;
  }
};

const updateReserveRosterCache = async () => {
  try {
    const response = await axios("https://api.7cav.us/api/v1/roster/2", {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + API_TOKEN,
        "Accept-Encoding": "gzip",
      },
    });
    cachedReserveRoster = response.data;
    cacheTime["reserve"] = Date.now();
    cacheStatus.reserve = true;
  } catch (error) {
    console.error("Failed to update reserve cache:", error);
    cacheStatus.reserve = false;
  }
};

const updateCachedIndividual = async () => {
  try {
    let userName = "Stetchkov.A";
    const response = await axios(
      `https://api.7cav.us/api/v1/milpacs/profile/username/${userName}`,
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: "Bearer " + API_TOKEN,
        },
      }
    );
    cachedIndividual = response.data;
    cacheTime["individual"] = Date.now();
    cacheStatus.individual = true;
  } catch (error) {
    console.error("Failed to update individual user cache:", error);
    cacheStatus.individual = false;
  }
};

const scheduleCacheUpdate = (updateFunction) => {
  const now = new Date();
  const delay =
    (60 - now.getMinutes()) * 60 * 1000 + (60 - now.getSeconds()) * 1000;

  setTimeout(() => {
    updateFunction();
    setInterval(updateFunction, 3660 * 1000); // Update every 3660 seconds (1 hour and 1 minute)
  }, delay);
};

const initializeCache = async () => {
  try {
    // Initial cache update
    await updateCombatRosterCache();
    await updateReserveRosterCache();
    await updateCachedIndividual();

    // Check if cache is valid
    if (!cacheStatus["combat"] || !cacheStatus["reserve"]) {
      console.error("Failed to initialize cache. Exiting...");
      process.exit(1); // Exit to trigger Docker restart
    }

    // Schedule the updates
    scheduleCacheUpdate(updateCachedIndividual);
    scheduleCacheUpdate(updateCombatRosterCache);
    scheduleCacheUpdate(updateReserveRosterCache);
  } catch (error) {
    console.error("Critical error during cache initialization:", error);
    process.exit(1); // Exit to trigger Docker restart
  }
};

const getCachedCombatRoster = () => {
  return cachedCombatRoster;
};

const getCachedReserveRoster = () => {
  return cachedReserveRoster;
};

const getCachedIndividual = () => {
  return cachedIndividual;
};

module.exports = {
  getCachedCombatRoster,
  getCachedReserveRoster,
  getCachedIndividual,
  cacheTime,
  initializeCache,
};
