// https://ror.readme.io/docs/ror-identifier-pattern
const rorRegex = /^0[a-hj-km-np-tv-z|0-9]{6}[0-9]{2}$/;

const isRor = (affiliation) => rorRegex.test(affiliation);

const getRorData = async (affiliation, getChildren = false) => {
  const affiliationId = affiliation.replace('https://ror.org/', '').replace('ror.org/', '');
  if (!isRor(affiliationId)) return [];
  let response = await fetch(`https://api.ror.org/organizations/${affiliationId}`);
  response = await response.json();
  const topLevel = [{
    rorId: affiliationId,
    names: [
      response.name,
      ...response.acronyms,
      ...response.aliases,
      ...response.labels.map((item) => item.label),
    ] }];
  if (!getChildren) {
    return topLevel;
  }
  const children = response.relationships.filter((relationship) => relationship.type === 'Child');
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
  getRorData,
  isRor,
};
