import { getIdentifierValue } from './publications';

const {
  VITE_OPENALEX_SIZE,
  VITE_OPENALEX_PER_PAGE,
} = import.meta.env;

const VITE_OPENALEX_MAX_PAGE = Math.floor(VITE_OPENALEX_SIZE / VITE_OPENALEX_PER_PAGE);

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

export default getOpenAlexData;
