/* eslint-disable max-len */
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
  getAffiliationRor,
  getAffiliationsHtmlField,
  getAffiliationsSearchField,
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
const REGEXP_ROR = /^(https:\/\/ror\.org\/|ror\.org\/){0,1}0[a-hj-km-np-tv-z|0-9]{6}[0-9]{2}$/;

const getRorAffiliations = (affiliations) => {
  const notRorAffiliations = [];
  const rorAffiliations = [];
  affiliations.forEach((affiliation) => {
    // eslint-disable-next-line no-unused-expressions
    affiliation.match(REGEXP_ROR) ? rorAffiliations.push(affiliation) : notRorAffiliations.push(affiliation);
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
  const [allAffiliations, setAllAffiliations] = useState([]);
  const [allWorks, setAllWorks] = useState([]);
  const [filterAffiliations, setFilterAffiliations] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [options, setOptions] = useState({});
  const [regexp, setRegexp] = useState();
  const [selectedAffiliations, setSelectedAffiliations] = useState([]);
  const [selectedWorks, setSelectedWorks] = useState([]);
  const [affiliationsNotice, setAffiliationsNotice] = useState(true);
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

  const normalizedName = (name) => name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[^a-zA-Z0-9]/g, '');

  const groupByAffiliations = (works) => {
    setIsLoading(true);
    // Save already decided affiliations
    const decidedAffiliations = Object.values(allAffiliations).filter((affiliation) => affiliation.status !== TO_BE_DECIDED_STATUS);
    // Compute distinct affiliations of the undecided works
    let allAffiliationsTmp = {};
    works.filter((work) => work.status === TO_BE_DECIDED_STATUS).forEach((work) => {
      (work?.affiliations ?? [])
        .filter((affiliation) => Object.keys(affiliation).length && affiliation?.name)
        .forEach((affiliation) => {
          const ror = getAffiliationRor(affiliation);
          const normalizedAffiliationName = normalizedName(affiliation.name);
          if (!allAffiliationsTmp?.[normalizedAffiliationName]) {
            allAffiliationsTmp[normalizedAffiliationName] = {
              matches: [...new Set((affiliation?.name?.match(regexp) ?? []).map((name) => normalizedName(name)))].length,
              name: affiliation.name,
              nameHtml: affiliation.name.replace(regexp, '<b>$&</b>'),
              ror,
              status: TO_BE_DECIDED_STATUS,
              works: [],
            };
          }
          allAffiliationsTmp[normalizedAffiliationName].works.push(work.id);
        });
    });

    decidedAffiliations.forEach((affiliation) => {
      const affiliationName = normalizedName(affiliation.name);

      if (!allAffiliationsTmp?.[affiliationName]) {
        allAffiliationsTmp[affiliationName] = affiliation;
      } else {
        allAffiliationsTmp[affiliationName].status = affiliation.status;
      }
    });

    allAffiliationsTmp = Object.values(allAffiliationsTmp)
      .map((affiliation, index) => ({ ...affiliation, works: [...new Set(affiliation.works)], id: index.toString(), worksNumber: [...new Set(affiliation.works)].length }));
    setAllAffiliations(allAffiliationsTmp);
    setIsLoading(false);
  };

  useEffect(() => {
    const regexpTmp = new RegExp(`(${(options?.affiliations ?? [])
      .map((affiliationQuery) => (affiliationQuery.match(REGEXP_ROR) ? affiliationQuery : affiliationQuery
        .replaceAll(/(a|à|á|â|ã|ä|å)/g, '(a|à|á|â|ã|ä|å)')
        .replaceAll(/(e|è|é|ê|ë)/g, '(e|è|é|ê|ë)')
        .replaceAll(/(i|ì|í|î|ï)/g, '(i|ì|í|î|ï)')
        .replaceAll(/(o|ò|ó|ô|õ|ö|ø)/g, '(o|ò|ó|ô|õ|ö|ø)')
        .replaceAll(/(u|ù|ú|û|ü)/g, '(u|ù|ú|û|ü)')
        .replaceAll(/(y|ý|ÿ)/g, '(y|ý|ÿ)')
        .replaceAll(/(n|ñ)/g, '(n|ñ)')
        .replaceAll(/(c|ç)/g, '(c|ç)')
        .replaceAll(/æ/g, '(æ|ae)')
        .replaceAll(/œ/g, '(œ|oe)')))
      .join('|')})`, 'gi');
    setRegexp(regexpTmp);
  }, [options?.affiliations]);

  useEffect(() => {
    let allWorksTmp = [];
    if (data) {
      allWorksTmp = data.results
        .map((work) => ({
          ...work,
          affiliationsSearch: getAffiliationsSearchField(work),
          affiliationsHtml: getAffiliationsHtmlField(work, regexp),
          allIdsHtml: getAllIdsHtmlField(work),
          authorsHtml: getAuthorsHtmlField(work),
          authorsTooltip: getAuthorsTooltipField(work),
          status: TO_BE_DECIDED_STATUS,
        }));
    }
    setAllWorks(allWorksTmp);
  }, [data, regexp]);

  useEffect(() => {
    groupByAffiliations(allWorks, regexp);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allWorks]);

  const tagWorks = (works, action) => {
    const allWorksTmp = [...allWorks];
    const workIds = works.map((work) => work.id);
    allWorksTmp.filter((work) => workIds.includes(work.id)).map((work) => work.status = action);
    setAllWorks(allWorksTmp);
    setSelectedWorks([]);
  };

  const tagAffiliations = (affiliations, action) => {
    if (action !== EXCLUDED_STATUS) {
      const allWorksTmp = [...allWorks];
      const workIds = affiliations.map((affiliation) => affiliation.works).flat();
      allWorksTmp.filter((work) => workIds.includes(work.id)).map((work) => work.status = action);
      setAllWorks(allWorksTmp);
    }
    const allAffiliationsTmp = [...allAffiliations];
    const affiliationIds = affiliations.map((affiliation) => affiliation.id);
    allAffiliationsTmp.filter((affiliation) => affiliationIds.includes(affiliation.id)).map((affiliation) => affiliation.status = action);
    setAllAffiliations(allAffiliationsTmp);
    setSelectedAffiliations([]);
  };
  const renderAffiliationsButtons = () => (
    <>
      <Button
        className="fr-mr-1w btn-keep"
        disabled={!selectedAffiliations.length}
        icon="ri-checkbox-circle-line"
        onClick={() => tagAffiliations(selectedAffiliations, VALIDATED_STATUS)}
        size="sm"
      >
        Validate
        {` (${selectedAffiliations.length})`}
      </Button>
      <Button
        className="fr-mr-1w btn-hide"
        disabled={!selectedAffiliations.length}
        icon="ri-indeterminate-circle-line"
        onClick={() => tagAffiliations(selectedAffiliations, EXCLUDED_STATUS)}
        size="sm"
      >
        Exclude
        {` (${selectedAffiliations.length})`}
      </Button>
      <Button
        className="fr-mb-1w btn-reset"
        disabled={!selectedAffiliations.length}
        icon="ri-reply-fill"
        onClick={() => tagAffiliations(selectedAffiliations, TO_BE_DECIDED_STATUS)}
        size="sm"
      >
        Reset status
        {` (${selectedAffiliations.length})`}
      </Button>
    </>
  );

  const renderWorksButtons = () => (
    <>
      <Button
        className="fr-mr-1w btn-keep"
        disabled={!selectedWorks.length}
        icon="ri-checkbox-circle-line"
        onClick={() => tagWorks(selectedWorks, VALIDATED_STATUS)}
        size="sm"
      >
        Validate
        {` (${selectedWorks.length})`}
      </Button>
      <Button
        className="fr-mr-1w btn-hide"
        disabled={!selectedWorks.length}
        icon="ri-indeterminate-circle-line"
        onClick={() => tagWorks(selectedWorks, EXCLUDED_STATUS)}
        size="sm"
      >
        Exclude
        {` (${selectedWorks.length})`}
      </Button>
      <Button
        className="fr-mb-1w btn-reset"
        disabled={!selectedWorks.length}
        icon="ri-reply-fill"
        onClick={() => tagWorks(selectedWorks, TO_BE_DECIDED_STATUS)}
        size="sm"
      >
        Reset status
        {` (${selectedWorks.length})`}
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
          allAffiliations={allAffiliations}
          allWorks={allWorks}
          options={options}
          setAllAffiliations={setAllAffiliations}
          setAllWorks={setAllWorks}
        />
        <Tabs defaultActiveTab={0}>
          <Tab label={`Affiliations (${filterAffiliations ? allAffiliations.filter((affiliation) => !!affiliation.matches).length : allAffiliations.length})`}>
            {affiliationsNotice && (
              <Row>
                <Col n="12">
                  <Notice
                    className="fr-m-1w"
                    onClose={() => { setAffiliationsNotice(false); }}
                    title="All the affiliations of the publications found in OpenAlex and French OSM are listed below. A filter can be applied to view only the affiliations containing at least one of the matching query input (this filter is applied by default but can be removed)"
                  />
                </Col>
              </Row>
            )}
            <Row>
              <Col>
                {renderAffiliationsButtons()}
              </Col>
              <Col className="text-right" n="3">
                <Checkbox
                  checked={filterAffiliations}
                  label="Filter on matching affiliations"
                  onChange={() => setFilterAffiliations(!filterAffiliations)}
                  size="sm"
                />
              </Col>
              <Col className="text-right" n="2">
                <Button
                  className="fr-mb-1w"
                  icon="ri-refresh-line"
                  onClick={() => groupByAffiliations(allWorks)}
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
                    allAffiliations={filterAffiliations ? allAffiliations.filter((affiliation) => !!affiliation.matches) : allAffiliations}
                    selectedAffiliations={selectedAffiliations}
                    setSelectedAffiliations={setSelectedAffiliations}
                  />
                )}
              </Col>
            </Row>
            <Row>
              <Col>
                {renderAffiliationsButtons()}
              </Col>
            </Row>
          </Tab>
          <Tab label={`Works (${allWorks.filter((work) => work.status === VALIDATED_STATUS).length} / ${allWorks.length})`}>
            <Row>
              <Col>
                {renderWorksButtons()}
              </Col>
              <Col>
                <Gauge
                  data={[
                    { label: 'French OSM', color: '#334476', value: allWorks.filter((work) => work.datasource === 'bso').length },
                    { label: 'OpenAlex', color: '#22a498', value: allWorks.filter((work) => work.datasource === 'openalex').length },
                    { label: 'Both', color: '#2faf41a4', value: allWorks.filter((work) => work.datasource === 'bso, openalex').length },
                  ]}
                />
              </Col>
            </Row>
            <Row>
              <Col>
                {(isFetching || isLoading) && (<Container as="section"><PageSpinner /></Container>)}
                {!isFetching && !isLoading && (
                  <WorksView
                    allWorks={allWorks}
                    selectedWorks={selectedWorks}
                    setSelectedWorks={setSelectedWorks}
                  />
                )}
              </Col>
            </Row>
            <Row>
              <Col>
                {renderWorksButtons()}
              </Col>
            </Row>
          </Tab>
        </Tabs>
      </Container>
    </>
  );
}
