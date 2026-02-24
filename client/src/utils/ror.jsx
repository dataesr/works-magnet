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
  const topLevel = [
    {
      names: response.names,
      rorCountry: response?.locations?.[0]?.geonames_details?.country_code,
      rorId: affiliationId,
      rorName: response.names.find((name) => name.types.includes('ror_display')).value,
    },
  ];
  if (!getChildren) {
    return topLevel;
  }
  const children = response.relationships.filter(
    (relationship) => relationship.type === 'child',
  );
  let childrenRes = [];
  if (getChildren) {
    const childrenQueries = [];
    children.forEach((child) => {
      childrenQueries.push(getRorData(child.id, getChildren));
    });
    if (childrenQueries.length > 0) {
      childrenRes = await Promise.all(childrenQueries);
    }
  }
  return topLevel.concat(childrenRes.flat());
};

export {
  cleanRor,
  getRorData,
  isRor,
};
