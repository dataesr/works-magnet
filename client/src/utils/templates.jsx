/* eslint-disable react/no-danger */
/* eslint-disable react/no-array-index-key */
import { Badge } from '@dataesr/react-dsfr';
import { Tooltip } from 'react-tooltip';

import { getIdLink } from './works';
import { status } from '../config';

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

const datasourceTemplate = (rowData) => {
  const tmp = `<ul>${rowData.datasource.map((source) => `<li key="source-${source}">${source}</li>`).join('')}</ul>`;
  return <span dangerouslySetInnerHTML={{ __html: tmp }} />;
};

const getAffiliationsHtmlField = (rowData, regexp) => {
  let affiliations = (rowData?.affiliations ?? [])
    .sort((a, b) => (b.match(regexp)?.length ?? 0) - (a.match(regexp)?.length ?? 0))
    .map((affiliation) => affiliation.replace(regexp, '<b>$&</b>'))
    .filter((affiliation) => affiliation?.length ?? 0)
    .flat();
  affiliations = [...new Set(affiliations)];
  let html = `<ul data-tooltip-id="tooltip-affiliation-${rowData.id}">`;
  html += affiliations.slice(0, 3).map((affiliation, index) => `<li key="affilition-${index}">${affiliation}</li>`).join('');
  if (affiliations.length > 3) {
    html += `<li>et al. (${affiliations.length - 3})</li>`;
  }
  html += '</ul>';
  return html;
};

const getAffiliationsTooltipField = (rowData) => {
  let html = '<ul>';
  html += rowData.affiliations.map((affiliation, index) => `<li key="tooltip-affiliation-${rowData.id}-${index}">${affiliation}</li>`).join('');
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
  html += rowData.authors.slice(0, 3).map((author, index) => `<li key="author-${rowData.id}-${index}">${author}</li>`).join('');
  if (rowData.authors.length > 3) {
    html += `<li>et al. (${rowData.authors.length - 3})</li>`;
  }
  html += '</ul>';
  return html;
};

const getAuthorsTooltipField = (rowData) => {
  let html = '<ul>';
  html += rowData.authors.map((author, index) => `<li key="tooltip-author-${rowData.id}-${index}">${author}</li>`).join('');
  html += '</ul>';
  return html;
};

const nameTemplate = (rowData) => <span dangerouslySetInnerHTML={{ __html: rowData.nameHtml }} />;

const statusTemplate = (rowData) => <Badge text={status[rowData?.status ?? rowData]?.label} type={status[rowData?.status ?? rowData]?.badgeType} />;

export {
  affiliationsTemplate,
  allIdsTemplate,
  authorsTemplate,
  datasourceTemplate,
  getAffiliationsHtmlField,
  getAffiliationsTooltipField,
  getAllIdsHtmlField,
  getAuthorsHtmlField,
  getAuthorsTooltipField,
  nameTemplate,
  statusTemplate,
};
