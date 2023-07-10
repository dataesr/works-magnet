const getQuery = ({ datasources, affiliations, affiliationsExclude, authors, authorsExclude, yearMin, yearMax }) => {
  datasources.map((datasource) => {
    if (datasource === 'bso') {
      const query = { filter: {}, must_not: [], should: [] };
      affiliations.forEach((affiliation) => {
        query.should.apppend({ match: { 'affiliations.name': { query: affiliation, operator: 'and' } } });
      });
      affiliationsExclude.forEach((affiliationExclude) => {
        query.must_not.apppend({ match: { 'affiliations.name': { query: affiliationExclude, operator: 'and' } } });
      });
      authors.forEach((author) => {
        query.should.apppend({ match: { 'authors.full_name': { query: author, operator: 'and' } } });
      });
      authorsExclude.forEach((authorExclude) => {
        query.must_not.apppend({ match: { 'authors.full_name': { query: authorExclude, operator: 'and' } } });
      });
      query.filter = { range: { year: { gte: Number(yearMin), lte: Number(yearMax) } } };
      return query;
    }
    return {};
  });
};

export default getQuery;
