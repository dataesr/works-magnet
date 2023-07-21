/* eslint-disable no-plusplus */
/* eslint-disable indent */
/* eslint-disable jsx-a11y/control-has-associated-label */
import { Col, Container, Row, Tab, Tabs } from '@dataesr/react-dsfr';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import Actions from './actions';
import Filters from './filters';
import ActionsView from './views/actions';
import AffiliationsView from './views/affiliations';
import PublicationsView from './views/publications';
import { PageSpinner } from '../../components/spinner';
import { getAffiliationsField } from '../../utils/fields';
import {
  getBsoData,
  getOpenAlexData,
  mergePublications,
} from '../../utils/publications';

import './index.scss';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import Metrics from './metrics';

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
  return data;
};

export default function Home() {
  const [actions, setActions] = useState([]);
  const [options, setOptions] = useState({});
  const [selectedAffiliation, setSelectedAffiliation] = useState({});
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
        authors: item.authors,
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
            const affiliatioName = normalizedName(affiliation);
            if (!Object.keys(dataGroupedByAffiliation).includes(affiliatioName)) {
              dataGroupedByAffiliation[affiliatioName] = {
                datasource: 'bso',
                name: affiliation,
                publications: [],
              };
            }
            dataGroupedByAffiliation[affiliatioName].publications.push(publication);
          });
          break;
        case 'openalex':
          (publication?.authors ?? []).forEach((author) => (author?.raw_affiliation_strings ?? []).forEach((affiliation) => {
            const affiliatioName = normalizedName(affiliation);
            if (!Object.keys(dataGroupedByAffiliation).includes(affiliatioName)) {
              dataGroupedByAffiliation[normalizedName(affiliation)] = {
                datasource: 'openalex',
                name: affiliation,
                publications: [],
              };
            }
            dataGroupedByAffiliation[affiliatioName].publications.push(publication);
          }));
          break;
        default:
      }
    });
  }
  const affiliationsDataTable = Object.values(dataGroupedByAffiliation)
    .sort((a, b) => b.publications.length - a.publications.length)
    .map((affiliation, index) => ({
      affiliations: affiliation.name,
      publications: affiliation.publications.map((publication) => (
        {
          ...publication,
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
      <Container className="fr-my-5w" as="section" fluid>
        <Row className="fr-px-5w">
          <Col n="9">
            <Filters
              options={options}
              sendQuery={sendQuery}
            />
          </Col>
          <Col n="3">
            {data && (<Metrics data={data} />)}
          </Col>
        </Row>
        <Row>
          <Col>
            {isFetching && (<Container as="section"><PageSpinner /></Container>)}
          </Col>
        </Row>
      </Container>

      <Container className="fr-mx-5w" as="section" fluid>
        <Actions
          actions={actions}
          options={options}
          selectedAffiliation={selectedAffiliation}
          selectedPublications={selectedPublications}
          setActions={setActions}
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
                  selectedAffiliation={selectedAffiliation}
                  setSelectedAffiliation={setSelectedAffiliation}
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
          <Tab label={`Publications to keep (${actions.filter((action) => action.action === 'keep').length})`}>
            <ActionsView
              data={actions.filter((action) => action.action === 'keep')}
              setActions={setActions}
            />
          </Tab>
          <Tab label={`Publications to exclude (${actions.filter((action) => action.action === 'exclude').length})`}>
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
