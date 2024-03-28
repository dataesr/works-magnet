/* eslint-disable max-len */
import PropTypes from 'prop-types';
import {
  Row, Col,
  Tabs, Tab,
  Title,
} from '@dataesr/dsfr-plus';
import ActionsAffiliations from '../actions/actionsAffiliations';
import AffiliationsTab from '../affiliationsTab';
import PublicationsTab from '../publicationsTab';

export default function Publications({
  allAffiliations,
  allPublications,
  data,
  options,
  selectedAffiliations,
  selectedPublications,
  setAllAffiliations,
  setSelectedAffiliations,
  setSelectedPublications,
  tagAffiliations,
  tagPublications,
}) {
  return (
    <div>
      {options.datasets ? (
        <>
          <Title as="h2" look="h6">
            You did not search for publications
          </Title>
          <Row>
            <Col xs="12">
              <div className="fr-callout">
                <p className="fr-callout__text fr-text--sm">
                  To search for publications, please disable the "Search for datasets only" option
                </p>
              </div>
            </Col>
          </Row>
        </>
      ) : (
        <>
          <Row className="fr-pb-3w">
            <Col xs="12">
              <div className="fr-callout">
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
            <Col>
              <ActionsAffiliations
                allAffiliations={allAffiliations}
                setAllAffiliations={setAllAffiliations}
                tagAffiliations={tagAffiliations}
              />
            </Col>
          </Row>
          <Tabs>
            <Tab
              icon="checkbox-line"
              label="Select the raw affiliations for your institution"
            >
              <AffiliationsTab
                affiliations={allAffiliations}
                selectedAffiliations={selectedAffiliations}
                setSelectedAffiliations={setSelectedAffiliations}
                tagAffiliations={tagAffiliations}
              />
            </Tab>
            <Tab
              icon="user-line"
              label="List of publications"
            >
              <PublicationsTab
                publishers={data.publications?.publishers || []}
                publications={allPublications}
                selectedPublications={selectedPublications}
                setSelectedPublications={setSelectedPublications}
                tagPublications={tagPublications}
                types={data.publications?.types || []}
                years={data.publications?.years || []}
              />
            </Tab>

          </Tabs>
        </>
      )}
    </div>
  );
}

Publications.propTypes = {
  allAffiliations: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.isRequired,
    nameHtml: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    works: PropTypes.arrayOf(PropTypes.string).isRequired,
    worksNumber: PropTypes.number.isRequired,
  })).isRequired,
  setSelectedAffiliations: PropTypes.func.isRequired,
  selectedAffiliations: PropTypes.arrayOf(PropTypes.object).isRequired,
  setAllAffiliations: PropTypes.func.isRequired,
  tagAffiliations: PropTypes.func.isRequired,
  options: PropTypes.object.isRequired,
  allPublications: PropTypes.arrayOf(PropTypes.object).isRequired,
  data: PropTypes.object.isRequired,
  selectedPublications: PropTypes.arrayOf(PropTypes.object).isRequired,
  setSelectedPublications: PropTypes.func.isRequired,
  tagPublications: PropTypes.func.isRequired,
};
