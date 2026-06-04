const CLIENT_TOKEN = process.env.NEXT_PUBLIC_CLIENT_TOKEN;
const BASE_URL = process.env.NEXT_PUBLIC_USERCACHE_API_URL;

export default async function searchForUser(query) {
  const url = new URL(BASE_URL);

  url.searchParams.append("q", query);
  const fullIndividualApiUrl = url.toString();

  const response = await fetch(fullIndividualApiUrl, {
    headers: {
      Authorization: CLIENT_TOKEN,
    },
    cache: "no-store",
  });

  if (response.status != 200) {
    throw new Error(`User search failed: ${response.status}`);
  }

  try {
    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error(`Invalid JSON response: ${error.message}`);
  }
}
