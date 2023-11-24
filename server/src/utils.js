const VITE_OPENALEX_MAX_PAGE = Math.floor(process.env.VITE_OPENALEX_SIZE / process.env.VITE_OPENALEX_PER_PAGE);

const range = (startYear, endYear = new Date().getFullYear()) => {
  const start = Number(startYear);
  const end = Number(endYear);
  if (start === end) return [start];
  return [start, ...range(start + 1, end)];
};

const getBsoQuery = (options, pit, searchAfter) => {
  const query = { size: process.env.VITE_BSO_SIZE, query: { bool: { filter: [], must: [], must_not: [], should: [] } } };
  const affiliationsFields = ['affiliations.name'];
  options.affiliations.forEach((affiliation) => {
    query.query.bool.should.push({ multi_match: { fields: affiliationsFields, query: `"${affiliation}"`, operator: 'and' } });
  });
  query.query.bool.filter.push({ range: { year: { gte: options.year, lte: options.year } } });
  if (options?.filter) {
    query.query.bool.filter.push({ term: { [options.filter.field]: options.filter.value } });
  }
  query.query.bool.minimum_should_match = 1;
  query._source = ['affiliations', 'authors', 'doi', 'external_ids', 'genre', 'genre_raw', 'hal_id', 'id', 'journal_name', 'title', 'year'];
  query.sort = ['_shard_doc'];
  if (pit) {
    query.pit = { id: pit, keep_alive: process.env.VITE_BSO_PIT_KEEP_ALIVE };
  }
  if (searchAfter) {
    query.search_after = searchAfter;
    query.track_total_hits = false;
  }
  return query;
};

const getBsoWorksByYear = async ({ allResults = [], index = process.env.VITE_BSO_PUBLICATIONS_INDEX, options, pit, searchAfter }) => {
  if (!pit) {
    const response = await fetch(
      `${process.env.VITE_BSO_URL}/${index}/_pit?keep_alive=${process.env.VITE_BSO_PIT_KEEP_ALIVE}`,
      { method: 'POST', headers: { Authorization: process.env.VITE_BSO_AUTH } },
    );
    // eslint-disable-next-line no-param-reassign
    pit = (await response.json()).id;
  }
  const { affiliations } = options;
  // eslint-disable-next-line no-param-reassign
  options.affiliations = Array.isArray(affiliations) ? affiliations : [affiliations];
  const body = getBsoQuery(options, pit, searchAfter);
  const params = {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'content-type': 'application/json',
      Authorization: process.env.VITE_BSO_AUTH,
    },
  };
  const url = `${process.env.VITE_BSO_URL}/_search`;
  return fetch(url, params)
    .then((response) => {
      if (response.ok) return response.json();
      console.error(`Error while fetching ${url} :`);
      console.error(`${response.status} | ${response.statusText}`);
      return 'Oops... BSO API request did not work';
    })
    .then((response) => {
      const hits = response?.hits?.hits ?? [];
      // eslint-disable-next-line no-param-reassign
      allResults = allResults.concat(hits.map((result) => ({
        // Filter ids on unique values
        affiliations: result._source.affiliations.map((affiliation) => affiliation.name),
        allIds: Object.values((result?._source?.external_ids ?? []).reduce((acc, obj) => ({ ...acc, [obj.id_value]: obj }), {})),
        authors: (result._source?.authors ?? []).map((author) => author.full_name),
        datasource: ['bso'],
        id: result._source?.doi ?? result._source?.hal_id ?? result._source.id,
        type: result._source?.genre_raw ?? result._source.genre,
        year: result._source.year,
      })));
      if (hits.length > 0 && (Number(process.env.VITE_BSO_MAX_SIZE) === 0 || allResults.length < Number(process.env.VITE_BSO_MAX_SIZE))) {
        // eslint-disable-next-line no-param-reassign
        searchAfter = hits.at('-1').sort;
        return getBsoWorksByYear({ allResults, index, options, pit, searchAfter });
      }
      if (pit) {
        fetch(
          `${process.env.VITE_BSO_URL}/_pit`,
          {
            body: JSON.stringify({ id: pit }),
            headers: { Authorization: process.env.VITE_BSO_AUTH, 'Content-type': 'application/json' },
            method: 'DELETE',
          },
        );
      }
      return allResults;
    });
};

const getBsoWorks = async (options) => {
  const { endYear, startYear } = options.options;
  const years = range(startYear, endYear);
  const promises = years.map((year) => getBsoWorksByYear({ ...options, year }));
  const allResults = await Promise.all(promises);
  return ({
    datasource: 'bso',
    results: allResults.flat(),
  });
};

const getIdValue = (id) => (
  id
    ? id
      .replace('https://doi.org/', '')
      .replace('https://openalex.org/', '')
      .replace('https://pubmed.ncbi.nlm.nih.gov/', '')
      .replace('https://www.ncbi.nlm.nih.gov/pmc/articles/', '')
    : null
);

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

