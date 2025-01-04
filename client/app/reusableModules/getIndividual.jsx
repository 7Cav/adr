const CLIENT_TOKEN = process.env.CLIENT_TOKEN;
const individualApiUrl = process.env.INDIVIDUAL_API_URL;

async function GetIndividual() {
  const response = await fetch(individualApiUrl, {
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

export default await GetIndividual();
