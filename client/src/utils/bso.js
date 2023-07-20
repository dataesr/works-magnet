const {
  VITE_BSO_AUTH,
  VITE_BSO_SIZE,
  VITE_BSO_URL,
} = import.meta.env;

const getBsoQuery = ({ filters }) => {
  const query = { size: VITE_BSO_SIZE, query: { bool: {} } };
  query.query.bool.filter = [];
  query.query.bool.should = [];
  query.query.bool.must_not = [];
  filters.affiliations.forEach((affiliation) => {
    query.query.bool.should.push({ match: { 'affiliations.name': { query: `"${affiliation}"`, operator: 'and' } } });
  });
  filters.authors.forEach((author) => {
    query.query.bool.should.push({ match: { 'authors.full_name': { query: `"${author}"`, operator: 'and' } } });
  });
  filters.affiliationsToExclude.forEach((affiliationToExclude) => {
    query.query.bool.must_not.push({ match: { 'affiliations.name': { query: affiliationToExclude, operator: 'and' } } });
  });
  filters.authorsToExclude.forEach((authorToExclude) => {
    query.query.bool.must_not.push({ match: { 'authors.full_name': { query: authorToExclude, operator: 'and' } } });
  });
  if (filters?.startYear && filters?.endYear) {
    query.query.bool.filter.push({ range: { year: { gte: filters.startYear, lte: filters.endYear } } });
  } else if (filters?.startYear) {
    query.query.bool.filter.push({ range: { year: { gte: filters.startYear } } });
  } else if (filters?.endYear) {
    query.query.bool.filter.push({ range: { year: { lte: filters.endYear } } });
  }
  query.highlight = { fields: { 'affiliations.name': {}, 'authors.full_name': {} } };
  query.query.bool.filter.push({ terms: { 'external_ids.id_type': filters.dataidentifiers } });
  query.query.bool.minimum_should_match = 1;
  query._source = ['affiliations', 'authors', 'doi', 'external_ids', 'genre', 'hal_id', 'id', 'title', 'year'];
  return query;
};

const getBsoData = (options) => {
  const params = {
    method: 'POST',
    body: JSON.stringify(getBsoQuery(options)),
    headers: {
      'content-type': 'application/json',
      Authorization: VITE_BSO_AUTH,
    },
  };
  return fetch(VITE_BSO_URL, params)
    .then((response) => {
      if (response.ok) return response.json();
      return 'Oops... BSO API request did not work';
    })
    .then((response) => ({
      datasource: 'bso',
      total: response?.hits?.total?.value ?? 0,
      results: (response?.hits?.hits ?? []).map((result) => ({
        ...result._source,
        allIds: result?._source?.external_ids ?? [],
        authors: result?._source?.authors ?? [],
        datasource: 'bso',
        highlight: result.highlight,
        identifier: result?._source?.doi ?? result?._source?.hal_id ?? result._source.id,
      })),
    }));
};

export default getBsoData;
