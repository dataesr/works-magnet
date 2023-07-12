const {
  VITE_ES_SIZE,
} = import.meta.env;

const getQuery = ({ datasource, filters }) => {
  const query = { size: VITE_ES_SIZE, query: { bool: {} } };
  query.query.bool.filter = [];
  query.query.bool.should = [];
  query.query.bool.must_not = [];
  switch (datasource) {
  case 'bso':
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
    query.query.bool.filter.push({ terms: { 'external_ids.id_type': filters.dataidentifiers } });
    query.query.bool.minimum_should_match = 1;
    query.highlight = { fields: { 'affiliations.name': {}, 'authors.full_name': {} } };
    break;
  default:
  }
  return query;
};

export default getQuery;
