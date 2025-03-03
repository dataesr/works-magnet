/* eslint-disable max-len */
import {
  Breadcrumb,
  Col,
  Link,
  Row,
  SegmentedControl,
  SegmentedElement,
  Title,
} from '@dataesr/dsfr-plus';
import PropTypes from 'prop-types';
import { useState } from 'react';

import ActionsAffiliations from '../actions/actionsAffiliations';
import ActionsPublications from '../actions/actionsPublications';
import AffiliationsTab from '../affiliationsTab';
import PublicationsTab from '../publications/publicationsTab';

export default function Publications({
  allAffiliations,
  allPublications,
  data,
  selectedAffiliations,
  selectedPublications,
  setSelectedAffiliations,
  setSelectedPublications,
  tagAffiliations,
  tagPublications,
}) {
  const [tab, setTab] = useState('selectAffiliations');

  if (allPublications?.length === 0) {
    return <div>No publications detected.</div>;
  }

  return (
    <>
      <Row>
        <Breadcrumb className="fr-pt-4w fr-mt-0 fr-mb-2w">
          <Link href="/">
            Home
          </Link>
          <Link href="/publications">
            Build my corpus of publications
          </Link>
          <Link current>
            Select the affiliations and build the corpus
          </Link>
        </Breadcrumb>
      </Row>
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
            onChangeValue={(value) => setTab(value)}
          >
            <SegmentedElement
              checked={tab === 'selectAffiliations'}
              label="Select the raw affiliations for your institution"
              value="selectAffiliations"
            />
            <SegmentedElement
              checked={tab === 'listOfPublications'}
              label="List of publications"
              value="listOfPublications"
            />
          </SegmentedControl>
        </Col>
      </Row>
      {tab === 'selectAffiliations' && (
        <>
          <Row>
            <Col xs="12">
              <div className="fr-callout fr-callout--pink-tuile">
                <Title as="h3" look="h6">
                  Select the raw affiliations corresponding to your
                  institution
                </Title>
                <p className="fr-callout__text fr-text--sm">
                  🔎 The array below summarizes the most frequent raw
                  affiliation strings retrieved in the French Open Science
                  Monitor data and in OpenAlex for your query.
                  <br />
                  🤔 You can validate ✅ or exclude ❌ each of them, whether
                  it actually corresponds to your institution or not. If an
                  affiliation is validated, it will also validate all the
                  works with that affiliation string.
                  <br />
                  🤖 The second column indicates the ROR automatically
                  computed by OpenAlex. Sometimes, they can be inaccurate or
                  missing. If any errors, please use the first tab to send
                  feedback.
                  <br />
                  💾 You can save (export to a file) those decisions, and
                  restore them later on.
                </p>
              </div>
            </Col>
          </Row>
          <Row>
            <Col>
              <ActionsAffiliations
                allAffiliations={allAffiliations}
                tagAffiliations={tagAffiliations}
              />
            </Col>
          </Row>
        </>
      )}
      <Row>
        <Col xs="12">
          {tab === 'selectAffiliations' && (
            <AffiliationsTab
              affiliations={allAffiliations}
              selectedAffiliations={selectedAffiliations}
              setSelectedAffiliations={setSelectedAffiliations}
              tagAffiliations={tagAffiliations}
            />
          )}
          {tab === 'listOfPublications' && (
            <>
              <ActionsPublications
                allPublications={allPublications}
                className="fr-pb-1w"
              />
              <PublicationsTab
                publishers={data.publications?.publishers || []}
                publications={allPublications}
                selectedPublications={selectedPublications}
                setSelectedPublications={setSelectedPublications}
                tagPublications={tagPublications}
                types={data.publications?.types ?? {}}
                years={data.publications?.years ?? {}}
              />
            </>
          )}
        </Col>
      </Row>
    </>
  );
}

Publications.propTypes = {
  allAffiliations: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      nameHtml: PropTypes.string.isRequired,
      status: PropTypes.string.isRequired,
      works: PropTypes.arrayOf(PropTypes.string).isRequired,
      worksNumber: PropTypes.number.isRequired,
    }),
  ).isRequired,
  setSelectedAffiliations: PropTypes.func.isRequired,
  selectedAffiliations: PropTypes.arrayOf(PropTypes.object).isRequired,
  tagAffiliations: PropTypes.func.isRequired,
  allPublications: PropTypes.arrayOf(PropTypes.object).isRequired,
  data: PropTypes.object.isRequired,
  selectedPublications: PropTypes.arrayOf(PropTypes.object).isRequired,
  setSelectedPublications: PropTypes.func.isRequired,
  tagPublications: PropTypes.func.isRequired,
};
