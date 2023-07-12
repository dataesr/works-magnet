const getOpenAlexData = (options) => {
  return Promise.resolve();
  let url = 'https://api.openalex.org/works?mailto=bso@recherche.gouv.fr&per_page=200';
  url += '&filter=is_paratext:false';
  // publication_year:${startyear}-${endyear},
  url += `,title.search:${queries.split(',').join('|')},abstract.search:${queries.split(',').join('|')}`;
  url += countries.length > 0 ? `,institutions.country_code:${countries.split(',').join('|')}` : '';
  return fetch(`${url}&cursor=${cursor}`)
    .then((response) => response.json())
    .then(({ meta, results }) => {
      const response = [...previousResponse, ...results];
      if (results.length !== 0) {
        return getData({ countries, endyear, queries, startyear, cursor: meta.next_cursor, previousResponse: response });
      }
      return response;
    });
};

export default getOpenAlexData;
