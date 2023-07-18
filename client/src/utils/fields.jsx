/* eslint-disable react/no-danger */

const getAffiliationsField = (item) => {
  if (item?.highlight?.['affiliations.name']) {
    let list = '<ul>';
    list += item.highlight['affiliations.name'].map((affiliation) => `<li>${affiliation}</li>`).join('');
    list += '</ul>';
    return list;
  }

  let affiliations = (item?.affiliations ?? [])
    .map((affiliation) => affiliation.name)
    .filter((affiliation) => affiliation.length > 0)
    .flat();
  affiliations = [...new Set(affiliations)];
  let list = '<ul>';
  list += affiliations.map((affiliation) => `<li>${affiliation}</li>`).join('');
  list += '</ul>';
  return list;
};

const getAuthorsField = (item) => {
  if (item?.highlight?.['authors.full_name']) return item.highlight['authors.full_name'].join(';');
  if (item.authors === undefined) return '';

  const { authors = [] } = item;
  if (authors.length === 0) return '';
  if (authors.length === 1) return authors[0].full_name;
  return `${authors[0].full_name} et al. (${authors.length - 1})`;
};

const affiliationsTemplate = (rowData) => <span dangerouslySetInnerHTML={{ __html: rowData.affiliations }} />;

const authorsTemplate = (rowData) => <span dangerouslySetInnerHTML={{ __html: rowData.authors }} />;

export {
  affiliationsTemplate,
  authorsTemplate,
  getAffiliationsField,
  getAuthorsField,
};
