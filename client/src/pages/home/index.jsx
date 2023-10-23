/* eslint-disable max-len */
/* eslint-disable indent */
/* eslint-disable jsx-a11y/control-has-associated-label */
/* eslint-disable no-case-declarations */
import { Button, Checkbox, CheckboxGroup, Col, Container, Notice, Row, Tab, Tabs } from '@dataesr/react-dsfr';
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
  getOpenAlexPublications,
  mergePublications,
} from '../../utils/works';

import 'primereact/resources/primereact.min.css';
import 'primereact/resources/themes/lara-light-indigo/theme.css';

const {
  VITE_BSO_MAX_SIZE,
  VITE_BSO_DATASETS_INDEX,
  VITE_BSO_PUBLICATIONS_INDEX,
} = import.meta.env;

const DATASOURCES = [{ key: 'bso', label: 'French OSM' }, { key: 'openalex', label: 'OpenAlex' }];
const FOSM_IDENTIFIERS = ['crossref', 'hal_id', 'datacite'];
const STATUS_EXCLUDED = 'excluded';
const STATUS_TO_BE_DECIDED = 'to be decided';
const STATUS_VALIDATED = 'validated';

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
  const [filteredDatasources, setFilteredDatasources] = useState(DATASOURCES.map((datasource) => datasource.key));
  const [filteredFosmIdentifiers, setFilteredFosmIdentifiers] = useState(FOSM_IDENTIFIERS);
  const [filteredPublications, setFilteredPublications] = useState([]);
  const [filteredTypes, setFilteredTypes] = useState([]);
  const [filteredYears, setFilteredYears] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [options, setOptions] = useState({});
  const [regexp, setRegexp] = useState();
  const [selectedAffiliations, setSelectedAffiliations] = useState([]);
  const [selectedDatasets, setSelectedDatasets] = useState([]);
  const [selectedPublications, setSelectedPublications] = useState([]);
  const [types, setTypes] = useState([]);
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

  const groupByAffiliations = (publications) => {
    setIsLoading(true);
    // Save already decided affiliations
    const decidedAffiliations = Object.values(allAffiliations).filter((affiliation) => affiliation.status !== STATUS_TO_BE_DECIDED);
    // Compute distinct affiliations of the undecided publications
    let allAffiliationsTmp = {};
    publications.filter((publication) => publication.status === STATUS_TO_BE_DECIDED).forEach((publication) => {
      (publication?.affiliations ?? [])
        .filter((affiliation) => Object.keys(affiliation).length && affiliation?.name)
        .forEach((affiliation) => {
          const ror = getAffiliationRor(affiliation);
          const normalizedAffiliationName = normalizedName(affiliation.name);
          if (!allAffiliationsTmp?.[normalizedAffiliationName]) {
            // Check matches in affiliation name
            let matches = `${affiliation?.name}`?.match(regexp) ?? [];
            // Normalize matched strings
            matches = matches.map((name) => normalizedName(name));
            // Filter matches as uniq
            matches = [...new Set(matches)];
            allAffiliationsTmp[normalizedAffiliationName] = {
              matches: matches.length,
              name: affiliation.name,
              nameHtml: affiliation.name.replace(regexp, '<b>$&</b>'),
              ror,
              rorHtml: ror?.replace(regexp, '<b>$&</b>'),
              status: STATUS_TO_BE_DECIDED,
              publications: [],
            };
          }
          allAffiliationsTmp[normalizedAffiliationName].publications.push(publication.id);
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
      .map((affiliation, index) => ({ ...affiliation, publications: [...new Set(affiliation.publications)], id: index.toString(), publicationsNumber: [...new Set(affiliation.publications)].length }));
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
          affiliationsSearch: getAffiliationsSearchField(dataset),
          allIdsHtml: getAllIdsHtmlField(dataset),
          authorsHtml: getAuthorsHtmlField(dataset),
          authorsTooltip: getAuthorsTooltipField(dataset),
          status: STATUS_TO_BE_DECIDED,
        }));
      allPublicationsTmp = data.publications
        .map((publication) => ({
          ...publication,
          affiliationsHtml: getAffiliationsHtmlField(publication, regexp),
          affiliationsSearch: getAffiliationsSearchField(publication),
          allIdsHtml: getAllIdsHtmlField(publication),
          authorsHtml: getAuthorsHtmlField(publication),
          authorsTooltip: getAuthorsTooltipField(publication),
          status: STATUS_TO_BE_DECIDED,
        }));
    }
    setAllDatasets(allDatasetsTmp);
    setAllPublications(allPublicationsTmp);
    const allTypes = [...new Set(allPublicationsTmp.map((publication) => publication?.type))];
    setTypes(allTypes);
    const allYears = [...new Set(allPublicationsTmp.map((publication) => publication?.year))];
    setYears(allYears);
    setFilteredTypes(allTypes);
    setFilteredYears(allYears);
    setFilteredPublications(allPublicationsTmp);
  }, [data, regexp]);

  useEffect(() => {
    const filteredPublicationsTmp = allPublications.filter((publication) => filteredDatasources.includes(publication.datasource) && ((!publication.datasource.includes('bso')) || (publication?.external_ids.map((id) => id.id_type).every((type) => filteredFosmIdentifiers.includes(type)))) && filteredTypes.includes(publication.type) && filteredYears.includes(publication.year));
    setFilteredPublications(filteredPublicationsTmp);
  }, [allPublications, filteredDatasources, filteredFosmIdentifiers, filteredTypes, filteredYears]);

  useEffect(() => {
    groupByAffiliations(allPublications, regexp);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allPublications, regexp]);

  const tagPublications = (publications, action) => {
    const allPublicationsTmp = [...allPublications];
    const publicationsIds = publications.map((publication) => publication.id);
    allPublicationsTmp.filter((publication) => publicationsIds.includes(publication.id)).map((publication) => publication.status = action);
    setAllPublications(allPublicationsTmp);
    setSelectedPublications([]);
  };

  const tagAffiliations = (affiliations, action) => {
    if (action !== STATUS_EXCLUDED) {
      const allPublicationsTmp = [...allPublications];
      const publicationsIds = affiliations.map((affiliation) => affiliation.publications).flat();
      allPublicationsTmp.filter((publication) => publicationsIds.includes(publication.id)).map((publication) => publication.status = action);
      setAllPublications(allPublicationsTmp);
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
        onClick={() => tagAffiliations(selectedAffiliations, STATUS_VALIDATED)}
        size="sm"
      >
        Validate
        {` (${selectedAffiliations.length})`}
      </Button>
      <Button
        className="fr-mr-1w btn-hide"
        disabled={!selectedAffiliations.length}
        icon="ri-indeterminate-circle-line"
        onClick={() => tagAffiliations(selectedAffiliations, STATUS_EXCLUDED)}
        size="sm"
      >
        Exclude
        {` (${selectedAffiliations.length})`}
      </Button>
      <Button
        className="fr-mb-1w btn-reset"
        disabled={!selectedAffiliations.length}
        icon="ri-reply-fill"
        onClick={() => tagAffiliations(selectedAffiliations, STATUS_TO_BE_DECIDED)}
        size="sm"
      >
        Reset status
        {` (${selectedAffiliations.length})`}
      </Button>
    </>
  );

  const renderWorksButtons = (selected) => (
    <>
      <Button
        className="fr-mr-1w btn-keep"
        disabled={!selected.length}
        icon="ri-checkbox-circle-line"
        onClick={() => tagPublications(selected, STATUS_VALIDATED)}
        size="sm"
      >
        Validate
        {` (${selected.length})`}
      </Button>
      <Button
        className="fr-mr-1w btn-hide"
        disabled={!selected.length}
        icon="ri-indeterminate-circle-line"
        onClick={() => tagPublications(selected, STATUS_EXCLUDED)}
        size="sm"
      >
        Exclude
        {` (${selected.length})`}
      </Button>
      <Button
        className="fr-mb-1w btn-reset"
        disabled={!selected.length}
        icon="ri-reply-fill"
        onClick={() => tagPublications(selected, STATUS_TO_BE_DECIDED)}
        size="sm"
      >
        Reset status
        {` (${selected.length})`}
      </Button>
    </>
  );

  const onDatasourcesChange = (datasource) => {
    if (filteredDatasources.includes(datasource.key)) {
      setFilteredDatasources(filteredDatasources.filter((filteredDatasource) => filteredDatasource !== datasource.key));
    } else {
      setFilteredDatasources(filteredDatasources.concat([datasource.key]));
    }
  };

  const onFosmIdentifiersChange = (fosmIdentifier) => {
    if (filteredFosmIdentifiers.includes(fosmIdentifier)) {
      setFilteredFosmIdentifiers(filteredFosmIdentifiers.filter((filteredFosmIdentifier) => filteredFosmIdentifier !== fosmIdentifier));
    } else {
      setFilteredFosmIdentifiers(filteredFosmIdentifiers.concat([fosmIdentifier]));
    }
  };

  const onTypesChange = (type) => {
    if (filteredTypes.includes(type)) {
      setFilteredTypes(filteredTypes.filter((filteredType) => filteredType !== type));
    } else {
      setFilteredTypes(filteredTypes.concat([type]));
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
          allPublications={allPublications}
          options={options}
          setAllAffiliations={setAllAffiliations}
          setAllPublications={setAllPublications}
        />
        <Tabs defaultActiveTab={0}>
          <Tab label={`Affiliations (${allAffiliations.filter((affiliation) => !!affiliation.matches).length})`}>
            {affiliationsNotice && (
              <Row>
                <Col n="12">
                  <Notice
                    className="fr-m-1w"
                    onClose={() => { setAffiliationsNotice(false); }}
                    title="All the affiliations of the works found in the French OSM and OpenAlex are listed below. A filter is applied to view only the affiliations containing at least one of the matching query input."
                  />
                </Col>
              </Row>
            )}
            <Row>
              <Col>
                {renderAffiliationsButtons()}
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
                {renderAffiliationsButtons()}
              </Col>
            </Row>
          </Tab>
          <Tab label={`Publications (${allPublications.filter((publication) => publication.status === STATUS_VALIDATED).length} / ${allPublications.length})`}>
            <Row>
              <Col>
                {renderWorksButtons(selectedPublications)}
              </Col>
              <Col>
                <Gauge
                  data={[
                    { label: 'French OSM', color: '#334476', value: allPublications.filter((publication) => publication.datasource === 'bso').length },
                    { label: 'OpenAlex', color: '#22a498', value: allPublications.filter((publication) => publication.datasource === 'openalex').length },
                    { label: 'Both', color: '#2faf41a4', value: allPublications.filter((publication) => publication.datasource === 'bso, openalex').length },
                  ]}
                />
              </Col>
            </Row>
            {(isFetching || isLoading) && (<Container as="section"><PageSpinner /></Container>)}
            {(!isFetching && !isLoading) && (
              <Row>
                <Col n="2">
                  <CheckboxGroup
                    hint="Filter results on selected datasources"
                    legend="Datasources"
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
                    hint="Filter results on selected identifiers"
                    legend="FOSM identifiers"
                  >
                    {FOSM_IDENTIFIERS.map((fosmIdentifier) => (
                      <Checkbox
                        checked={filteredFosmIdentifiers.includes(fosmIdentifier)}
                        key={fosmIdentifier}
                        label={fosmIdentifier}
                        onChange={() => onFosmIdentifiersChange(fosmIdentifier)}
                        size="sm"
                      />
                    ))}
                  </CheckboxGroup>
                  <CheckboxGroup
                    hint="Filter results on selected types"
                    legend="Types"
                  >
                    {types.map((type) => (
                      <Checkbox
                        checked={filteredTypes.includes(type)}
                        key={type}
                        label={type}
                        onChange={() => onTypesChange(type)}
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
                        label={year}
                        onChange={() => onYearsChange(year)}
                        size="sm"
                      />
                    ))}
                  </CheckboxGroup>
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
              <Col>
                {renderWorksButtons(selectedPublications)}
              </Col>
            </Row>
          </Tab>
          <Tab label={`Datasets (${allDatasets.filter((dataset) => dataset.status === STATUS_VALIDATED).length} / ${allDatasets.length})`}>
            <Row>
              <Col>
                {renderWorksButtons(selectedDatasets)}
              </Col>
              <Col>
                <Gauge
                  data={[
                    { label: 'French OSM', color: '#334476', value: allDatasets.filter((dataset) => dataset.datasource === 'bso').length },
                    { label: 'OpenAlex', color: '#22a498', value: allDatasets.filter((dataset) => dataset.datasource === 'openalex').length },
                    { label: 'Both', color: '#2faf41a4', value: allDatasets.filter((dataset) => dataset.datasource === 'bso, openalex').length },
                  ]}
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
                {renderWorksButtons(selectedDatasets)}
              </Col>
            </Row>
          </Tab>
        </Tabs>
      </Container>
    </>
  );
}
