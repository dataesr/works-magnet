const getQuery = ({ datasource, filters }) => {
  const query = {};
  switch (datasource) {
  case 'bso':
    if (filters.affiliations.length > 0 || filters.authors.length > 0) {
      query.should = [];
    }
    filters.affiliations.forEach((affiliation) => {
      query.should.push({ match: { 'affiliations.name': { query: affiliation, operator: 'and' } } });
    });
    filters.authors.forEach((author) => {
      query.should.push({ match: { 'authors.full_name': { query: author, operator: 'and' } } });
    });
    if (filters.affiliationsToExclude.length > 0 || filters.authorsToExclude.length > 0) {
      query.must_not = [];
    }
    filters.affiliationsToExclude.forEach((affiliationToExclude) => {
      query.must_not.push({ match: { 'affiliations.name': { query: affiliationToExclude, operator: 'and' } } });
    });
    filters.authorsToExclude.forEach((authorToExclude) => {
      query.must_not.push({ match: { 'authors.full_name': { query: authorToExclude, operator: 'and' } } });
    });
    if (filters?.startYear || filters?.endYear) {
      query.filter = { range: { year: {} } };
      if (filters?.startYear) {
        query.filter.range.year.gte = Number(filters.startYear);
      }
      if (filters?.endYear) {
        query.filter.range.year.lte = Number(filters.endYear);
      }
    }
    break;
  default:
  }
  return query;
};

export default getQuery;
