const CLIENT_TOKEN = process.env.REACT_APP_CLIENT_TOKEN;
const combatApiUrl = process.env.REACT_APP_COMBAT_API_URL;
const cacheTimestampUrl = process.env.REACT_APP_CACHE_TIMESTAMP_URL;
const millisecondsToMinutes = (milliseconds) => {
  return Math.round(milliseconds / (1000 * 60));
};

async function GetCombatRoster() {
  "use server";
  const response = await fetch(combatApiUrl, {
    headers: {
      Authorization: CLIENT_TOKEN,
    },
  });

  if (!response.ok) {
    throw new Error("HTTP Error! status: " + response.status);
  }

  const data = await response.json();

  return data;
}

export default await GetCombatRoster();
