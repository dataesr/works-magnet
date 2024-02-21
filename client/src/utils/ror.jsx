// https://ror.readme.io/docs/ror-identifier-pattern
const rorRegex = /^0[a-hj-km-np-tv-z|0-9]{6}[0-9]{2}$/;

const isRor = (affiliation) => rorRegex.test(affiliation);

const getRorNames = async (affiliation) => {
  const affiliationId = affiliation.replace('https://ror.org/', '').replace('ror.org/', '');
  if (!isRor(affiliationId)) return [];
  let response = await fetch(`https://api.ror.org/organizations/${affiliationId}`);
  response = await response.json();
  const children = response.relationships.filter((relationship) => relationship.type === 'Child');
  let childrenRes = [];
  const childrenQueries = [];
  children.forEach((child) => {
    childrenQueries.push(getRorNames(child.id));
  });
  if (childrenQueries.length > 0) {
    childrenRes = await Promise.all(childrenQueries);
  }
  const topLevel = [{
    rorId: affiliationId,
    children,
    names: [
      response.name,
      ...response.acronyms,
      ...response.aliases,
      ...response.labels.map((item) => item.label),
    ] }];
  const ans = topLevel.concat(childrenRes.flat());
  return ans;
};

export {
  getRorNames,
};
