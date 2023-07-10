const getQuery = ({ datasources, affiliations, affiliationsExclude, authors, authorsExclude, years }) => {
  datasources.map((datasource) => {
    if (datasource === 'bso') {
      const query = { should: [], must_not: [] };
      authors.forEach((author) => {
        query.should.apppend({ match: { 'authors.full_name': { query: author, operator: 'and' } } });
      });
      authorsExclude.forEach((authorExclude) => {
        query.must_not.apppend({ match: { 'authors.full_name': { query: authorExclude, operator: 'and' } } });
      });
      return query;
    }
    return {};
  });
};

export default getQuery;
