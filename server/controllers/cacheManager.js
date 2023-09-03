const axios = require("axios");
const { API_TOKEN } = require("../credentials/token");

let cachedCombatRoster;
let cachedReserveRoster;
let cacheTime = {};

const updateCombatRosterCache = async () => {
    try {
        const response = await axios('https://api.7cav.us/api/v1/roster/1', {
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + API_TOKEN
            },
        });
        cachedCombatRoster = response.data;
        cacheTime['combat'] = Date.now();
    } catch (error) {
        console.error("Failed to update combat cache:", error);
    }
};

const updateReserveRosterCache = async () => {
    try {
        const response = await axios('https://api.7cav.us/api/v1/roster/2', {
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + API_TOKEN
            },
        });
        cachedReserveRoster = response.data;
        cacheTime['reserve'] = Date.now();
    } catch (error) {
        console.error("Failed to update reserve cache:", error);
    }
};

const scheduleCacheUpdate = (updateFunction, key) => {
    const now = new Date();
    const delay = (60 - now.getMinutes()) * 60 * 1000 + (60 - now.getSeconds()) * 1000;

    setTimeout(() => {
        updateFunction();
        setInterval(updateFunction, 3660 * 1000); // Update every 3660 seconds (1 hour and 1 minute)
    }, delay);
};

// Initialize the cache and schedule the updates
updateCombatRosterCache();
scheduleCacheUpdate(updateCombatRosterCache, 'combat');
updateReserveRosterCache();
scheduleCacheUpdate(updateReserveRosterCache, 'reserve');

const getCachedCombatRoster = () => {
    return cachedCombatRoster;
};

const getCachedReserveRoster = () => {
    return cachedReserveRoster;
};

module.exports = {
    getCachedCombatRoster,
    getCachedReserveRoster
};