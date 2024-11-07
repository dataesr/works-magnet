import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  Col, Row,
} from '@dataesr/dsfr-plus';

import PublicationsView from './publicationsView';
import Gauge from '../../components/gauge';
import { datasources, status } from '../../config';
import { normalizeName, renderButtons } from '../../utils/works';

export default function PublicationsTab({ publications, publishers, selectedPublications, setSelectedPublications, tagPublications, types, years }) {
  const [filteredAffiliationName, setFilteredAffiliationName] = useState('');
  const [filteredDatasources] = useState(datasources.map((datasource) => datasource.key));
  const [filteredPublications, setFilteredPublications] = useState([]);
  const [filteredPublishers, setFilteredPublishers] = useState([]);
  const [filteredStatus] = useState([status.tobedecided.id, status.validated.id, status.excluded.id]);
  const [filteredTypes, setFilteredTypes] = useState([]);
  const [timer, setTimer] = useState();
  const [fixedMenu, setFixedMenu] = useState(false);

  useEffect(() => {
    setFilteredPublications(publications);
    setFilteredPublishers(Object.keys(publishers));
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
        && filteredTypes.includes(publication.type));
      setFilteredPublications(filteredPublicationsTmp);
    }, 500);
    setTimer(timerTmp);
    // The timer should not be tracked
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publications, filteredAffiliationName, filteredDatasources, filteredPublishers, filteredStatus, filteredTypes]);

  return (
    <>
      <div className={`actions-menu ${fixedMenu ? 'action-menu-fixed' : ''}`} title="actions">
        <div className={`selected-item ${selectedPublications.length && 'selected'}`}>
          <span className="number">
            {selectedPublications.length}
          </span>
          {`selected publication${selectedPublications.length === 1 ? '' : 's'}`}
        </div>
        {renderButtons(selectedPublications, tagPublications)}
        <div className="text-right">
          <Button
            onClick={() => setFixedMenu(!fixedMenu)}
            size="sm"
            variant="tertiary"
          >
            {fixedMenu ? <i className="ri-pushpin-fill" /> : <i className="ri-pushpin-line" />}
          </Button>
        </div>
      </div>
      <Row gutters>
        <Col xs="12">
          <Gauge
            data={Object.values(status).map((st) => ({
              ...st,
              value: publications.filter((publication) => publication.status === st.id).length,
            }))}
          />
        </Col>
        <Col xs="12">
          <PublicationsView
            filteredAffiliationName={filteredAffiliationName}
            selectedWorks={selectedPublications}
            setFilteredAffiliationName={setFilteredAffiliationName}
            setSelectedWorks={setSelectedPublications}
            works={filteredPublications}
            years={years}
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
