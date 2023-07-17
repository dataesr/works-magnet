const {
  VITE_OPENALEX_SIZE,
  VITE_OPENALEX_PER_PAGE,
} = import.meta.env;

const VITE_OPENALEX_MAX_PAGE = Math.floor(VITE_OPENALEX_SIZE / VITE_OPENALEX_PER_PAGE);

const getOpenAlexData = ({ filters, page = '1', previousResponse = [] }) => {
  let url = `https://api.openalex.org/works?mailto=bso@recherche.gouv.fr&per_page=${Math.min(VITE_OPENALEX_SIZE, VITE_OPENALEX_PER_PAGE)}`;
  url += '&filter=is_paratext:false';
  if (filters?.startYear && filters?.endYear) {
    url += `,publication_year:${filters.startYear}-${filters?.endYear$}`;
  } else if (filters?.startYear) {
    url += `,publication_year:${filters.startYear}-`;
  } else if (filters?.endYear) {
    url += `,publication_year:-${filters.endYear}`;
  }
  if (filters.affiliations.length > 0 || filters.affiliationsToExclude.length > 0) {
    url += ',raw_affiliation_string.search:';
    if (filters.affiliations.length > 0) url += `(${filters.affiliations.map((aff) => `"${aff}"`).join(' OR ')})`;
    if (filters.affiliationsToExclude.length > 0) url += `${filters.affiliationsToExclude.map((aff) => ` AND NOT ${aff}`).join('')}`;
  }
  url += '&select=authorships,display_name,doi,id,publication_year,type';
  return fetch(`${url}&page=${page}`)
    .then((response) => {
      if (response.ok) return response.json();
      return 'Oops... OpenAlex API request did not work';
    })
    .then(({ results }) => {
      const response = [...previousResponse, ...results];
      const nextPage = Number(page) + 1;
      if (Number(results.length) === Number(VITE_OPENALEX_PER_PAGE) && nextPage <= VITE_OPENALEX_MAX_PAGE) {
        return getOpenAlexData({ filters, page: nextPage, previousResponse: response });
      }
      return response;
    })
    .then((results) => results.map((item) => ({
      affiliations: item?.authorships?.map((author) => ({ name: author.raw_affiliation_strings })) ?? item.affiliations,
      authors: item?.authorships?.map((author) => ({ ...author, full_name: author.author.display_name })) ?? item.authors,
      datasource: 'openalex',
      doi: item?.doi?.replace('https://doi.org/', '') ?? null,
      genre: item?.type ?? item.genre,
      id: item.id,
      title: item?.display_name ?? item.title,
      year: item?.publication_year ?? item.year,
      identifier: item?.doi?.replace('https://doi.org/', '') ?? item.id,
    })));
};

export default getOpenAlexData;
