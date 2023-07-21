/* eslint-disable react/no-danger */
/* eslint-disable react/no-array-index-key */
import { Link } from '@dataesr/react-dsfr';
import { Tooltip } from 'react-tooltip';

import { getIdentifierLink } from './publications';

const affiliationTemplate = (rowData) => <span dangerouslySetInnerHTML={{ __html: rowData.affiliations }} />;

const affiliationsTemplate = (rowData) => {
  const highlights = [
    ...(rowData?.highlight?.['affiliations.grid'] ?? []),
    ...(rowData?.highlight?.['affiliations.name'] ?? []),
    ...(rowData?.highlight?.['affiliations.rnsr'] ?? []),
    ...(rowData?.highlight?.['affiliations.ror'] ?? []),
    ...(rowData?.highlight?.['affiliations.structId'] ?? []),
    ...(rowData?.highlight?.['affiliations.viaf'] ?? []),
  ];
  if (highlights.length > 0) {
    return (
      <ul>
        {highlights.map((highlight, index) => (
          <li key={`highlight-${index}`}>
            <span dangerouslySetInnerHTML={{ __html: highlight }} />
          </li>
        ))}
      </ul>
    );
  }

  let affiliations = (rowData?.affiliations ?? [])
    .map((affiliation) => affiliation.name)
    .filter((affiliation) => affiliation.length > 0)
    .flat();
  affiliations = [...new Set(affiliations)];
  return (
    <ul>
      {affiliations.map((affiliation, index) => (
        <li key={`affilition-${index}`}>
          {affiliation}
        </li>
      ))}
    </ul>
  );
};

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

const authorsTemplate = (rowData) => {
  if (rowData?.highlight?.['authors.full_name']) {
    return (
      <ul>
        {rowData?.highlight?.['authors.full_name'].slice(0, 3).map((author, index) => (
          <li key={`author-${rowData.identifier}-${index}`}>
            <span dangerouslySetInnerHTML={{ __html: author }} />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <>
      <ul data-tooltip-id={`tooltip-author-${rowData.identifier}`}>
        {rowData.authors.slice(0, 3).map((author, index) => (
          <li key={`author-${rowData.identifier}-${index}`}>
            {author.full_name}
          </li>
        ))}
        {(rowData.authors.length > 3) && (
          <li>
            et al. (
            {rowData.authors.length - 3}
            )
          </li>
        )}
      </ul>
      <Tooltip id={`tooltip-author-${rowData.identifier}`} place="right">
        <ul>
          {rowData.authors.map((author) => (
            <li key={`author-all-${author.full_name}`}>
              {author.full_name}
            </li>
          ))}
        </ul>
      </Tooltip>
    </>
  );
};

export {
  affiliationTemplate,
  affiliationsTemplate,
  allIdsTemplate,
  authorsTemplate,
};
