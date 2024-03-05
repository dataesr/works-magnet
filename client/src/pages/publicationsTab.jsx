import {
  Checkbox,
  CheckboxGroup,
  Col,
  Row,
  TextInput,
} from '@dataesr/react-dsfr';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';

import PublicationsView from './publicationsView';
import Gauge from '../components/gauge';
import { datasources, status } from '../config';
import { normalizeName, renderButtons } from '../utils/works';

export default function PublicationsTab({ publications, publishers, selectedPublications, setSelectedPublications, tagPublications, types, years }) {
  const [filteredAffiliationName, setFilteredAffiliationName] = useState('');
  const [filteredDatasources, setFilteredDatasources] = useState(datasources.map((datasource) => datasource.key));
  const [filteredPublications, setFilteredPublications] = useState([]);
  const [filteredPublishers, setFilteredPublishers] = useState([]);
  const [filteredStatus, setFilteredStatus] = useState([status.tobedecided.id, status.validated.id, status.excluded.id]);
  const [filteredTypes, setFilteredTypes] = useState([]);
  const [filteredYears, setFilteredYears] = useState([]);
  const [timer, setTimer] = useState();

  useEffect(() => {
    setFilteredPublications(publications);
    setFilteredPublishers(Object.keys(publishers));
    setFilteredYears(Object.keys(years));
    setFilteredTypes(Object.keys(types));
  }, [publications, publishers, types, years]);

  useEffect(() => {
    if (timer) {
      clearTimeout(timer);
    }
    const timerTmp = setTimeout(() => {
      const filteredPublicationsTmp = publications.filter((publication) => normalizeName(publication.allInfos).includes(normalizeName(filteredAffiliationName))
        && filteredDatasources.filter((filteredDatasource) => publication.datasource.includes(filteredDatasource)).length
        && filteredPublishers.includes(publication.publisher)
        && filteredStatus.includes(publication.status)
        && filteredTypes.includes(publication.type)
        && filteredYears.includes(publication.year));
      setFilteredPublications(filteredPublicationsTmp);
    }, 500);
    setTimer(timerTmp);
    // The timer should not be tracked
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publications, filteredAffiliationName, filteredDatasources, filteredPublishers, filteredStatus, filteredTypes, filteredYears]);

  return (
    <>
      <Row>
        <Col n="9">
          {renderButtons(selectedPublications, tagPublications, 'publication')}
        </Col>
        <Col n="3">
          <Gauge
            data={Object.values(status).map((st) => ({
              ...st,
              value: publications.filter((publication) => publication.status === st.id).length,
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
          <PublicationsView
            selectedWorks={selectedPublications}
            setSelectedWorks={setSelectedPublications}
            works={filteredPublications}
          />
        </Col>
      </Row>
    </>
  );
}

PublicationsTab.propTypes = {
  publications: PropTypes.arrayOf(PropTypes.shape({
    affiliations: PropTypes.arrayOf(PropTypes.object).isRequired,
    allIds: PropTypes.arrayOf(PropTypes.object).isRequired,
    authors: PropTypes.arrayOf(PropTypes.string).isRequired,
    datasource: PropTypes.arrayOf(PropTypes.string).isRequired,
    id: PropTypes.string.isRequired,
    publisher: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
  })).isRequired,
  publishers: PropTypes.object.isRequired,
  selectedPublications: PropTypes.arrayOf(PropTypes.shape({
    affiliations: PropTypes.arrayOf(PropTypes.object).isRequired,
    allIds: PropTypes.arrayOf(PropTypes.object).isRequired,
    authors: PropTypes.arrayOf(PropTypes.string).isRequired,
    datasource: PropTypes.arrayOf(PropTypes.string).isRequired,
    id: PropTypes.string.isRequired,
    publisher: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
  })).isRequired,
  setSelectedPublications: PropTypes.func.isRequired,
  tagPublications: PropTypes.func.isRequired,
  types: PropTypes.object.isRequired,
  years: PropTypes.object.isRequired,
};
