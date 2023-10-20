/* eslint-disable max-len */
/* eslint-disable indent */
/* eslint-disable jsx-a11y/control-has-associated-label */
/* eslint-disable no-case-declarations */
import { Button, Col, Container, Notice, Row, Tab, Tabs } from '@dataesr/react-dsfr';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import Actions from './actions';
import Filters from './filters';
import Metrics from './metrics';
import AffiliationsView from './views/affiliations';
import PublicationsView from './views/publications';
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
  getBsoPublications,
  getOpenAlexPublications,
  mergePublications,
} from '../../utils/publications';

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
  if ((Number(data.total.bso) === 0) || (Number(data.total.bso) === Number(VITE_BSO_MAX_SIZE))) {
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
  const [allAffiliations, setAllAffiliations] = useState([]);
  const [allPublications, setAllPublications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [options, setOptions] = useState({});
  const [regexp, setRegexp] = useState();
  const [selectedAffiliations, setSelectedAffiliations] = useState([]);
  const [selectedPublications, setSelectedPublications] = useState([]);
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

  const groupByAffiliations = (publications) => {
    setIsLoading(true);
    // Save already decided affiliations
    const decidedAffiliations = Object.values(allAffiliations).filter((affiliation) => affiliation.status !== TO_BE_DECIDED_STATUS);
    // Compute distinct affiliations of the undecided publications
    let allAffiliationsTmp = {};
    publications.filter((publication) => publication.status === TO_BE_DECIDED_STATUS).forEach((publication) => {
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
              status: TO_BE_DECIDED_STATUS,
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
    let allPublicationsTmp = [];
    if (data) {
      allPublicationsTmp = data.results
        .map((publication) => ({
          ...publication,
          affiliationsSearch: getAffiliationsSearchField(publication),
          affiliationsHtml: getAffiliationsHtmlField(publication, regexp),
          allIdsHtml: getAllIdsHtmlField(publication),
          authorsHtml: getAuthorsHtmlField(publication),
          authorsTooltip: getAuthorsTooltipField(publication),
          status: TO_BE_DECIDED_STATUS,
        }));
    }
    setAllPublications(allPublicationsTmp);
  }, [data, regexp]);

  useEffect(() => {
    groupByAffiliations(allPublications, regexp);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allPublications]);

  const tagPublications = (publications, action) => {
    const allPublicationsTmp = [...allPublications];
    const publicationsIds = publications.map((publication) => publication.id);
    allPublicationsTmp.filter((publication) => publicationsIds.includes(publication.id)).map((publication) => publication.status = action);
    setAllPublications(allPublicationsTmp);
    setSelectedPublications([]);
  };

  const tagAffiliations = (affiliations, action) => {
    if (action !== EXCLUDED_STATUS) {
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

  const renderPublicationsButtons = () => (
    <>
      <Button
        className="fr-mr-1w btn-keep"
        disabled={!selectedPublications.length}
        icon="ri-checkbox-circle-line"
        onClick={() => tagPublications(selectedPublications, VALIDATED_STATUS)}
        size="sm"
      >
        Validate
        {` (${selectedPublications.length})`}
      </Button>
      <Button
        className="fr-mr-1w btn-hide"
        disabled={!selectedPublications.length}
        icon="ri-indeterminate-circle-line"
        onClick={() => tagPublications(selectedPublications, EXCLUDED_STATUS)}
        size="sm"
      >
        Exclude
        {` (${selectedPublications.length})`}
      </Button>
      <Button
        className="fr-mb-1w btn-reset"
        disabled={!selectedPublications.length}
        icon="ri-reply-fill"
        onClick={() => tagPublications(selectedPublications, TO_BE_DECIDED_STATUS)}
        size="sm"
      >
        Reset status
        {` (${selectedPublications.length})`}
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
                    title="All the affiliations of the publications found in OpenAlex and French OSM are listed below. A filter can be applied to view only the affiliations containing at least one of the matching query input (this filter is applied by default but can be removed)"
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
          <Tab label={`Publications (${allPublications.filter((publication) => publication.status === VALIDATED_STATUS).length} / ${allPublications.length})`}>
            <Row>
              <Col>
                {renderPublicationsButtons()}
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
            <Row>
              <Col>
                {(isFetching || isLoading) && (<Container as="section"><PageSpinner /></Container>)}
                {!isFetching && !isLoading && (
                  <PublicationsView
                    allPublications={allPublications}
                    selectedPublications={selectedPublications}
                    setSelectedPublications={setSelectedPublications}
                  />
                )}
              </Col>
            </Row>
            <Row>
              <Col>
                {renderPublicationsButtons()}
              </Col>
            </Row>
          </Tab>
        </Tabs>
      </Container>
    </>
  );
}
