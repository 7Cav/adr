const CLIENT_TOKEN = process.env.REACT_APP_CLIENT_TOKEN;
const reserveApiUrl = process.env.REACT_APP_RESERVE_API_URL;

async function GetReserveRoster() {
  const response = await fetch(reserveApiUrl, {
    headers: {
      Authorization: CLIENT_TOKEN,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("HTTP Error! status: " + response.status);
  }

  const data = await response.json();

  return data;
}

export default await GetReserveRoster();
