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
  let fileName = 'works_finder';
  fileName += label ? `_${label.replace(' ', '')}` : '';
  fileName += `_${hashCode(searchParams.get('affiliations'))}`;
  fileName += `_${searchParams.get('startYear')}`;
  fileName += `_${searchParams.get('endYear')}`;
  fileName += `_${Date.now()}`;
  fileName += `.${extension}`;
  return fileName;
};

const export2FosmCsv = ({ data: allPublications }) => {
  const csvHeader = ['doi', 'hal_id', 'nnt_id'].join(';');
  const validatedPublications = allPublications.filter((publication) => publication.status === status.validated.id);
  const getValue = (row, idType) => {
    if (!row) return '';
    if (row.doi && idType === 'doi') return row.doi;
    return row.allIds.find((id) => id.id_type === idType)?.id_value || '';
  };

  const csvContent = validatedPublications.map((row) => {
    const doi = getValue(row, 'doi');
    const halId = getValue(row, 'hal_id');
    const nntId = getValue(row, 'nnt_id');
    if (doi) return `${doi};;`;
    if (halId) return `;${halId};`;
    if (nntId) return `;;${nntId}`;
    return ';;';
  }).join('\r\n');

  const csvFile = `${csvHeader}\r\n${csvContent}`;

  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([csvFile], { type: 'text/csv;charset=utf-8' }));
  link.setAttribute('download', 'works-finder-to-fosm.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const export2Csv = ({ data, label, searchParams }) => {
  data.forEach((work) => {
    work.allIds?.forEach((id) => {
      work[id.id_type] = id.id_value;
    });
    delete work.affiliations;
    delete work.affiliationsHtml;
    delete work.affiliationsTooltip;
    delete work.allIds;
    delete work.authors;
    delete work.datasource;
    delete work.id;
  });
  const headers = Object.keys(data?.[0] ?? {});
  const csvFile = [
    headers,
    ...data.map((item) => Object.values(item).map((cell) => JSON.stringify(cell))),
  ].map((e) => e.join(',')).join('\n');
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([csvFile], { type: 'text/csv;charset=utf-8' }));
  const fileName = getFileName({ extension: 'csv', label, searchParams });
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const export2json = ({ data, label, searchParams }) => {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
  const fileName = getFileName({ extension: 'json', label, searchParams });
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const export2jsonl = ({ data, label, searchParams }) => {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([data.map(JSON.stringify).join('\n')], { type: 'application/jsonl+json' }));
  const fileName = getFileName({ extension: 'jsonl', label, searchParams });
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const importJson = (e, optionsInit, setAllAffiliations, setAllPublications, setSearchParams, tagAffiliations) => {
  const fileReader = new FileReader();
  fileReader.readAsText(e.target.files[0], 'UTF-8');
  fileReader.onload = (f) => {
    const { allAffiliations = [], allPublications = [], decidedAffiliations = [], options = optionsInit } = JSON.parse(f.target.result);
    options.restoreFromFile = true;
    if (allAffiliations.length) {
      setAllAffiliations(allAffiliations);
    }
    if (allPublications.length) {
      setAllPublications(allPublications);
    }
    if (decidedAffiliations) {
      const validatedAffiliations = decidedAffiliations.filter((decidedAffiliation) => decidedAffiliation.status === status.validated.id);
      tagAffiliations(validatedAffiliations, status.validated.id);
      const excludedAffiliations = decidedAffiliations.filter((decidedAffiliation) => decidedAffiliation.status === status.excluded.id);
      tagAffiliations(excludedAffiliations, status.excluded.id);
    }
    setSearchParams(options);
  };
};

export {
  export2Csv,
  export2FosmCsv,
  export2json,
  export2jsonl,
  importJson,
};
