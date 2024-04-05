import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Container, Row, Col,
  TextInput,
} from '@dataesr/dsfr-plus';
import OpenalexView from './openalexView';
import { status } from '../config';
import { normalizeName } from '../utils/works';

export default function OpenalexTab({ affiliations, setAllOpenalexCorrections }) {
  const [filteredAffiliations, setFilteredAffiliations] = useState([]);
  const [filteredAffiliationName, setFilteredAffiliationName] = useState('');
  const [filteredStatus] = useState([status.tobedecided.id, status.validated.id, status.excluded.id]);
  const [timer, setTimer] = useState();

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
  }, [affiliations, filteredAffiliationName, filteredStatus]);

  return (
    <Container fluid>
      <Row gutters>
        <Col n="12">
          <OpenalexView
            allAffiliations={filteredAffiliations}
            filteredAffiliationName={filteredAffiliationName}
            setAllOpenalexCorrections={setAllOpenalexCorrections}
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
