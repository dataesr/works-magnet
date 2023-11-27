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

export {
  cleanId,
  getRegexpFromOptions,
  normalizedName,
  range,
};
