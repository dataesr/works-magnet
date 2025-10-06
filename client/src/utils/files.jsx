import Papa from 'papaparse';

import { status } from '../config';

const hashCode = (str) => {
  let hash = 0;
  if (str.length === 0) return hash;
  for (let i = 0; i < str.length; i += 1) {
    const chr = str.charCodeAt(i);
    // eslint-disable-next-line no-bitwise
    hash = ((hash << 5) - hash) + chr;
    // eslint-disable-next-line no-bitwise
    hash |= 0; // Convert to 32bit integer
  }
  // return positive numbers only
  return hash + 2147483647 + 1;
};

const getFileName = ({ extension, label, searchParams }) => {
  let fileName = 'works_magnet';
  fileName += label ? `_${label.replace(' ', '')}` : '';
  fileName += `_${Date.now()}`;
  if (searchParams.get('startYear')) fileName += `_${searchParams.get('startYear')}`;
  if (searchParams.get('endYear')) fileName += `_${searchParams.get('endYear')}`;
  if (searchParams.get('affiliations')) fileName += `_${hashCode(searchParams.get('affiliations'))}`;
  fileName += `.${extension}`;
  return fileName;
};

const export2FosmCsv = ({ data, label, searchParams }) => {
  // For publications, DOI from Datacite will be ignored as it is not supported in the FOSM
  let idsToExport = ['doi', 'hal_id', 'nnt_id', 'openalex'];
  // For datasets
  if (label === 'datasets') {
    idsToExport = ['doi'];
  }
  const rows = data
    .filter((publication) => publication.status === status.validated.id)
    .map((publication) => {
      const row = [];
      idsToExport.forEach((currentId) => {
        const elt = publication.allIds.filter((id) => id.id_type === currentId);
        if (elt.length) {
          row.push(elt[0].id_value);
        } else {
          row.push('');
        }
      });
      return row;
    });
  const csvFile = Papa.unparse([idsToExport, ...rows], { skipEmptyLines: 'greedy' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([csvFile], { type: 'text/csv;charset=utf-8' }));
  link.setAttribute('download', getFileName({ extension: 'csv', label: label.concat('_bso'), searchParams }));
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  // Count lines in the CSV file
  return csvFile.split('\n').length;
};

const export2Csv = ({ data, label, searchParams, transform }) => {
  // Deep copy of data
  let dataCopy = JSON.parse(JSON.stringify(data));
  dataCopy = transform(dataCopy);
  const deletedFields = ['affiliations', 'affiliationsHtml', 'affiliationsTooltip', 'allIds', 'allInfos', 'authors', 'datasource', 'id', 'hasCorrection', 'key', 'nameHtml', 'selected'];
  const stringifiedFields = ['addList', 'fr_authors_orcid', 'fr_publications_linked', 'removeList', 'rors', 'rorsInOpenAlex', 'rorsToCorrect', 'worksExample'];
  dataCopy.forEach((work) => {
    // Extract all IDs first
    const idMap = {};
    work.allIds?.forEach((id) => {
      idMap[id.id_type] = id.id_value;
    });

    // Initialize all potential ID columns to ensure they appear in CSV
    work.doi = '';
    work.crossref = '';
    work.datacite = '';
    work.hal_id = '';
    work.openalex = '';
    work.nnt_id = '';

    // Apply DOI priority logic: if DOI exists and equals crossref or datacite, remove the duplicates
    if (idMap.doi) {
      work.doi = idMap.doi;
      if (idMap.crossref === idMap.doi) {
        // Don't set crossref, keep it empty
      } else if (idMap.crossref) {
        work.crossref = idMap.crossref;
      }
      if (idMap.datacite === idMap.doi) {
        // Don't set datacite, keep it empty
      } else if (idMap.datacite) {
        work.datacite = idMap.datacite;
      }
    } else {
      // No DOI, add crossref and datacite if they exist
      if (idMap.crossref) work.crossref = idMap.crossref;
      if (idMap.datacite) work.datacite = idMap.datacite;
    }

    // Add other IDs
    if (idMap.hal_id) work.hal_id = idMap.hal_id;
    if (idMap.openalex) work.openalex = idMap.openalex;
    if (idMap.nnt_id) work.nnt_id = idMap.nnt_id;

    deletedFields.forEach((field) => delete work[field]);
    stringifiedFields.forEach((field) => {
      if ((work?.[field] ?? []).length > 0) {
        work[field] = JSON.stringify(work[field]);
      }
    });
  });
  const csvFile = Papa.unparse(dataCopy, { skipEmptyLines: 'greedy' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([csvFile], { type: 'text/csv;charset=utf-8' }));
  const fileName = getFileName({ extension: 'csv', label, searchParams });
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const export2json = ({ data, label, searchParams }) => {
  // Deep copy of data
  const dataCopy = JSON.parse(JSON.stringify(data));
  dataCopy.forEach((work) => {
    delete work.allInfos;
  });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([JSON.stringify(dataCopy, null, 2)], { type: 'application/json' }));
  const fileName = getFileName({ extension: 'json', label, searchParams });
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const export2jsonl = ({ data, label, searchParams }) => {
  // Deep copy of data
  const dataCopy = JSON.parse(JSON.stringify(data));
  dataCopy.forEach((work) => {
    delete work.allInfos;
  });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([dataCopy.map(JSON.stringify).join('\n')], { type: 'application/jsonl+json' }));
  const fileName = getFileName({ extension: 'jsonl', label, searchParams });
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const importJson = (e, tagAffiliations) => {
  const fileReader = new FileReader();
  fileReader.readAsText(e.target.files[0], 'UTF-8');
  fileReader.onload = (f) => {
    const affiliations = JSON.parse(f.target.result);
    const validatedAffiliations = affiliations.filter((decidedAffiliation) => decidedAffiliation.status === status.validated.id);
    if (validatedAffiliations.length > 0) tagAffiliations(validatedAffiliations, status.validated.id);
    const excludedAffiliations = affiliations.filter((decidedAffiliation) => decidedAffiliation.status === status.excluded.id);
    if (excludedAffiliations.length > 0) tagAffiliations(excludedAffiliations, status.excluded.id);
  };
};

export {
  export2Csv,
  export2FosmCsv,
  export2json,
  export2jsonl,
  importJson,
};
