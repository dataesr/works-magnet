import { Button } from '@dataesr/react-dsfr';

import { status } from '../config';

const {
  VITE_API,
} = import.meta.env;

const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

const getData = async (options) => {
  const urlParams = new URLSearchParams(options).toString();
  return fetch(`${VITE_API}/works?${urlParams}`)
    .then((response) => {
      if (response.ok) return response.json();
      return 'Oops... FOSM API request did not work';
    });
};

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

const renderButtons = (selected, fn, entityLabel) => (
  <>
    {Object.values(status).map((st) => (
      <Button
        className={`fr-mb-1w fr-mr-1w ${st.buttonClassName}`}
        disabled={!selected.length}
        icon={st.buttonIcon}
        key={st.id}
        onClick={() => fn(selected, st.id)}
        size="lg"
      >
        {`${st.buttonLabel} ${selected.length} ${entityLabel}${selected.length === 1 ? '' : 's'}`}
      </Button>
    ))}
  </>
);

export {
  capitalize,
  getData,
  getIdLink,
  normalizeName,
  range,
  renderButtons,
};
