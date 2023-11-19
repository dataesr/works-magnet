import {
  Col,
  Row,
} from '@dataesr/react-dsfr';
import PropTypes from 'prop-types';
import { useState } from 'react';

import WorksView from './worksView';
import Gauge from '../components/gauge';
import { status } from '../config';
import { renderButtons } from '../utils/works';

export default function DatasetsTab({ datasets, tagDatasets }) {
  const [selectedDatasets, setSelectedDatasets] = useState([]);

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
        <Col>
          <WorksView
            selectedWorks={selectedDatasets}
            setSelectedWorks={setSelectedDatasets}
            works={datasets}
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
    affiliations: PropTypes.arrayOf(PropTypes.object).isRequired,
    allIds: PropTypes.arrayOf(PropTypes.object).isRequired,
    authors: PropTypes.arrayOf(PropTypes.object).isRequired,
    datasource: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
  })).isRequired,
  tagDatasets: PropTypes.func.isRequired,
};
