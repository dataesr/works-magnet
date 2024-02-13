// https://ror.readme.io/docs/ror-identifier-pattern
const rorRegex = /^0[a-hj-km-np-tv-z|0-9]{6}[0-9]{2}$/;

const isRor = (affiliation) => rorRegex.test(affiliation);

const getRorNames = async (affiliation) => {
  const affiliationId = affiliation.replace('https://ror.org/', '').replace('ror.org/', '');
  if (!isRor(affiliationId)) return [];
  let response = await fetch(`https://api.ror.org/organizations/${affiliation}`);
  response = await response.json();
  const queries = response.relationships.filter((relationship) => relationship.type === 'Child').map((relationship) => getRorNames(relationship.id));
  let childrenNames = [];
  if (queries.length > 0) {
    childrenNames = await Promise.all(queries);
  }
  return [
    response.name,
    ...response.acronyms,
    ...response.aliases,
    ...response.labels.map((item) => item.label),
    ...childrenNames.flat(),
  ];
};

export {
  getRorNames,
};
