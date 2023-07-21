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

const allIdsTemplate = (rowData) => <span dangerouslySetInnerHTML={{ __html: rowData.allIdsHtml }} />;

const authorsTemplate = (rowData) => (
  <>
    <span dangerouslySetInnerHTML={{ __html: rowData.authorsHtml }} />
    <Tooltip id={`tooltip-author-${rowData.identifier}`} place="right">
      <span dangerouslySetInnerHTML={{ __html: rowData.authorsTooltip }} />
    </Tooltip>
  </>
);

const getAllIdsHtmlField = (rowData) => {
  let html = '<ul>';
  rowData.allIds.forEach((id) => {
    html += `<li key="${id.id_value}">`;
    html += id.id_type;
    html += ': ';
    const identifierLink = getIdentifierLink(id.id_type, id.id_value);
    if (identifierLink) {
      html += `<a target="_blank" href="${identifierLink}">`;
      html += id.id_value;
      html += '</a>';
    } else {
      html += `<span>${id.id_value}</span>`;
    }
    html += '</li>';
  });
  html += '</ul>';
  return html;
};

const getAuthorsHtmlField = (rowData) => {
  if (rowData?.highlight?.['authors.full_name']) {
    const authors = rowData.highlight['authors.full_name'];
    let html = `<ul data-tooltip-id="tooltip-author-${rowData.identifier}">`;
    authors.slice(0, 3).forEach((author, index) => {
      html += `<li key="author-${rowData.identifier}-${index}">`;
      html += author;
      html += '</li>';
    });
    if (authors.length > 3) {
      html += `<li>et al. (${authors.length - 3})</li>`;
    }
    html += '</ul>';
    return html;
  }
  let html = `<ul data-tooltip-id="tooltip-author-${rowData.identifier}">`;
  rowData.authors.slice(0, 3).forEach((author, index) => {
    html += `<li key="author-${rowData.identifier}-${index}">`;
    html += author.full_name;
    html += '</li>';
  });
  if (rowData.authors.length > 3) {
    html += `<li>et al. (${rowData.authors.length - 3})</li>`;
  }
  html += '</ul>';
  return html;
};

const getAuthorsTooltipField = (rowData) => {
  if (rowData?.highlight?.['authors.full_name']) {
    let html = '<ul>';
    rowData.highlight['authors.full_name'].forEach((author, index) => {
      html += `<li key="tooltip-author-${rowData.identifier}-${index}">`;
      html += author;
      html += '</li>';
    });
    html += '</ul>';
    return html;
  }
  let html = '<ul>';
  rowData.authors.forEach((author, index) => {
    html += `<li key="tooltip-author-${rowData.identifier}-${index}">`;
    html += author.full_name;
    html += '</li>';
  });
  html += '</ul>';
  return html;
};

export {
  affiliationTemplate,
  affiliationsTemplate,
  allIdsTemplate,
  authorsTemplate,
  getAllIdsHtmlField,
  getAuthorsHtmlField,
  getAuthorsTooltipField,
};
