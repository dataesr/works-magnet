/* eslint-disable indent */
/* eslint-disable jsx-a11y/control-has-associated-label */
/* eslint-disable no-case-declarations */
import { Button, Checkbox, Col, Container, Row, Tab, Tabs } from '@dataesr/react-dsfr';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import Actions from './actions';
import Filters from './filters';
import Metrics from './metrics';
import SortedView from './views/sorted';
import AffiliationsView from './views/affiliations';
import PublicationsView from './views/publications';
import { PageSpinner } from '../../components/spinner';
import {
  getBsoCount,
  getBsoPublications,
  getOpenAlexPublications,
  mergePublications,
} from '../../utils/publications';
import {
  getAllIdsHtmlField,
  getAffiliationsHtmlField,
  getAuthorsHtmlField,
  getAuthorsTooltipField,
} from '../../utils/templates';

import './index.scss';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';

const {
  VITE_BSO_MAX_SIZE,
} = import.meta.env;

const getRorAffiliations = (affiliations) => {
  const notRorAffiliations = [];
  const rorAffiliations = [];
  const regexp = /^(https:\/\/ror\.org\/|ror\.org\/){0,1}0[a-hj-km-np-tv-z|0-9]{6}[0-9]{2}$/;
  affiliations.forEach((affiliation) => {
    // eslint-disable-next-line no-unused-expressions
    affiliation.match(regexp) ? rorAffiliations.push(affiliation) : notRorAffiliations.push(affiliation);
  });
  return { notRorAffiliations, rorAffiliations };
};

