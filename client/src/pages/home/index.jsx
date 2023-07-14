/* eslint-disable jsx-a11y/control-has-associated-label */
import './index.scss';
import { useState } from 'react';
import { Button, Container } from '@dataesr/react-dsfr';
import { useQuery } from '@tanstack/react-query';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';

import Filters from './filters';
import getBsoData from '../../utils/bso';
import getOpenAlexData from '../../utils/openalex';
import { PageSpinner } from '../../components/spinner';

import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';

const getData = async (options) => {
  const promises = options?.datasources.map((datasource) => {
    switch (datasource) {
    case 'bso':
      return getBsoData(options);
    case 'openalex':
      return getOpenAlexData(options);
    default:
      console.error(`Datasoure : ${datasource} is badly formated and shoud be on of bso or openalex`);
      return Promise.resolve();
    }
  });
  const results = await Promise.all(promises);
  return results.flat();
};

export default function Home() {
  const [options, setOptions] = useState({});
  const [actions, setActions] = useState([{ doi: '10.1007/s13595-016-0554-5', action: 'keep' }]);

  const getAffiliationsField = (item) => {
    if (item?.highlight?.['affiliations.name']) {
      return item.highlight['affiliations.name'].join('<br />');
    }

    if (item.affiliations === undefined) {
      return '';
    }

    const { affiliations = [] } = item;
    return affiliations.map((affiliation) => affiliation.name).join('<br />');
  };

  const getAuthorsField = (item) => {
    if (item?.highlight?.['authors.full_name']) {
      return item.highlight['authors.full_name'].join(';');
    }

    if (item.authors === undefined) {
      return '';
    }

    const { authors = [] } = item;
    if (authors.length === 0) return '';
    if (authors.length === 1) return authors[0].full_name;
    return `${authors[0].full_name} et al. (${authors.length - 1})`;
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
      identifiers: filters.identifiers,
      datasources: filters.datasources,
      filters: {
        affiliations: filters.affiliations,
        affiliationsToExclude: filters.affiliationsToExclude,
        authors: filters.authors,
        authorsToExclude: filters.authorsToExclude,
        startYear: filters.startYear,
        endYear: filters.endYear,
        dataidentifiers: filters.dataidentifiers,
      },
    });
    refetch();
  };

  let publicationsDataTable = [];
  if (data) {
    publicationsDataTable = data.map((item, index) => ({
      affiliations: getAffiliationsField(item),
      authors: getAuthorsField(item),
      doi: item.doi,
      hal_id: item.hal_id,
      id: index,
      title: item.title,
      genre: item.genre_raw || item.genre,
      year: item.year,
      action: actions.find((action) => action.doi === item.doi)?.action,
      datasource: item.datasource,
    }));
  }
  const paginatorLeft = <Button icon="ri-refresh-fill" text>Refresh</Button>;
  const paginatorRight = <Button icon="ri-download-fill" text>Download</Button>;

  // regroupement par affiliation
  const normalizedName = (name) => name.toLowerCase().replace(/[^a-zA-Z0-9]/g, '');
  const dataGroupedByAffiliation = [];
  if (data) {
    data.forEach((publication) => {
      if (publication?.highlight?.['affiliations.name']) {
        publication.highlight['affiliations.name'].forEach((affiliation) => {
          if (dataGroupedByAffiliation.find((item) => normalizedName(item.name) === normalizedName(affiliation))) {
            dataGroupedByAffiliation.find((item) => normalizedName(item.name) === normalizedName(affiliation)).publications.push(publication.id);
          } else {
            dataGroupedByAffiliation.push({ name: affiliation, publications: [publication.id] });
          }
        });
      }
    });
    dataGroupedByAffiliation.sort((a, b) => b.publications.length - a.publications.length);
  }
  const affiliationsDataTable = dataGroupedByAffiliation.map((affiliation) => ({ affiliations: affiliation.name, publicationsNumber: affiliation.publications.length }));

  const affiliationsTemplate = (rowData) => <span dangerouslySetInnerHTML={{ __html: rowData.affiliations }} />;

  const authorsTemplate = (rowData) => <span dangerouslySetInnerHTML={{ __html: rowData.authors }} />;

  return (
    <Container className="fr-my-5w" as="section">
      <Filters
        sendQuery={sendQuery}
      />
      {isFetching && (<Container><PageSpinner /></Container>)}
      <div>
        {`${data?.length || 0} results`}
      </div>
      {
        affiliationsDataTable && (
          <DataTable
            style={{ fontSize: '11px', lineHeight: '15px' }}
            size="small"
            value={affiliationsDataTable}
            paginator
            rows={25}
            rowsPerPageOptions={[25, 50, 100, 200]}
            tableStyle={{ minWidth: '50rem' }}
            paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
            currentPageReportTemplate="{first} to {last} of {totalRecords}"
            paginatorLeft={paginatorLeft}
            paginatorRight={paginatorRight}
            filterDisplay="row"
            scrollable
            stripedRows
          >
            <Column filter filterMatchMode="contains" body={affiliationsTemplate} field="affiliation" header="affiliations" style={{ minWidth: '10px' }} />
            <Column showFilterMenu={false} field="publicationsNumber" header="publicationsNumber" style={{ minWidth: '10px' }} />
          </DataTable>
        )
      }
      {
        publicationsDataTable && (
          <DataTable
            style={{ fontSize: '11px', lineHeight: '15px' }}
            size="small"
            value={publicationsDataTable}
            paginator
            rows={25}
            rowsPerPageOptions={[25, 50, 100, 200]}
            tableStyle={{ minWidth: '50rem' }}
            paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
            currentPageReportTemplate="{first} to {last} of {totalRecords}"
            paginatorLeft={paginatorLeft}
            paginatorRight={paginatorRight}
            filterDisplay="row"
            scrollable
            stripedRows
          >
            <Column field="verified" header="Verified" dataType="boolean" style={{ minWidth: '6rem' }} />
            <Column field="datasource" header="Datasource" style={{ minWidth: '10px' }} />
            <Column filter filterMatchMode="contains" showFilterMenu={false} field="doi" header="DOI" style={{ minWidth: '10px' }} sortable />
            <Column filter filterMatchMode="contains" showFilterMenu={false} field="hal_id" header="HAL Id" style={{ minWidth: '10px' }} />
            <Column filter filterMatchMode="contains" body={affiliationsTemplate} field="affiliations" header="Affiliations" style={{ minWidth: '10px' }} />
            <Column filter filterMatchMode="contains" body={authorsTemplate} field="authors" header="Authors" style={{ minWidth: '10px' }} />
            <Column filter filterMatchMode="contains" showFilterMenu={false} field="title" header="Title" style={{ minWidth: '10px' }} />
          </DataTable>
        )
      }
    </Container>
  );
}
