const {
  VITE_BSO_AUTH,
  VITE_BSO_SIZE,
  VITE_BSO_URL,
  VITE_OPENALEX_SIZE,
  VITE_OPENALEX_PER_PAGE,
} = import.meta.env;

const VITE_OPENALEX_MAX_PAGE = Math.floor(VITE_OPENALEX_SIZE / VITE_OPENALEX_PER_PAGE);

const getBsoQuery = (options) => {
  const query = { size: VITE_BSO_SIZE, query: { bool: { filter: [], must: [], must_not: [], should: [] } } };
  const affiliationsFields = ['affiliations.grid', 'affiliations.name', 'affiliations.rnsr', 'affiliations.ror', 'affiliations.structId', 'affiliations.viaf'];
  options.affiliations.forEach((affiliation) => {
    query.query.bool.should.push({ multi_match: { fields: affiliationsFields, query: `"${affiliation}"`, operator: 'and' } });
  });
  options.authors.forEach((author) => {
    query.query.bool.should.push({ match: { 'authors.full_name': { query: `"${author}"`, operator: 'and' } } });
  });
  options.affiliationsToExclude.forEach((affiliationToExclude) => {
    query.query.bool.must_not.push({ multi_match: { fields: affiliationsFields, query: affiliationToExclude, operator: 'and' } });
  });
  options.authorsToExclude.forEach((authorToExclude) => {
    query.query.bool.must_not.push({ match: { 'authors.full_name': { query: authorToExclude, operator: 'and' } } });
  });
  options.affiliationsToInclude.forEach((affiliationToInclude) => {
    query.query.bool.must.push({ multi_match: { fields: affiliationsFields, query: `"${affiliationToInclude}"`, operator: 'and' } });
  });
  if (options?.startYear && options?.endYear) {
    query.query.bool.filter.push({ range: { year: { gte: options.startYear, lte: options.endYear } } });
  } else if (options?.startYear) {
    query.query.bool.filter.push({ range: { year: { gte: options.startYear } } });
  } else if (options?.endYear) {
    query.query.bool.filter.push({ range: { year: { lte: options.endYear } } });
  }
  query.highlight = { fields: {
    'affiliations.grid': {},
    'affiliations.name': {},
    'affiliations.rnsr': {},
    'affiliations.ror': {},
    'affiliations.structId': {},
    'affiliations.viaf': {},
    'authors.full_name': {},
  } };
  query.query.bool.filter.push({ terms: { 'external_ids.id_type': options.dataIdentifiers } });
  query.query.bool.minimum_should_match = 1;
  query._source = ['affiliations', 'authors', 'doi', 'external_ids', 'genre', 'hal_id', 'id', 'title', 'year'];
  return query;
};

const getBsoCount = (options) => {
  const body = getBsoQuery(options);
  delete body._source;
  delete body.highlight;
  delete body.size;
  const params = {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'content-type': 'application/json',
      Authorization: VITE_BSO_AUTH,
    },
  };
  return fetch(`${VITE_BSO_URL}/_count`, params)
    .then((response) => {
      if (response.ok) return response.json();
      return 'Oops... BSO API request did not work';
    });
};

const getBsoPublications = (options) => {
  const params = {
    method: 'POST',
    body: JSON.stringify(getBsoQuery(options)),
    headers: {
      'content-type': 'application/json',
      Authorization: VITE_BSO_AUTH,
    },
  };
  return fetch(`${VITE_BSO_URL}/_search`, params)
    .then((response) => {
      if (response.ok) return response.json();
      return 'Oops... BSO API request did not work';
    })
    .then((response) => ({
      datasource: 'bso',
      total: response?.hits?.total?.value ?? 0,
      results: (response?.hits?.hits ?? []).map((result) => ({
        ...result._source,
        // Filter ids by uniq values
        allIds: Object.values((result?._source?.external_ids ?? []).reduce((acc, obj) => ({ ...acc, [obj.id_value]: obj }), {})),
        authors: result._source?.authors ?? [],
        datasource: 'bso',
        highlight: result.highlight,
        identifier: result._source?.doi ?? result._source?.hal_id ?? result._source.id,
        type: result._source?.genre_raw ?? result._source.genre,
      })),
    }));
};

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
    prefix = 'https://www.ncbi.nlm.nih.gov/pmc/articles/';
    break;
  case 'pmid':
    prefix = 'https://pubmed.ncbi.nlm.nih.gov/';
    break;
  default:
  }
  return (prefix !== null) ? `${prefix}${identifier}` : false;
};

