const getBsoQuery = (options, pit, searchAfter) => {
  const query = { size: process.env.VITE_BSO_SIZE, query: { bool: { filter: [], must: [], must_not: [], should: [] } } };
  const affiliationsFields = [
    'affiliations.grid', 'affiliations.name', 'affiliations.rnsr', 'affiliations.ror', 'affiliations.structId', 'affiliations.viaf'];
  let { affiliations } = options;
  affiliations = Array.isArray(affiliations) ? affiliations : [affiliations];
  affiliations.forEach((affiliation) => {
    query.query.bool.should.push({ multi_match: { fields: affiliationsFields, query: `"${affiliation}"`, operator: 'and' } });
  });
  if (options?.startYear && options?.endYear) {
    query.query.bool.filter.push({ range: { year: { gte: options.startYear, lte: options.endYear } } });
  } else if (options?.startYear) {
    query.query.bool.filter.push({ range: { year: { gte: options.startYear } } });
  } else if (options?.endYear) {
    query.query.bool.filter.push({ range: { year: { lte: options.endYear } } });
  }
  query.query.bool.minimum_should_match = 1;
  query._source = ['affiliations', 'authors', 'doi', 'external_ids', 'genre', 'hal_id', 'id', 'journal_name', 'title', 'year'];
  query.sort = ['_shard_doc'];
  if (pit) {
    query.pit = { id: pit, keep_alive: process.env.VITE_BSO_PIT_KEEP_ALIVE };
  }
  if (searchAfter) {
    query.search_after = searchAfter;
    query.track_total_hits = false;
  }
  return query;
};

const getBsoWorks = async ({ allResults = [], index = process.env.VITE_BSO_PUBLICATIONS_INDEX, options, pit, searchAfter }) => {
  if (!pit) {
    const response = await fetch(
      `${process.env.VITE_BSO_URL}/${index}/_pit?keep_alive=${process.env.VITE_BSO_PIT_KEEP_ALIVE}`,
      { method: 'POST', headers: { Authorization: process.env.VITE_BSO_AUTH } },
    );
    // eslint-disable-next-line no-param-reassign
    pit = (await response.json()).id;
  }
  const body = getBsoQuery(options, pit, searchAfter);
  const params = {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'content-type': 'application/json',
      Authorization: process.env.VITE_BSO_AUTH,
    },
  };
  return fetch(`${process.env.VITE_BSO_URL}/_search`, params)
    .then((response) => {
      if (response.ok) return response.json();
      return 'Oops... BSO API request did not work';
    })
    .then((response) => {
      const hits = response?.hits?.hits ?? [];
      // eslint-disable-next-line no-param-reassign
      allResults = allResults.concat(hits.map((result) => ({
        ...result._source,
        // Filter ids on unique values
        allIds: Object.values((result?._source?.external_ids ?? []).reduce((acc, obj) => ({ ...acc, [obj.id_value]: obj }), {})),
        authors: result._source?.authors ?? [],
        datasource: 'bso',
        id: result._source?.doi ?? result._source?.hal_id ?? result._source.id,
        original: result,
        type: result._source?.genre_raw ?? result._source.genre,
      })));
      if (hits.length > 0 && (Number(process.env.VITE_BSO_MAX_SIZE) === 0 || allResults.length < Number(process.env.VITE_BSO_MAX_SIZE))) {
        // eslint-disable-next-line no-param-reassign
        searchAfter = hits.at('-1').sort;
        return getBsoWorks({ allResults, index, options, pit, searchAfter });
      }
      if (pit) {
        fetch(
          `${process.env.VITE_BSO_URL}/_pit`,
          {
            body: JSON.stringify({ id: pit }),
            headers: { Authorization: process.env.VITE_BSO_AUTH, 'Content-type': 'application/json' },
            method: 'DELETE',
          },
        );
      }
      return ({
        datasource: 'bso',
        total: response?.hits?.total?.value ?? 0,
        results: allResults,
      });
    });
};

export {
  getBsoQuery,
  getBsoWorks,
};
