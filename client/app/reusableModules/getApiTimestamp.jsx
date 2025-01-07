const CLIENT_TOKEN = process.env.NEXT_PUBLIC_CLIENT_TOKEN;
const CACHE_TIMESTAMP_URL = process.env.CACHE_TIMESTAMP_URL;

const millisecondsToMinutes = (milliseconds) =>
  Math.round(milliseconds / (1000 * 60));

export default async function GetApiTimestamp() {
  const response = await fetch(CACHE_TIMESTAMP_URL, {
    headers: {
      Authorization: CLIENT_TOKEN,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("HTTP Error on Data Cache");
  }

  const data = await response.json();

  return [
    {
      combat: millisecondsToMinutes(Date.now() - data.cacheTime.combat),
      reserve: millisecondsToMinutes(Date.now() - data.cacheTime.reserve),
    },
  ];
}
