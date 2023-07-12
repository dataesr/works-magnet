const {
  VITE_ES_SIZE,
} = import.meta.env;

const getBsoQuery = ({ filters }) => {
  const query = { size: VITE_ES_SIZE, query: { bool: {} } };
  if (filters.affiliations.length > 0 || filters.authors.length > 0) {
    query.query.bool.should = [];
  }
  filters.affiliations.forEach((affiliation) => {
    query.query.bool.should.push({ match: { 'affiliations.name': { query: `"${affiliation}"`, operator: 'and' } } });
  });
  filters.authors.forEach((author) => {
    query.query.bool.should.push({ match: { 'authors.full_name': { query: `"${author}"`, operator: 'and' } } });
  });
  if (filters.affiliationsToExclude.length > 0 || filters.authorsToExclude.length > 0) {
    query.query.bool.must_not = [];
  }
  filters.affiliationsToExclude.forEach((affiliationToExclude) => {
    query.query.bool.must_not.push({ match: { 'affiliations.name': { query: affiliationToExclude, operator: 'and' } } });
  });
  filters.authorsToExclude.forEach((authorToExclude) => {
    query.query.bool.must_not.push({ match: { 'authors.full_name': { query: authorToExclude, operator: 'and' } } });
  });
  if (filters?.startYear || filters?.endYear) {
    query.query.bool.filter = [];
  }
  if (filters?.startYear && filters?.endYear) {
    query.query.bool.filter.push({ range: { year: { gte: filters.startYear, lte: filters.endYear } } });
  } else if (filters?.startYear) {
    query.query.bool.filter.push({ range: { year: { gte: filters.startYear } } });
  } else if (filters?.endYear) {
    query.query.bool.filter.push({ range: { year: { lte: filters.endYear } } });
  }
  query.highlight = { fields: { 'affiliations.name': {}, 'authors.full_name': {} } };
  return query;
};

export default getBsoQuery;
