import { Button } from '@dataesr/dsfr-plus';

import { status } from '../config';

const { VITE_API } = import.meta.env;

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
  return JSON.parse(await resp.text());
};

const unzipAll = async (chunks) => {
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
  return prefix !== null ? `${prefix}${id}` : false;
};

const getMentions = async (options) => {
  const response = await fetch(`${VITE_API}/mentions`, {
    body: JSON.stringify(options),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
    signal: timeout(1200).signal, // 20 minutes
  });
  return response.json();
};

const getOpenAlexAffiliations = async (body, toast) => {
  const response = await fetch(`${VITE_API}/openalex-affiliations`, {
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
    signal: timeout(1200).signal, // 20 minutes
  });
  if (!response.ok) {
    throw new Error('Oops... Error while computing OpenAlex affiliations !');
  }
  const { affiliations, warnings } = await response.json();
  const resAffiliations = await unzipAll(affiliations);
  let warningMessage = '';
  if (warnings?.isMaxFosmReached) {
    warningMessage = warningMessage.concat(
      `More than ${warnings.maxFosmValue} publications found in French OSM, only the first ${warnings.maxFosmValue} were retrieved.\n`,
    );
  }
  if (warnings?.isMaxOpenalexReached) {
    warningMessage = warningMessage.concat(
      `More than ${warnings.maxOpenalexValue} publications found in OpenAlex, only the first ${warnings.maxOpenalexValue} were retrieved.\n`,
    );
  }
  if (warningMessage) {
    toast({
      description: warningMessage,
      id: 'tooManyPublications',
      title: 'Too Many publications found',
      toastType: 'error',
    });
  }
  return { affiliations: resAffiliations, warnings };
};

const getWorks = async ({ options, toast, type }) => {
  const response = await fetch(`${VITE_API}/works`, {
    body: JSON.stringify({ ...options, type }),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
    signal: timeout(1200).signal, // 20 minutes
  });
  if (!response.ok) {
    throw new Error('Oops... FOSM API request did not work for works !');
  }
  const { affiliations, datasets, publications, warnings } = await response.json();
  const resAffiliations = await unzipAll(affiliations);
  datasets.results = await unzipAll(datasets.results);
  publications.results = await unzipAll(publications.results);
  let warningMessage = '';
  if (warnings?.isMaxFosmReached) {
    warningMessage = warningMessage.concat(
      `More than ${warnings.maxFosmValue} publications found in French OSM, only the first ${warnings.maxFosmValue} were retrieved.\n`,
    );
  }
  if (warnings?.isMaxOpenalexReached) {
    warningMessage = warningMessage.concat(
      `More than ${warnings.maxOpenalexValue} publications found in OpenAlex, only the first ${warnings.maxOpenalexValue} were retrieved.\n`,
    );
  }
  if (warningMessage) {
    toast({
      description: warningMessage,
      id: 'tooManyPublications',
      title: 'Too Many publications found',
      toastType: 'error',
    });
  }
  return { affiliations: resAffiliations, datasets, publications, warnings };
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
  return start === end ? [start] : [start, ...range(start + 1, end)];
};

const renderButtons = (selected, fn) => Object.values(status).map((st) => (
  <Button
    className="fr-mb-1w fr-pl-1w button"
    color="blue-ecume"
    disabled={!selected.length}
    key={st.id}
    onClick={() => fn(selected, st.id)}
    size="lg"
    style={{ display: 'block', width: '100%', textAlign: 'left' }}
  >
    <i
      className={`${st.buttonIcon} fr-mr-2w`}
      style={{ color: st.iconColor }}
    />
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
    {`Validate ${selected.length} dataset${
      selected.length === 1 ? '' : 's'
    } ${label}`}
  </Button>
);

export {
  getIdLink,
  getMentions,
  getOpenAlexAffiliations,
  getWorks,
  normalizeName,
  range,
  renderButtonDataset,
  renderButtons,
};
