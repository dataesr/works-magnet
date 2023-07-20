const export2json = (actions, options) => {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([JSON.stringify({ actions, options })], { type: 'application/json' }));
  link.setAttribute('download', 'publications-finder.json');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const importJson = (e, setActions, setOptions) => {
  const fileReader = new FileReader();
  fileReader.readAsText(e.target.files[0], 'UTF-8');
  fileReader.onload = (f) => {
    const { actions, options } = JSON.parse(f.target.result);
    options.restoreFromFile = true;
    setActions(actions);
    setOptions(options);
  };
};

export {
  export2json,
  importJson,
};
