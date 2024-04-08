import { Col, Container, Row, Spinner } from '@dataesr/dsfr-plus';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
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
    queryKey: ['data', JSON.stringify(options)],
    queryFn: () => getData(options),
    enabled: false,
    cacheTime: 60 * (60 * 1000), // 1h
  });

  const sendQuery = async (_options) => {
    await setOptions(_options);
    refetch();
  };

  const tagPublications = (publications, action) => {
    const publicationsIds = publications.map((publication) => publication.id);
    data?.publications?.results?.filter((publication) => publicationsIds.includes(publication.id)).map((publication) => publication.status = action);
    setSelectedPublications([]);
  };

  const tagDatasets = (datasets, action) => {
    const datasetsIds = datasets.map((dataset) => dataset.id);
    data?.datasets?.results?.filter((dataset) => datasetsIds.includes(dataset.id)).map((dataset) => dataset.status = action);
    setSelectedDatasets([]);
  };

  const tagAffiliations = (affiliations, action) => {
    if (action !== status.excluded.id) {
      const worksIds = affiliations.map((affiliation) => affiliation.works).flat();
      data?.publications?.results?.filter((publication) => worksIds.includes(publication.id)).map((publication) => publication.status = action);
      data?.datasets?.results?.filter((dataset) => worksIds.includes(dataset.id)).map((dataset) => dataset.status = action);
    }
    const affiliationIds = affiliations.map((affiliation) => affiliation.id);
    data?.affiliations?.filter((affiliation) => affiliationIds.includes(affiliation.id)).map((affiliation) => affiliation.status = action);
    setSelectedAffiliations([]);
  };

  return (
    // TODO:do a cleaner way to display the spinner and views
    <>
      <Filters isFetched sendQuery={sendQuery} />
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
          && (data?.affiliations?.length > 0 || data?.datasets?.results?.length > 0 || data?.publications?.results?.length > 0)
          && searchParams.get('view') === 'openalex'
          && (
            <Openalex
              allAffiliations={data?.affiliations}
              allOpenalexCorrections={allOpenalexCorrections}
              options={options}
              setAllOpenalexCorrections={setAllOpenalexCorrections}
            />
          )}

        {!isFetching
          && (data?.affiliations?.length > 0 || data?.datasets?.results?.length > 0 || data?.publications?.results?.length > 0)
          && searchParams.get('view') === 'publications'
          && (
            <Publications
              allAffiliations={data?.affiliations ?? []}
              allPublications={data?.publications?.results ?? []}
              data={data}
              options={options}
              selectedAffiliations={selectedAffiliations}
              selectedPublications={selectedPublications}
              setSelectedAffiliations={setSelectedAffiliations}
              setSelectedPublications={setSelectedPublications}
              tagAffiliations={tagAffiliations}
              tagPublications={tagPublications}
            />
          )}

        {!isFetching
          && (data?.affiliations?.length > 0 || data?.datasets?.results?.length > 0 || data?.publications?.results?.length > 0)
          && searchParams.get('view') === 'datasets'
          && (
            <Datasets
              allAffiliations={data?.affiliations ?? []}
              allDatasets={data?.datasets?.results ?? []}
              data={data}
              options={options}
              selectedAffiliations={selectedAffiliations}
              selectedDatasets={selectedDatasets}
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
