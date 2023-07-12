const getOpenAlexData = ({ filters, cursor = '*', previousResponse = [] }) => {
  return Promise.resolve();
  let url = 'https://api.openalex.org/works?mailto=bso@recherche.gouv.fr&per_page=200';
  url += '&filter=is_paratext:false';
  if (filters?.startYear && filters?.endYear) {
    url += `,publication_year:${filters.startYear}-${filters?.endYear$}`;
  } else if (filters?.startYear) {
    url += `,publication_year:${filters.startYear}-`;
  } else if (filters?.endYear) {
    url += `,publication_year:-${filters.endYear}`;
  }
  if (filters.affiliations.length > 0) {
    url += `,raw_affiliation_string.search:${filters.affiliations.join('|')}`;
  }
  // if (filters.authors.length > 0) {
  //   url += `,authorships.author.display_name.search:${filters.authors.join('|')}`;
  // }
  return fetch(`${url}&cursor=${cursor}`)
    .then((response) => response.json())
    .then(({ meta, results }) => {
      const response = [...previousResponse, ...results];
      if (results.length !== 0) {
        return getOpenAlexData({ filters, cursor: meta.next_cursor, previousResponse: response });
      }
      return response;
    });
};

export default getOpenAlexData;
