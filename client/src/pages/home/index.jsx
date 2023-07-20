/* eslint-disable no-plusplus */
/* eslint-disable indent */
/* eslint-disable jsx-a11y/control-has-associated-label */
import { Container, Tab, Tabs } from '@dataesr/react-dsfr';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import Actions from './actions';
import Options from './options';
import ActionsView from './views/actions';
import AffiliationsView from './views/affiliations';
import PublicationsView from './views/publications';
import { PageSpinner } from '../../components/spinner';
import {
  getAffiliationsField,
  getAuthorsField,
} from '../../utils/fields';
import {
  getBsoData,
  getOpenAlexData,
  mergePublications,
} from '../../utils/publications';

import './index.scss';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';

const {
  VITE_BSO_SIZE,
  VITE_OPENALEX_SIZE,
} = import.meta.env;

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

  // Deduplicate publications by DOI
  data.total.all = data.results.length;
  const deduplicatedPublications = {};
  data.results.forEach((publication) => {
    const id = publication?.doi ?? publication.id;
    if (!Object.keys(deduplicatedPublications).includes(id)) {
      deduplicatedPublications[id] = publication;
    } else {
      deduplicatedPublications[id] = mergePublications(deduplicatedPublications[id], publication);
    }
  });
  data.results = Object.values(deduplicatedPublications);
  data.total.deduplicated = Object.values(deduplicatedPublications).length;
  // Set uniq identifier by value
  data.results.map((publication) => {
    // eslint-disable-next-line no-param-reassign
    publication.allIds = Object.values(publication.allIds.reduce((acc, obj) => ({ ...acc, [obj.id_value]: obj }), {}));
    return publication;
  });
  return data;
};