const getData = async (options) => {
  const promises = options?.datasources.map((datasource) => {
    switch (datasource) {
      case 'bso':
        return getBsoPublications(options);
      case 'openalex':
        const { notRorAffiliations, rorAffiliations } = getRorAffiliations(options.affiliations);
        const { notRorAffiliations: notRorAffiliationsToExclude, rorAffiliations: rorAffiliationsToExclude } = getRorAffiliations(options.affiliationsToExclude);
        const { notRorAffiliations: notRorAffiliationsToInclude, rorAffiliations: rorAffiliationsToInclude } = getRorAffiliations(options.affiliationsToInclude);
        const p = [];
        if (notRorAffiliations.length || notRorAffiliationsToExclude.length || notRorAffiliationsToInclude.length) {
          p.push(getOpenAlexPublications({
            ...options,
            affiliations: notRorAffiliations,
            affiliationsToExclude: notRorAffiliationsToExclude,
            affiliationsToInclude: notRorAffiliationsToInclude,
          }, false));
        }
        if (rorAffiliations.length || rorAffiliationsToExclude.length || rorAffiliationsToInclude.length) {
          p.push(getOpenAlexPublications({
            ...options,
            affiliations: rorAffiliations,
            affiliationsToExclude: rorAffiliationsToExclude,
            affiliationsToInclude: rorAffiliationsToInclude,
          }, true));
        }
        return p;
      default:
        // eslint-disable-next-line no-console
        console.error(`Datasoure : ${datasource} is badly formatted and shoud be one of BSO or OpenAlex`);
        return Promise.resolve();
    }
  });
  const publications = await Promise.all(promises.flat());
  const data = { results: [], total: {} };
  publications.forEach((publication) => {
    data.results = [...data.results, ...publication.results];
    data.total[publication.datasource] = publication.total;
  });
  // Correct BSO total if maximum is reached
  if (Number(data.total.bso) === Number(VITE_BSO_MAX_SIZE)) {
    const { count } = await getBsoCount(options);
    data.total.bso = count;
  }

  // Deduplicate publications by DOI or by hal_id
  data.total.all = data.results.length;
  const deduplicatedPublications = {};
  data.results.forEach((publication) => {
    const id = publication?.doi ?? publication?.primary_location?.landing_page_url?.split('/')?.pop() ?? publication.id;
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
  const [formOptions, setFormOptions] = useState({});
  const [selectedAffiliation, setSelectedAffiliation] = useState({});
  const [selectedPublications, setSelectedPublications] = useState([]);
  const [sortedPublications, setSortedPublications] = useState([]);
  const [viewAllAffiliations, setViewAllAffiliations] = useState(false);
  const [viewAllPublications, setViewAllPublications] = useState(false);

  const [publicationsDataTable, setPublicationsDataTable] = useState([]);
  const [affiliationsDataTable, setAffiliationsDataTable] = useState([]);

  const { data, isFetching, refetch } = useQuery({
    queryKey: ['data'],
    queryFn: () => getData(formOptions),
    enabled: false,
    staleTime: Infinity,
    cacheTime: Infinity,
  });

  const sendQuery = async (_options) => {
    await setFormOptions(_options);
    refetch();
  };

  useEffect(() => {
    let publicationsDataTableTmp = [];
    if (data) {
      publicationsDataTableTmp = data.results
        .map((publication) => ({
          ...publication,
          action: sortedPublications.find((action) => action.id === publication.id)?.action || 'sort',
          affiliationsHtml: getAffiliationsHtmlField(publication),
          allIdsHtml: getAllIdsHtmlField(publication),
          authorsHtml: getAuthorsHtmlField(publication),
          authorsTooltip: getAuthorsTooltipField(publication),
        }))
        .filter((item) => {
          if (viewAllPublications) { return true; }
          return !sortedPublications.map((action) => action.id).includes(item.id);
        });
    }

    setPublicationsDataTable(publicationsDataTableTmp);
  }, [data, sortedPublications, viewAllPublications]);

  useEffect(() => {
    // Group by affiliation
    const normalizedName = (name) => name.toLowerCase().replace(/[^a-zA-Z0-9]/g, '');
    const dataGroupedByAffiliation = {};
    if (data) {
      data.results.forEach((publication) => {
        switch (publication.datasource) {
          case 'bso':
            (publication?.highlight?.['affiliations.name'] ?? []).forEach((affiliation) => {
              const affiliationName = normalizedName(affiliation);
              if (!Object.keys(dataGroupedByAffiliation).includes(affiliationName)) {
                dataGroupedByAffiliation[affiliationName] = {
                  datasource: 'bso',
                  name: affiliation,
                  publications: [],
                };
              }
              dataGroupedByAffiliation[affiliationName].publications.push(publication);
            });
            break;
          case 'openalex':
            (publication?.authors ?? []).forEach((author) => (author?.raw_affiliation_strings ?? []).forEach((affiliation) => {
              const affiliationName = normalizedName(affiliation);
              if (!Object.keys(dataGroupedByAffiliation).includes(affiliationName)) {
                dataGroupedByAffiliation[normalizedName(affiliation)] = {
                  datasource: 'openalex',
                  name: affiliation,
                  publications: [],
                };
              }
              dataGroupedByAffiliation[affiliationName].publications.push(publication);
            }));
            break;
          default:
        }
      });
    }

    const affiliationsDataTableTmp = Object.values(dataGroupedByAffiliation)
      .sort((a, b) => b.publications.length - a.publications.length)
      .map((affiliation, index) => ({
        affiliations: affiliation.name,
        publications: affiliation.publications,
        id: index,
        datasource: affiliation.datasource,
      })).filter((affiliation) => {
        if (viewAllAffiliations) { return true; }
        const allPublicationsIds = affiliation.publications.map((publication) => publication.identifier);
        const allPublicationsIdsFromSelectedPublications = sortedPublications.map((publication) => publication.identifier);
        // if all publications are already selected, don't display
        if (allPublicationsIds.every((id) => allPublicationsIdsFromSelectedPublications.includes(id))) {
          return false;
        }
        return true;
      });

    setAffiliationsDataTable(affiliationsDataTableTmp);
  }, [data, sortedPublications, viewAllAffiliations]);

  const tagLines = (lines, action) => {
    const newLines = lines.filter((line) => !sortedPublications.map((item) => item.id).includes(line.id));
    const newActions = newLines.map((line) => ({ ...line, action }));
    setSortedPublications([...sortedPublications, ...newActions]);
  };

  const tagAffiliation = (affiliation, action) => {
    // list of keeped publications from actions
    const keepedPublications = sortedPublications.filter((item) => item.action === 'keep').map((item) => item.id);
    // if exclude, don't add keeped publications
    const publicationToAdd = affiliation.publications.filter((publication) => (action === 'exclude' ? !keepedPublications.includes(publication.id) : true));

    // if already add, don't add again
    const newActions = publicationToAdd.filter((publication) => !sortedPublications.map((item) => item.id).includes(publication.id)).map((publication) => ({ ...publication, action }));

    setSortedPublications([...sortedPublications, ...newActions]);
  };

  const checkSelectedAffiliation = () => {
    if (!selectedAffiliation) {
      return true;
    }
    if (Object.keys(selectedAffiliation)?.length === 0 && selectedAffiliation?.constructor === Object) {
      return true;
    }
    return false;
  };

  const keepedData = sortedPublications.filter((action) => action.action === 'keep');
  const excludedData = sortedPublications.filter((action) => action.action === 'exclude');

  return (
    <>
      <Container className="fr-my-5w" as="section" fluid>
        <Row className="fr-px-5w">
          <Col n="9">
            <Filters
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
          sortedPublications={sortedPublications}
          options={formOptions}
          setSortedPublications={setSortedPublications}
          setOptions={setFormOptions}
        />
        <Tabs defaultActiveTab={1}>
          <Tab label={`Affiliations view (${affiliationsDataTable.length})`}>
            {
              affiliationsDataTable && (
                <>
                  <Row>
                    <Col>
                      <Checkbox
                        checked={viewAllAffiliations}
                        label="View all affiliations"
                        onChange={() => setViewAllAffiliations(!viewAllAffiliations)}
                        size="sm"
                      />
                    </Col>
                    <Col className="text-right">
                      <Button
                        className="fr-mr-1w"
                        disabled={checkSelectedAffiliation()}
                        icon="ri-check-fill"
                        onClick={() => { tagAffiliation(selectedAffiliation, 'keep'); }}
                        size="sm"
                      >
                        Keep all
                      </Button>
                      <Button
                        className="fr-mb-1w"
                        disabled={checkSelectedAffiliation()}
                        icon="ri-close-fill"
                        onClick={() => { tagAffiliation(selectedAffiliation, 'exclude'); }}
                        size="sm"
                      >
                        Exclude all
                      </Button>
                    </Col>
                  </Row>
                  <AffiliationsView
                    affiliationsDataTable={affiliationsDataTable}
                    selectedAffiliation={selectedAffiliation}
                    setSelectedAffiliation={setSelectedAffiliation}
                  />
                </>
              )
            }
          </Tab>
          <Tab label={`Publications to sort (${publicationsDataTable.length})`}>
            {
              publicationsDataTable && (
                <>
                  <Row>
                    <Col>
                      <Checkbox
                        checked={viewAllPublications}
                        label="View all publications"
                        onChange={() => setViewAllPublications(!viewAllPublications)}
                        size="sm"
                      />
                    </Col>
                    <Col className="text-right">
                      <Button
                        className="fr-mr-1w"
                        disabled={selectedPublications.length === 0}
                        icon="ri-check-fill"
                        onClick={() => { tagLines(selectedPublications, 'keep'); }}
                        size="sm"
                      >
                        Keep
                      </Button>
                      <Button
                        className="fr-mb-1w"
                        disabled={selectedPublications.length === 0}
                        icon="ri-close-fill"
                        onClick={() => { tagLines(selectedPublications, 'exclude'); }}
                        size="sm"
                      >
                        Exclude
                      </Button>
                    </Col>
                  </Row>
                  <PublicationsView
                    publicationsDataTable={publicationsDataTable}
                    selectedPublications={selectedPublications}
                    setSelectedPublications={setSelectedPublications}
                  />
                </>
              )
            }
          </Tab>
          <Tab label={`Publications to keep (${keepedData.length})`}>
            <SortedView
              setSortedPublications={setSortedPublications}
              sortedPublications={keepedData}
            />
          </Tab>
          <Tab label={`Publications to exclude (${excludedData.length})`}>
            <SortedView
              setSortedPublications={setSortedPublications}
              sortedPublications={excludedData}
            />
          </Tab>
        </Tabs>
      </Container>
    </>
  );
}
