/* eslint-disable jsx-a11y/control-has-associated-label */
import { useState } from 'react';
import { Button, Container } from '@dataesr/react-dsfr';
import { useQuery } from '@tanstack/react-query';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';

import Filters from './filters';
import getQuery from '../../utils/queries';
import { PageSpinner } from '../../components/spinner';

// theme
import 'primereact/resources/themes/lara-light-indigo/theme.css';

// core
import 'primereact/resources/primereact.min.css';

const {
  VITE_ES_URL,
  VITE_ES_AUTH,
} = import.meta.env;

async function getData(options) {
  const params = {
    method: 'POST',
    body: JSON.stringify(getQuery(options)),
    headers: {
      'content-type': 'application/json',
      Authorization: VITE_ES_AUTH,
    },
  };
  return fetch(VITE_ES_URL, params).then((response) => {
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
    { label: 'hal_id', name: 'hal_id' },
    { label: 'Title', name: 'title' },
    { label: 'Authors', name: 'authors' },
    { label: 'year', name: 'year' },
    { label: 'genre', name: 'genre' },
    { label: 'affiliations', name: 'affiliations' },
  ];

  const getAffiliationsField = (item) => {
    if (item.highlight && item.highlight['affiliations.name']) {
      const highlight = item.highlight['affiliations.name'];
      return highlight.join(';');
    }
    if (item._source.affiliations === undefined) {
      return '';
    }
    const { affiliations } = item._source;
    const nbAffiliations = affiliations?.length || 0;
    if (nbAffiliations === 0) return '';
    if (nbAffiliations === 1) return affiliations[0].name;
    return `${affiliations[0].name} et al. (${nbAffiliations - 1})`;
  };

  const getAuthorsField = (item) => {
    if (item.highlight && item.highlight['authors.full_name']) {
      const highlight = item.highlight['authors.full_name'];
      return highlight.join(';');
    }
    if (item._source.authors === undefined) {
      return '';
    }
    const { authors } = item._source;
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
  const nbResults = (data?.hits?.total?.value || 0).toString().concat(' résultats');
  let dataTable = [];
  if (data?.hits?.hits) {
    dataTable = data.hits.hits.map((item, index) => ({
      affiliations: getAffiliationsField(item),
      authors: getAuthorsField(item),
      doi: item._source.doi,
      hal_id: item._source.hal_id,
      id: index,
      title: item._source.title,
      genre: item._source.genre_raw || item._source.genre,
      year: item._source.year,
      action: actions.find((action) => action.doi === item._source.doi)?.action,
    }));
  }
  const paginatorLeft = <Button icon="ri-refresh-fill" text>Refresh</Button>;
  const paginatorRight = <Button icon="ri-download-fill" text>Download</Button>;

  return (
    <Container className="fr-my-5w" as="section">
      <Filters
        sendQuery={sendQuery}
      />
      {isFetching && (<Container><PageSpinner /></Container>)}
      { nbResults }

      {
        dataTable && (
          <DataTable
            value={dataTable}
            paginator
            rows={5}
            rowsPerPageOptions={[5, 10, 25, 50]}
            tableStyle={{ minWidth: '50rem' }}
            paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
            currentPageReportTemplate="{first} to {last} of {totalRecords}"
            paginatorLeft={paginatorLeft}
            paginatorRight={paginatorRight}
          >
            <Column field="action" header="action" />
            <Column field="doi" header="doi" />
            <Column field="title" header="title" />
            <Column field="authors" header="authors" />
            <Column field="year" header="year" />
            <Column field="url" header="url" />
            <Column field="affiliations" header="affiliations" />
          </DataTable>
          // <Table
          //   columns={columns}
          //   data={dataTable}
          //   rowKey="undefined"
          // />
        )
      }
    </Container>
  );
}
