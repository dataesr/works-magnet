import { status } from '../config';

const export2FosmCsv = (allPublications) => {
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

const export2json = (data) => {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
  link.setAttribute('download', 'works-finder.json');
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
  export2FosmCsv,
  export2json,
  importJson,
};
