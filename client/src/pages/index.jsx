import { Col, Container, Row, Spinner } from '@dataesr/dsfr-plus';
import { useQuery } from '@tanstack/react-query';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import DatasetsTile from '../components/tiles/datasets';
import OpenalexTile from '../components/tiles/openalex';
import PublicationsTile from '../components/tiles/publications';
import { status } from '../config';
import useToast from '../hooks/useToast';
import { getAffiliationsCorrections } from '../utils/curations';
import { getWorks } from '../utils/works';
import Filters from './filters';
import Datasets from './views/datasets';
import Openalex from './views/openalex';
import Publications from './views/publications';

import 'primereact/resources/primereact.min.css';
import 'primereact/resources/themes/lara-light-indigo/theme.css';

export default function Home({ isSticky, setIsSticky }) {
  const [searchParams, setSearchParams] = useSearchParams();

  const [affiliations, setAffiliations] = useState([]);
  const [allOpenalexCorrections, setAllOpenalexCorrections] = useState([]);
  const [options, setOptions] = useState({});
  const [selectedAffiliations, setSelectedAffiliations] = useState([]);
  const [selectedDatasets, setSelectedDatasets] = useState([]);
  const [selectedPublications, setSelectedPublications] = useState([]);
  const { toast } = useToast();

  const setView = (_view) => {
    setSearchParams((params) => {
      params.set('view', _view);
      return params;
    });
  };

  const { data, error, isFetched, isFetching, refetch } = useQuery({
    queryKey: ['data', JSON.stringify(options)],
    queryFn: () => getWorks(options, toast),
    enabled: false,
    cacheTime: 60 * (60 * 1000), // 1h
  });

  const sendQuery = async (_options) => {
    await setOptions(_options);
    refetch();
  };

  const tagPublications = (publications, action) => {
    const publicationsIds = publications.map((publication) => publication.id);
    data?.publications?.results
      ?.filter((publication) => publicationsIds.includes(publication.id))
      .map((publication) => (publication.status = action));
    setSelectedPublications([]);
  };

  const tagDatasets = (datasets, action) => {
    const datasetsIds = datasets.map((dataset) => dataset.id);
    data?.datasets?.results
      ?.filter((dataset) => datasetsIds.includes(dataset.id))
      .map((dataset) => (dataset.status = action));
    setSelectedDatasets([]);
  };

  const tagAffiliations = (affiliations, action) => {
    if (action !== status.excluded.id) {
      const worksIds = affiliations
        .map((affiliation) => affiliation.works)
        .flat();
      data?.publications?.results
        ?.filter((publication) => worksIds.includes(publication.id))
        .map((publication) => (publication.status = action));
      data?.datasets?.results
        ?.filter((dataset) => worksIds.includes(dataset.id))
        .map((dataset) => (dataset.status = action));
    }
    const affiliationIds = affiliations.map((affiliation) => affiliation.id);
    setAffiliations(
      affiliations
        ?.filter((affiliation) => affiliationIds.includes(affiliation.id))
        .map((affiliation) => (affiliation.status = action)),
    );
    setSelectedAffiliations([]);
  };

  const undo = (id) => {
    const newAffiliations = affiliations.map((affiliation) => {
      if (affiliation.id === id) {
        // eslint-disable-next-line no-param-reassign
        affiliation.hasCorrection = false;
        // eslint-disable-next-line no-param-reassign
        affiliation.rorsToCorrect = affiliation.rors.map((r) => r.rorId).join(';');
      }
      return affiliation;
    });
    setAffiliations(newAffiliations);
    setAllOpenalexCorrections(getAffiliationsCorrections(newAffiliations));
  };

  useEffect(() => {
    setAffiliations(data?.affiliations ?? []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  return (
    // TODO: Find a cleaner way to display the spinner and views
    <>
      <Filters
        isFetched
        isSticky={isSticky}
        sendQuery={sendQuery}
        setIsSticky={setIsSticky}
      />
      <Container as="section" className="fr-mt-4w">
        {isFetching && (
          <Row>
            <Col xs="2" offsetXs="6">
              <Spinner size={48} />
            </Col>
          </Row>
        )}

        {error && (
          <Row gutters className="fr-mb-16w">
            <Col xs="12">
              <div>
                Error while fetching data, please try again later or contact the
                team (see footer).
              </div>
            </Col>
          </Row>
        )}

        {!isFetching && !searchParams.get('view') && isFetched && (
          <Row gutters className="fr-mb-16w">
            <Col xs="12">
              <div>
                {' '}
                The data has been fetched, please start with one of the use
                cases described below. You will be able to switch from one to
                another.
                {' '}
              </div>
            </Col>
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

        {!isFetching && searchParams.get('view') === 'openalex' && (
          <Openalex
            allAffiliations={affiliations}
            allOpenalexCorrections={allOpenalexCorrections}
            options={options}
            setAllOpenalexCorrections={setAllOpenalexCorrections}
            undo={undo}
          />
        )}

        {!isFetching && searchParams.get('view') === 'publications' && (
          <Publications
            allAffiliations={affiliations}
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

        {!isFetching && searchParams.get('view') === 'datasets' && (
          <Datasets
            allAffiliations={affiliations}
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

Home.propTypes = {
  isSticky: PropTypes.bool.isRequired,
  setIsSticky: PropTypes.func.isRequired,
};