const getOpenAlexPublicationsByYear = (options, page = '1', previousResponse = []) => {
  const { affiliations } = options;
  // eslint-disable-next-line no-param-reassign
  options.affiliations = Array.isArray(affiliations) ? affiliations : [affiliations];
  let url = `https://api.openalex.org/works?per_page=${Math.min(process.env.VITE_OPENALEX_SIZE, process.env.VITE_OPENALEX_PER_PAGE)}`;
  url += '&filter=is_paratext:false';
  url += `,publication_year:${Number(options.year)}-${Number(options?.year)}`;
  if (options.affiliations.length) {
    url += `,raw_affiliation_string.search:(${options.affiliations.map((aff) => `"${aff}"`).join(' OR ')})`;
  }
  if (process?.env?.VITE_OPENALEX_KEY) {
    url += `&api_key=${process.env.VITE_OPENALEX_KEY}`;
  } else {
    url += '&mailto=bso@recherche.gouv.fr';
  }
  url += '&select=authorships,display_name,doi,id,ids,publication_year,type';
  return fetch(`${url}&page=${page}`)
    .then((response) => {
      if (response.ok) return response.json();
      console.error(`Error while fetching ${url} :`);
      console.error(`${response.status} | ${response.statusText}`);
      return 'Oops... OpenAlex API request did not work';
    })
    .then((response) => {
      const hits = response?.results ?? [];
      const results = previousResponse.concat(hits.map((result) => ({
        affiliations: result?.authorships?.map((author) => author.raw_affiliation_strings).flat(),
        allIds: result?.ids ? Object.keys(result.ids).map((key) => ({ id_type: key, id_value: getIdValue(result.ids[key]) })) : result.allIds,
        authors: result?.authorships?.map((author) => author.author.display_name),
        datasource: ['openalex'],
        doi: getIdValue(result?.doi),
        id: result?.doi ? getIdValue(result.doi) : result.id,
        title: result?.display_name ?? result.title,
        type: getTypeFromOpenAlex(result.type),
        year: result?.publication_year,
      })));
      const nextPage = Number(page) + 1;
      if (Number(response.results.length) === Number(process.env.VITE_OPENALEX_PER_PAGE) && nextPage <= VITE_OPENALEX_MAX_PAGE) {
        return getOpenAlexPublicationsByYear(options, nextPage, results);
      }
      return results;
    });
};

const getOpenAlexPublications = async (options) => {
  const { endYear, startYear } = options.options;
  const years = range(startYear, endYear);
  const promises = years.map((year) => getOpenAlexPublicationsByYear({ ...options, year }));
  const allResults = await Promise.all(promises);
  return ({
    datasource: 'openalex',
    results: allResults.flat(),
  });
};

const getRegexpFromOptions = (options) => {
  const regex = new RegExp(`(${(options?.affiliations ?? [])
    .map((affiliationQuery) => affiliationQuery
      .replaceAll(/(a|à|á|â|ã|ä|å)/g, '(a|à|á|â|ã|ä|å)')
      .replaceAll(/(e|è|é|ê|ë)/g, '(e|è|é|ê|ë)')
      .replaceAll(/(i|ì|í|î|ï)/g, '(i|ì|í|î|ï)')
      .replaceAll(/(o|ò|ó|ô|õ|ö|ø)/g, '(o|ò|ó|ô|õ|ö|ø)')
      .replaceAll(/(u|ù|ú|û|ü)/g, '(u|ù|ú|û|ü)')
      .replaceAll(/(y|ý|ÿ)/g, '(y|ý|ÿ)')
      .replaceAll(/(n|ñ)/g, '(n|ñ)')
      .replaceAll(/(c|ç)/g, '(c|ç)')
      .replaceAll(/æ/g, '(æ|ae)')
      .replaceAll(/œ/g, '(œ|oe)'))
    .join('|')})`, 'gi');
  return regex;
};

const normalizedName = (name) => name
  .toLowerCase()
  .normalize('NFD')
  .replace(/[^a-zA-Z0-9]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const groupByAffiliations = ({ datasets, options, publications }) => {
  const regexp = getRegexpFromOptions(options);
  // Compute distinct affiliations of the undecided works
  let allAffiliationsTmp = {};
  [...datasets.results, ...publications.results].forEach((work) => {
    (work?.affiliations ?? [])
      .forEach((affiliation) => {
        const normalizedAffiliationName = normalizedName(affiliation);
        if (!allAffiliationsTmp?.[normalizedAffiliationName]) {
          // Check matches in affiliation name
          let matches = affiliation?.match(regexp) ?? [];
          // Normalize matched strings
          matches = matches.map((macth) => normalizedName(macth));
          // Filter matches as unique
          matches = [...new Set(matches)];
          allAffiliationsTmp[normalizedAffiliationName] = {
            matches: matches.length,
            name: affiliation,
            nameHtml: affiliation.replace(regexp, '<b>$&</b>'),
            works: [],
          };
        }
        allAffiliationsTmp[normalizedAffiliationName].works.push(work.id);
      });
  });

  allAffiliationsTmp = Object.values(allAffiliationsTmp)
    .map((affiliation, index) => ({ ...affiliation, id: index.toString(), works: [...new Set(affiliation.works)], worksNumber: [...new Set(affiliation.works)].length }));
  return allAffiliationsTmp;
};

const mergePublications = (publication1, publication2) => {
  // Any publication from FOSM is prioritized among others
  const priorityPublication = [publication1, publication2].some((publi) => publi.datasource === 'bso')
    ? [publication1, publication2].find((publi) => publi.datasource === 'bso')
    : publication1;
  return ({
    ...priorityPublication,
    affiliations: [...publication1.affiliations, ...publication2.affiliations],
    // Filter allIds by unique values
    allIds: Object.values([...publication1.allIds, ...publication2.allIds].reduce((acc, obj) => ({ ...acc, [obj.id_value]: obj }), {})),
    // Filter authors by unique
    authors: [...new Set([...publication1.authors, ...publication2.authors])],
    datasource: ['bso', 'openalex'],
  });
};

export {
  getBsoQuery,
  getBsoWorks,
  getOpenAlexPublications,
  groupByAffiliations,
  mergePublications,
};
