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

export {
  export2json,
  importJson,
};
