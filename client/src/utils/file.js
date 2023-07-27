const export2json = (affiliationsDataTable, options, publicationDataTable) => {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([JSON.stringify({ options, affiliationsDataTable, publicationDataTable })], { type: 'application/json' }));
  link.setAttribute('download', 'publications-finder.json');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const importJson = (e, setAffiliationsDataTable, setPublicationsDataTable, setOptions) => {
  const fileReader = new FileReader();
  fileReader.readAsText(e.target.files[0], 'UTF-8');
  fileReader.onload = (f) => {
    const { options, affiliationsDataTable, publicationDataTable } = JSON.parse(f.target.result);
    options.restoreFromFile = true;
    setAffiliationsDataTable(affiliationsDataTable);
    setPublicationsDataTable(publicationDataTable);
    setOptions(options);
  };
};

const export2BsoCsv = (publicationDataTable) => {
  const csvHeader = ['doi', 'hal_id', 'nnt_id'].join(';');
  const keepedPublications = publicationDataTable.filter((publication) => publication.status === 'keep');
  const getValue = (row, idType) => {
    if (!row) return '';
    if (row.doi && idType === 'doi') return row.doi;
    return row.allIds.find((id) => id.id_type === idType)?.id_value || '';
  };

  const csvContent = keepedPublications.map((row) => {
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
  link.setAttribute('download', 'publications-finder-to-bso.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export {
  export2BsoCsv,
  export2json,
  importJson,
};