export default function Home() {
  const [actions, setActions] = useState([]);
  const [options, setOptions] = useState({});
  const [selectedAffiliations, setSelectedAffiliations] = useState([]);
  const [selectedPublications, setSelectedPublications] = useState([]);
  const [viewAllPublications, setViewAllPublications] = useState(false);

  const { data, isFetching, refetch } = useQuery({
    queryKey: ['data'],
    queryFn: () => getData(options),
    enabled: false,
    staleTime: Infinity,
    cacheTime: Infinity,
  });

  const sendQuery = async (_options) => {
    await setOptions(_options);
    refetch();
  };

  let publicationsDataTable = [];
  if (data) {
    publicationsDataTable = data.results
      .map((item) => ({
        action: actions.find((action) => action.id === item.id)?.action || undefined,
        affiliations: getAffiliationsField(item),
        allIds: item.allIds,
        authors: getAuthorsField(item),
        datasource: item.datasource,
        doi: item.doi,
        hal_id: item.hal_id,
        id: item.id,
        identifier: item.identifier,
        title: item.title,
        genre: item.genre_raw || item.genre,
        year: item.year,
      }))
      .filter((item) => {
        if (viewAllPublications) { return true; }
        return !actions.map((action) => action.id).includes(item.id);
      });
  }

  // Group by affiliation
  const normalizedName = (name) => name.toLowerCase().replace(/[^a-zA-Z0-9]/g, '');
  const dataGroupedByAffiliation = {};
  if (data) {
    data.results.forEach((publication) => {
      switch (publication.datasource) {
        case 'bso':
          (publication?.highlight?.['affiliations.name'] ?? []).forEach((affiliation) => {
            if (!Object.keys(dataGroupedByAffiliation).includes(normalizedName(affiliation))) {
              dataGroupedByAffiliation[normalizedName(affiliation)] = {
                name: affiliation,
                count: 0,
                publications: [],
                datasource: 'bso',
              };
            }
            dataGroupedByAffiliation[normalizedName(affiliation)].count++;
            dataGroupedByAffiliation[normalizedName(affiliation)].datasource = 'bso';
            dataGroupedByAffiliation[normalizedName(affiliation)].publications.push(publication);
          });
          break;
        case 'openalex':
          (publication?.authors ?? []).forEach((author) => (author?.raw_affiliation_strings ?? []).forEach((affiliation) => {
            if (!Object.keys(dataGroupedByAffiliation).includes(normalizedName(affiliation))) {
              dataGroupedByAffiliation[normalizedName(affiliation)] = {
                name: affiliation,
                count: 0,
                publications: [],
                datasource: 'openalex',
              };
            }
            dataGroupedByAffiliation[normalizedName(affiliation)].count++;
            dataGroupedByAffiliation[normalizedName(affiliation)].datasource = 'openalex';
            dataGroupedByAffiliation[normalizedName(affiliation)].publications.push(publication);
          }));
          break;
        default:
      }
    });
  }
  const affiliationsDataTable = Object.values(dataGroupedByAffiliation)
    .sort((a, b) => b.count - a.count)
    .map((affiliation, index) => ({
      affiliations: affiliation.name,
      publicationsNumber: affiliation.count,
      publications: affiliation.publications.map((publication) => (
        {
          ...publication,
          authors: getAuthorsField(publication),
          affiliations: getAffiliationsField(publication),
        })),
      id: index,
      datasource: affiliation.datasource,
    }));

  const tagLines = (lines, action) => {
    const newActions = lines.map((line) => ({ ...line, action }));
    setActions([...actions, ...newActions]);
  };

  const tagAffiliation = (affiliation, action) => {
    const newActions = affiliation.publications.map((publication) => ({ ...publication, action }));
    setActions([...actions, ...newActions]);
  };
  return (
    <>
      <Container className="fr-my-5w" as="section">
        <Options
          sendQuery={sendQuery}
          setViewAllPublications={setViewAllPublications}
          viewAllPublications={viewAllPublications}
        />
        {isFetching && (<Container as="section"><PageSpinner /></Container>)}
        <div>
          {`${data?.total?.bso ?? 0} publications in the BSO`}
          {' // '}
          {`${data?.total?.openalex ?? 0} publications in OpenAlex`}
          {' // '}
          {`${Math.min(data?.total?.bso ?? 0, VITE_BSO_SIZE)} publications collected from the BSO`}
          {' // '}
          {`${Math.min(data?.total?.openalex ?? 0, VITE_OPENALEX_SIZE)} publications collected from OpenAlex`}
          {' // '}
          {`${data?.total?.deduplicated ?? 0} publications after deduplication`}
        </div>
      </Container>
      <Container className="fr-mx-5w" as="section" fluid>
        <Actions
          options={options}
          publicationsDataTable={publicationsDataTable}
          selectedAffiliations={selectedAffiliations}
          selectedPublications={selectedPublications}
          setOptions={setOptions}
          setViewAllPublications={setViewAllPublications}
          tagAffiliation={tagAffiliation}
          tagLines={tagLines}
          viewAllPublications={viewAllPublications}
        />
        <Tabs defaultActiveTab={1}>
          <Tab label="Affiliations view">
            {
              affiliationsDataTable && (
                <AffiliationsView
                  affiliationsDataTable={affiliationsDataTable}
                  selectedAffiliations={selectedAffiliations}
                  setSelectedAffiliations={setSelectedAffiliations}
                />
              )
            }
          </Tab>
          <Tab label={`Publications to sort (${publicationsDataTable.length})`}>
            {
              publicationsDataTable && (
                <PublicationsView
                  publicationsDataTable={publicationsDataTable}
                  selectedPublications={selectedPublications}
                  setSelectedPublications={setSelectedPublications}
                />
              )
            }
          </Tab>
          <Tab label={`Keep List (${actions.filter((action) => action.action === 'keep').length})`}>
            <ActionsView
              data={actions.filter((action) => action.action === 'keep')}
              setActions={setActions}
            />
          </Tab>
          <Tab label={`Exclude List (${actions.filter((action) => action.action === 'exclude').length})`}>
            <ActionsView
              data={actions.filter((action) => action.action === 'exclude')}
              setActions={setActions}
            />
          </Tab>
        </Tabs>
      </Container>
    </>
  );
}
