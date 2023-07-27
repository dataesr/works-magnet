/* eslint-disable indent */
/* eslint-disable jsx-a11y/control-has-associated-label */
/* eslint-disable no-case-declarations */
import { Button, Col, Container, Row, Tab, Tabs } from '@dataesr/react-dsfr';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import Actions from './actions';
import Filters from './filters';
import Metrics from './metrics';
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
        console.error(`Datasoure : ${datasource} is badly formatted and should be one of BSO or OpenAlex`);
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
  const [affiliationsDataTable, setAffiliationsDataTable] = useState([]);
  const [formOptions, setFormOptions] = useState({});
  const [isLoadingAffiliations, setIsLoadingAffiliations] = useState(false);
  const [publicationsDataTable, setPublicationsDataTable] = useState([]);
  const [selectedAffiliations, setSelectedAffiliations] = useState([]);
  const [selectedPublications, setSelectedPublications] = useState([]);
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

  const groupByAffiliations = (publications) => {
    setIsLoadingAffiliations(true);
    const normalizedName = (name) => name
      .toLowerCase()
      .replaceAll('<em>', '')
      .replaceAll('</em>', '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9]/g, '');
    let affiliationsDataTableTmp = {};
    publications.filter((publication) => publication.status === 'sort').forEach((publication) => {
      switch (publication.datasource) {
        case 'bso':
          (publication?.highlight?.['affiliations.name'] ?? []).forEach((affiliation) => {
            const affiliationName = normalizedName(affiliation);
            if (!Object.keys(affiliationsDataTableTmp).includes(affiliationName)) {
              affiliationsDataTableTmp[affiliationName] = {
                name: affiliation,
                nameTxt: affiliation.replaceAll('<em>', '').replaceAll('</em>', ''),
                publications: [],
                status: 'sort',
              };
            }
            affiliationsDataTableTmp[affiliationName].publications.push(publication.id);
          });
          break;
        case 'openalex':
          (publication?.authors ?? []).forEach((author) => (author?.raw_affiliation_strings ?? []).forEach((affiliation) => {
            const affiliationName = normalizedName(affiliation);
            if (!Object.keys(affiliationsDataTableTmp).includes(affiliationName)) {
              affiliationsDataTableTmp[affiliationName] = {
                name: affiliation,
                nameTxt: affiliation.replaceAll('<em>', '').replaceAll('</em>', ''),
                publications: [],
                status: 'sort',
              };
            }
            affiliationsDataTableTmp[affiliationName].publications.push(publication.id);
          }));
          break;
        default:
      }
    });
    affiliationsDataTableTmp = Object.values(affiliationsDataTableTmp)
      .sort((a, b) => b.publications.length - a.publications.length)
      .map((affiliation, index) => ({ ...affiliation, id: index.toString() }));
    setAffiliationsDataTable(affiliationsDataTableTmp);
    setIsLoadingAffiliations(false);
  };

  useEffect(() => {
    let publicationsDataTableTmp = [];
    if (data) {
      publicationsDataTableTmp = data.results
        .map((publication) => ({
          ...publication,
          affiliationsHtml: getAffiliationsHtmlField(publication),
          allIdsHtml: getAllIdsHtmlField(publication),
          authorsHtml: getAuthorsHtmlField(publication),
          authorsTooltip: getAuthorsTooltipField(publication),
          status: 'sort',
        }));
    }
    setPublicationsDataTable(publicationsDataTableTmp);
    groupByAffiliations(publicationsDataTableTmp);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const tagPublications = (publications, action) => {
    const publicationsDataTableTmp = [...publicationsDataTable];
    const publicationIds = publications.map((publication) => publication.id);
    publicationsDataTableTmp.filter((publication) => publicationIds.includes(publication.id)).map((publication) => publication.status = action);
    setPublicationsDataTable(publicationsDataTableTmp);
    setSelectedPublications([]);
  };

  const tagAffiliations = (affiliations, action) => {
    if (action !== 'exclude') {
      const publicationsDataTableTmp = [...publicationsDataTable];
      const publicationIds = affiliations.map((affiliation) => affiliation.publications).flat();
      publicationsDataTableTmp.filter((publication) => publicationIds.includes(publication.id)).map((publication) => publication.status = action);
      setPublicationsDataTable(publicationsDataTableTmp);
    }
    const affiliationsDataTableTmp = [...affiliationsDataTable];
    const affiliationIds = affiliations.map((affiliation) => affiliation.id);
    affiliationsDataTableTmp.filter((affiliation) => affiliationIds.includes(affiliation.id)).map((affiliation) => affiliation.status = action);
    setAffiliationsDataTable(affiliationsDataTableTmp);
    setSelectedAffiliations([]);
  };

  const checkSelectedAffiliation = () => {
    let ret = false;
    if (!selectedAffiliations) ret = true;
    if (Object.keys(selectedAffiliations)?.length === 0 && selectedAffiliations?.constructor === Object) {
      ret = true;
    }
    return ret;
  };

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
          affiliationsDataTable={affiliationsDataTable}
          options={formOptions}
          publicationsDataTable={publicationsDataTable}
          setAffiliationsDataTable={setAffiliationsDataTable}
          setOptions={setFormOptions}
          setPublicationsDataTable={setPublicationsDataTable}
        />
        <Tabs defaultActiveTab={0}>
          <Tab label={`Affiliations (${affiliationsDataTable.length})`}>
            <Row>
              <Col className="text-right">
                <Button
                  className="fr-mr-1w"
                  disabled={checkSelectedAffiliation()}
                  icon="ri-question-mark"
                  onClick={() => tagAffiliations(selectedAffiliations, 'sort')}
                  size="sm"
                >
                  Sort all
                </Button>
                <Button
                  className="fr-mr-1w"
                  disabled={checkSelectedAffiliation()}
                  icon="ri-check-fill"
                  onClick={() => tagAffiliations(selectedAffiliations, 'keep')}
                  size="sm"
                >
                  Keep all
                </Button>
                <Button
                  className="fr-mr-1w"
                  disabled={checkSelectedAffiliation()}
                  icon="ri-close-fill"
                  onClick={() => tagAffiliations(selectedAffiliations, 'exclude')}
                  size="sm"
                >
                  Exclude all
                </Button>
                <Button
                  className="fr-mb-1w"
                  icon="ri-refresh-line"
                  onClick={() => groupByAffiliations(publicationsDataTable)}
                  size="sm"
                >
                  Refresh
                </Button>
              </Col>
            </Row>
            <Row>
              <Col>
                {isLoadingAffiliations && (<Container as="section"><PageSpinner /></Container>)}
                {!isLoadingAffiliations && (
                  <AffiliationsView
                    affiliationsDataTable={affiliationsDataTable}
                    selectedAffiliations={selectedAffiliations}
                    setSelectedAffiliations={setSelectedAffiliations}
                  />
                )}
              </Col>
            </Row>
          </Tab>
          <Tab label={`Publications (${publicationsDataTable.length})`}>
            <Row>
              <Col className="text-right">
                <Button
                  className="fr-mr-1w"
                  disabled={selectedPublications.length === 0}
                  icon="ri-question-mark"
                  onClick={() => tagPublications(selectedPublications, 'sort')}
                  size="sm"
                >
                  Sort
                </Button>
                <Button
                  className="fr-mr-1w"
                  disabled={selectedPublications.length === 0}
                  icon="ri-check-fill"
                  onClick={() => tagPublications(selectedPublications, 'keep')}
                  size="sm"
                >
                  Keep
                </Button>
                <Button
                  className="fr-mb-1w"
                  disabled={selectedPublications.length === 0}
                  icon="ri-close-fill"
                  onClick={() => tagPublications(selectedPublications, 'exclude')}
                  size="sm"
                >
                  Exclude
                </Button>
              </Col>
            </Row>
            <Row>
              <Col>
                <PublicationsView
                  publicationsDataTable={publicationsDataTable}
                  selectedPublications={selectedPublications}
                  setSelectedPublications={setSelectedPublications}
                />
              </Col>
            </Row>
          </Tab>
        </Tabs>
      </Container>
    </>
  );
}
