/* eslint-disable react/no-danger */
/* eslint-disable react/no-array-index-key */
import { Badge, Button } from '@dataesr/dsfr-plus';
import { MultiSelect } from 'primereact/multiselect';
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

const affiliations2Template = (rowData) => {
  let affiliationsHtml = `<ul data-tooltip-id="tooltip-affiliation-${rowData.id}">`;
  affiliationsHtml += rowData.affiliations
    .slice(0, 3)
    .map(
      (affiliation, index) => `<li class="ellipsis" key="affiliation-${rowData.id}-${index}">${affiliation}</li>`,
    )
    .join('');
  if (rowData.affiliations.length > 3) {
    affiliationsHtml += `<li class="ellipsis">and others (${
      rowData.affiliations.length - 3
    })</li>`;
  }
  affiliationsHtml += '</ul>';
  let affiliationsTooltip = '<ul>';
  affiliationsTooltip += rowData.affiliations
    .map(
      (affiliation, index) => `<li key="tooltip-affiliation-${rowData.id}-${index}">${affiliation}</li>`,
    )
    .join('');
  affiliationsTooltip += '</ul>';
  return (
    <>
      <span dangerouslySetInnerHTML={{ __html: affiliationsHtml }} />
      <Tooltip id={`tooltip-affiliation-${rowData.id}`}>
        <span dangerouslySetInnerHTML={{ __html: affiliationsTooltip }} />
      </Tooltip>
    </>
  );
};

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
    options={Object.values(status).map((item) => ({
      name: item.label,
      value: item.id,
    }))}
    placeholder="Any"
    style={{ maxWidth: '9rem', minWidth: '9rem' }}
    value={options.value}
  />
);

const getIdLinkDisplay = (idType, idValue) => {
  const idLink = getIdLink(idType, idValue);
  const html = idLink
    ? `<a href="${idLink}" target="_blank">${idValue}</a>`
    : `<span>${idValue}</span>`;
  return html;
};

const getIdsTemplate = (ids) => {
  let html = '<ul>';
  ids.forEach((id) => {
    if (['datacite', 'crossref'].includes(id.id_type)) {
      html += '';
    } else {
      html += `<li key="${id.id_value}"> `;
      html += getIdLinkDisplay(id.id_type, id.id_value);
      html += '</li>';
    }
  });
  html += '</ul>';
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
};

const doiTemplate = (data) => {
  const html = getIdLinkDisplay('doi', data.doi);
  return (
    <span
      className="d-block ellipsis"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

const allIdsTemplate = (rowData) => getIdsTemplate(rowData?.allIds ?? []);

const linkedDOITemplate = (rowData) => getIdsTemplate(rowData?.fr_publications_linked ?? []);

const worksExampleTemplate = (rowData) => getIdsTemplate(
  rowData?.worksExample
    ?.filter((e) => ['crossref', 'datacite', 'doi', 'hal_id', 'openalex']?.includes(
      e.id_type,
    ))
    ?.slice(0, 5) ?? [],
);

const linkedORCIDTemplate = (rowData) => {
  let html = '<ul>';
  const frOrcid = rowData.fr_authors_orcid || [];
  frOrcid.forEach((id) => {
    html += `<li key="${id.orcid}">`;
    const idLink = getIdLink('orcid', id.orcid);
    html += idLink
      ? `<a target="_blank" href="${idLink}">${id.name}</a>`
      : `<span>${id.name}</span>`;
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
    html += `<li key="${id.rorId}" class="fr-pb-2w list-none">`;
    html
      += '<img alt="ROR logo" class="vertical-middle" src="https://raw.githubusercontent.com/ror-community/ror-logos/main/ror-icon-rgb.svg" height="16" />';
    html += ` <a target="_blank" href="https://ror.org/${id.rorId}">https://ror.org/${id.rorId}</a>`;
    html += ` (${id.rorName} - ${id.rorCountry})`;
    html += '</li>';
  });
  html += '</ul>';
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
};

const authorsTemplate = (rowData) => {
  let authorsHtml = `<ul data-tooltip-id="tooltip-author-${rowData.id}">`;
  authorsHtml += rowData.authors
    .slice(0, 3)
    .map(
      (author, index) => `<li key="author-${rowData.id}-${index}">${author}</li>`,
    )
    .join('');
  if (rowData.authors.length > 3) {
    authorsHtml += `<li>et al. (${rowData.authors.length - 3})</li>`;
  }
  authorsHtml += '</ul>';
  let authorsTooltip = '<ul>';
  authorsTooltip += rowData.authors
    .map(
      (author, index) => `<li key="tooltip-author-${rowData.id}-${index}">${author}</li>`,
    )
    .join('');
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
  const html = `<ul>${rowData.datasource
    .map((source) => `<li key="source-${source}">${source}</li>`)
    .join('')}</ul>`;
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
};

const correctionTemplate = (rowData) => {
  let html = '';
  html = html.concat('<ul>');
  let rorsToCorrect = [];
  if (Array.isArray(rowData?.rorsToCorrect)) {
    rorsToCorrect = rowData.rorsToCorrect.map((item) => item.rorId);
  } else {
    rorsToCorrect = rowData.rorsToCorrect.split(';');
  }
  if (rorsToCorrect.length > 0) {
    rorsToCorrect.forEach((ror) => {
      html = html.concat(`<li key="ror-${ror}">${ror}</li>`);
    });
  }
  html = html.concat('</ul>');
  if (rowData.hasCorrection) {
    html = `<strong>${html}</strong>`;
  }
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
};

const nameTemplate = (rowData) => (
  <span dangerouslySetInnerHTML={{ __html: rowData.nameHtml }} />
);

const statusTemplate = (rowData) => (
  <Badge variant={status[rowData?.status ?? rowData]?.badgeType}>
    {status[rowData?.status ?? rowData]?.label}
  </Badge>
);

const hasCorrectionTemplate = (rowData, undo) => (rowData?.hasCorrection ? (
  <Button
    icon="arrow-go-back-line"
    onClick={() => undo(rowData.id)}
    size="sm"
    title="Undo changes"
    variant="info"
  />
) : (
  ''
));

export {
  affiliations2Template,
  affiliationsTemplate,
  allIdsTemplate,
  authorsTemplate,
  correctionTemplate,
  datasourceTemplate,
  doiTemplate,
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
