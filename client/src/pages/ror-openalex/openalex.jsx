import { Col, Row, Title } from '@dataesr/dsfr-plus';
import PropTypes from 'prop-types';

import ActionsOpenalex from './actionsOpenalex';
import ActionsOpenalexFeedback from './actionsOpenalexFeedback';
import OpenalexTab from './openalexTab';
import ModalInfo from './modal-info';

export default function Openalex({
  allAffiliations,
  allOpenalexCorrections,
  options,
  setAllOpenalexCorrections,
  undo,
}) {
  if (!allAffiliations || allAffiliations?.length === 0) {
    return <div>No affiliations detected</div>;
  }
  return (
    <>
      <Row className="fr-pb-1w fr-grid-row--top">
        <Col xs="12">
          <ModalInfo />
        </Col>
        <Col xs="3">
          <ActionsOpenalex
            allOpenalexCorrections={allOpenalexCorrections}
            options={options}
          />
        </Col>
        <Col xs="3">
          <ActionsOpenalexFeedback
            allOpenalexCorrections={allOpenalexCorrections}
          />
        </Col>
      </Row>
      <OpenalexTab
        affiliations={allAffiliations.filter(
          (affiliation) => affiliation.source === 'OpenAlex',
        )}
        setAllOpenalexCorrections={setAllOpenalexCorrections}
        undo={undo}
      />
    </>
  );
}

Openalex.propTypes = {
  allAffiliations: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      nameHtml: PropTypes.string.isRequired,
      status: PropTypes.string.isRequired,
      works: PropTypes.arrayOf(PropTypes.string).isRequired,
      worksNumber: PropTypes.number.isRequired,
    }),
  ).isRequired,
  allOpenalexCorrections: PropTypes.arrayOf(
    PropTypes.shape({
      rawAffiliationString: PropTypes.string.isRequired,
      rorsInOpenAlex: PropTypes.arrayOf(PropTypes.object).isRequired,
      correctedRors: PropTypes.string.isRequired,
      worksExample: PropTypes.arrayOf(PropTypes.object).isRequired,
      worksOpenAlex: PropTypes.arrayOf(PropTypes.string).isRequired,
    }),
  ).isRequired,
  options: PropTypes.object.isRequired,
  setAllOpenalexCorrections: PropTypes.func.isRequired,
  undo: PropTypes.func.isRequired,
};
