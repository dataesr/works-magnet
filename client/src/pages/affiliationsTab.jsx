import {
  Button,
  Col,
  Row,
} from '@dataesr/dsfr-plus';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';

import AffiliationsView from './affiliationsView';
import Gauge from '../components/gauge';
import { status } from '../config';
import { removeDiacritics } from '../utils/strings';
import { renderButtons } from '../utils/works';

export default function AffiliationsTab({ affiliations, selectedAffiliations, setSelectedAffiliations, tagAffiliations }) {
  const [filteredAffiliations, setFilteredAffiliations] = useState([]);
  const [filteredAffiliationName, setFilteredAffiliationName] = useState('');
  const [timer, setTimer] = useState();
  const [fixedMenu, setFixedMenu] = useState(false);

  useEffect(() => { // TODO : look for a better way to do this
    setFilteredAffiliations(affiliations);
  }, [affiliations]);

  useEffect(() => {
    if (timer) {
      clearTimeout(timer);
    }
    const timerTmp = setTimeout(() => {
      const filteredAffiliationsTmp = affiliations.filter((affiliation) => {
        const regex = new RegExp(removeDiacritics(filteredAffiliationName));
        return regex.test(affiliation.key.replace('[ source: ', '').replace(' ]', ''));
      });
      setFilteredAffiliations(filteredAffiliationsTmp);
    }, 500);
    setTimer(timerTmp);
    // The timer should not be tracked
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [affiliations, filteredAffiliationName]);

  return (
    <>
      <div className={`actions-menu ${fixedMenu ? 'action-menu-fixed' : ''}`} title="actions">
        <div className={`selected-item ${selectedAffiliations.length && 'selected'}`}>
          <span className="number">
            {selectedAffiliations.length}
          </span>
          {`selected affiliation${selectedAffiliations.length === 1 ? '' : 's'}`}
        </div>
        {renderButtons(selectedAffiliations, tagAffiliations, 'affiliation')}
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
      <Row>
        <Col>
          <Gauge
            data={Object.values(status).map((st) => ({
              ...st,
              value: affiliations.filter((affiliation) => affiliation.status === st.id).length,
            }))}
          />
        </Col>
      </Row>
      <Row gutters>
        <Col xs="12">
          <AffiliationsView
            allAffiliations={filteredAffiliations}
            filteredAffiliationName={filteredAffiliationName}
            selectedAffiliations={selectedAffiliations}
            setFilteredAffiliationName={setFilteredAffiliationName}
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
