const CLIENT_TOKEN = process.env.REACT_APP_CLIENT_TOKEN;
const cacheTimestampUrl = process.env.REACT_APP_CACHE_TIMESTAMP_URL;
const millisecondsToMinutes = (milliseconds) => {
  return Math.round(milliseconds / (1000 * 60));
};

async function GetApiTimestamp() {
  const response = await fetch(cacheTimestampUrl, {
    headers: {
      Authorization: CLIENT_TOKEN,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("HTTP Error on Data Cache");
  }

  const data = await response.json();
  let returnObject = [];

  returnObject.push({
    combat: millisecondsToMinutes(Date.now() - data.cacheTime.combat),
    reserve: millisecondsToMinutes(Date.now() - data.cacheTime.reserve),
  });

  return returnObject;
}

export default await GetApiTimestamp();
