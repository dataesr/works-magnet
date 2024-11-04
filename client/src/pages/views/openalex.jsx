import { Col, Row, Title } from '@dataesr/dsfr-plus';
import PropTypes from 'prop-types';

import ActionsOpenalex from '../actions/actionsOpenalex';
import ActionsOpenalexFeedback from '../actions/actionsOpenalexFeedback';
import OpenalexTab from '../openalexTab';

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
          <div className="fr-callout fr-callout--pink-tuile">
            <Title as="h2" look="h6">
              Improve ROR matching in OpenAlex - Provide your feedback!
            </Title>
            <p className="fr-callout__text fr-text--sm">
              🔎 The array below summarizes the most frequent raw affiliation
              strings retrieved in OpenAlex for your query.
              <br />
              🤖 The second column indicates the ROR automatically computed by
              OpenAlex. Sometimes, they can be inaccurate or missing.
              <br />
              ✏️ Click the third column to edit and input the right RORs for
              this raw affiliation string. Use a ';' to input multiple RORs.
              <br />
              🗣 Once finished, you can use the Export button on the right to
              send this feedback to OpenAlex.
            </p>
          </div>
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
