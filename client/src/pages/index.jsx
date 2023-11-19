/* eslint-disable max-len */
/* eslint-disable indent */
/* eslint-disable jsx-a11y/control-has-associated-label */
/* eslint-disable no-case-declarations */
import {
  Col,
  Container,
  Row,
  Tab,
  Tabs,
} from '@dataesr/react-dsfr';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import Actions from './actions';
import AffiliationsTab from './affiliationsTab';
import Filters from './filters';
import PublicationsTab from './publicationsTab';
import WorksView from './worksView';
import Gauge from '../components/gauge';
import { PageSpinner } from '../components/spinner';
import {
  getAllIdsHtmlField,
  getAffiliationRor,
  getAffiliationsHtmlField,
  getAffiliationsTooltipField,
  getAuthorsHtmlField,
  getAuthorsTooltipField,
} from '../utils/templates';
import { getData, renderButtons } from '../utils/works';
import { status } from '../config';

import 'primereact/resources/primereact.min.css';
import 'primereact/resources/themes/lara-light-indigo/theme.css';

export default function Home() {
  const [allAffiliations, setAllAffiliations] = useState([]);
  const [allDatasets, setAllDatasets] = useState([]);
  const [allPublications, setAllPublications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [options, setOptions] = useState({});
  const [regexp, setRegexp] = useState();
  const [selectedDatasets, setSelectedDatasets] = useState([]);

  const { data, isFetching, refetch } = useQuery({
    queryKey: ['data'],
    queryFn: () => getData(options),
    enabled: false,
    staleTime: Infinity,
    cacheTime: Infinity,
  });

  const sendQuery = async (_options) => {
    setIsLoading(true);
    setAllAffiliations([]);
    setAllDatasets([]);
    setAllPublications([]);
    await setOptions(_options);
    refetch();
  };

  const normalizedName = (name) => name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[^a-zA-Z0-9]/g, '');

  const groupByAffiliations = () => {
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
      .map((affiliation, index) => ({ ...affiliation, id: index.toString(), works: [...new Set(affiliation.works)], worksNumber: [...new Set(affiliation.works)].length }));
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
        .filter((dataset) => !!dataset?.affiliations)
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
  }, [data, regexp]);

  useEffect(() => {
    groupByAffiliations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allDatasets, allPublications, regexp]);

  const tagPublications = (publications, action) => {
    const allPublicationsTmp = [...allPublications];
    const publicationsIds = publications.map((publication) => publication.id);
    allPublicationsTmp.filter((publication) => publicationsIds.includes(publication.id)).map((publication) => publication.status = action);
    setAllPublications(allPublicationsTmp);
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
        {allAffiliations.length > 0 && (
          <Tabs defaultActiveTab={0}>
            <Tab label="Grouped affiliations of works">
              <AffiliationsTab
                affiliations={allAffiliations}
                tagAffiliations={tagAffiliations}
              />
            </Tab>
            <Tab label="List all publications">
              <PublicationsTab
                publications={allPublications}
                tagPublications={tagPublications}
              />
            </Tab>
            <Tab label="List all datasets">
              <Row>
                <Col n="4">
                  {renderButtons(selectedDatasets, tagDatasets)}
                </Col>
                <Col n="8">
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
        )}
      </Container>
    </>
  );
}
