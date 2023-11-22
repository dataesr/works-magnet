const VITE_OPENALEX_MAX_PAGE = Math.floor(process.env.VITE_OPENALEX_SIZE / process.env.VITE_OPENALEX_PER_PAGE);

const getAffilitionsFromOpenAlex = (publication) => {
  if (publication?.authorships) {
    return publication?.authorships?.map((author) => {
      if (author.raw_affiliation_strings.length === 1) {
        const affiliation = { name: author.raw_affiliation_strings[0] };
        if (author?.institutions?.[0]?.ror) affiliation.ror = author.institutions[0].ror;
        return affiliation;
      }
      return author.raw_affiliation_strings.map((name) => ({ name }));
    }).flat();
  }
  return publication.affiliations;
};

const getAffiliationRor = (affiliation) => {
  if (!affiliation?.ror) return undefined;
  if (Array.isArray(affiliation.ror)) return affiliation.ror.map((ror) => (ror.startsWith('https') ? ror : `https://ror.org/${ror}`)).join(' ');
  if (!affiliation.ror.startsWith('https')) return `https://ror.org/${affiliation.ror}`;
  return affiliation.ror;
};

const getBsoQuery = (options, pit, searchAfter) => {
  const query = { size: process.env.VITE_BSO_SIZE, query: { bool: { filter: [], must: [], must_not: [], should: [] } } };
  const affiliationsFields = ['affiliations.name'];
  options.affiliations.forEach((affiliation) => {
    query.query.bool.should.push({ multi_match: { fields: affiliationsFields, query: `"${affiliation}"`, operator: 'and' } });
  });
  if (options?.startYear && options?.endYear) {
    query.query.bool.filter.push({ range: { year: { gte: options.startYear, lte: options.endYear } } });
  } else if (options?.startYear) {
    query.query.bool.filter.push({ range: { year: { gte: options.startYear } } });
  } else if (options?.endYear) {
    query.query.bool.filter.push({ range: { year: { lte: options.endYear } } });
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

const getBsoWorks = async ({
  allResults = [], filter, index = process.env.VITE_BSO_PUBLICATIONS_INDEX, options, pit, searchAfter,
}) => {
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
  let url = `${process.env.VITE_BSO_URL}/_search`;
  if (filter) {
    url += `?${filter}`;
  }
  return fetch(url, params)
    .then((response) => {
      if (response.ok) return response.json();
      return 'Oops... BSO API request did not work';
    })
    .then((response) => {
      const hits = response?.hits?.hits ?? [];
      // eslint-disable-next-line no-param-reassign
      allResults = allResults.concat(hits.map((result) => ({
        ...result._source,
        // Filter ids on unique values
        allIds: Object.values((result?._source?.external_ids ?? []).reduce((acc, obj) => ({ ...acc, [obj.id_value]: obj }), {})),
        authors: result._source?.authors ?? [],
        datasource: 'bso',
        id: result._source?.doi ?? result._source?.hal_id ?? result._source.id,
        status: 'tobedecided',
        type: result._source?.genre_raw ?? result._source.genre,
      })));
      if (hits.length > 0 && (Number(process.env.VITE_BSO_MAX_SIZE) === 0 || allResults.length < Number(process.env.VITE_BSO_MAX_SIZE))) {
        // eslint-disable-next-line no-param-reassign
        searchAfter = hits.at('-1').sort;
        return getBsoWorks({ allResults, filter, index, options, pit, searchAfter });
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
      return ({
        datasource: 'bso',
        results: allResults,
      });
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

const getOpenAlexPublications = (options, page = '1', previousResponse = []) => {
  const { affiliations } = options;
  // eslint-disable-next-line no-param-reassign
  options.affiliations = Array.isArray(affiliations) ? affiliations : [affiliations];
  let url = `https://api.openalex.org/works?per_page=${Math.min(process.env.VITE_OPENALEX_SIZE, process.env.VITE_OPENALEX_PER_PAGE)}`;
  url += '&filter=is_paratext:false';
  if (options?.startYear && options?.endYear) {
    url += `,publication_year:${Number(options.startYear)}-${Number(options?.endYear)}`;
  } else if (options?.startYear) {
    url += `,publication_year:${Number(options.startYear)}-`;
  } else if (options?.endYear) {
    url += `,publication_year:-${Number(options.endYear)}`;
  }
  if (options.affiliations.length) {
    url += ',raw_affiliation_string.search:';
    if (options.affiliations.length) url += `(${options.affiliations.map((aff) => `"${aff}"`).join(' OR ')})`;
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
      return 'Oops... OpenAlex API request did not work';
    })
    .then((response) => {
      const results = [...previousResponse, ...response.results];
      const nextPage = Number(page) + 1;
      if (Number(response.results.length) === Number(process.env.VITE_OPENALEX_PER_PAGE) && nextPage <= VITE_OPENALEX_MAX_PAGE) {
        return getOpenAlexPublications(options, nextPage, results);
      }
      return ({ results });
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
        status: 'tobedecided',
        title: result?.display_name ?? result.title,
        type: getTypeFromOpenAlex(result.type),
        year: result?.publication_year,
      })),
    }));
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
  .replace(/[^a-zA-Z0-9]/g, '');

const groupByAffiliations = ({ datasets, options, publications }) => {
  const regexp = getRegexpFromOptions(options);
  // Save already decided affiliations
  // const decidedAffiliations = Object.values(allAffiliations).filter((affiliation) => affiliation.status !== status.tobedecided.id);
  // Compute distinct affiliations of the undecided works
  let allAffiliationsTmp = {};
  [...datasets.results, ...publications.results].filter((work) => work.status === 'tobedecided').forEach((work) => {
    (work?.affiliations ?? [])
      .filter((affiliation) => Object.keys(affiliation).length && affiliation?.name)
      .forEach((affiliation) => {
        const ror = getAffiliationRor(affiliation);
        const normalizedAffiliationName = normalizedName(affiliation.name);
        if (!allAffiliationsTmp?.[normalizedAffiliationName]) {
          // Check matches in affiliation name
          let matches = `${affiliation?.name}`?.match(regexp) ?? [];
          // Normalize matched strings
          matches = matches.map((name) => normalizedName(name));
          // Filter matches as unique
          matches = [...new Set(matches)];
          allAffiliationsTmp[normalizedAffiliationName] = {
            matches: matches.length,
            name: affiliation.name,
            nameHtml: affiliation.name.replace(regexp, '<b>$&</b>'),
            ror,
            rorHtml: ror?.replace(regexp, '<b>$&</b>'),
            status: 'tobedecided',
            works: [],
          };
        }
        allAffiliationsTmp[normalizedAffiliationName].works.push(work.id);
      });
  });

  // decidedAffiliations.forEach((affiliation) => {
  //   const affiliationName = normalizedName(affiliation.name);
  //   if (!allAffiliationsTmp?.[affiliationName]) {
  //     allAffiliationsTmp[affiliationName] = affiliation;
  //   } else {
  //     allAffiliationsTmp[affiliationName].status = affiliation.status;
  //   }
  // });

  allAffiliationsTmp = Object.values(allAffiliationsTmp)
    .map((affiliation, index) => ({ ...affiliation, id: index.toString(), works: [...new Set(affiliation.works)], worksNumber: [...new Set(affiliation.works)].length }));
  return allAffiliationsTmp;
};

const mergePublications = (publi1, publi2) => {
  const priorityPublication = [publi1, publi2].some((publi) => publi.datasource === 'bso')
    ? [publi1, publi2].find((publi) => publi.datasource === 'bso')
    : publi1;
  return ({
    ...priorityPublication,
    affiliations: [...publi1.affiliations, ...publi2.affiliations],
    // Filter allIds by unique values
    allIds: Object.values([...publi1.allIds, ...publi2.allIds].reduce((acc, obj) => ({ ...acc, [obj.id_value]: obj }), {})),
    // Filter authors by unique full_name
    authors: Object.values([...publi1.authors, ...publi2.authors].reduce((acc, obj) => ({ ...acc, [obj.full_name]: obj }), {})),
    datasource: 'bso, openalex',
  });
};

export {
  getBsoQuery,
  getBsoWorks,
  getOpenAlexPublications,
  groupByAffiliations,
  mergePublications,
};
