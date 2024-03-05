import {
  Checkbox,
  CheckboxGroup,
  Col,
  Row,
  TextInput,
} from '@dataesr/react-dsfr';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';

import DatasetsView from './datasetsView';
import Gauge from '../components/gauge';
import { datasources, status } from '../config';
import { normalizeName, renderButtons } from '../utils/works';

export default function DatasetsTab({ datasets, publishers, selectedDatasets, setSelectedDatasets, tagDatasets, types, years }) {
  const [filteredAffiliationName, setFilteredAffiliationName] = useState('');
  const [filteredDatasets, setFilteredDatasets] = useState([]);
  const [filteredDatasources, setFilteredDatasources] = useState(datasources.map((datasource) => datasource.key));
  const [filteredStatus, setFilteredStatus] = useState([status.tobedecided.id, status.validated.id, status.excluded.id]);
  const [filteredPublishers, setFilteredPublishers] = useState([]);
  const [filteredTypes, setFilteredTypes] = useState([]);
  const [filteredYears, setFilteredYears] = useState([]);
  const [timer, setTimer] = useState();

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
      const filteredDatasetsTmp = datasets.filter((dataset) => normalizeName(dataset.allInfos).includes(normalizeName(filteredAffiliationName))
        && filteredDatasources.filter((filteredDatasource) => dataset.datasource.includes(filteredDatasource)).length
        && filteredPublishers.includes(dataset.publisher)
        && filteredStatus.includes(dataset.status)
        && filteredTypes.includes(dataset.type)
        && filteredYears.includes(dataset.year));
      setFilteredDatasets(filteredDatasetsTmp);
    }, 500);
    setTimer(timerTmp);
    // The timer should not be tracked
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [datasets, filteredAffiliationName, filteredDatasources, filteredPublishers, filteredStatus, filteredTypes, filteredYears]);

  return (
    <>
      <Row>
        <Col n="9">
          {renderButtons(selectedDatasets, tagDatasets, 'dataset')}
        </Col>
        <Col n="3">
          <Gauge
            data={Object.values(status).map((st) => ({
              ...st,
              value: datasets.filter((dataset) => dataset.status === st.id).length,
            }))}
          />
        </Col>
      </Row>
      <Row gutters>
        <Col n="12">
          <TextInput
            label="Search in any field"
            onChange={(e) => setFilteredAffiliationName(e.target.value)}
            value={filteredAffiliationName}
          />
        </Col>
      </Row>
      <Row gutters>
        <Col n="12">
          <DatasetsView
            selectedWorks={selectedDatasets}
            setSelectedWorks={setSelectedDatasets}
            works={filteredDatasets}
          />
        </Col>
      </Row>
    </>
  );
}

DatasetsTab.propTypes = {
  datasets: PropTypes.arrayOf(PropTypes.shape({
    affiliations: PropTypes.arrayOf(PropTypes.object),
    allIds: PropTypes.arrayOf(PropTypes.object).isRequired,
    authors: PropTypes.arrayOf(PropTypes.string).isRequired,
    datasource: PropTypes.arrayOf(PropTypes.string).isRequired,
    id: PropTypes.string.isRequired,
    publisher: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
  })).isRequired,
  publishers: PropTypes.object.isRequired,
  selectedDatasets: PropTypes.arrayOf(PropTypes.shape({
    affiliations: PropTypes.arrayOf(PropTypes.object),
    allIds: PropTypes.arrayOf(PropTypes.object).isRequired,
    authors: PropTypes.arrayOf(PropTypes.string).isRequired,
    datasource: PropTypes.arrayOf(PropTypes.string).isRequired,
    id: PropTypes.string.isRequired,
    publisher: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
  })).isRequired,
  setSelectedDatasets: PropTypes.func.isRequired,
  tagDatasets: PropTypes.func.isRequired,
  types: PropTypes.object.isRequired,
  years: PropTypes.object.isRequired,
};
