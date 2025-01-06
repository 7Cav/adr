const CLIENT_TOKEN = process.env.CLIENT_TOKEN;
const baseIndividualApiUrl = process.env.INDIVIDUAL_API_URL;

export default async function GetIndividual(userName) {
  const fullIndividualApiUrl = baseIndividualApiUrl + userName;

  const response = await fetch(fullIndividualApiUrl, {
    headers: {
      Authorization: CLIENT_TOKEN,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("HTTP Error! status: " + response.status);
  }

  try {
    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error(`Invalid JSON response: ${error.message}`);
  }

  return data;
}

//export default await GetIndividual();
