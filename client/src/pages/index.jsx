/* eslint-disable max-len */
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import {
  AccordionGroup, Accordion,
  Container, Row, Col,
  Tabs, Tab,
} from '@dataesr/dsfr-plus';

import { useQuery } from '@tanstack/react-query';

// import ActionsAffiliations from './actions/actionsAffiliations';
import ActionsDatasets from './actions/actionsDatasets';
// import ActionsOpenalex from './actions/actionsOpenalex';
// import ActionsOpenalexFeedback from './actions/actionsOpenalexFeedback';
import ActionsPublications from './actions/actionsPublications';
// import AffiliationsTab from './affiliationsTab';
import { PageSpinner } from '../components/spinner';
import { status } from '../config';
import DatasetsYearlyDistribution from './datasetsYearlyDistribution';
import DatasetsTab from './datasetsTab';
import Filters from './filters';
// import OpenalexTab from './openalexTab';
import PublicationsTab from './publicationsTab';
import { getAffiliationsTooltipField } from '../utils/templates';
import { getData } from '../utils/works';

import 'primereact/resources/primereact.min.css';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import Openalex from './views/openalex';
import Publications from './views/publications';

export default function Home() {
  const [searchParams] = useSearchParams();
  const [allAffiliations, setAllAffiliations] = useState([]);
  const [allDatasets, setAllDatasets] = useState([]);
  const [allPublications, setAllPublications] = useState([]);
  const [allOpenalexCorrections, setAllOpenalexCorrections] = useState([]);
  const [options, setOptions] = useState({});
  const [selectedAffiliations, setSelectedAffiliations] = useState([]);
  const [selectedDatasets, setSelectedDatasets] = useState([]);
  const [selectedPublications, setSelectedPublications] = useState([]);

  const { data, isFetched, isFetching, refetch } = useQuery({
    queryKey: ['data'],
    queryFn: () => getData(options),
    enabled: false,
    staleTime: Infinity,
    cacheTime: Infinity,
  });

  const sendQuery = async (_options) => {
    setAllAffiliations([]);
    setAllDatasets([]);
    setAllPublications([]);
    setAllOpenalexCorrections([]);
    await setOptions(_options);
    refetch();
  };

  useEffect(() => {
    if (data) {
      // TODO do it on the API
      const allDatasetsTmp = data.datasets?.results
        ?.map((dataset) => ({
          ...dataset,
          affiliationsTooltip: getAffiliationsTooltipField(dataset),
        }));
      const allPublicationsTmp = data.publications?.results
        ?.map((publication) => ({
          ...publication,
          affiliationsTooltip: getAffiliationsTooltipField(publication),
        }));
      setAllAffiliations(data.affiliations || []);
      setAllDatasets(allDatasetsTmp || []);
      setAllPublications(allPublicationsTmp || []);
    }
  }, [data]);

  const tagPublications = (publications, action) => {
    const allPublicationsTmp = [...allPublications];
    const publicationsIds = publications.map((publication) => publication.id);
    // eslint-disable-next-line no-return-assign, no-param-reassign
    allPublicationsTmp.filter((publication) => publicationsIds.includes(publication.id)).map((publication) => publication.status = action);
    setAllPublications(allPublicationsTmp);
    setSelectedPublications([]);
  };

  const tagDatasets = (datasets, action) => {
    const allDatasetsTmp = [...allDatasets];
    const datasetsIds = datasets.map((dataset) => dataset.id);
    // eslint-disable-next-line no-return-assign, no-param-reassign
    allDatasetsTmp.filter((dataset) => datasetsIds.includes(dataset.id)).map((dataset) => dataset.status = action);
    setAllDatasets(allDatasetsTmp);
    setSelectedDatasets([]);
  };

  const tagAffiliations = (affiliations, action) => {
    if (action !== status.excluded.id) {
      const worksIds = affiliations.map((affiliation) => affiliation.works).flat();
      const allPublicationsTmp = [...allPublications];
      // eslint-disable-next-line no-return-assign, no-param-reassign
      allPublicationsTmp.filter((publication) => worksIds.includes(publication.id)).map((publication) => publication.status = action);
      setAllPublications(allPublicationsTmp);
      const allDatasetsTmp = [...allDatasets];
      // eslint-disable-next-line no-return-assign, no-param-reassign
      allDatasetsTmp.filter((dataset) => worksIds.includes(dataset.id)).map((dataset) => dataset.status = action);
      setAllDatasets(allDatasetsTmp);
    }
    const allAffiliationsTmp = [...allAffiliations];
    const affiliationIds = affiliations.map((affiliation) => affiliation.id);
    // eslint-disable-next-line no-return-assign, no-param-reassign
    allAffiliationsTmp.filter((affiliation) => affiliationIds.includes(affiliation.id)).map((affiliation) => affiliation.status = action);
    setAllAffiliations(allAffiliationsTmp);
    setSelectedAffiliations([]);
  };

  return (
    <>
      <Container fluid as="section" className="filters">
        <Filters sendQuery={sendQuery} />
      </Container>
      <Container fluid as="section">
        {(isFetching || (isFetched && (allAffiliations?.length ?? 0) === 0)) && (
          <PageSpinner />
        )}
        {!isFetching
          && (allAffiliations?.length > 0 || allDatasets?.length > 0 || allPublications?.length > 0)
          && searchParams.get('view') === 'openalex'
          && (
            <Openalex
              allAffiliations={allAffiliations}
              allOpenalexCorrections={allOpenalexCorrections}
              options={options}
              setAllOpenalexCorrections={setAllOpenalexCorrections}
            />
          )}

        {!isFetching
          && (allAffiliations?.length > 0 || allDatasets?.length > 0 || allPublications?.length > 0)
          && searchParams.get('view') === 'publications'
          && (
            <Publications
              allAffiliations={allAffiliations}
              allPublications={allPublications}
              data={data}
              options={options}
              selectedAffiliations={selectedAffiliations}
              selectedPublications={selectedPublications}
              setAllAffiliations={setAllAffiliations}
              setSelectedAffiliations={setSelectedAffiliations}
              setSelectedPublications={setSelectedPublications}
              tagAffiliations={tagAffiliations}
              tagPublications={tagPublications}
            />
          )}

        {!isFetching
          && (allAffiliations?.length > 0 || allDatasets?.length > 0 || allPublications?.length > 0)
          && searchParams.get('view') === 'datasets'
          && (
            <>
              datasets
            </>
          )}

        {/* <Accordion title="📑 Find the publications affiliated to your institution">
          {(options.datasets) ? (
            <div className="fr-callout fr-icon-information-line">
              <h3 className="fr-callout__title">
                You did not search for publications
              </h3>
              <p className="fr-callout__text">
                To search for publications, please disable the "Search for datasets only" option
              </p>
            </div>
          ) : (
            <Tabs>
              {affiliationsChoiceTab}
              <Tab label="📑 List of publications">
                <ActionsPublications
                  allPublications={allPublications}
                />
                <PublicationsTab
                  publishers={data.publications?.publishers || []}
                  publications={allPublications}
                  selectedPublications={selectedPublications}
                  setSelectedPublications={setSelectedPublications}
                  tagPublications={tagPublications}
                  types={data.publications?.types || []}
                  years={data.publications?.years || []}
                />
              </Tab>
            </Tabs>
          )}
        </Accordion>
        <Accordion title="🗃 Find the datasets affiliated to your institution">
          <Tabs>
            {affiliationsChoiceTab}
            <Tab label="🗃 List of datasets">
              <ActionsDatasets
                allDatasets={allDatasets}
              />
              <DatasetsTab
                datasets={allDatasets}
                publishers={data.datasets?.publishers}
                selectedDatasets={selectedDatasets}
                setSelectedDatasets={setSelectedDatasets}
                tagDatasets={tagDatasets}
                types={data.datasets.types}
                years={data.datasets.years}
              />
            </Tab>
            <Tab label="📊 Insights">
              {(allDatasets.filter((dataset) => dataset.status === 'validated').length > 0) ? (
                <>
                  <DatasetsYearlyDistribution allDatasets={allDatasets} field="publisher" />
                  <DatasetsYearlyDistribution allDatasets={allDatasets} field="type" />
                  <DatasetsYearlyDistribution allDatasets={allDatasets} field="format" />
                  <DatasetsYearlyDistribution allDatasets={allDatasets} field="client_id" />
                  <DatasetsYearlyDistribution allDatasets={allDatasets} field="affiliations" subfield="rawAffiliation" />
                </>
              ) : (
                // <Callout colorFamily="beige-gris-galet">
                //   <CalloutTitle size="md">
                //     You did not validate any datasets
                //   </CalloutTitle>
                //   <CalloutText size="sm">
                //     Please validate affiliations or datasets to see insights about it.
                //   </CalloutText>
                // </Callout>
                <div className="fr-callout fr-icon-information-line">
                  <h3 className="fr-callout__title">
                    You did not validate any datasets
                  </h3>
                  <p className="fr-callout__text">
                    Please validate affiliations or datasets to see insights about it.
                  </p>
                </div>
              )}
            </Tab>
          </Tabs>
        </Accordion>
      </AccordionGroup>
        )} */}
      </Container>
    </>
  );
}
