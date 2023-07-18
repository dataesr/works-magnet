const mergePublications = (publi1, publi2) => ({
  ...[publi1, publi2].find((publi) => publi.datasource === 'bso'),
  affiliations: [...publi1.affiliations, ...publi2.affiliations],
  authors: [...publi1.authors, ...publi2.authors],
});

export {
  mergePublications,
};
