/* eslint-disable react/no-danger */
/* eslint-disable react/no-array-index-key */
import { Badge } from '@dataesr/react-dsfr';
import { Dropdown } from 'primereact/dropdown';
import { Tooltip } from 'react-tooltip';

import { getIdLink } from './works';

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
  let affiliations = (rowData?.affiliations ?? [])
    .map((affiliation) => affiliation.name)
    .filter((affiliation) => affiliation.length > 0)
    .flat();
  affiliations = [...new Set(affiliations)];
  let html = '<ul>';
  html += affiliations.map((affiliation, index) => `<li key=affilition-${index}>${affiliation}</li>`);
  html += '</ul>';
  return html;
};

const getAllIdsHtmlField = (rowData) => {
  let html = '<ul>';
  rowData.allIds.forEach((id) => {
    html += `<li key="${id.id_value}">${id.id_type}: `;
    const idLink = getIdLink(id.id_type, id.id_value);
    html += idLink ? `<a target="_blank" href="${idLink}">${id.id_value}</a>` : `<span>${id.id_value}</span>`;
    html += '</li>';
  });
  html += '</ul>';
  return html;
};

const getAuthorsHtmlField = (rowData) => {
  let html = `<ul data-tooltip-id="tooltip-author-${rowData.id}">`;
  html += rowData.authors.slice(0, 3).map((author, index) => `<li key="author-${rowData.id}-${index}">${author.full_name}</li>`);
  if (rowData.authors.length > 3) {
    html += `<li>et al. (${rowData.authors.length - 3})</li>`;
  }
  html += '</ul>';
  return html;
};

const getAuthorsTooltipField = (rowData) => {
  let html = '<ul>';
  html += rowData.authors.map((author, index) => `<li key="tooltip-author-${rowData.id}-${index}">${author.full_name}</li>`);
  html += '</ul>';
  return html;
};

const nameTemplate = (rowData) => <span dangerouslySetInnerHTML={{ __html: rowData.name }} />;

const getBadgeTypeByStatus = (status) => {
  let type;
  switch (status) {
  case 'validated':
    type = 'success';
    break;
  case 'excluded':
    type = 'error';
    break;
  default:
    type = 'info';
    break;
  }
  return type;
};

const statusTemplate = (rowData) => <Badge text={rowData?.status ?? rowData} type={getBadgeTypeByStatus(rowData?.status ?? rowData)} />;

const statusFilterTemplate = (options) => (
  <Dropdown
    className="p-column-filter"
    itemTemplate={statusTemplate}
    onChange={(e) => options.filterApplyCallback(e.value)}
    options={['to be decided', 'validated', 'excluded']}
    placeholder=""
    style={{ width: '6rem' }}
    showClear
    value={options.value}
  />
);

const genreFilterTemplate = (options) => (
  <Dropdown
    className="p-column-filter"
    onChange={(e) => options.filterApplyCallback(e.value)}
    options={['journal-article', 'proceedings', 'book-chapter', 'book', 'dataset', 'preprint', 'other']}
    placeholder="Type"
    style={{ width: '5rem', overflow: 'scroll' }}
    showClear
    value={options.value}
  />
);

const sourcesFilterTemplate = (options) => (
  <Dropdown
    className="p-column-filter"
    onChange={(e) => options.filterApplyCallback(e.value)}
    options={['bso', 'openalex']}
    placeholder=""
    showClear
    style={{ width: '3rem' }}
    value={options.value}
  />
);

export {
  affiliationsTemplate,
  allIdsTemplate,
  authorsTemplate,
  genreFilterTemplate,
  getAffiliationsHtmlField,
  getAllIdsHtmlField,
  getAuthorsHtmlField,
  getAuthorsTooltipField,
  nameTemplate,
  sourcesFilterTemplate,
  statusFilterTemplate,
  statusTemplate,
};
