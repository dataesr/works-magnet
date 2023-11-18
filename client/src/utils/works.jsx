import { Button } from '@dataesr/react-dsfr';

import { status } from '../config';

const {
  VITE_API,
} = import.meta.env;

const getData = async (options) => {
  const urlParams = new URLSearchParams(options).toString();
  return fetch(`${VITE_API}/works?${urlParams}`)
    .then((response) => {
      if (response.ok) return response.json();
      return 'Oops... BSO API request did not work';
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
  default:
  }
  return (prefix !== null) ? `${prefix}${id}` : false;
};

const renderButtons = (selected, fn) => (
  <>
    {Object.values(status).map((st) => (
      <Button
        className={`fr-mb-1w fr-mr-1w ${st.buttonClassName}`}
        disabled={!selected.length}
        icon={st.buttonIcon}
        key={st.id}
        onClick={() => fn(selected, st.id)}
        size="sm"
      >
        {`${st.buttonLabel} (${selected.length})`}
      </Button>
    ))}
  </>
);

export {
  getData,
  getIdLink,
  renderButtons,
};
