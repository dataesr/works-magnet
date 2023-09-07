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

const getAffiliationName = (affiliation) => {
  let affiliationName = affiliation.name;
  if (affiliation?.ror) {
    let ror = '';
    if (Array.isArray(affiliation.ror)) {
      ror = affiliation.ror.map((_ror) => _ror.replace('https://ror.org/', '')).join(' ');
    } else {
      ror = affiliation.ror.replace('https://ror.org/', '');
    }
    affiliationName += ` ${ror}`;
  }
  return affiliationName;
};

const getAffiliationsHtmlField = (rowData, regexp) => {
  let affiliations = (rowData?.affiliations ?? [])
    .filter((affiliation) => Object.keys(affiliation).length)
    .map((affiliation) => getAffiliationName(affiliation).replace(regexp, '<b>$&</b>'))
    .filter((affiliation) => affiliation.length)
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

const nameTemplate = (rowData) => <span dangerouslySetInnerHTML={{ __html: rowData.nameHtml }} />;

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

const typeFilterTemplate = (options) => (
  <Dropdown
    className="p-column-filter"
    onChange={(e) => options.filterApplyCallback(e.value)}
    options={['book-chapter', 'comm', 'dataset', 'image', 'journal-article', 'other', 'physicalobject', 'preprint', 'proceedings-article', 'text', 'thesis']}
    placeholder="Type"
    style={{ width: '5rem', overflow: 'scroll' }}
    showClear
    value={options.value}
  />
);

export {
  affiliationsTemplate,
  allIdsTemplate,
  authorsTemplate,
  getAffiliationsHtmlField,
  getAffiliationName,
  getAllIdsHtmlField,
  getAuthorsHtmlField,
  getAuthorsTooltipField,
  nameTemplate,
  sourcesFilterTemplate,
  statusFilterTemplate,
  statusTemplate,
  typeFilterTemplate,
};
