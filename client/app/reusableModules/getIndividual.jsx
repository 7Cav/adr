const CLIENT_TOKEN = process.env.NEXT_PUBLIC_CLIENT_TOKEN;
const baseIndividualApiUrl = process.env.NEXT_PUBLIC_INDIVIDUAL_API_URL;

export default async function GetIndividual(userName) {
  const url = new URL(baseIndividualApiUrl);
  url.searchParams.append("username", userName);
  const fullIndividualApiUrl = url.toString();

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
