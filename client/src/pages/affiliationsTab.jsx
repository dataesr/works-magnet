import { Col, Row, TextInput } from '@dataesr/react-dsfr';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';

import AffiliationsView from './affiliationsView';
import Gauge from '../components/gauge';
import { status } from '../config';
import { normalizeName, renderButtons } from '../utils/works';

export default function AffiliationsTab({ affiliations, selectedAffiliations, setSelectedAffiliations, tagAffiliations }) {
  const [filteredAffiliations, setFilteredAffiliations] = useState([]);
  const [filteredAffiliationName, setFilteredAffiliationName] = useState('');
  const [timer, setTimer] = useState();

  useEffect(() => {
    setFilteredAffiliations(affiliations);
  }, [affiliations]);

  useEffect(() => {
    if (timer) {
      clearTimeout(timer);
    }
    const timerTmp = setTimeout(() => {
      const filteredAffiliationsTmp = affiliations.filter((affiliation) => affiliation.key.includes(normalizeName(filteredAffiliationName)));
      setFilteredAffiliations(filteredAffiliationsTmp);
    }, 500);
    setTimer(timerTmp);
    // The timer should not be tracked
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [affiliations, filteredAffiliationName]);

  return (
    <>
      <Row>
        <Col n="9">
          {renderButtons(selectedAffiliations, tagAffiliations, 'affiliation')}
        </Col>
        <Col n="3">
          <Gauge
            data={Object.values(status).map((st) => ({
              ...st,
              value: affiliations.filter((affiliation) => affiliation.status === st.id).length,
            }))}
          />
        </Col>
      </Row>
      <Row gutters>
        <Col n="12" offset="0">
          <TextInput
            label="Search in affiliations name"
            onChange={(e) => setFilteredAffiliationName(e.target.value)}
            value={filteredAffiliationName}
          />
        </Col>
      </Row>
      <Row gutters>
        <Col n="12">
          <AffiliationsView
            allAffiliations={filteredAffiliations}
            selectedAffiliations={selectedAffiliations}
            setSelectedAffiliations={setSelectedAffiliations}
          />
        </Col>
      </Row>
    </>
  );
}

AffiliationsTab.propTypes = {
  affiliations: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.isRequired,
    nameHtml: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    works: PropTypes.arrayOf(PropTypes.string).isRequired,
    worksNumber: PropTypes.number.isRequired,
  })).isRequired,
  selectedAffiliations: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.isRequired,
    nameHtml: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    works: PropTypes.arrayOf(PropTypes.string).isRequired,
    worksNumber: PropTypes.number.isRequired,
  })).isRequired,
  setSelectedAffiliations: PropTypes.func.isRequired,
  tagAffiliations: PropTypes.func.isRequired,
};
