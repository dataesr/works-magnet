const {
  VITE_API,
  VITE_OPENALEX_PER_PAGE,
  VITE_OPENALEX_SIZE,
} = import.meta.env;

const VITE_OPENALEX_MAX_PAGE = Math.floor(VITE_OPENALEX_SIZE / VITE_OPENALEX_PER_PAGE);

const getBsoCount = (options) => {
  const urlParams = new URLSearchParams(options).toString();
  return fetch(`${VITE_API}/bso/count?${urlParams}`)
    .then((response) => {
      if (response.ok) return response.json();
      return 'Oops... BSO API request did not work';
    });
};

const getBsoWorks = async ({ options, index }) => {
  const urlParams = new URLSearchParams({ ...options, index }).toString();
  return fetch(`${VITE_API}/bso/works?${urlParams}`)
    .then((response) => {
      if (response.ok) return response.json();
      return 'Oops... BSO API request did not work';
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
  let url = `${VITE_API}/openalex?per_page=${Math.min(VITE_OPENALEX_SIZE, VITE_OPENALEX_PER_PAGE)}`;
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
        year: Number(result?.publication_year) ?? Number(result.year),
      })),
    }));
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
  getBsoCount,
  getBsoWorks,
  getIdLink,
  getOpenAlexPublications,
  mergePublications,
};
