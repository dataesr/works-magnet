const {
  VITE_BSO_AUTH,
  VITE_BSO_INDICES,
  VITE_BSO_MAX_SIZE,
  VITE_BSO_PIT_KEEP_ALIVE,
  VITE_BSO_SIZE,
  VITE_BSO_URL,
  VITE_OPENALEX_PER_PAGE,
  VITE_OPENALEX_SIZE,
  VITE_OPENALEX_URL,
} = import.meta.env;

const VITE_OPENALEX_MAX_PAGE = Math.floor(VITE_OPENALEX_SIZE / VITE_OPENALEX_PER_PAGE);

const getBsoQuery = (options, pit, searchAfter) => {
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
  query.query.bool.filter.push({ terms: { 'external_ids.id_type': options.dataIdentifiers } });
  query.query.bool.minimum_should_match = 1;
  query._source = ['affiliations', 'authors', 'doi', 'external_ids', 'genre', 'hal_id', 'id', 'title', 'year'];
  query.sort = ['_shard_doc'];
  if (pit) {
    query.pit = { id: pit, keep_alive: VITE_BSO_PIT_KEEP_ALIVE };
  }
  if (searchAfter) {
    query.search_after = searchAfter;
    query.track_total_hits = false;
  }
  return query;
};

const getBsoCount = (options) => {
  const body = getBsoQuery(options);
  delete body._source;
  delete body.size;
  delete body.sort;
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

const getBsoWorks = async (options, pit, searchAfter, allResults = []) => {
  if (!pit) {
    const response = await fetch(`${VITE_BSO_URL}/${VITE_BSO_INDICES}/_pit?keep_alive=${VITE_BSO_PIT_KEEP_ALIVE}`, { method: 'POST', headers: { Authorization: VITE_BSO_AUTH } });
    // eslint-disable-next-line no-param-reassign
    pit = (await response.json()).id;
  }
  const params = {
    method: 'POST',
    body: JSON.stringify(getBsoQuery(options, pit, searchAfter)),
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
    .then((response) => {
      const hits = response?.hits?.hits ?? [];
      // eslint-disable-next-line no-param-reassign
      allResults = allResults.concat(hits.map((result) => ({
        ...result._source,
        // Filter ids on uniq values
        allIds: Object.values((result?._source?.external_ids ?? []).reduce((acc, obj) => ({ ...acc, [obj.id_value]: obj }), {})),
        authors: result._source?.authors ?? [],
        datasource: 'bso',
        id: result._source?.doi ?? result._source?.hal_id ?? result._source.id,
        original: result,
        type: result._source?.genre_raw ?? result._source.genre,
      })));
      if (hits.length > 0 && (Number(VITE_BSO_MAX_SIZE) === 0 || allResults.length < Number(VITE_BSO_MAX_SIZE))) {
        // eslint-disable-next-line no-param-reassign
        searchAfter = hits.at('-1').sort;
        return getBsoWorks(options, pit, searchAfter, allResults);
      }
      if (pit) {
        fetch(`${VITE_BSO_URL}/_pit`, { method: 'DELETE', headers: { Authorization: VITE_BSO_AUTH, 'Content-type': 'application/json' }, body: JSON.stringify({ id: pit }) });
      }
      return ({
        datasource: 'bso',
        total: response?.hits?.total?.value ?? 0,
        results: allResults,
      });
    });
};

const getIdLink = (type, id) => {
  let prefix = null;
  switch (type) {
  case 'crossref':
  case 'datacite':
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
  return (prefix !== null) ? `${prefix}${id}` : false;
};

const getIdValue = (id) => (
  id
    ? id.replace('https://doi.org/', '').replace('https://openalex.org/', '').replace('https://pubmed.ncbi.nlm.nih.gov/', '').replace('https://www.ncbi.nlm.nih.gov/pmc/articles/', '')
    : null
);

const getAffilitionsFromOpenAlex = (work) => {
  if (work?.authorships) {
    return work?.authorships?.map((author) => {
      if (author.raw_affiliation_strings.length === 1) {
        const affiliation = { name: author.raw_affiliation_strings[0] };
        if (author?.institutions?.[0]?.ror) affiliation.ror = author.institutions[0].ror;
        return affiliation;
      }
      return author.raw_affiliation_strings.map((name) => ({ name }));
    }).flat();
  }
  return work.affiliations;
};

const getTypeFromOpenAlex = (type) => {
  let newType = type;
  // eslint-disable-next-line default-case
  switch (type) {
  case 'component':
  case 'dissertation':
  case 'editorial':
  case 'erratum':
  case 'grant':
  case 'journal':
  case 'journal-issue':
  case 'journal-volume':
  case 'letter':
  case 'paratext':
  case 'peer-review':
  case 'reference-entry':
  case 'report':
  case 'report-series':
  case 'standard':
    newType = 'other';
    break;
  case 'book-series':
  case 'book-set':
  case 'monograph':
  case 'reference-book':
    newType = 'book';
    break;
  case 'proceedings-article':
  case 'proceedings-series':
    newType = 'proceedings';
    break;
  case 'article':
    newType = 'journal-article';
    break;
  case 'book-part':
    newType = 'book-chapter';
    break;
  case 'posted-content':
    newType = 'preprint';
    break;
  }
  return newType;
};

const getOpenAlexWorks = (options, isRor = false, page = '1', previousResponse = []) => {
  let url = `${VITE_OPENALEX_URL}per_page=${Math.min(VITE_OPENALEX_SIZE, VITE_OPENALEX_PER_PAGE)}`;
  url += '&filter=is_paratext:false';
  if (options?.startYear && options?.endYear) {
    url += `,publication_year:${Number(options.startYear)}-${Number(options?.endYear)}`;
  } else if (options?.startYear) {
    url += `,publication_year:${Number(options.startYear)}-`;
  } else if (options?.endYear) {
    url += `,publication_year:-${Number(options.endYear)}`;
  }
  if (options.affiliations.length || options.affiliationsToExclude.length || options.affiliationsToInclude.length) {
    if (isRor) {
      url += '';
      if (options.affiliations.length) url += `,institutions.ror:${options.affiliations.join('|')}`;
      if (options.affiliationsToExclude.length) url += options.affiliationsToExclude.map((affiliation) => `,institutions.ror:!${affiliation}`).join('');
      if (options.affiliationsToInclude.length) url += options.affiliationsToInclude.map((affiliation) => `,institutions.ror:${affiliation}`).join('');
    } else {
      url += ',raw_affiliation_string.search:';
      if (options.affiliations.length) url += `(${options.affiliations.map((aff) => `"${aff}"`).join(' OR ')})`;
      if (options.affiliationsToExclude.length) url += `${options.affiliationsToExclude.map((aff) => ` AND NOT ${aff}`).join('')}`;
      if (options.affiliationsToInclude.length) url += `${options.affiliationsToInclude.map((aff) => ` AND "${aff}"`).join('')}`;
    }
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
        return getOpenAlexWorks(options, isRor, nextPage, results);
      }
      return ({ total: response.meta.count, results });
    })
    .then((response) => ({
      datasource: 'openalex',
      total: response.total,
      results: response.results.map((result) => ({
        affiliations: getAffilitionsFromOpenAlex(result),
        allIds: result?.ids ? Object.keys(result.ids).map((key) => ({ id_type: key, id_value: getIdValue(result.ids[key]) })) : result.allIds,
        authors: result?.authorships?.map((author) => ({ ...author, full_name: author.author.display_name })) ?? result.authors,
        datasource: 'openalex',
        doi: getIdValue(result?.doi),
        id: result?.doi ? getIdValue(result.doi) : result.id,
        original: result,
        title: result?.display_name ?? result.title,
        type: getTypeFromOpenAlex(result.type),
        year: result?.publication_year ?? result.year,
      })),
    }));
};

const mergeWorks = (publi1, publi2) => {
  const priorityWork = [publi1, publi2].some((publi) => publi.datasource === 'bso')
    ? [publi1, publi2].find((publi) => publi.datasource === 'bso')
    : publi1;
  return ({
    ...priorityWork,
    affiliations: [...publi1.affiliations, ...publi2.affiliations],
    // Filter allIds by uniq values
    allIds: Object.values([...publi1.allIds, ...publi2.allIds].reduce((acc, obj) => ({ ...acc, [obj.id_value]: obj }), {})),
    // Filter authors by uniq full_name
    authors: Object.values([...publi1.authors, ...publi2.authors].reduce((acc, obj) => ({ ...acc, [obj.full_name]: obj }), {})),
    datasource: 'bso, openalex',
  });
};

export {
  getBsoCount,
  getBsoWorks,
  getIdLink,
  getOpenAlexWorks,
  mergeWorks,
};
