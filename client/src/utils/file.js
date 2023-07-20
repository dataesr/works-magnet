const export2json = (options, data) => {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([JSON.stringify({ options, data })], { type: 'application/json' }));
  link.setAttribute('download', 'publications-finder.json');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const importJson = (e, setOptions) => {
  const fileReader = new FileReader();
  fileReader.readAsText(e.target.files[0], 'UTF-8');
  fileReader.onload = (f) => {
    const { data, options } = JSON.parse(f.target.result);
    console.log(setOptions);
    console.log(options);
    setOptions(options);
  };
};

export {
  export2json,
  importJson,
};
