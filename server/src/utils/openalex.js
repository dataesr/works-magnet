const getInstitutionIdFromRor = (ror) => {
  const cleanRor = ror.replace('https://ror.org/', '').replace('ror.org/', '');
  let url = `https://api.openalex.org/institutions?filter=ror:${cleanRor}`;
  // Polite mode https://docs.openalex.org/how-to-use-the-api/rate-limits-and-authentication#the-polite-pool
  if (process?.env?.OPENALEX_KEY) {
    url += `&api_key=${process.env.OPENALEX_KEY}`;
  } else {
    url += '&mailto=bso@recherche.gouv.fr';
  }
  return fetch(url)
    .then((response) => {
      if (response.ok) return response.json();
      console.error(`Error while fetching ${url} :`);
      console.error(`${response.status} | ${response.statusText}`);
      return [];
    }).then((response) => response?.results?.[0]?.id);
};

export {
  getInstitutionIdFromRor,
};
