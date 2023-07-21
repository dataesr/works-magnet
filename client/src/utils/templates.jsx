/* eslint-disable react/no-danger */
/* eslint-disable react/no-array-index-key */
import { Link } from '@dataesr/react-dsfr';
import { Tooltip } from 'react-tooltip';

import { getIdentifierLink } from './publications';

const affiliationTemplate = (rowData) => <span dangerouslySetInnerHTML={{ __html: rowData.affiliations }} />;

const affiliationsTemplate = (rowData) => {
  if (rowData?.highlight?.['affiliations.name']) {
    return (
      <ul>
        {rowData.highlight['affiliations.name'].map((affiliation, index) => (
          <li key={`affiliation-${index}`}>
            <span dangerouslySetInnerHTML={{ __html: affiliation }} />
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
          <li key={`author-${rowData.id}-${index}`}>
            <span dangerouslySetInnerHTML={{ __html: author }} />
          </li>
        ))}
      </ul>
    );
  }
  return (
    <>
      <ul data-tooltip-id={`tooltip-author-${rowData.id}`}>
        {rowData.authors.slice(0, 3).map((author, index) => (
          <li key={`author-${rowData.id}-${index}`}>
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
      <Tooltip id={`tooltip-author-${rowData.id}`} place="right">
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
