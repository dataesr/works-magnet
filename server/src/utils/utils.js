const range = (startYear, endYear = new Date().getFullYear()) => {
  const start = Number(startYear);
  const end = Number(endYear);
  if (start === end) return [start];
  return [start, ...range(start + 1, end)];
};

const cleanId = (id) => (
  id
    ? id
      .replace('https://doi.org/', '')
      .replace('https://openalex.org/', '')
      .replace('https://pubmed.ncbi.nlm.nih.gov/', '')
      .replace('https://www.ncbi.nlm.nih.gov/pmc/articles/', '')
    : null
);

const getRegexpFromOptions = (options) => {
  const regex = new RegExp(`(${(options?.affiliations ?? [])
    .map((affiliationQuery) => affiliationQuery
      .replaceAll(/(a|à|á|â|ã|ä|å)/g, '(a|à|á|â|ã|ä|å)')
      .replaceAll(/(e|è|é|ê|ë)/g, '(e|è|é|ê|ë)')
      .replaceAll(/(i|ì|í|î|ï)/g, '(i|ì|í|î|ï)')
      .replaceAll(/(o|ò|ó|ô|õ|ö|ø)/g, '(o|ò|ó|ô|õ|ö|ø)')
      .replaceAll(/(u|ù|ú|û|ü)/g, '(u|ù|ú|û|ü)')
      .replaceAll(/(y|ý|ÿ)/g, '(y|ý|ÿ)')
      .replaceAll(/(n|ñ)/g, '(n|ñ)')
      .replaceAll(/(c|ç)/g, '(c|ç)')
      .replaceAll(/æ/g, '(æ|ae)')
      .replaceAll(/œ/g, '(œ|oe)'))
    .join('|')})`, 'gi');
  return regex;
};

const normalizedName = (name) => name
  .toLowerCase()
  .normalize('NFD')
  .replace(/[^a-zA-Z0-9]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const groupByAffiliations = ({ datasets, options, publications }) => {
  const regexp = getRegexpFromOptions(options);
  // Compute distinct affiliations of the undecided works
  let allAffiliationsTmp = {};
  [...datasets.results, ...publications.results].forEach((work) => {
    (work?.affiliations ?? [])
      .forEach((affiliation) => {
        const normalizedAffiliationName = normalizedName(affiliation);
        if (!allAffiliationsTmp?.[normalizedAffiliationName]) {
          // Check matches in affiliation name
          let matches = affiliation?.match(regexp) ?? [];
          // Normalize matched strings
          matches = matches.map((match) => normalizedName(match));
          // Filter matches as unique
          matches = [...new Set(matches)];
          allAffiliationsTmp[normalizedAffiliationName] = {
            matches: matches.length,
            name: affiliation,
            nameHtml: affiliation.replace(regexp, '<b>$&</b>'),
            works: [],
          };
        }
        allAffiliationsTmp[normalizedAffiliationName].works.push(work.id);
      });
  });

  allAffiliationsTmp = Object.values(allAffiliationsTmp)
    .map((affiliation, index) => ({ ...affiliation, id: index.toString(), works: [...new Set(affiliation.works)], worksNumber: [...new Set(affiliation.works)].length }));
  return allAffiliationsTmp;
};

export {
  cleanId,
  groupByAffiliations,
  range,
};
