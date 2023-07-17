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
  if (filters.affiliations.length > 0) {
    url += `,raw_affiliation_string.search:${filters.affiliations.join('|')}`;
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
      doi: item?.doi?.replace('https://doi.org/', '') || 'No DOI',
      title: item?.display_name ? item.display_name : item.title,
      genre: item?.type ? item.type : item.genre,
      year: item?.publication_year ? item.publication_year : item.year,
      authors: item?.authorships ? item.authorships.map((author) => ({ ...author, full_name: author.author.display_name })) : item.authors,
      datasource: 'openalex',
      affiliations: item?.authorships ? item.authorships.map((author) => author.institutions.map((institution) => ({ name: institution.display_name }))) : item.affiliations,
    })));
};

export default getOpenAlexData;
