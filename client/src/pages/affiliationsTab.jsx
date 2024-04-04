import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  Row, Col,
  TextInput,
  Title,
} from '@dataesr/dsfr-plus';

import AffiliationsView from './affiliationsView';
import Gauge from '../components/gauge';
import { status } from '../config';
import { normalizeName, renderButtons } from '../utils/works';

export default function AffiliationsTab({ affiliations, selectedAffiliations, setSelectedAffiliations, tagAffiliations }) {
  const [filteredAffiliations, setFilteredAffiliations] = useState([]);
  const [filteredAffiliationName, setFilteredAffiliationName] = useState('');
  const [timer, setTimer] = useState();
  const [fixedMenu, setFixedMenu] = useState(true);

  useEffect(() => { // TODO : look for a better way to do this
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
        <Col xs="12">
          <div className="fr-callout callout-color">
            <Title as="h3" look="h6">
              Select the raw affiliations corresponding to your institution
            </Title>
            <p className="fr-callout__text fr-text--sm">
              🔎 The array below summarizes the most frequent raw affiliation strings retrieved in the French Open Science Monitor data and in OpenAlex for your query.
              <br />
              🤔 You can validate ✅ or exclude ❌ each of them, whether it actually corresponds to your institution or not. If an affiliation is validated, it will also validate all the works with that affiliation string.
              <br />
              🤖 The second column indicates the RoR automatically computed by OpenAlex. Sometimes, they can be inaccurate or missing. If any errors, please use the first tab to send feedback.
              <br />
              💾 You can save (export to a file) those decisions, and restore them later on.
            </p>
          </div>
        </Col>
        <Col />
      </Row>
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
        <Col xs="12" offset="0">
          <TextInput
            label="Search in affiliations name"
            onChange={(e) => setFilteredAffiliationName(e.target.value)}
            value={filteredAffiliationName}
          />
        </Col>
      </Row>
      <Row gutters>
        <Col xs="12">
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
