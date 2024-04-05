import {
  Container, Row, Col,
  Spinner,
} from '@dataesr/dsfr-plus';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import DatasetsTile from '../components/tiles/datasets';
import OpenalexTile from '../components/tiles/openalex';
import PublicationsTile from '../components/tiles/publications';
import { status } from '../config';
import Filters from './filters';
import { getData } from '../utils/works';
import Datasets from './views/datasets';
import Openalex from './views/openalex';
import Publications from './views/publications';

import 'primereact/resources/primereact.min.css';
import 'primereact/resources/themes/lara-light-indigo/theme.css';

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [allAffiliations, setAllAffiliations] = useState([]);
  const [allDatasets, setAllDatasets] = useState([]);
  const [allPublications, setAllPublications] = useState([]);
  const [allOpenalexCorrections, setAllOpenalexCorrections] = useState([]);
  const [options, setOptions] = useState({});
  const [selectedAffiliations, setSelectedAffiliations] = useState([]);
  const [selectedDatasets, setSelectedDatasets] = useState([]);
  const [selectedPublications, setSelectedPublications] = useState([]);

  const setView = (_view) => {
    setSearchParams((params) => {
      params.set('view', _view);
      return params;
    });
  };

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
      setAllAffiliations(data?.affiliations ?? []);
      setAllDatasets(data?.datasets?.results ?? []);
      setAllPublications(data?.publications?.results ?? []);
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
    // TODO:do a cleaner way to display the spinner and views
    <>
      <Filters sendQuery={sendQuery} />
      <Container as="section">
        {isFetching && <Spinner size={48} />}
        {(!isFetching && !searchParams.get('view') && isFetched) && (
          <Row gutters>
            <Col>
              <OpenalexTile setView={setView} />
            </Col>
            <Col>
              <PublicationsTile setView={setView} />
            </Col>
            <Col>
              <DatasetsTile setView={setView} />
            </Col>
          </Row>
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
            <Datasets
              allAffiliations={allAffiliations}
              allDatasets={allDatasets}
              data={data}
              options={options}
              selectedAffiliations={selectedAffiliations}
              selectedDatasets={selectedDatasets}
              setAllAffiliations={setAllAffiliations}
              setSelectedAffiliations={setSelectedAffiliations}
              setSelectedDatasets={setSelectedDatasets}
              tagAffiliations={tagAffiliations}
              tagDatasets={tagDatasets}
            />
          )}
      </Container>
    </>
  );
}
