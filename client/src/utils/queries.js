const getQuery = ({ datasource, filters }) => {
  let query = {};
  switch (datasource) {
  case 'bso':
    query = { filter: {}, must_not: [], should: [] };
    filters.affiliations.forEach((affiliation) => {
      query.should.push({ match: { 'affiliations.name': { query: affiliation, operator: 'and' } } });
    });
    filters.affiliationsToExclude.forEach((affiliationToExclude) => {
      query.must_not.push({ match: { 'affiliations.name': { query: affiliationToExclude, operator: 'and' } } });
    });
    filters.authors.forEach((author) => {
      query.should.push({ match: { 'authors.full_name': { query: author, operator: 'and' } } });
    });
    filters.authorsToExclude.forEach((authorToExclude) => {
      query.must_not.push({ match: { 'authors.full_name': { query: authorToExclude, operator: 'and' } } });
    });
    query.filter = { range: { year: { gte: Number(filters.startYear), lte: Number(filters.endYear) } } };
    break;
  default:
  }
  return query;
};

export default getQuery;
