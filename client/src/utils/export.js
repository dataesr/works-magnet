export default function export2json(options, data) {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([JSON.stringify({ options, data })], { type: 'application/json' }));
  link.setAttribute('download', 'publications-finder.json');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
