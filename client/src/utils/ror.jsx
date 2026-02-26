const { VITE_API } = import.meta.env;

// https://ror.readme.io/docs/ror-identifier-pattern
const rorRegex = /^0[a-hj-km-np-tv-z|0-9]{6}[0-9]{2}$/;

const cleanRor = (ror) => ror
  .replace('https://ror.org/', '')
  .replace('http://ror.org/', '')
  .replace('ror.org/', '');

const isRor = (affiliation) => (affiliation ? rorRegex.test(cleanRor(affiliation)) : false);

const getRorData = async (affiliation, getChildren = false) => {
  const affiliationId = cleanRor(affiliation);
  if (!isRor(affiliationId)) return [];
  let response = await fetch(`${VITE_API}/ror-organizations/${affiliationId}`);
  if (!response.ok) {
    throw new Error('Oops... Error while computing ROR affiliations !');
  }
  response = await response.json();
  const rorData = [
    {
      names: response.names,
      rorCountry: response?.locations?.[0]?.geonames_details?.country_code,
      rorId: affiliationId,
      rorName: response.names.find((name) => name.types.includes('ror_display')).value,
    },
  ];
  if (!getChildren) {
    return rorData;
  }
  const children = response.relationships.filter(
    (relationship) => relationship.type === 'child',
  );
  const rorDataChildren = [];
  const childrenQueries = children.map((child) => () => getRorData(child.id, getChildren));
  // Chunk childrenQueries array in slices of 50
  const childrenQueriesChunk = [];
  for (let i = 0; i < childrenQueries.length; i += 50) {
    childrenQueriesChunk.push(childrenQueries.slice(i, i + 50));
  }
  // eslint-disable-next-line no-restricted-syntax
  for (const childrenQuery of childrenQueriesChunk) {
    // eslint-disable-next-line no-await-in-loop
    const rorNamesTmp = await Promise.allSettled(childrenQuery.map((fn) => fn()));
    rorDataChildren.push(rorNamesTmp.map((item) => {
      if (item.status === 'fulfilled') return item.value;
      console.error(`getRorData query failed: ${item.reason}`);
      return undefined;
    }));
  }
  return rorData.concat(rorDataChildren.flat().flat());
};

export {
  cleanRor,
  getRorData,
  isRor,
};
