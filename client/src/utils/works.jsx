import { Button } from '@dataesr/dsfr-plus';

import { status } from '../config';

const {
  VITE_API,
} = import.meta.env;

const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

const getData = async (options) => fetch(`${VITE_API}/works`, {
  body: JSON.stringify(options),
  headers: { 'Content-Type': 'application/json' },
  method: 'POST',
}).then((response) => {
  if (response.ok) return response.json();
  return 'Oops... FOSM API request did not work';
}).catch((error) => {
  console.error(error);
  return 'Oops... FOSM API request did not work';
});

const getIdLink = (type, id) => {
  let prefix = null;
  switch (type) {
    case 'crossref':
    case 'datacite':
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
    className={`fr-mb-1w ${st.buttonClassName} fr-pl-1w button`}
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
    className="fr-mb-1w fr-mr-1w btn-keep"
    disabled={!selected.length}
    onClick={() => fn(selected, 'validated')}
    size="lg"
  >
    <i className={`${icon} fr-mr-1w`} />
    {`Validate ${selected.length} dataset${selected.length === 1 ? '' : 's'} ${label}`}
  </Button>
);

export {
  capitalize,
  getData,
  getIdLink,
  normalizeName,
  range,
  renderButtons,
  renderButtonDataset,
};
