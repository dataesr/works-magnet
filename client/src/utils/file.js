const export2BsoCsv = (allPublications) => {
  const csvHeader = ['doi', 'hal_id', 'nnt_id'].join(';');
  const validatedPublications = allPublications.filter((publication) => publication.status === 'validated');
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
  link.setAttribute('download', 'works-finder-to-bso.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const export2json = (allAffiliations, allPublications, options) => {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([JSON.stringify({ allAffiliations, allPublications, options })], { type: 'application/json' }));
  link.setAttribute('download', 'works-finder.json');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const importJson = (e, setAllAffiliations, setSearchParams, setAllPublications) => {
  const fileReader = new FileReader();
  fileReader.readAsText(e.target.files[0], 'UTF-8');
  fileReader.onload = (f) => {
    const { allAffiliations, allPublications, options } = JSON.parse(f.target.result);
    options.restoreFromFile = true;
    setAllAffiliations(allAffiliations);
    setAllPublications(allPublications);
    setSearchParams(options);
  };
};

export {
  export2BsoCsv,
  export2json,
  importJson,
};
