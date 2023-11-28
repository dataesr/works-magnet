import { cleanId, getRegexpFromOptions, normalizeName, range } from './utils';

const VITE_OPENALEX_MAX_PAGE = Math.floor(process.env.VITE_OPENALEX_SIZE / process.env.VITE_OPENALEX_PER_PAGE);

const mergePublications = (publication1, publication2) => {
  // Any publication from FOSM is prioritized among others
  const priorityPublication = [publication1, publication2].some((publi) => publi.datasource === 'fosm')
    ? [publication1, publication2].find((publi) => publi.datasource === 'fosm')
    : publication1;
  return ({
    ...priorityPublication,
    affiliations: [...new Set([...publication1.affiliations, ...publication2.affiliations])],
    // Filter allIds by unique values
    allIds: Object.values([...publication1.allIds, ...publication2.allIds].reduce((acc, obj) => ({ ...acc, [obj.id_value]: obj }), {})),
    // Filter authors by unique
    authors: [...new Set([...publication1.authors, ...publication2.authors])],
    datasource: [...new Set([...publication1.datasource, ...publication2.datasource])].sort(),
  });
};

const deduplicateWorks = (works) => {
  const deduplicatedWorks = works.reduce((deduplicatedWorksTmp, work) => {
    const { id } = work;
    // eslint-disable-next-line no-param-reassign
    deduplicatedWorksTmp[id] = deduplicatedWorksTmp[id] ? mergePublications(deduplicatedWorksTmp[id], work) : work;
    return deduplicatedWorksTmp;
  }, {});
  return Object.values(deduplicatedWorks);
};

const getFosmQuery = (options, pit, searchAfter) => {
  const query = { size: process.env.VITE_FOSM_SIZE, query: { bool: { filter: [], must: [], must_not: [], should: [] } } };
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
    query.pit = { id: pit, keep_alive: process.env.VITE_FOSM_PIT_KEEP_ALIVE };
  }
  if (searchAfter) {
    query.search_after = searchAfter;
    query.track_total_hits = false;
  }
  return query;
};

const getFosmWorksByYear = async ({ allResults = [], index = process.env.VITE_FOSM_PUBLICATIONS_INDEX, options, pit, searchAfter }) => {
  if (!pit) {
    const response = await fetch(
      `${process.env.VITE_FOSM_URL}/${index}/_pit?keep_alive=${process.env.VITE_FOSM_PIT_KEEP_ALIVE}`,
      { method: 'POST', headers: { Authorization: process.env.VITE_FOSM_AUTH } },
    );
    // eslint-disable-next-line no-param-reassign
    pit = (await response.json()).id;
  }
  const body = getFosmQuery(options, pit, searchAfter);
  const params = {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'content-type': 'application/json',
      Authorization: process.env.VITE_FOSM_AUTH,
    },
  };
  const url = `${process.env.VITE_FOSM_URL}/_search`;
  return fetch(url, params)
    .then((response) => {
      if (response.ok) return response.json();
      console.error(`Error while fetching ${url} :`);
      console.error(`${response.status} | ${response.statusText}`);
      return 'Oops... FOSM API request did not work';
    })
    .then((response) => {
      const hits = response?.hits?.hits ?? [];
      // eslint-disable-next-line no-param-reassign
      allResults = allResults.concat(hits.map((result) => ({
        // Filter ids on unique values
        affiliations: result._source.affiliations.map((affiliation) => affiliation.name),
        allIds: Object.values((result?._source?.external_ids ?? []).reduce((acc, obj) => ({ ...acc, [obj.id_value]: obj }), {})),
        authors: (result._source?.authors ?? []).map((author) => author.full_name),
        datasource: ['fosm'],
        id: cleanId(result._source?.doi ?? result._source?.hal_id ?? result._source.id),
        type: result._source?.genre_raw ?? result._source.genre,
        year: result._source.year,
      })));
      if (hits.length > 0 && (Number(process.env.VITE_FOSM_MAX_SIZE) === 0 || allResults.length < Number(process.env.VITE_FOSM_MAX_SIZE))) {
        // eslint-disable-next-line no-param-reassign
        searchAfter = hits.at('-1').sort;
        return getFosmWorksByYear({ allResults, index, options, pit, searchAfter });
      }
      if (pit) {
        fetch(
          `${process.env.VITE_FOSM_URL}/_pit`,
          {
            body: JSON.stringify({ id: pit }),
            headers: { Authorization: process.env.VITE_FOSM_AUTH, 'Content-type': 'application/json' },
            method: 'DELETE',
          },
        );
      }
      return allResults;
    });
};

const getFosmWorks = async ({ options }) => {
  const { endYear, startYear } = options;
  const years = range(startYear, endYear);
  const promises = years.map((year) => getFosmWorksByYear({ options: { ...options, year } }));
  const allResults = await Promise.all(promises);
  return allResults.flat();
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
    default:
      newType = type;
  }
  return newType;
};

const getOpenAlexPublicationsByYear = (options, page = '1', previousResponse = []) => {
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
        allIds: Object.keys(result.ids).map((key) => ({ id_type: key, id_value: cleanId(result.ids[key]) })),
        authors: result?.authorships?.map((author) => author.author.display_name),
        datasource: ['openalex'],
        doi: cleanId(result?.doi),
        id: cleanId(result?.ids?.doi ?? result?.primary_location?.landing_page_url?.split('/')?.pop() ?? result?.ids?.openalex),
        title: result?.display_name,
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

const getOpenAlexPublications = async ({ options }) => {
  const { endYear, startYear } = options;
  const years = range(startYear, endYear);
  const promises = years.map((year) => getOpenAlexPublicationsByYear({ ...options, year }));
  const allResults = await Promise.all(promises);
  return allResults.flat();
};

const groupByAffiliations = ({ options, works }) => {
  const regexp = getRegexpFromOptions(options);
  // Compute distinct affiliations of works
  let allAffiliationsTmp = {};
  works.forEach((work) => {
    (work?.affiliations ?? [])
      .forEach((affiliation) => {
        const normalizedAffiliationName = normalizeName(affiliation);
        if (!allAffiliationsTmp?.[normalizedAffiliationName]) {
          // Check matches in affiliation name
          let matches = affiliation?.match(regexp) ?? [];
          // Normalize matched strings
          matches = matches.map((match) => normalizeName(match));
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
    .map((affiliation, index) => {
      const uniqueWorks = [...new Set(affiliation.works)];
      return ({
        ...affiliation,
        id: index.toString(),
        works: uniqueWorks,
        worksNumber: uniqueWorks.length,
      });
    });
  return allAffiliationsTmp;
};

export {
  deduplicateWorks,
  getFosmWorks,
  getOpenAlexPublications,
  groupByAffiliations,
};
