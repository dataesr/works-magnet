const mergePublications = (publi1, publi2) => ({
  ...[publi1, publi2].find((publi) => publi.datasource === 'bso'),
  affiliations: [...publi1.affiliations, ...publi2.affiliations],
  authors: [...publi1.authors, ...publi2.authors],
  datasource: 'bso, openalex',
  allIds: Object.values([...publi1.allIds, ...publi2.allIds].reduce((acc, obj) => ({ ...acc, [obj.id_value]: obj }), {})),
});

export {
  mergePublications,
};
