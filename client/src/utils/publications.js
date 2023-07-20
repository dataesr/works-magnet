const mergePublications = (publi1, publi2) => ({
  ...[publi1, publi2].find((publi) => publi.datasource === 'bso'),
  affiliations: [...publi1.affiliations, ...publi2.affiliations],
  authors: [...publi1.authors, ...publi2.authors],
  datasource: 'bso, openalex',
  allIds: Object.values([...publi1.allIds, ...publi2.allIds].reduce((acc, obj) => ({ ...acc, [obj.id_value]: obj }), {})),
});

const getIdentifierValue = (identifier) => (identifier ? identifier.replace('https://doi.org/', '').replace('https://openalex.org/', '') : null);

const getIdentifierLink = (type, identifier) => {
  let prefix = null;
  switch (type) {
  case 'crossref':
  case 'doi':
    prefix = 'https://doi.org/';
    break;
  case 'hal_id':
    prefix = 'https://hal.science/';
    break;
  case 'openalex':
    prefix = 'https://openalex.org/';
    break;
  case 'pmcid':
  case 'pmid':
    prefix = '';
    break;
  default:
  }
  return (prefix !== null) ? `${prefix}${identifier}` : false;
};

export {
  getIdentifierLink,
  getIdentifierValue,
  mergePublications,
};
