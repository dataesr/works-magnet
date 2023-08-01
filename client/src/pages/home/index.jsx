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
import WorksView from './views/works';
import { PageSpinner } from '../../components/spinner';
import {
  getBsoCount,
  getBsoWorks,
  getOpenAlexWorks,
  mergeWorks,
} from '../../utils/works';
import {
  getAllIdsHtmlField,
  getAffiliationsHtmlField,
  getAuthorsHtmlField,
  getAuthorsTooltipField,
} from '../../utils/templates';

import './index.scss';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import Gauge from '../../components/gauge';

const {
  VITE_BSO_MAX_SIZE,
} = import.meta.env;

const TO_BE_DECIDED_STATUS = 'to be decided';
const VALIDATED_STATUS = 'validated';
const EXCLUDED_STATUS = 'excluded';

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
        return getBsoWorks(options);
      case 'openalex':
        const { notRorAffiliations, rorAffiliations } = getRorAffiliations(options.affiliations);
        const { notRorAffiliations: notRorAffiliationsToExclude, rorAffiliations: rorAffiliationsToExclude } = getRorAffiliations(options.affiliationsToExclude);
        const { notRorAffiliations: notRorAffiliationsToInclude, rorAffiliations: rorAffiliationsToInclude } = getRorAffiliations(options.affiliationsToInclude);
        const p = [];
        if (notRorAffiliations.length || notRorAffiliationsToExclude.length || notRorAffiliationsToInclude.length) {
          p.push(getOpenAlexWorks({
            ...options,
            affiliations: notRorAffiliations,
            affiliationsToExclude: notRorAffiliationsToExclude,
            affiliationsToInclude: notRorAffiliationsToInclude,
          }, false));
        }
        if (rorAffiliations.length || rorAffiliationsToExclude.length || rorAffiliationsToInclude.length) {
          p.push(getOpenAlexWorks({
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
  const works = await Promise.all(promises.flat());
  const data = { results: [], total: {} };
  works.forEach((work) => {
    data.results = [...data.results, ...work.results];
    data.total[work.datasource] = work.total;
  });
  // Correct BSO total if maximum is reached
  if (Number(data.total.bso) === Number(VITE_BSO_MAX_SIZE)) {
    const { count } = await getBsoCount(options);
    data.total.bso = count;
  }
  // Deduplicate works by DOI or by hal_id
  data.total.all = data.results.length;
  const deduplicatedWorks = {};
  data.results.forEach((work) => {
    const id = work?.doi ?? work?.primary_location?.landing_page_url?.split('/')?.pop() ?? work.id;
    if (!Object.keys(deduplicatedWorks).includes(id)) {
      deduplicatedWorks[id] = work;
    } else {
      deduplicatedWorks[id] = mergeWorks(deduplicatedWorks[id], work);
    }
  });
  data.results = Object.values(deduplicatedWorks);
  data.total.deduplicated = Object.values(deduplicatedWorks).length;
  return data;
};

export default function Home() {
  const [affiliationsDataTable, setAffiliationsDataTable] = useState([]);
  const [isLoadingAffiliations, setIsLoadingAffiliations] = useState(false);
  const [options, setOptions] = useState({});
  const [selectedAffiliations, setSelectedAffiliations] = useState([]);
  const [selectedWorks, setSelectedWorks] = useState([]);
  const [worksDataTable, setWorksDataTable] = useState([]);
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

  const groupByAffiliations = (works) => {
    setIsLoadingAffiliations(true);
    const normalizedName = (name) => name
      .toLowerCase()
      .replaceAll('<em>', '')
      .replaceAll('</em>', '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9]/g, '');
    let affiliationsDataTableTmp = {};
    works.filter((work) => work.status === TO_BE_DECIDED_STATUS).forEach((work) => {
      switch (work.datasource) {
        case 'bso, openalex':
        case 'bso':
          (work?.affiliations ?? []).forEach((affiliation) => {
            const affiliationName = normalizedName(affiliation.name);
            if (!Object.keys(affiliationsDataTableTmp).includes(affiliationName)) {
              affiliationsDataTableTmp[affiliationName] = {
                name: affiliation.name,
                status: TO_BE_DECIDED_STATUS,
                works: [],
              };
            }
            affiliationsDataTableTmp[affiliationName].works.push(work.id);
          });
          break;
        case 'openalex':
          (work?.authors ?? []).forEach((author) => (author?.raw_affiliation_strings ?? []).forEach((affiliation) => {
            const affiliationName = normalizedName(affiliation);
            if (!Object.keys(affiliationsDataTableTmp).includes(affiliationName)) {
              affiliationsDataTableTmp[affiliationName] = {
                name: affiliation,
                status: TO_BE_DECIDED_STATUS,
                works: [],
              };
            }
            affiliationsDataTableTmp[affiliationName].works.push(work.id);
          }));
          break;
        default:
          // eslint-disable-next-line no-console
          console.error(`Datasource ${work.datasource} not integrated`);
      }
    });
    affiliationsDataTableTmp = Object.values(affiliationsDataTableTmp)
      .sort((a, b) => b.works.length - a.works.length)
      .map((affiliation, index) => ({ ...affiliation, id: index.toString() }));
    setAffiliationsDataTable(affiliationsDataTableTmp);
    setIsLoadingAffiliations(false);
  };

  useEffect(() => {
    let worksDataTableTmp = [];
    if (data) {
      worksDataTableTmp = data.results
        .map((work) => ({
          ...work,
          affiliationsHtml: getAffiliationsHtmlField(work),
          allIdsHtml: getAllIdsHtmlField(work),
          authorsHtml: getAuthorsHtmlField(work),
          authorsTooltip: getAuthorsTooltipField(work),
          status: TO_BE_DECIDED_STATUS,
        }));
    }
    setWorksDataTable(worksDataTableTmp);
    groupByAffiliations(worksDataTableTmp);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const tagWorks = (works, action) => {
    const worksDataTableTmp = [...worksDataTable];
    const workIds = works.map((work) => work.id);
    worksDataTableTmp.filter((work) => workIds.includes(work.id)).map((work) => work.status = action);
    setWorksDataTable(worksDataTableTmp);
    setSelectedWorks([]);
  };

  const tagAffiliations = (affiliations, action) => {
    if (action !== EXCLUDED_STATUS) {
      const worksDataTableTmp = [...worksDataTable];
      const workIds = affiliations.map((affiliation) => affiliation.works).flat();
      worksDataTableTmp.filter((work) => workIds.includes(work.id)).map((work) => work.status = action);
      setWorksDataTable(worksDataTableTmp);
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

  const renderAffiliationButtons = () => (
    <>
      <Button
        className="fr-mr-1w btn-keep"
        disabled={checkSelectedAffiliation()}
        icon="ri-checkbox-circle-line"
        onClick={() => tagAffiliations(selectedAffiliations, VALIDATED_STATUS)}
        size="sm"
      >
        Validate
        {!!selectedAffiliations.length && (
          ` (${selectedAffiliations.length})`
        )}
      </Button>
      <Button
        className="fr-mr-1w btn-hide"
        disabled={checkSelectedAffiliation()}
        icon="ri-indeterminate-circle-line"
        onClick={() => tagAffiliations(selectedAffiliations, EXCLUDED_STATUS)}
        size="sm"
      >
        Exclude
        {!!selectedAffiliations.length && (
          ` (${selectedAffiliations.length})`
        )}
      </Button>
      <Button
        className="fr-mb-1w btn-reset"
        disabled={checkSelectedAffiliation()}
        icon="ri-reply-fill"
        onClick={() => tagAffiliations(selectedAffiliations, TO_BE_DECIDED_STATUS)}
        size="sm"
      >
        Reset status
        {!!selectedAffiliations.length && (
          ` (${selectedAffiliations.length})`
        )}
      </Button>
    </>
  );

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
          options={options}
          setAffiliationsDataTable={setAffiliationsDataTable}
          setWorksDataTable={setWorksDataTable}
          worksDataTable={worksDataTable}
        />
        <Tabs defaultActiveTab={0}>
          <Tab label={`Affiliations (${affiliationsDataTable.length})`}>
            <Row>
              <Col>
                {renderAffiliationButtons()}
              </Col>
              <Col className="text-right" n="2">
                <Button
                  className="fr-mb-1w"
                  icon="ri-refresh-line"
                  onClick={() => groupByAffiliations(worksDataTable)}
                  size="sm"
                >
                  Refresh affiliations
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
            <Row>
              <Col>
                {renderAffiliationButtons()}
              </Col>
            </Row>
          </Tab>
          <Tab label={`Works (${worksDataTable.filter((work) => work.status === VALIDATED_STATUS).length} / ${worksDataTable.length})`}>
            <Row>
              <Col>
                <Button
                  className="fr-mr-1w btn-keep"
                  disabled={selectedWorks.length === 0}
                  icon="ri-checkbox-circle-line"
                  onClick={() => tagWorks(selectedWorks, VALIDATED_STATUS)}
                  size="sm"
                >
                  Validate
                  {!!selectedWorks.length && (
                    ` (${selectedWorks.length})`
                  )}
                </Button>
                <Button
                  className="fr-mr-1w btn-hide"
                  disabled={selectedWorks.length === 0}
                  icon="ri-indeterminate-circle-line"
                  onClick={() => tagWorks(selectedWorks, EXCLUDED_STATUS)}
                  size="sm"
                >
                  Exclude
                  {!!selectedWorks.length && (
                    ` (${selectedWorks.length})`
                  )}
                </Button>
                <Button
                  className="fr-mb-1w btn-reset"
                  disabled={selectedWorks.length === 0}
                  icon="ri-reply-fill"
                  onClick={() => tagWorks(selectedWorks, TO_BE_DECIDED_STATUS)}
                  size="sm"
                >
                  Reset status
                  {!!selectedWorks.length && (
                    ` (${selectedWorks.length})`
                  )}
                </Button>
              </Col>
              <Col>
                <Gauge
                  data={[
                    { label: 'French Monitor', color: '#334476', value: worksDataTable.filter((work) => work.datasource === 'bso').length },
                    { label: 'openAlex', color: '#22a498', value: worksDataTable.filter((work) => work.datasource === 'openalex').length },
                    { label: 'Both', color: '#2faf41a4', value: worksDataTable.filter((work) => work.datasource === 'bso, openalex').length },
                  ]}
                />
              </Col>
            </Row>
            <Row>
              <Col>
                <WorksView
                  selectedWorks={selectedWorks}
                  setSelectedWorks={setSelectedWorks}
                  worksDataTable={worksDataTable}
                />
              </Col>
            </Row>
          </Tab>
        </Tabs>
      </Container>
    </>
  );
}
