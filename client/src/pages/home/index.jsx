/* eslint-disable jsx-a11y/control-has-associated-label */
import './index.scss';
import { useState } from 'react';
import { Button, Container, Tab, Tabs } from '@dataesr/react-dsfr';
import { useQuery } from '@tanstack/react-query';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';

import Filters from './filters';
import getBsoData from '../../utils/bso';
import getOpenAlexData from '../../utils/openalex';
import { PageSpinner } from '../../components/spinner';

import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import PublicationsView from './views/publications';
import AffiliationsView from './views/affiliations';

const getData = async (options) => {
  const promises = options?.datasources.map((datasource) => {
    switch (datasource) {
      case 'bso':
        return getBsoData(options);
      case 'openalex':
        return getOpenAlexData(options);
      default:
        console.error(`Datasoure : ${datasource} is badly formatted and shoud be on of bso or openalex`);
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
  const dataGroupedByAffiliation = {};
  if (data) {
    data.forEach((publication) => {
      (publication?.highlight?.['affiliations.name'] ?? []).forEach((affiliation) => {
        if (!Object.keys(dataGroupedByAffiliation).includes(normalizedName(affiliation))) {
          dataGroupedByAffiliation[normalizedName(affiliation)] = { name: affiliation, count: 0 };
        }
        // eslint-disable-next-line no-plusplus
        dataGroupedByAffiliation[normalizedName(affiliation)].count++;
      });
    });
  }
  const affiliationsDataTable = Object.values(dataGroupedByAffiliation)
    .sort((a, b) => b.count - a.count)
    .map((affiliation) => ({ affiliations: affiliation.name, publicationsNumber: affiliation.count }));

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

      <Tabs>
        <Tab label="Affiliations view">
          {
            affiliationsDataTable && (
              <AffiliationsView
                affiliationsTemplate={affiliationsTemplate}
                paginatorLeft={paginatorLeft}
                paginatorRight={paginatorRight}
                affiliationsDataTable={affiliationsDataTable}
              />
            )
          }
        </Tab>
        <Tab label="Publications view">
          {
            publicationsDataTable && (
              <PublicationsView
                affiliationsTemplate={affiliationsTemplate}
                authorsTemplate={authorsTemplate}
                paginatorLeft={paginatorLeft}
                paginatorRight={paginatorRight}
                publicationsDataTable={publicationsDataTable}
              />
            )
          }
        </Tab>
      </Tabs>
    </Container>
  );
}
