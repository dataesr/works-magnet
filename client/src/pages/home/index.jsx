/* eslint-disable no-plusplus */
/* eslint-disable indent */
/* eslint-disable jsx-a11y/control-has-associated-label */
import './index.scss';
import { useState } from 'react';
import { Container, Tab, Tabs } from '@dataesr/react-dsfr';
import { useQuery } from '@tanstack/react-query';

import { PageSpinner } from '../../components/spinner';
import Actions from './actions';
import AffiliationsView from './views/affiliations';
import Filters from './filters';
import PublicationsView from './views/publications';

import getBsoData from '../../utils/bso';
import getOpenAlexData from '../../utils/openalex';
import {
  getAffiliationsField,
  getAuthorsField,
} from '../../utils/fields';

import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import ActionsView from './views/actions';

const getData = async (options) => {
  const promises = options?.datasources.map((datasource) => {
    switch (datasource.key) {
      case 'bso':
        return getBsoData(options);
      case 'openalex':
        return getOpenAlexData(options);
      default:
        // eslint-disable-next-line no-console
        console.error(`Datasoure : ${datasource.label} is badly formatted and shoud be one of BSO or OpenAlex`);
        return Promise.resolve();
    }
  });
  const publications = await Promise.all(promises);
  const data = { results: [], total: {} };
  publications.forEach((publication) => {
    data.results = [...data.results, ...publication.results];
    data.total[publication.datasource] = publication.total;
  });
  return data;
};

export default function Home() {
  const [options, setOptions] = useState({});
  const [actions, setActions] = useState([]);
  const [selectedPublications, setSelectedPublications] = useState([]);
  const [viewAllPublications, setViewAllPublications] = useState(false);

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
    publicationsDataTable = data.results
      .map((item) => ({
        affiliations: getAffiliationsField(item),
        authors: getAuthorsField(item),
        doi: item.doi,
        hal_id: item.hal_id,
        id: item.id,
        title: item.title,
        genre: item.genre_raw || item.genre,
        year: item.year,
        action: actions.find((action) => action.id === item.id)?.action || undefined,
        datasource: item.datasource,
        identifier: item.identifier,
      }))
      .filter((item) => {
        if (viewAllPublications) { return true; }
        return !actions.map((action) => action.id).includes(item.id);
      });
  }

  // regroupement par affiliation
  const normalizedName = (name) => name.toLowerCase().replace(/[^a-zA-Z0-9]/g, '');
  const dataGroupedByAffiliation = {};
  if (data) {
    data.results.forEach((publication) => {
      switch (publication.datasource) {
        case 'bso':
          (publication?.highlight?.['affiliations.name'] ?? []).forEach((affiliation) => {
            if (!Object.keys(dataGroupedByAffiliation).includes(normalizedName(affiliation))) {
              dataGroupedByAffiliation[normalizedName(affiliation)] = { name: affiliation, count: 0, publications: [] };
            }
            dataGroupedByAffiliation[normalizedName(affiliation)].count++;
            dataGroupedByAffiliation[normalizedName(affiliation)].publications.push(publication.id);
          });
          break;
        case 'openalex':
          (publication?.authors ?? []).forEach((author) => (author?.raw_affiliation_strings ?? []).forEach((affiliation) => {
            if (!Object.keys(dataGroupedByAffiliation).includes(normalizedName(affiliation))) {
              dataGroupedByAffiliation[normalizedName(affiliation)] = { name: affiliation, count: 0, publications: [] };
            }
            dataGroupedByAffiliation[normalizedName(affiliation)].count++;
            dataGroupedByAffiliation[normalizedName(affiliation)].publications.push(publication.id);
          }));
          break;
        default:
      }
    });
  }
  const affiliationsDataTable = Object.values(dataGroupedByAffiliation)
    .sort((a, b) => b.count - a.count)
    .map((affiliation) => ({ affiliations: affiliation.name, publicationsNumber: affiliation.count }));

  const tagLines = (lines, action) => {
    const newActions = lines.map((line) => ({ ...line, action }));
    setActions([...actions, ...newActions]);
  };

  return (
    <>
      <Container className="fr-my-5w" as="section">
        <Filters
          sendQuery={sendQuery}
          viewAllPublications={viewAllPublications}
          setViewAllPublications={setViewAllPublications}
        />
        {isFetching && (<Container><PageSpinner /></Container>)}
        <div>
          {`${data?.total?.bso ?? 0} results in the BSO // ${data?.total?.openalex ?? 0} results in OpenAlex`}
        </div>
      </Container>
      <Container className="fr-mx-5w" as="section" fluid>
        <Actions
          viewAllPublications={viewAllPublications}
          setViewAllPublications={setViewAllPublications}
          selectedPublications={selectedPublications}
          tagLines={tagLines}
        />
        <Tabs defaultActiveTab={1}>
          <Tab label="Affiliations view">
            {
              affiliationsDataTable && <AffiliationsView affiliationsDataTable={affiliationsDataTable} />
            }
          </Tab>
          <Tab label={`Publications to sort (${publicationsDataTable.length})`}>
            {
              publicationsDataTable && (
                <PublicationsView
                  publicationsDataTable={publicationsDataTable}
                  setSelectedPublications={setSelectedPublications}
                  selectedPublications={selectedPublications}
                />
              )
            }
          </Tab>
          <Tab label={`Keep List (${actions.filter((action) => action.action === 'keep').length})`}>
            <ActionsView data={actions.filter((action) => action.action === 'keep')} />
          </Tab>
          <Tab label={`Exclude List (${actions.filter((action) => action.action === 'exclude').length})`}>
            <ActionsView data={actions.filter((action) => action.action === 'exclude')} />
          </Tab>
        </Tabs>
      </Container>
    </>
  );
}
