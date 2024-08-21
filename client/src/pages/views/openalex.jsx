import PropTypes from 'prop-types';
import {
  Row, Col,
  Title,
} from '@dataesr/dsfr-plus';
import ActionsOpenalex from '../actions/actionsOpenalex';
import ActionsOpenalexFeedback from '../actions/actionsOpenalexFeedback';
import OpenalexTab from '../openalexTab';

export default function Openalex({
  allAffiliations,
  allOpenalexCorrections,
  setAllOpenalexCorrections,
  options,
}) {
  return (
    <>
      <Row className="fr-pb-1w fr-grid-row--top">
        <Col xs="12">
          <div className="fr-callout fr-callout--pink-tuile">
            <Title as="h2" look="h6">
              Improve RoR matching in OpenAlex - Provide your feedback!
            </Title>
            <p className="fr-callout__text fr-text--sm">
              🔎 The array below summarizes the most frequent raw affiliation strings retrieved in OpenAlex for your query.
              <br />
              🤖 The second column indicates the RoR automatically computed by OpenAlex. Sometimes, they can be inaccurate or missing.
              <br />
              ✏️  Click the third column to edit and input the right RoRs for this raw affiliation string. Use a ';' to input multiple RoRs.
              <br />
              🗣 Once finished, you can use the Export button on the right to send this feedback to OpenAlex.
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
            options={options}
          />
        </Col>
      </Row>
      <OpenalexTab
        affiliations={allAffiliations.filter((aff) => aff.source === 'OpenAlex')}
        setAllOpenalexCorrections={setAllOpenalexCorrections}
      />
    </>
  );
}

Openalex.propTypes = {
  allAffiliations: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.isRequired,
    nameHtml: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    works: PropTypes.arrayOf(PropTypes.string).isRequired,
    worksNumber: PropTypes.number.isRequired,
  })).isRequired,
  allOpenalexCorrections: PropTypes.arrayOf(
    PropTypes.shape({
      rawAffiliationString: PropTypes.string.isRequired,
      rorsInOpenAlex: PropTypes.arrayOf(PropTypes.object).isRequired,
      correctedRors: PropTypes.string.isRequired,
      worksExample: PropTypes.arrayOf(PropTypes.object).isRequired,
      worksOpenAlex: PropTypes.arrayOf(PropTypes.string).isRequired,
    }),
  ).isRequired,
  setAllOpenalexCorrections: PropTypes.func.isRequired,
  options: PropTypes.object.isRequired,
};
