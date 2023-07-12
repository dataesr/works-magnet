import { useState } from 'react';
import {
  Container,
  Table,
} from '@dataesr/react-dsfr';
import { useQuery } from '@tanstack/react-query';
import Filters from './filters';
import getQuery from '../../utils/queries';
import { PageSpinner } from '../../components/spinner';

const {
  VITE_API_URL,
  VITE_API_AUTH,
} = import.meta.env;

async function getData(options) {
  const params = {
    method: 'POST',
    body: JSON.stringify(getQuery(options)),
    headers: {
      'content-type': 'application/json',
      Authorization: VITE_API_AUTH,
    },
  };
  return fetch(VITE_API_URL, params).then((response) => {
    if (response.ok) return response.json();
    return 'Oops... API request did not work';
  });
}

export default function Home() {
  const [options, setOptions] = useState({});
  const [actions, setActions] = useState([{ doi: '10.1007/s13595-016-0554-5', action: 'keep' }]);

  const columns = [
    { label: 'action', name: 'action' },
    { label: 'doi', name: 'doi' },
    { label: 'Title', name: 'title' },
    { label: 'Authors', name: 'authors' },
    { label: 'year', name: 'year' },
    { label: 'url', name: 'url' },
    { label: 'affiliations', name: 'affiliations' },
  ];

  const getAffiliationsField = (affiliations) => {
    const nbAffiliations = affiliations?.length || 0;
    if (nbAffiliations === 0) return '';
    if (nbAffiliations === 1) return affiliations[0].name;
    return `${affiliations[0].name} et al. (${nbAffiliations - 1})`;
  };

  const getAuthorsField = (authors) => {
    const nbAuthors = authors?.length || 0;
    if (nbAuthors === 0) return '';
    if (nbAuthors === 1) return authors[0].full_name;
    return `${authors[0].full_name} et al. (${nbAuthors - 1})`;
  };

  const { data, isFetching, refetch } = useQuery({
    queryKey: ['data'],
    queryFn: () => getData(options),
    enabled: false,
    staleTime: Infinity,
    cacheTime: Infinity,
  });

  const sendQuery = async (filters) => {
    await setOptions({
      datasource: 'bso',
      filters: {
        affiliations: filters.affiliations,
        affiliationsToExclude: filters.affiliationsToExclude,
        authors: filters.authors,
        authorsToExclude: filters.authorsToExclude,
        startYear: filters.startYear,
        endYear: filters.endYear,
      },
    });
    refetch();
  };

  let dataTable = [];
  if (data?.hits?.hits) {
    dataTable = data.hits.hits.map((item, index) => ({
      affiliations: getAffiliationsField(item._source.affiliations),
      authors: getAuthorsField(item._source.authors),
      doi: item._source.doi,
      id: index,
      title: item._source.title,
      url: item._source.url,
      year: item._source.year,
      action: actions.find((action) => action.doi === item._source.doi)?.action,
    }));
  }

  return (
    <Container className="fr-my-5w" as="section">
      <Filters
        sendQuery={sendQuery}
      />
      {isFetching && (<Container><PageSpinner /></Container>)}

      {
        dataTable && (
          <Table
            columns={columns}
            data={dataTable}
            rowKey="undefined"
          />
        )
      }
    </Container>
  );
}
