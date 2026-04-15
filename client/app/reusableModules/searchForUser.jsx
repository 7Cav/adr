const baseSearchApiUrl = process.env.SQLCACHE_API_URL;

export default async function searchForUser(query) {
  const url = new URL(baseSearchApiUrl);

  url.searchParams.append("q", query);
  const fullIndividualApiUrl = url.toString();

  const response = await fetch(fullIndividualApiUrl, {
    // TODO: Add basic auth.
    // headers: {
    //   Authorization: CLIENT_TOKEN,
    // },
    cache: "no-store",
  });

  if (response.status != 200) {
    throw Error(e);
  }

  try {
    const data = await response.json();
    console.log(data);
    return data;
  } catch (error) {
    throw new Error(`Invalid JSON response: ${error.message}`);
  }

  return data;
}
