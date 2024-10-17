import { Button } from '@dataesr/dsfr-plus';

import { status } from '../config';

const { VITE_API } = import.meta.env;

const capitalize = (str) => (str && str.length > 0 ? str.charAt(0).toUpperCase() + str.slice(1) : '');

const b64decode = (str) => {
  const binaryString = window.atob(str);
  const len = binaryString.length;
  const bytes = new Uint8Array(new ArrayBuffer(len));
  for (let i = 0; i < len; i += 1) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

const unzipData = async (compressedBase64) => {
  const stream = new Blob([b64decode(compressedBase64)], {
    type: 'application/json',
  }).stream();
  const compressedReadableStream = stream.pipeThrough(
    new DecompressionStream('gzip'),
  );
  const resp = new Response(compressedReadableStream);
  const blob = await resp.blob();
  return JSON.parse(await blob.text());
};

const decompressAll = async (chunks) => {
  const res = await Promise.all(chunks.map(async (c) => unzipData(c)));
  return res.flat();
};

const timeout = (time) => {
  const controller = new AbortController();
  setTimeout(() => controller.abort(), time * 1000);
  return controller;
};

const getIdLink = (type, id) => {
  let prefix = null;
  switch (type) {
  case 'doi':
    prefix = 'https://doi.org/';
    break;
  case 'hal_id':
    prefix = 'https://hal.science/';
    break;
  case 'openalex':
    prefix = 'https://openalex.org/';
    break;
  case 'pmcid':
    prefix = 'https://www.ncbi.nlm.nih.gov/pmc/articles/';
    break;
  case 'pmid':
    prefix = 'https://pubmed.ncbi.nlm.nih.gov/';
    break;
  case 'orcid':
    prefix = 'https://orcid.org/';
    break;
  default:
  }
  return (prefix !== null) ? `${prefix}${id}` : false;
};

const getMentions = async (options) => {
  const response = await fetch(`${VITE_API}/mentions`, {
    body: JSON.stringify(options),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
    signal: timeout(1200).signal, // 20 minutes
  });
  if (!response.ok) {
    throw new Error('Oops... FOSM API request did not work for mentions !');
  }
  const mentions = await response.json();
  return mentions;
};

const getWorks = async (options) => {
  const response = await fetch(`${VITE_API}/works`, {
    body: JSON.stringify(options),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
    signal: timeout(1200).signal, // 20 minutes
  });
  if (!response.ok) {
    throw new Error('Oops... FOSM API request did not work for works !');
  }
  const { affiliations, datasets, publications } = await response.json();
  const resAffiliations = await decompressAll(affiliations);
  datasets.results = await decompressAll(datasets.results);
  publications.results = await decompressAll(publications.results);
  return { affiliations: resAffiliations, datasets, publications };
};

const normalizeName = (name) => name
  .toLowerCase()
  .normalize('NFD')
  .replace(/[^a-zA-Z0-9]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const range = (startYear, endYear = new Date().getFullYear()) => {
  const start = Number(startYear);
  const end = Number(endYear);
  return (start === end) ? [start] : [start, ...range(start + 1, end)];
};

const renderButtons = (selected, fn) => Object.values(status).map((st) => (
  <Button
    className="fr-mb-1w fr-pl-1w button"
    disabled={!selected.length}
    key={st.id}
    onClick={() => fn(selected, st.id)}
    size="lg"
    style={{ display: 'block', width: '100%', textAlign: 'left' }}
    color="blue-ecume"
  >
    <i className={`${st.buttonIcon} fr-mr-2w`} style={{ color: st.iconColor }} />
    {st.buttonLabel}
  </Button>
));

const renderButtonDataset = (selected, fn, label, icon) => (
  <Button
    className="fr-mb-1w fr-mr-1w"
    disabled={!selected.length}
    onClick={() => fn(selected, 'validated')}
    size="sm"
  >
    <i className={`${icon} fr-mr-1w`} />
    {`Validate ${selected.length} dataset${selected.length === 1 ? '' : 's'} ${label}`}
  </Button>
);

export {
  capitalize,
  getIdLink,
  getMentions,
  getWorks,
  normalizeName,
  range,
  renderButtons,
  renderButtonDataset,
};
