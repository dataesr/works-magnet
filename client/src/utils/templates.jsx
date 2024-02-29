/* eslint-disable react/no-danger */
/* eslint-disable react/no-array-index-key */
import { Badge } from '@dataesr/react-dsfr';
import { Tooltip } from 'react-tooltip';

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

const allIdsTemplate = (rowData) => {
  let html = '<ul>';
  rowData.allIds.forEach((id) => {
    html += `<li key="${id.id_value}">${id.id_type}:<br>`;
    const idLink = getIdLink(id.id_type, id.id_value);
    html += idLink ? `<a target="_blank" href="${idLink}">${id.id_value}</a>` : `<span>${id.id_value}</span>`;
    html += '</li>';
  });
  html += '</ul>';
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
};

//TODO: is there a way not to duplicate code : linkedDOITemplate and allIdsTemplate are the same but do not use the same field
const linkedDOITemplate = (rowData) => {
  let html = '<ul>';
  const publicationsLinked = rowData.fr_publications_linked || [];
  publicationsLinked.forEach((id) => {
    html += `<li key="${id.id_value}">${id.id_type}:<br>`;
    const idLink = getIdLink(id.id_type, id.id_value);
    html += idLink ? `<a target="_blank" href="${idLink}">${id.id_value}</a>` : `<span>${id.id_value}</span>`;
    html += '</li>';
  });
  html += '</ul>';
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
};

//TODO: is there a way not to duplicate code : linkedDOITemplate and allIdsTemplate are the same but do not use the same field
const worksExampleTemplate = (rowData) => {
  let html = '<ul>';
  rowData.worksExample.filter((e) => ['doi', 'hal_id', 'crossref', 'datacite'].includes(e.id_type)).slice(0, 5).forEach((id) => {
    html += `<li key="${id.id_value}">${id.id_type}:`;
    const idLink = getIdLink(id.id_type, id.id_value);
    html += idLink ? `<a target="_blank" href="${idLink}">${id.id_value}</a>` : `<span>${id.id_value}</span>`;
    html += '</li>';
  });
  html += '</ul>';
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
};

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

const getAffiliationsHtmlField = (rowData, regexp) => {
  let affiliations = (rowData?.affiliations ?? [])
    .map((a) => a.rawAffiliation)
    .sort((a, b) => (b.match(regexp)?.length ?? 0) - (a.match(regexp)?.length ?? 0))
    .map((affiliation) => affiliation.replace(regexp, '<b>$&</b>'))
    .filter((affiliation) => affiliation?.length ?? 0)
    .flat();
  affiliations = [...new Set(affiliations)];
  let html = `<ul data-tooltip-id="tooltip-affiliation-${rowData.id}">`;
  html += affiliations.slice(0, 3).map((affiliation, index) => `<li key="affilition-${index}">${affiliation}</li>`).join('');
  if (affiliations.length > 3) {
    html += `<li>and others (${affiliations.length - 3})</li>`;
  }
  html += '</ul>';
  return html;
};

const getAffiliationsTooltipField = (rowData) => {
  let html = '<ul>';
  html += rowData.affiliations?.map((affiliation, index) => `<li key="tooltip-affiliation-${rowData.id}-${index}">${affiliation.rawAffiliation}</li>`).join('');
  html += '</ul>';
  return html;
};

const getAllInfos = (rowData) => {
  const x = JSON.stringify(rowData);
  return x;
};

const nameTemplate = (rowData) => <span dangerouslySetInnerHTML={{ __html: rowData.nameHtml }} />;

const statusTemplate = (rowData) => <Badge text={status[rowData?.status ?? rowData]?.label} type={status[rowData?.status ?? rowData]?.badgeType} />;

const hasCorrectionTemplate = (rowData) => <Badge text={rowData.hasCorrection ? correction.corrected.label : correction.notcorrected.label} type={rowData.hasCorrection ? correction.corrected.badgeType : correction.notcorrected.badgeType} />;

export {
  affiliationsTemplate,
  allIdsTemplate,
  authorsTemplate,
  datasourceTemplate,
  frAuthorsTemplate,
  getAffiliationsHtmlField,
  getAffiliationsTooltipField,
  getAllInfos,
  hasCorrectionTemplate,
  linkedDOITemplate,
  linkedORCIDTemplate,
  nameTemplate,
  rorTemplate,
  statusTemplate,
  worksExampleTemplate,
};
