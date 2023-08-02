/* eslint-disable indent */
/* eslint-disable jsx-a11y/control-has-associated-label */
/* eslint-disable no-case-declarations */
import { Button, Checkbox, Col, Container, Notice, Row, Tab, Tabs } from '@dataesr/react-dsfr';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import Actions from './actions';
import Filters from './filters';
import Metrics from './metrics';
import AffiliationsView from './views/affiliations';
import WorksView from './views/works';
import Gauge from '../../components/gauge';
import { PageSpinner } from '../../components/spinner';
import {
  getAllIdsHtmlField,
  getAffiliationsHtmlField,
  getAffiliationName,
  getAuthorsHtmlField,
  getAuthorsTooltipField,
} from '../../utils/templates';
import {
  getBsoCount,
  getBsoWorks,
  getOpenAlexWorks,
  mergeWorks,
} from '../../utils/works';

import 'primereact/resources/primereact.min.css';
import 'primereact/resources/themes/lara-light-indigo/theme.css';

const { VITE_BSO_MAX_SIZE } = import.meta.env;

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
  const [filterAffiliations, setFilterAffiliations] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
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
    setIsLoading(true);
    await setOptions(_options);
    refetch();
  };

  const groupByAffiliations = (works, regexp) => {
    const normalizedName = (name) => name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9]/g, '');
    let affiliationsDataTableTmp = {};
    works.filter((work) => work.status === TO_BE_DECIDED_STATUS).forEach((work) => {
      let affiliations = work?.affiliations ?? [];
      if (filterAffiliations) {
        affiliations = affiliations
          .map((affiliation) => ({
            ...affiliation,
            matches: affiliation.name.match(regexp)?.length ?? 0,
          }))
          .filter((affiliation) => !!affiliation.matches);
      }
      affiliations.forEach((affiliation) => {
        const affiliationName = normalizedName(affiliation.name);
        if (!Object.keys(affiliationsDataTableTmp).includes(affiliationName)) {
          affiliationsDataTableTmp[affiliationName] = {
            matches: affiliation?.matches,
            name: getAffiliationName(affiliation, regexp),
            status: TO_BE_DECIDED_STATUS,
            works: [],
          };
        }
        affiliationsDataTableTmp[affiliationName].works.push(work.id);
      });
    });
    affiliationsDataTableTmp = Object.values(affiliationsDataTableTmp)
      .sort((a, b) => b.works.length - a.works.length)
      .map((affiliation, index) => ({ ...affiliation, id: index.toString() }));
    setAffiliationsDataTable(affiliationsDataTableTmp);
    setIsLoading(false);
  };

  useEffect(() => {
    const regexp = new RegExp(`(${(options?.affiliations ?? [])
      .map((affiliationQuery) => affiliationQuery
        .replaceAll(/(a|à|á|â|ã|ä|å)/g, '(a|à|á|â|ã|ä|å)')
        .replaceAll(/(e|è|é|ê|ë)/g, '(e|è|é|ê|ë)')
        .replaceAll(/(i|ì|í|î|ï)/g, '(i|ì|í|î|ï)')
        .replaceAll(/(o|ò|ó|ô|õ|ö|ø)/g, '(o|ò|ó|ô|õ|ö|ø)')
        .replaceAll(/(u|ù|ú|û|ü)/g, '(u|ù|ú|û|ü)')
        .replaceAll(/(y|ý|ÿ)/g, '(y|ý|ÿ)')
        .replaceAll(/(n|ñ)/g, '(n|ñ)')
        .replaceAll(/(c|ç)/g, '(c|ç)')
        .replaceAll(/æ/g, '(æ|ae)')
        .replaceAll(/œ/g, '(œ|oe)'))
      .join('|')})`, 'gi');
    let worksDataTableTmp = [];
    if (data) {
      worksDataTableTmp = data.results
        .map((work) => ({
          ...work,
          affiliationsHtml: getAffiliationsHtmlField(work, regexp),
          allIdsHtml: getAllIdsHtmlField(work),
          authorsHtml: getAuthorsHtmlField(work),
          authorsTooltip: getAuthorsTooltipField(work),
          status: TO_BE_DECIDED_STATUS,
        }));
    }
    setWorksDataTable(worksDataTableTmp);
    groupByAffiliations(worksDataTableTmp, regexp);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, options]);

  useEffect(() => {
    setIsLoading(false);
    const regexp = new RegExp(`(${(options?.affiliations ?? [])
      .map((affiliationQuery) => affiliationQuery
        .replaceAll(/(a|à|á|â|ã|ä|å)/g, '(a|à|á|â|ã|ä|å)')
        .replaceAll(/(e|è|é|ê|ë)/g, '(e|è|é|ê|ë)')
        .replaceAll(/(i|ì|í|î|ï)/g, '(i|ì|í|î|ï)')
        .replaceAll(/(o|ò|ó|ô|õ|ö|ø)/g, '(o|ò|ó|ô|õ|ö|ø)')
        .replaceAll(/(u|ù|ú|û|ü)/g, '(u|ù|ú|û|ü)')
        .replaceAll(/(y|ý|ÿ)/g, '(y|ý|ÿ)')
        .replaceAll(/(n|ñ)/g, '(n|ñ)')
        .replaceAll(/(c|ç)/g, '(c|ç)')
        .replaceAll(/æ/g, '(æ|ae)')
        .replaceAll(/œ/g, '(œ|oe)'))
      .join('|')})`, 'gi');
    groupByAffiliations(worksDataTable, regexp);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterAffiliations, worksDataTable]);

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

  const renderAffiliationButtons = () => (
    <>
      <Button
        className="fr-mr-1w btn-keep"
        disabled={!selectedAffiliations.length}
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
        disabled={!selectedAffiliations.length}
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
        disabled={!selectedAffiliations.length}
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
              <Col n="8" offset="2">
                <Notice
                  className="fr-m-1w"
                  title="All the affiliations of the publications found in OpenAlex and French OSM are listed below. A filter can be applied to view only the affiliations containing at least one of the matching query input (this filter is applied by default but can be removed)"
                />
              </Col>
            </Row>
            <Row>
              <Col>
                {renderAffiliationButtons()}
              </Col>
              <Col className="text-right" n="2">
                <Checkbox
                  checked={filterAffiliations}
                  label="Filter on matching affiliations"
                  onChange={() => setFilterAffiliations(!filterAffiliations)}
                  size="sm"
                />
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
                {(isFetching || isLoading) && (<Container as="section"><PageSpinner /></Container>)}
                {!isFetching && !isLoading && (
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
                  disabled={!selectedWorks.length}
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
                  disabled={!selectedWorks.length}
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
                  disabled={!selectedWorks.length}
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
                    { label: 'French OSM', color: '#334476', value: worksDataTable.filter((work) => work.datasource === 'bso').length },
                    { label: 'OpenAlex', color: '#22a498', value: worksDataTable.filter((work) => work.datasource === 'openalex').length },
                    { label: 'Both', color: '#2faf41a4', value: worksDataTable.filter((work) => work.datasource === 'bso, openalex').length },
                  ]}
                />
              </Col>
            </Row>
            <Row>
              <Col>
                {(isFetching || isLoading) && (<Container as="section"><PageSpinner /></Container>)}
                {!isFetching && !isLoading && (
                  <WorksView
                    selectedWorks={selectedWorks}
                    setSelectedWorks={setSelectedWorks}
                    worksDataTable={worksDataTable}
                  />
                )}
              </Col>
            </Row>
          </Tab>
        </Tabs>
      </Container>
    </>
  );
}
