const {
  VITE_BSO_AUTH,
  VITE_BSO_SIZE,
  VITE_BSO_URL,
  VITE_OPENALEX_SIZE,
  VITE_OPENALEX_PER_PAGE,
} = import.meta.env;

const VITE_OPENALEX_MAX_PAGE = Math.floor(VITE_OPENALEX_SIZE / VITE_OPENALEX_PER_PAGE);

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

const getIdentifierValue = (identifier) => (identifier ? identifier.replace('https://doi.org/', '').replace('https://openalex.org/', '') : null);

const getIdentifierLink = (type, identifier) => {
  let prefix = null;
  switch (type) {
  case 'crossref':
  case 'doi':
    prefix = 'https://doi.org/';
    break;
  case 'hal_id':
    prefix = 'https://hal.science/';
    break;
  case 'openalex':
    prefix = 'https://openalex.org/';
    break;
  case 'pmcid':
  case 'pmid':
    prefix = '';
    break;
  default:
  }
  return (prefix !== null) ? `${prefix}${identifier}` : false;
};

const getOpenAlexData = ({ filters, page = '1', previousResponse = [] }) => {
  let url = `https://api.openalex.org/works?mailto=bso@recherche.gouv.fr&per_page=${Math.min(VITE_OPENALEX_SIZE, VITE_OPENALEX_PER_PAGE)}`;
  url += '&filter=is_paratext:false';
  if (filters?.startYear && filters?.endYear) {
    url += `,publication_year:${Number(filters.startYear)}-${Number(filters?.endYear)}`;
  } else if (filters?.startYear) {
    url += `,publication_year:${Number(filters.startYear)}-`;
  } else if (filters?.endYear) {
    url += `,publication_year:-${Number(filters.endYear)}`;
  }
  if (filters.affiliations.length > 0 || filters.affiliationsToExclude.length > 0) {
    url += ',raw_affiliation_string.search:';
    if (filters.affiliations.length > 0) url += `(${filters.affiliations.map((aff) => `"${aff}"`).join(' OR ')})`;
    if (filters.affiliationsToExclude.length > 0) url += `${filters.affiliationsToExclude.map((aff) => ` AND NOT ${aff}`).join('')}`;
  }
  url += '&select=authorships,display_name,doi,id,ids,publication_year,type';
  return fetch(`${url}&page=${page}`)
    .then((response) => {
      if (response.ok) return response.json();
      return 'Oops... OpenAlex API request did not work';
    })
    .then((response) => {
      const results = [...previousResponse, ...response.results];
      const nextPage = Number(page) + 1;
      if (Number(response.results.length) === Number(VITE_OPENALEX_PER_PAGE) && nextPage <= VITE_OPENALEX_MAX_PAGE) {
        return getOpenAlexData({ filters, page: nextPage, previousResponse: results });
      }
      return ({ total: response.meta.count, results });
    })
    .then((response) => ({
      datasource: 'openalex',
      total: response.total,
      results: response.results.map((item) => ({
        affiliations: item?.authorships?.map((author) => ({ name: author.raw_affiliation_strings })) ?? item.affiliations,
        authors: item?.authorships?.map((author) => ({ ...author, full_name: author.author.display_name })) ?? item.authors,
        datasource: 'openalex',
        doi: getIdentifierValue(item?.doi),
        genre: item?.type ?? item.genre,
        id: item.id,
        identifier: item?.doi ? getIdentifierValue(item.doi) : item.id,
        allIds: item?.ids ? Object.keys(item.ids).map((key) => ({ id_type: key, id_value: getIdentifierValue(item.ids[key]) })) : item.allIds,
        title: item?.display_name ?? item.title,
        year: item?.publication_year ?? item.year,
      })),
    }));
};

const mergePublications = (publi1, publi2) => ({
  ...[publi1, publi2].find((publi) => publi.datasource === 'bso'),
  affiliations: [...publi1.affiliations, ...publi2.affiliations],
  authors: [...publi1.authors, ...publi2.authors],
  datasource: 'bso, openalex',
  allIds: Object.values([...publi1.allIds, ...publi2.allIds].reduce((acc, obj) => ({ ...acc, [obj.id_value]: obj }), {})),
});

export {
  getBsoData,
  getIdentifierLink,
  getIdentifierValue,
  getOpenAlexData,
  mergePublications,
};
