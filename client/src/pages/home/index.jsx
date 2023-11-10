/* eslint-disable max-len */
/* eslint-disable indent */
/* eslint-disable jsx-a11y/control-has-associated-label */
/* eslint-disable no-case-declarations */
import {
  Button,
  Checkbox,
  CheckboxGroup,
  Col,
  Container,
  Notice,
  Row,
  Tab,
  Tabs,
  TextInput,
} from '@dataesr/react-dsfr';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import Actions from './actions';
import Filters from './filters';
// import Metrics from './metrics';
import AffiliationsView from './views/affiliations';
import WorksView from './views/works';
import Gauge from '../../components/gauge';
import { PageSpinner } from '../../components/spinner';
import {
  getAllIdsHtmlField,
  getAffiliationRor,
  getAffiliationsHtmlField,
  getAffiliationsTooltipField,
  getAuthorsHtmlField,
  getAuthorsTooltipField,
} from '../../utils/templates';
import {
  getBsoCount,
  getBsoWorks,
  getOpenAlexPublications,
  mergePublications,
} from '../../utils/works';
import { status } from '../../config';

import 'primereact/resources/primereact.min.css';
import 'primereact/resources/themes/lara-light-indigo/theme.css';

const {
  VITE_BSO_MAX_SIZE,
  VITE_BSO_DATASETS_INDEX,
  VITE_BSO_PUBLICATIONS_INDEX,
} = import.meta.env;

const DATASOURCES = [{ key: 'bso', label: 'French OSM' }, { key: 'openalex', label: 'OpenAlex' }];

const getData = async (options) => {
  const promises1 = [getBsoWorks({ options, index: VITE_BSO_PUBLICATIONS_INDEX }), getOpenAlexPublications(options)];
  const publications = await Promise.all(promises1.flat());
  const promises2 = [getBsoWorks({ options, index: VITE_BSO_DATASETS_INDEX })];
  const datasets = await Promise.all(promises2.flat());
  const data = { datasets: [], publications: [], total: {} };
  publications.forEach((publication) => {
    data.publications = [...data.publications, ...publication.results];
    data.total[publication.datasource] = publication.total;
  });
  datasets.forEach((dataset) => {
    data.datasets = [...data.datasets, ...dataset.results];
    data.total.dataset = dataset.total;
  });
  // Correct BSO total if maximum is reached
  if ((Number(data.total.bso) === 0) || (Number(data.total.bso) === Number(VITE_BSO_MAX_SIZE))) {
    const { count } = await getBsoCount(options);
    data.total.bso = count;
  }
  // Deduplicate publications by DOI or by hal_id
  data.total.all = data.publications.length;
  const deduplicatedPublications = {};
  data.publications.forEach((publication) => {
    const id = publication?.doi ?? publication?.primary_location?.landing_page_url?.split('/')?.pop() ?? publication.id;
    if (!Object.keys(deduplicatedPublications).includes(id)) {
      deduplicatedPublications[id] = publication;
    } else {
      deduplicatedPublications[id] = mergePublications(deduplicatedPublications[id], publication);
    }
  });
  data.publications = Object.values(deduplicatedPublications);
  data.total.deduplicated = Object.values(deduplicatedPublications).length;
  return data;
};

