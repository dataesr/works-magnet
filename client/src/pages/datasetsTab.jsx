import {
  Checkbox,
  CheckboxGroup,
  Col,
  Row,
  TextInput,
} from '@dataesr/react-dsfr';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';

import WorksView from './worksView';
import Gauge from '../components/gauge';
import { datasources, status } from '../config';
import { renderButtons } from '../utils/works';

export default function DatasetsTab({ datasets, selectedDatasets, setSelectedDatasets, tagDatasets, types, years }) {
  const [filteredAffiliationName, setFilteredAffiliationName] = useState('');
  const [filteredDatasets, setFilteredDatasets] = useState([]);
  const [filteredDatasources, setFilteredDatasources] = useState(datasources.map((datasource) => datasource.key));
  const [filteredStatus, setFilteredStatus] = useState(Object.keys(status));
  const [filteredTypes, setFilteredTypes] = useState([]);
  const [filteredYears, setFilteredYears] = useState([]);
  const [timer, setTimer] = useState();

  useEffect(() => {
    setFilteredDatasets(datasets);
    setFilteredYears(years);
    setFilteredTypes(types);
  }, [datasets, types, years]);

  useEffect(() => {
    if (timer) {
      clearTimeout(timer);
    }
    const timerTmp = setTimeout(() => {
      const filteredDatasetsTmp = datasets.filter((dataset) => dataset.affiliationsTooltip.includes(filteredAffiliationName)
        && filteredDatasources.filter((filteredDatasource) => dataset.datasource.includes(filteredDatasource)).length
        && filteredStatus.includes(dataset.status)
        && filteredTypes.includes(dataset.type)
        && filteredYears.includes(Number(dataset.year)));
      setFilteredDatasets(filteredDatasetsTmp);
    }, 500);
    setTimer(timerTmp);
    // The timer should not be tracked
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [datasets, filteredAffiliationName, filteredDatasources, filteredStatus, filteredTypes, filteredYears]);

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
      <Row>
        <Col n="4">
          {renderButtons(selectedDatasets, tagDatasets)}
        </Col>
        <Col n="8">
          <Gauge
            data={Object.values(status).map((st) => ({
              ...st,
              value: datasets.filter((dataset) => dataset.status === st.id).length,
            }))}
          />
        </Col>
      </Row>
      <Row>
        <Col n="2">
          <TextInput
            label="Search datasets on affiliations name"
            onChange={(e) => setFilteredAffiliationName(e.target.value)}
            value={filteredAffiliationName}
          />
          <CheckboxGroup
            hint="Filter publications on selected status"
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
            hint="Filter publications on selected datasources"
            legend="Source"
          >
            {datasources.map((datasource) => (
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
            hint="Filter publications on selected years"
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
          <CheckboxGroup
            hint="Filter publications on selected types"
            legend="Types"
          >
            {types.map((type) => (
              <Checkbox
                checked={filteredTypes.includes(type)}
                key={type}
                label={type.toString()}
                onChange={() => onTypesChange(type)}
                size="sm"
              />
            ))}
          </CheckboxGroup>
        </Col>
        <Col n="10">
          <WorksView
            selectedWorks={selectedDatasets}
            setSelectedWorks={setSelectedDatasets}
            works={filteredDatasets}
          />
        </Col>
      </Row>
      <Row>
        <Col>
          {renderButtons(selectedDatasets, tagDatasets)}
        </Col>
      </Row>
    </>
  );
}

DatasetsTab.propTypes = {
  datasets: PropTypes.arrayOf(PropTypes.shape({
    affiliations: PropTypes.arrayOf(PropTypes.string).isRequired,
    allIds: PropTypes.arrayOf(PropTypes.object).isRequired,
    authors: PropTypes.arrayOf(PropTypes.string).isRequired,
    datasource: PropTypes.arrayOf(PropTypes.string).isRequired,
    id: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
  })).isRequired,
  selectedDatasets: PropTypes.arrayOf(PropTypes.shape({
    affiliations: PropTypes.arrayOf(PropTypes.string).isRequired,
    allIds: PropTypes.arrayOf(PropTypes.object).isRequired,
    authors: PropTypes.arrayOf(PropTypes.string).isRequired,
    datasource: PropTypes.arrayOf(PropTypes.string).isRequired,
    id: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
  })).isRequired,
  setSelectedDatasets: PropTypes.func.isRequired,
  tagDatasets: PropTypes.func.isRequired,
  types: PropTypes.arrayOf(PropTypes.string).isRequired,
  years: PropTypes.arrayOf(PropTypes.number).isRequired,
};
