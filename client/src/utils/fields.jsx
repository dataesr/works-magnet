import { Link } from '@dataesr/react-dsfr';

import { getIdentifierLink } from './publications';

/* eslint-disable react/no-danger */
const affiliationsTemplate = (rowData) => <span dangerouslySetInnerHTML={{ __html: rowData.affiliations }} />;

const allIdsTemplate = (rowData) => (
  <ul>
    {rowData.allIds.map((id) => (
      <li key={id.id_value}>
        {id.id_type}
        :
        {' '}
        {getIdentifierLink(id.id_type, id.id_value)
          ? (
            <Link target="_blank" href={getIdentifierLink(id.id_type, id.id_value)}>
              {id.id_value}
            </Link>
          )
          : <span>{id.id_value}</span>}
      </li>
    ))}
  </ul>
);

const authorsTemplate = (rowData) => <span dangerouslySetInnerHTML={{ __html: rowData.authors }} />;

const getAffiliationsField = (item) => {
  if (item?.highlight?.['affiliations.name']) {
    let list = '<ul>';
    list += item.highlight['affiliations.name'].map((affiliation, index) => `<li key="affiliation-${index}">${affiliation}</li>`).join('');
    list += '</ul>';
    return list;
  }

  let affiliations = (item?.affiliations ?? [])
    .map((affiliation) => affiliation.name)
    .filter((affiliation) => affiliation.length > 0)
    .flat();
  affiliations = [...new Set(affiliations)];
  let list = '<ul>';
  list += affiliations.map((affiliation, index) => `<li key="affilition-${index}">${affiliation}</li>`).join('');
  list += '</ul>';
  return list;
};

const getAuthorsField = (item) => {
  if (item?.highlight?.['authors.full_name']) return item.highlight['authors.full_name'].join(';');

  const authors = (item?.authors ?? []);
  switch (authors.length) {
  case 0:
    return '';
  case 1:
    return authors[0].full_name;
  default:
    return `${authors[0].full_name} et al. (${authors.length - 1})`;
  }
};

export {
  affiliationsTemplate,
  allIdsTemplate,
  authorsTemplate,
  getAffiliationsField,
  getAuthorsField,
};