const getIdentifierValue = (identifier) => (identifier
  ? identifier.replace('https://doi.org/', '').replace('https://openalex.org/', '').replace('https://pubmed.ncbi.nlm.nih.gov/', '').replace('https://www.ncbi.nlm.nih.gov/pmc/articles/', '')
  : null
);

const getOpenAlexPublications = (options, page = '1', previousResponse = []) => {
  let url = `https://api.openalex.org/works?mailto=bso@recherche.gouv.fr&per_page=${Math.min(VITE_OPENALEX_SIZE, VITE_OPENALEX_PER_PAGE)}`;
  url += '&filter=is_paratext:false';
  if (options?.startYear && options?.endYear) {
    url += `,publication_year:${Number(options.startYear)}-${Number(options?.endYear)}`;
  } else if (options?.startYear) {
    url += `,publication_year:${Number(options.startYear)}-`;
  } else if (options?.endYear) {
    url += `,publication_year:-${Number(options.endYear)}`;
  }
  if (options.affiliations.length > 0 || options.affiliationsToExclude.length > 0) {
    url += ',raw_affiliation_string.search:';
    if (options.affiliations.length > 0) url += `(${options.affiliations.map((aff) => `"${aff}"`).join(' OR ')})`;
    if (options.affiliationsToExclude.length > 0) url += `${options.affiliationsToExclude.map((aff) => ` AND NOT ${aff}`).join('')}`;
    if (options.affiliationsToInclude.length > 0) url += `${options.affiliationsToInclude.map((aff) => ` AND "${aff}"`).join('')}`;
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
        return getOpenAlexPublications(options, nextPage, results);
      }
      return ({ total: response.meta.count, results });
    })
    .then((response) => ({
      datasource: 'openalex',
      total: response.total,
      results: response.results.map((item) => ({
        affiliations: item?.authorships?.map((author) => ({ name: author.raw_affiliation_strings })) ?? item.affiliations,
        allIds: item?.ids ? Object.keys(item.ids).map((key) => ({ id_type: key, id_value: getIdentifierValue(item.ids[key]) })) : item.allIds,
        authors: item?.authorships?.map((author) => ({ ...author, full_name: author.author.display_name })) ?? item.authors,
        datasource: 'openalex',
        doi: getIdentifierValue(item?.doi),
        id: item.id,
        identifier: item?.doi ? getIdentifierValue(item.doi) : item.id,
        title: item?.display_name ?? item.title,
        type: item.type,
        year: item?.publication_year ?? item.year,
      })),
    }));
};

const mergePublications = (publi1, publi2) => ({
  ...[publi1, publi2].find((publi) => publi.datasource === 'bso'),
  affiliations: [...publi1.affiliations, ...publi2.affiliations],
  // Filter ids by uniq values
  allIds: Object.values([...publi1.allIds, ...publi2.allIds].reduce((acc, obj) => ({ ...acc, [obj.id_value]: obj }), {})),
  // Filter authors by uniq full_name
  authors: Object.values([...publi1.authors, ...publi2.authors].reduce((acc, obj) => ({ ...acc, [obj.full_name]: obj }), {})),
  datasource: 'bso, openalex',
});

export {
  getBsoCount,
  getBsoPublications,
  getIdentifierLink,
  getIdentifierValue,
  getOpenAlexPublications,
  mergePublications,
};
