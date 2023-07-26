const export2json = (options, publicationDataTable) => {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([JSON.stringify({ options, publicationDataTable })], { type: 'application/json' }));
  link.setAttribute('download', 'publications-finder.json');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const importJson = (e, setPublicationsDataTable, setOptions) => {
  const fileReader = new FileReader();
  fileReader.readAsText(e.target.files[0], 'UTF-8');
  fileReader.onload = (f) => {
    const { options, publicationDataTable } = JSON.parse(f.target.result);
    options.restoreFromFile = true;
    setPublicationsDataTable(publicationDataTable);
    setOptions(options);
  };
};

export {
  export2json,
  importJson,
};