export default function Home() {
  const [affiliationsNotice, setAffiliationsNotice] = useState(true);
  const [allAffiliations, setAllAffiliations] = useState([]);
  const [allDatasets, setAllDatasets] = useState([]);
  const [allPublications, setAllPublications] = useState([]);
  const [filteredAffiliationName, setFilteredAffiliationName] = useState('');
  const [filteredDatasources, setFilteredDatasources] = useState(DATASOURCES.map((datasource) => datasource.key));
  const [filteredPublications, setFilteredPublications] = useState([]);
  const [filteredStatus, setFilteredStatus] = useState(Object.keys(status));
  const [filteredYears, setFilteredYears] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [options, setOptions] = useState({});
  const [regexp, setRegexp] = useState();
  const [selectedAffiliations, setSelectedAffiliations] = useState([]);
  const [selectedDatasets, setSelectedDatasets] = useState([]);
  const [selectedPublications, setSelectedPublications] = useState([]);
  const [timer, setTimer] = useState();
  const [years, setYears] = useState([]);

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

  const groupByAffiliations = () => {
    setIsLoading(true);
    // Save already decided affiliations
    const decidedAffiliations = Object.values(allAffiliations).filter((affiliation) => affiliation.status !== status.tobedecided.id);
    // Compute distinct affiliations of the undecided works
    let allAffiliationsTmp = {};
    [...allDatasets, ...allPublications].filter((work) => work.status === status.tobedecided.id).forEach((work) => {
      (work?.affiliations ?? [])
        .filter((affiliation) => Object.keys(affiliation).length && affiliation?.name)
        .forEach((affiliation) => {
          const ror = getAffiliationRor(affiliation);
          const normalizedAffiliationName = normalizedName(affiliation.name);
          if (!allAffiliationsTmp?.[normalizedAffiliationName]) {
            // Check matches in affiliation name
            let matches = `${affiliation?.name}`?.match(regexp) ?? [];
            // Normalize matched strings
            matches = matches.map((name) => normalizedName(name));
            // Filter matches as unique
            matches = [...new Set(matches)];
            allAffiliationsTmp[normalizedAffiliationName] = {
              matches: matches.length,
              name: affiliation.name,
              nameHtml: affiliation.name.replace(regexp, '<b>$&</b>'),
              ror,
              rorHtml: ror?.replace(regexp, '<b>$&</b>'),
              status: status.tobedecided.id,
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
    setRegexp(regexpTmp);
  }, [options?.affiliations]);

  useEffect(() => {
    let allDatasetsTmp = [];
    let allPublicationsTmp = [];
    if (data) {
      allDatasetsTmp = data.datasets
        .map((dataset) => ({
          ...dataset,
          affiliationsHtml: getAffiliationsHtmlField(dataset, regexp),
          affiliationsTooltip: getAffiliationsTooltipField(dataset),
          allIdsHtml: getAllIdsHtmlField(dataset),
          authorsHtml: getAuthorsHtmlField(dataset),
          authorsTooltip: getAuthorsTooltipField(dataset),
          status: status.tobedecided.id,
        }));
      allPublicationsTmp = data.publications
        .map((publication) => ({
          ...publication,
          affiliationsHtml: getAffiliationsHtmlField(publication, regexp),
          affiliationsTooltip: getAffiliationsTooltipField(publication),
          allIdsHtml: getAllIdsHtmlField(publication),
          authorsHtml: getAuthorsHtmlField(publication),
          authorsTooltip: getAuthorsTooltipField(publication),
          status: status.tobedecided.id,
        }));
    }
    setAllDatasets(allDatasetsTmp);
    setAllPublications(allPublicationsTmp);
    const allYears = [...new Set(allPublicationsTmp.map((publication) => publication?.year))];
    setYears(allYears);
    setFilteredYears(allYears);
    setFilteredPublications(allPublicationsTmp);
  }, [data, regexp]);

  useEffect(() => {
    if (timer) {
      clearTimeout(timer);
    }
    const timerTmp = setTimeout(() => {
      const filteredPublicationsTmp = allPublications.filter((publication) => publication.affiliationsTooltip.includes(filteredAffiliationName) && filteredDatasources.includes(publication.datasource) && filteredStatus.includes(publication.status) && filteredYears.includes(publication.year));
      setFilteredPublications(filteredPublicationsTmp);
    }, 500);
    setTimer(timerTmp);
  // The timer should not be tracked
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allPublications, filteredAffiliationName, filteredDatasources, filteredStatus, filteredYears]);

  useEffect(() => {
    groupByAffiliations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allDatasets, allPublications, regexp]);

  const tagPublications = (publications, action) => {
    const allPublicationsTmp = [...allPublications];
    const publicationsIds = publications.map((publication) => publication.id);
    allPublicationsTmp.filter((publication) => publicationsIds.includes(publication.id)).map((publication) => publication.status = action);
    setAllPublications(allPublicationsTmp);
    setSelectedPublications([]);
  };

  const tagDatasets = (datasets, action) => {
    const allDatasetsTmp = [...allDatasets];
    const datasetsIds = datasets.map((dataset) => dataset.id);
    allDatasetsTmp.filter((dataset) => datasetsIds.includes(dataset.id)).map((dataset) => dataset.status = action);
    setAllDatasets(allDatasetsTmp);
    setSelectedDatasets([]);
  };

  const tagAffiliations = (affiliations, action) => {
    if (action !== status.excluded.id) {
      const worksIds = affiliations.map((affiliation) => affiliation.works).flat();
      const allPublicationsTmp = [...allPublications];
      allPublicationsTmp.filter((publication) => worksIds.includes(publication.id)).map((publication) => publication.status = action);
      setAllPublications(allPublicationsTmp);
      const allDatasetsTmp = [...allDatasets];
      allDatasetsTmp.filter((dataset) => worksIds.includes(dataset.id)).map((dataset) => dataset.status = action);
      setAllDatasets(allDatasetsTmp);
    }
    const allAffiliationsTmp = [...allAffiliations];
    const affiliationIds = affiliations.map((affiliation) => affiliation.id);
    allAffiliationsTmp.filter((affiliation) => affiliationIds.includes(affiliation.id)).map((affiliation) => affiliation.status = action);
    setAllAffiliations(allAffiliationsTmp);
    setSelectedAffiliations([]);
  };

  const renderButtons = (selected, fn) => (
    <>
      {Object.values(status).map((st) => (
        <Button
          className={`fr-mb-1w fr-mr-1w ${st.buttonClassName}`}
          disabled={!selected.length}
          icon={st.buttonIcon}
          key={st.id}
          onClick={() => fn(selected, st.id)}
          size="sm"
        >
          {`${st.buttonLabel} (${selected.length})`}
        </Button>
      ))}
    </>
  );

  const onDatasourcesChange = (datasource) => {
    if (filteredDatasources.includes(datasource.key)) {
      setFilteredDatasources(filteredDatasources.filter((filteredDatasource) => filteredDatasource !== datasource.key));
    } else {
      setFilteredDatasources(filteredDatasources.concat([datasource.key]));
    }
  };

  const onStatusChange = (st) => {
    if (filteredStatus.includes(st)) {
      setFilteredStatus(filteredStatus.filter((filteredSt) => filteredSt !== st));
    } else {
      setFilteredStatus(filteredStatus.concat([st]));
    }
  };

  const onYearsChange = (year) => {
    if (filteredYears.includes(year)) {
      setFilteredYears(filteredYears.filter((filteredYear) => filteredYear !== year));
    } else {
      setFilteredYears(filteredYears.concat([year]));
    }
  };

  return (
    <>
      <Container className="fr-my-5w" as="section" fluid>
        <Row className="fr-px-5w">
          <Col>
            <Filters
              sendQuery={sendQuery}
            />
          </Col>
          {/*
            <Col n="3">
              {data && (<Metrics data={data} />)}
            </Col>
          */}
        </Row>
      </Container>
      <Container className="fr-mx-5w" as="section" fluid>
        <Actions
          allAffiliations={allAffiliations}
          allPublications={allPublications}
          options={options}
          setAllAffiliations={setAllAffiliations}
          setAllPublications={setAllPublications}
          tagAffiliations={tagAffiliations}
        />
        <Tabs defaultActiveTab={0}>
          <Tab label="Grouped affiliations of works">
            {affiliationsNotice && (
              <Row>
                <Col n="12">
                  <Notice
                    className="fr-m-1w"
                    onClose={() => { setAffiliationsNotice(false); }}
                    title="All the affiliations of the works found in the French OSM and OpenAlex are listed below. A filter is applied to view only the affiliations containing at least one of the matching query input"
                  />
                </Col>
              </Row>
            )}
            <Row>
              <Col n="4">
                {renderButtons(selectedAffiliations, tagAffiliations)}
              </Col>
              <Col>
                <Gauge
                  data={Object.values(status).map((st) => ({
                    ...st,
                    value: allAffiliations.filter((affiliation) => affiliation.status === st.id).length,
                  }))}
                />
              </Col>
            </Row>
            <Row>
              <Col>
                {(isFetching || isLoading) && (<Container as="section"><PageSpinner /></Container>)}
                {!isFetching && !isLoading && (
                  <AffiliationsView
                    allAffiliations={allAffiliations.filter((affiliation) => !!affiliation.matches)}
                    selectedAffiliations={selectedAffiliations}
                    setSelectedAffiliations={setSelectedAffiliations}
                  />
                )}
              </Col>
            </Row>
            <Row>
              <Col>
                {renderButtons(selectedAffiliations, tagAffiliations)}
              </Col>
            </Row>
          </Tab>
          <Tab label="List all publications">
            <Row>
              <Col n="4">
                {renderButtons(selectedPublications, tagPublications)}
              </Col>
              <Col>
                <Gauge
                  data={Object.values(status).map((st) => ({
                    ...st,
                    value: allPublications.filter((publication) => publication.status === st.id).length,
                  }))}
                />
              </Col>
            </Row>
            {(isFetching || isLoading) && (<Container as="section"><PageSpinner /></Container>)}
            {(!isFetching && !isLoading) && (
              <Row>
                <Col n="2">
                  <CheckboxGroup
                    hint="Filter results on selected status"
                    legend="Status"
                  >
                    {Object.values(status).map((st) => (
                      <Checkbox
                        checked={filteredStatus.includes(st.id)}
                        key={st.id}
                        label={st.label}
                        onChange={() => onStatusChange(st.id)}
                        size="sm"
                      />
                    ))}
                  </CheckboxGroup>
                  <CheckboxGroup
                    hint="Filter results on selected datasources"
                    legend="Source"
                  >
                    {DATASOURCES.map((datasource) => (
                      <Checkbox
                        checked={filteredDatasources.includes(datasource.key)}
                        key={datasource.key}
                        label={datasource.label}
                        onChange={() => onDatasourcesChange(datasource)}
                        size="sm"
                      />
                    ))}
                  </CheckboxGroup>
                  <CheckboxGroup
                    hint="Filter results on selected years"
                    legend="Years"
                  >
                    {years.map((year) => (
                      <Checkbox
                        checked={filteredYears.includes(year)}
                        key={year}
                        label={year.toString()}
                        onChange={() => onYearsChange(year)}
                        size="sm"
                      />
                    ))}
                  </CheckboxGroup>
                  <TextInput
                    label="Filter on affiliations"
                    onChange={(e) => setFilteredAffiliationName(e.target.value)}
                    value={filteredAffiliationName}
                  />
                </Col>
                <Col>
                  <WorksView
                    selectedWorks={selectedPublications}
                    setSelectedWorks={setSelectedPublications}
                    works={filteredPublications}
                  />
                </Col>
              </Row>
            )}
            <Row>
              <Col n="4">
                {renderButtons(selectedPublications, tagPublications)}
              </Col>
            </Row>
          </Tab>
          <Tab label="List all datasets">
            <Row>
              <Col n="4">
                {renderButtons(selectedDatasets, tagDatasets)}
              </Col>
              <Col>
                <Gauge
                  data={Object.values(status).map((st) => ({
                    ...st,
                    value: allDatasets.filter((dataset) => dataset.status === st.id).length,
                  }))}
                />
              </Col>
            </Row>
            <Row>
              <Col>
                {(isFetching || isLoading) && (<Container as="section"><PageSpinner /></Container>)}
                {!isFetching && !isLoading && (
                  <WorksView
                    selectedWorks={selectedDatasets}
                    setSelectedWorks={setSelectedDatasets}
                    works={allDatasets}
                  />
                )}
              </Col>
            </Row>
            <Row>
              <Col>
                {renderButtons(selectedDatasets, tagDatasets)}
              </Col>
            </Row>
          </Tab>
        </Tabs>
      </Container>
    </>
  );
}
