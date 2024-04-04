/* eslint-disable max-len */
import { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  Row, Col,
  SegmentedControl, SegmentedElement,
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
  const [Tab, setTab] = useState('selectAffiliations');
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
          <Row>
            <Col>
              <Title as="h2" look="h6" className="fr-mt-1w">
                📑 Find the publications affiliated to your institution
              </Title>
            </Col>
            <Col className="text-right">
              <SegmentedControl
                className="fr-mb-1w"
                name="tabSelector"
                onChange={(e) => setTab(e.target.value)}
              >
                <SegmentedElement
                  checked={Tab === 'selectAffiliations'}
                  label="Select the raw affiliations for your institution"
                  value="selectAffiliations"
                />
                <SegmentedElement
                  checked={Tab === 'listOfPublications'}
                  label="List of publications"
                  value="listOfPublications"
                />
              </SegmentedControl>
              <Button
                size="sm"
                variant="text"
                icon="settings-5-line"
              />
            </Col>
          </Row>
          {/* <Row>
            <Col>
              <ActionsAffiliations
                allAffiliations={allAffiliations}
                setAllAffiliations={setAllAffiliations}
                tagAffiliations={tagAffiliations}
              />
            </Col>
          </Row> */}
          <Row>
            <Col xs="12">
              {
                (Tab === 'selectAffiliations') && (
                  <AffiliationsTab
                    affiliations={allAffiliations}
                    selectedAffiliations={selectedAffiliations}
                    setSelectedAffiliations={setSelectedAffiliations}
                    tagAffiliations={tagAffiliations}
                  />
                )
              }
              {
                (Tab === 'listOfPublications') && (
                  <PublicationsTab
                    publishers={data.publications?.publishers || []}
                    publications={allPublications}
                    selectedPublications={selectedPublications}
                    setSelectedPublications={setSelectedPublications}
                    tagPublications={tagPublications}
                    types={data.publications?.types || []}
                    years={data.publications?.years || []}
                  />
                )
              }
            </Col>
          </Row>
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
