/* eslint-disable react/no-danger */
/* eslint-disable react/no-array-index-key */
import { Badge } from '@dataesr/dsfr-plus';
import { Tooltip } from 'react-tooltip';
import { MultiSelect } from 'primereact/multiselect';

import { getIdLink } from './works';
import { correction, status } from '../config';

const affiliationsTemplate = (rowData) => (
  <>
    <span dangerouslySetInnerHTML={{ __html: rowData.affiliationsHtml }} />
    <Tooltip id={`tooltip-affiliation-${rowData.id}`}>
      <span dangerouslySetInnerHTML={{ __html: rowData.affiliationsTooltip }} />
    </Tooltip>
  </>
);

const statusesItemTemplate = (option) => (
  <div className="flex align-items-center gap-2">
    <span>{option.name}</span>
  </div>
);

const statusRowFilterTemplate = (options) => (
  <MultiSelect
    className="p-column-filter"
    itemTemplate={statusesItemTemplate}
    maxSelectedLabels={1}
    onChange={(e) => options.filterApplyCallback(e.value)}
    optionLabel="name"
    options={Object.values(status).map((item) => ({ name: item.label, value: item.id }))}
    placeholder="Any"
    style={{ maxWidth: '9rem', minWidth: '9rem' }}
    value={options.value}
  />
);

const getIdsTemplate = (ids) => {
  let html = '<ul>';
  ids.forEach((id) => {
    html += `<li key="${id.id_value}">${id.id_type}: `;
    const idLink = getIdLink(id.id_type, id.id_value);
    html += idLink ? `<a target="_blank" href="${idLink}">${id.id_value}</a>` : `<span>${id.id_value}</span>`;
    html += '</li>';
  });
  html += '</ul>';
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
};

const allIdsTemplate = (rowData) => getIdsTemplate(rowData?.allIds ?? []);

const linkedDOITemplate = (rowData) => getIdsTemplate(rowData?.fr_publications_linked ?? []);

const worksExampleTemplate = (rowData) => getIdsTemplate(rowData?.worksExample?.filter((e) => ['doi', 'hal_id', 'crossref', 'datacite']?.includes(e.id_type))?.slice(0, 5) ?? []);

const linkedORCIDTemplate = (rowData) => {
  let html = '<ul>';
  const frOrcid = rowData.fr_authors_orcid || [];
  frOrcid.forEach((id) => {
    html += `<li key="${id.orcid}">`;
    const idLink = getIdLink('orcid', id.orcid);
    html += idLink ? `<a target="_blank" href="${idLink}">${id.name}</a>` : `<span>${id.name}</span>`;
    html += '</li>';
  });
  html += '</ul>';
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
};

const frAuthorsTemplate = (rowData) => {
  let html = '<ul>';
  const frAuthors = rowData.fr_authors_name || [];
  frAuthors.forEach((id) => {
    html += `<li key="${id}">`;
    html += `<span>${id}</span>`;
    html += '</li>';
  });
  html += '</ul>';
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
};

const rorTemplate = (rowData) => {
  let html = '<ul>';
  rowData.rors.forEach((id) => {
    html += `<li key="${id.rorId}">ror: `;
    const idLink = 'https://ror.org/'.concat(id.rorId);
    html += idLink ? `<a target="_blank" href="${idLink}">${id.rorId} (${id.rorName} - ${id.rorCountry})</a>` : `<span>${id.rorId}</span>`;
    html += '</li>';
  });
  html += '</ul>';
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
};

const authorsTemplate = (rowData) => {
  let authorsHtml = `<ul data-tooltip-id="tooltip-author-${rowData.id}">`;
  authorsHtml += rowData.authors.slice(0, 3).map((author, index) => `<li key="author-${rowData.id}-${index}">${author}</li>`).join('');
  if (rowData.authors.length > 3) {
    authorsHtml += `<li>et al. (${rowData.authors.length - 3})</li>`;
  }
  authorsHtml += '</ul>';
  let authorsTooltip = '<ul>';
  authorsTooltip += rowData.authors.map((author, index) => `<li key="tooltip-author-${rowData.id}-${index}">${author}</li>`).join('');
  authorsTooltip += '</ul>';
  return (
    <>
      <span dangerouslySetInnerHTML={{ __html: authorsHtml }} />
      <Tooltip id={`tooltip-author-${rowData.id}`}>
        <span dangerouslySetInnerHTML={{ __html: authorsTooltip }} />
      </Tooltip>
    </>
  );
};

const datasourceTemplate = (rowData) => {
  const html = `<ul>${rowData.datasource.map((source) => `<li key="source-${source}">${source}</li>`).join('')}</ul>`;
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
};

const correctionTemplate = (rowData) => {
  let html = '';
  const rorsToCorrect = rowData.rorsToCorrect.split(';').map((item) => item.trim()).filter((item) => item.length > 0);
  if (rorsToCorrect.length > 0) {
    html = html.concat('<ul>');
    rorsToCorrect.forEach((ror) => {
      html = html.concat(`<li key="ror-${ror}">${ror}</li>`);
    });
    html = html.concat('</ul>');
    if (rowData.hasCorrection) {
      html = `<strong>${ html }</strong>`;
    }
  }
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
};

const nameTemplate = (rowData) => <span dangerouslySetInnerHTML={{ __html: rowData.nameHtml }} />;

const statusTemplate = (rowData) => <Badge variant={status[rowData?.status ?? rowData]?.badgeType}>{status[rowData?.status ?? rowData]?.label}</Badge>;

const hasCorrectionTemplate = (rowData) => (rowData?.hasCorrection
  ? <Badge variant={correction.corrected.badgeType}>{correction.corrected.label}</Badge>
  : '');

export {
  affiliationsTemplate,
  allIdsTemplate,
  authorsTemplate,
  correctionTemplate,
  datasourceTemplate,
  frAuthorsTemplate,
  hasCorrectionTemplate,
  linkedDOITemplate,
  linkedORCIDTemplate,
  nameTemplate,
  rorTemplate,
  statusRowFilterTemplate,
  statusTemplate,
  worksExampleTemplate,
};
