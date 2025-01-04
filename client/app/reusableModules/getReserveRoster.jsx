const CLIENT_TOKEN = process.env.CLIENT_TOKEN;
const RESERVE_API_URL = process.env.RESERVE_API_URL;

export default async function GetReserveRoster() {
  const response = await fetch(RESERVE_API_URL, {
    headers: {
      Authorization: CLIENT_TOKEN,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("HTTP Error! status: " + response.status);
  }

  return await response.json();
}
