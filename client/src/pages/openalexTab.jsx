import { Col, Container, Row } from '@dataesr/dsfr-plus';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';

import { status } from '../config';
import OpenalexView from './openalexView';

export default function OpenalexTab({ affiliations, setAllOpenalexCorrections }) {
  const [filteredAffiliations, setFilteredAffiliations] = useState([]);
  const [filteredAffiliationId, setFilteredAffiliationId] = useState('');
  const [filteredAffiliationName, setFilteredAffiliationName] = useState('');
  const [filteredStatus] = useState([status.tobedecided.id, status.validated.id, status.excluded.id]);
  const [timer, setTimer] = useState();

  useEffect(() => {
    if (timer) {
      clearTimeout(timer);
    }
    const timerTmp = setTimeout(() => {
      const filteredAffiliationsTmp = affiliations
        .filter((affiliation) => {
          const regex = new RegExp(filteredAffiliationName);
          return regex.test(affiliation.key.replace('[ source', ''));
        }).filter((affiliation) => {
          const regex = new RegExp(filteredAffiliationId);
          return regex.test(affiliation.rors.map((ror) => ror.rorId).join(' '));
        });
      setFilteredAffiliations(filteredAffiliationsTmp);
    }, 500);
    setTimer(timerTmp);
    // The timer should not be tracked
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [affiliations, filteredAffiliationId, filteredAffiliationName, filteredStatus]);

  return (
    <Container fluid>
      <Row gutters>
        <Col n="12">
          <OpenalexView
            allAffiliations={filteredAffiliations}
            filteredAffiliationId={filteredAffiliationId}
            filteredAffiliationName={filteredAffiliationName}
            setAllOpenalexCorrections={setAllOpenalexCorrections}
            setFilteredAffiliationId={setFilteredAffiliationId}
            setFilteredAffiliationName={setFilteredAffiliationName}
          />
        </Col>
      </Row>
    </Container>
  );
}

OpenalexTab.propTypes = {
  affiliations: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.isRequired,
    nameHtml: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    works: PropTypes.arrayOf(PropTypes.string).isRequired,
    worksNumber: PropTypes.number.isRequired,
  })).isRequired,
  setAllOpenalexCorrections: PropTypes.func.isRequired,
};
