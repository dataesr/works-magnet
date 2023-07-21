import { Link } from '@dataesr/react-dsfr';
import { Tooltip } from 'react-tooltip';

import { getIdentifierLink } from './publications';

// eslint-disable-next-line react/no-danger
const affiliationTemplate = (rowData) => <span dangerouslySetInnerHTML={{ __html: rowData.affiliations }} />;

const affiliationsTemplate = (rowData) => {
  if (rowData?.highlight?.['affiliations.name']) {
    let list = '<ul>';
    list += rowData.highlight['affiliations.name'].map((affiliation, index) => `<li key="affiliation-${index}">${affiliation}</li>`).join('');
    list += '</ul>';
    return list;
  }

  let affiliations = (rowData?.affiliations ?? [])
    .map((affiliation) => affiliation.name)
    .filter((affiliation) => affiliation.length > 0)
    .flat();
  affiliations = [...new Set(affiliations)];
  let list = '<ul>';
  list += affiliations.map((affiliation, index) => `<li key="affilition-${index}">${affiliation}</li>`).join('');
  list += '</ul>';
  return list;
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

const authorsTemplate = (rowData) => (
  <>
    {/* {if (item?.highlight?.['authors.full_name']) return item.highlight['authors.full_name'].join(';');} */}
    <ul data-tooltip-id={`tooltip-author-${rowData.id}`}>
      {rowData.authors.slice(0, 3).map((author, index) => (
        // eslint-disable-next-line react/no-array-index-key
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

export {
  affiliationTemplate,
  affiliationsTemplate,
  allIdsTemplate,
  authorsTemplate,
};
