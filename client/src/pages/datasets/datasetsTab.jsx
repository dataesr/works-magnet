import { Button, Col, Container, Modal, ModalContent, Row, Spinner, TextInput, Title } from '@dataesr/dsfr-plus';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import Gauge from '../../components/gauge';
import { datasources, status } from '../../config';
import useToast from '../../hooks/useToast';
import {
  getDatasets,
  normalizeName,
  renderButtonDataset,
  renderButtons,
} from '../../utils/works';
import DatasetsView from './datasetsView';

export default function DatasetsTab({
  datasets,
  publishers,
  selectedDatasets,
  setSelectedDatasets,
  tagDatasets,
  types,
  years,
}) {
  const [searchParams] = useSearchParams();
  const [clientId, setClientId] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filteredAffiliationName, setFilteredAffiliationName] = useState('');
  const [filteredDatasets, setFilteredDatasets] = useState([]);
  const [filteredDatasources] = useState(
    datasources.map((datasource) => datasource.key),
  );
  const [filteredStatus] = useState([
    status.tobedecided.id,
    status.validated.id,
    status.excluded.id,
  ]);
  const [filteredPublishers, setFilteredPublishers] = useState([]);
  const [filteredTypes, setFilteredTypes] = useState([]);
  const [filteredYears, setFilteredYears] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState();
  const [fixedMenu] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setFilteredDatasets(datasets);
    setFilteredPublishers(Object.keys(publishers));
    setFilteredYears(Object.keys(years));
    setFilteredTypes(Object.keys(types));
  }, [datasets, publishers, types, years]);

  useEffect(() => {
    if (timer) {
      clearTimeout(timer);
    }
    const timerTmp = setTimeout(() => {
      const filteredDatasetsTmp = datasets.filter(
        (dataset) => normalizeName(dataset.allInfos).includes(
          normalizeName(filteredAffiliationName),
        )
          && filteredDatasources.filter((filteredDatasource) => dataset.datasource.includes(filteredDatasource)).length
          && filteredPublishers.includes(dataset.publisher)
          && filteredStatus.includes(dataset.status)
          && filteredTypes.includes(dataset.type)
          && filteredYears.includes(dataset.year),
      );
      setFilteredDatasets(filteredDatasetsTmp);
    }, 500);
    setTimer(timerTmp);
    // The timer should not be tracked
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    datasets,
    filteredAffiliationName,
    filteredDatasources,
    filteredPublishers,
    filteredStatus,
    filteredTypes,
    filteredYears,
  ]);

  const datasetLinkedArticle = datasets.filter(
    (d) => d.status === 'tobedecided'
      && d.affiliations === undefined
      && d.nbPublicationsLinked > 0,
  );
  const datasetPerson = datasets.filter(
    (d) => d.status === 'tobedecided'
      && d.affiliations === undefined
      && (d.nbAuthorsName >= 3 || d.nbOrcid >= 3),
  );

  const addDatasetsByClientId = async () => {
    setIsLoading(true);
    setIsModalOpen(!isModalOpen);
    setClientId('');
    const options = { clientId, endYear: searchParams.get('endYear'), startYear: searchParams.get('startYear') };
    const { datasets: ds } = await getDatasets({ options, toast, type: 'datasets' });
    setFilteredDatasets([...ds.results, ...filteredDatasets]);
    setIsLoading(false);
  };

  return (
    <>
      {isLoading && (
        <Row>
          <Col xs="2" offsetXs="6">
            <Spinner size={48} />
          </Col>
        </Row>
      )}
      <Modal isOpen={isModalOpen} hide={() => { setIsModalOpen(!isModalOpen); setClientId(''); }}>
        <ModalContent>
          <Title as="h2" look="h5">
            <i className="ri-save-line fr-mr-1w" />
            Enter your client.id
          </Title>
          <Container className="fr-mb-5w">
            <Row>
              <Col>
                <TextInput
                  label="Please enter here the client.id of your repository"
                  onChange={(e) => setClientId(e.target.value)}
                  required
                  value={clientId}
                />
                <Button
                  data-tooltip-id="save-affiliations-button"
                  disabled={clientId.length === 0}
                  onClick={addDatasetsByClientId}
                >
                  <i className="ri-save-line fr-mr-1w" />
                  Add
                </Button>
              </Col>
            </Row>
          </Container>
        </ModalContent>
      </Modal>
      <div
        className={`actions-menu ${fixedMenu ? 'action-menu-fixed' : ''}`}
        title="actions"
      >
        <div
          className={`selected-item ${selectedDatasets.length && 'selected'}`}
        >
          <span className="number">{selectedDatasets.length}</span>
          {` selected dataset${selectedDatasets.length === 1 ? '' : 's'}`}
        </div>
        {renderButtons(selectedDatasets, tagDatasets)}
        {/*
        <div className="text-right">
          <Button
            onClick={() => setFixedMenu(!fixedMenu)}
            size="sm"
            variant="tertiary"
          >
            {fixedMenu ? (
              <i className="ri-pushpin-fill" />
            ) : (
              <i className="ri-pushpin-line" />
            )}
          </Button>
        </div>
        */}
      </div>
      <Row gutters>
        <Col xs="12" className="text-right">
          {renderButtonDataset(
            datasetLinkedArticle,
            tagDatasets,
            'without affiliations but linked to an article from my institution',
            'ri-link',
          )}
          {renderButtonDataset(
            datasetPerson,
            tagDatasets,
            'without affiliations but at least 3 authors detected from my institution',
            'ri-team-line',
          )}
          <Button
            className="fr-mb-1w fr-mr-1w"
            onClick={() => setIsModalOpen(!isModalOpen)}
            size="sm"
          >
            Add a repository by client.id
          </Button>
        </Col>
        <Col xs="12">
          <Gauge
            data={Object.values(status).map((st) => ({
              ...st,
              value: datasets.filter((dataset) => dataset.status === st.id)
                .length,
            }))}
          />
        </Col>
      </Row>
      <Row gutters>
        <Col xs="12">
          <DatasetsView
            filteredAffiliationName={filteredAffiliationName}
            selectedWorks={selectedDatasets}
            setFilteredAffiliationName={setFilteredAffiliationName}
            setSelectedWorks={setSelectedDatasets}
            works={filteredDatasets}
          />
        </Col>
      </Row>
    </>
  );
}

DatasetsTab.propTypes = {
  datasets: PropTypes.arrayOf(
    PropTypes.shape({
      affiliations: PropTypes.arrayOf(PropTypes.object),
      allIds: PropTypes.arrayOf(PropTypes.object).isRequired,
      authors: PropTypes.arrayOf(PropTypes.string).isRequired,
      datasource: PropTypes.arrayOf(PropTypes.string).isRequired,
      id: PropTypes.string.isRequired,
      publisher: PropTypes.string.isRequired,
      status: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired,
    }),
  ).isRequired,
  publishers: PropTypes.object.isRequired,
  selectedDatasets: PropTypes.arrayOf(
    PropTypes.shape({
      affiliations: PropTypes.arrayOf(PropTypes.object),
      allIds: PropTypes.arrayOf(PropTypes.object).isRequired,
      authors: PropTypes.arrayOf(PropTypes.string).isRequired,
      datasource: PropTypes.arrayOf(PropTypes.string).isRequired,
      id: PropTypes.string.isRequired,
      publisher: PropTypes.string.isRequired,
      status: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired,
    }),
  ).isRequired,
  setSelectedDatasets: PropTypes.func.isRequired,
  tagDatasets: PropTypes.func.isRequired,
  types: PropTypes.object.isRequired,
  years: PropTypes.object.isRequired,
};
