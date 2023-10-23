/* eslint-disable react/no-danger */
/* eslint-disable react/no-array-index-key */
import { Badge } from '@dataesr/react-dsfr';
import { Dropdown } from 'primereact/dropdown';
import { Tooltip } from 'react-tooltip';

import { getIdLink } from './works';

const affiliationsTemplate = (rowData) => (
  <>
    <span dangerouslySetInnerHTML={{ __html: rowData.affiliationsHtml }} />
    <Tooltip id={`tooltip-affiliation-${rowData.id}`}>
      <span dangerouslySetInnerHTML={{ __html: rowData.affiliationsTooltip }} />
    </Tooltip>
  </>
);

const allIdsTemplate = (rowData) => <span dangerouslySetInnerHTML={{ __html: rowData.allIdsHtml }} />;

const authorsTemplate = (rowData) => (
  <>
    <span dangerouslySetInnerHTML={{ __html: rowData.authorsHtml }} />
    <Tooltip id={`tooltip-author-${rowData.id}`}>
      <span dangerouslySetInnerHTML={{ __html: rowData.authorsTooltip }} />
    </Tooltip>
  </>
);

const getAffiliationRor = (affiliation) => {
  if (!affiliation?.ror) return undefined;
  if (Array.isArray(affiliation.ror)) return affiliation.ror.map((ror) => (ror.startsWith('https') ? ror : `https://ror.org/${ror}`)).join(' ');
  if (!affiliation.ror.startsWith('https')) return `https://ror.org/${affiliation.ror}`;
  return affiliation.ror;
};

const getAffiliationsHtmlField = (rowData, regexp) => {
  let affiliations = (rowData?.affiliations ?? [])
    .filter((affiliation) => Object.keys(affiliation).length && affiliation?.name)
    .sort((a, b) => (b.name.match(regexp)?.length ?? 0) - (a.name.match(regexp)?.length ?? 0))
    .map((affiliation) => affiliation.name.replace(regexp, '<b>$&</b>'))
    .filter((affiliation) => affiliation?.length ?? 0)
    .flat();
  affiliations = [...new Set(affiliations)];
  let html = `<ul data-tooltip-id="tooltip-affiliation-${rowData.id}">`;
  html += affiliations.slice(0, 3).map((affiliation, index) => `<li key=affilition-${index}>${affiliation}</li>`).join('');
  if (affiliations.length > 3) {
    html += `<li>et al. (${affiliations.length - 3})</li>`;
  }
  html += '</ul>';
  return html;
};

const getAffiliationsTooltipField = (rowData) => {
  let html = '<ul>';
  html += rowData.affiliations.map((affiliation, index) => `<li key="tooltip-affiliation-${rowData.id}-${index}">${affiliation.name}</li>`).join('');
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
  html += rowData.authors.slice(0, 3).map((author, index) => `<li key="author-${rowData.id}-${index}">${author.full_name}</li>`).join('');
  if (rowData.authors.length > 3) {
    html += `<li>et al. (${rowData.authors.length - 3})</li>`;
  }
  html += '</ul>';
  return html;
};

const getAuthorsTooltipField = (rowData) => {
  let html = '<ul>';
  html += rowData.authors.map((author, index) => `<li key="tooltip-author-${rowData.id}-${index}">${author.full_name}</li>`).join('');
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

export {
  affiliationsTemplate,
  allIdsTemplate,
  authorsTemplate,
  getAffiliationRor,
  getAffiliationsHtmlField,
  getAffiliationsTooltipField,
  getAllIdsHtmlField,
  getAuthorsHtmlField,
  getAuthorsTooltipField,
  nameTemplate,
  statusFilterTemplate,
  statusTemplate,
};
