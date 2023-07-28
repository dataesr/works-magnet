/* eslint-disable react/no-danger */
/* eslint-disable react/no-array-index-key */
import { Badge } from '@dataesr/react-dsfr';
import { Tooltip } from 'react-tooltip';
import { Dropdown } from 'primereact/dropdown';

import { getIdLink } from './publications';

const affiliationsTemplate = (rowData) => <span dangerouslySetInnerHTML={{ __html: rowData.affiliationsHtml }} />;

const allIdsTemplate = (rowData) => <span dangerouslySetInnerHTML={{ __html: rowData.allIdsHtml }} />;

const authorsTemplate = (rowData) => (
  <>
    <span dangerouslySetInnerHTML={{ __html: rowData.authorsHtml }} />
    <Tooltip id={`tooltip-author-${rowData.id}`} place="right">
      <span dangerouslySetInnerHTML={{ __html: rowData.authorsTooltip }} />
    </Tooltip>
  </>
);

const getAffiliationsHtmlField = (rowData) => {
  const highlights = [
    ...(rowData?.highlight?.['affiliations.grid'] ?? []),
    ...(rowData?.highlight?.['affiliations.name'] ?? []),
    ...(rowData?.highlight?.['affiliations.rnsr'] ?? []),
    ...(rowData?.highlight?.['affiliations.ror'] ?? []),
    ...(rowData?.highlight?.['affiliations.structId'] ?? []),
    ...(rowData?.highlight?.['affiliations.viaf'] ?? []),
  ];
  if (highlights.length > 0) {
    let html = '<ul>';
    highlights.forEach((highlight, index) => {
      html += `<li key="highlight-${index}">`;
      html += highlight;
      html += '</li>';
    });
    html += '</ul>';
    return html;
  }

  let affiliations = (rowData?.affiliations ?? [])
    .map((affiliation) => affiliation.name)
    .filter((affiliation) => affiliation.length > 0)
    .flat();
  affiliations = [...new Set(affiliations)];
  let html = '<ul>';
  affiliations.forEach((affiliation, index) => {
    html += `<li key=affilition-${index}>`;
    html += affiliation;
    html += '</li>';
  });
  html += '</ul>';
  return html;
};

const getAllIdsHtmlField = (rowData) => {
  let html = '<ul>';
  rowData.allIds.forEach((id) => {
    html += `<li key="${id.id_value}">`;
    html += id.id_type;
    html += ': ';
    const idLink = getIdLink(id.id_type, id.id_value);
    if (idLink) {
      html += `<a target="_blank" href="${idLink}">`;
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
    let html = `<ul data-tooltip-id="tooltip-author-${rowData.id}">`;
    authors.slice(0, 3).forEach((author, index) => {
      html += `<li key="author-${rowData.id}-${index}">`;
      html += author;
      html += '</li>';
    });
    if (authors.length > 3) {
      html += `<li>et al. (${authors.length - 3})</li>`;
    }
    html += '</ul>';
    return html;
  }
  let html = `<ul data-tooltip-id="tooltip-author-${rowData.id}">`;
  rowData.authors.slice(0, 3).forEach((author, index) => {
    html += `<li key="author-${rowData.id}-${index}">`;
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
      html += `<li key="tooltip-author-${rowData.id}-${index}">`;
      html += author;
      html += '</li>';
    });
    html += '</ul>';
    return html;
  }
  let html = '<ul>';
  rowData.authors.forEach((author, index) => {
    html += `<li key="tooltip-author-${rowData.id}-${index}">`;
    html += author.full_name;
    html += '</li>';
  });
  html += '</ul>';
  return html;
};

const nameTemplate = (rowData) => <span dangerouslySetInnerHTML={{ __html: rowData.name }} />;

const getStatusType = (status) => {
  let type;
  switch (status) {
  case 'keep':
    type = 'success';
    break;
  case 'exclude':
    type = 'error';
    break;
  default:
    type = 'info';
    break;
  }
  return type;
};

const statusTemplate = (rowData) => <Badge text={rowData?.status ?? rowData} type={getStatusType(rowData?.status ?? rowData)} />;

const statusFilterTemplate = (options) => (
  <Dropdown
    className="p-column-filter"
    itemTemplate={statusTemplate}
    onChange={(e) => options.filterApplyCallback(e.value)}
    options={['exclude', 'keep', 'sort']}
    placeholder="Select One"
    showClear
    style={{ minWidth: '12rem' }}
    value={options.value}
  />
);

export {
  affiliationsTemplate,
  allIdsTemplate,
  authorsTemplate,
  getAffiliationsHtmlField,
  getAllIdsHtmlField,
  getAuthorsHtmlField,
  getAuthorsTooltipField,
  nameTemplate,
  statusFilterTemplate,
  statusTemplate,
};
