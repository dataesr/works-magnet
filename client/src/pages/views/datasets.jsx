/* eslint-disable max-len */
import { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Row,
  Col,
  SegmentedControl,
  SegmentedElement,
  Title,
} from '@dataesr/dsfr-plus';
import ActionsDatasets from '../actions/actionsDatasets';
import DatasetsTab from '../datasets/datasetsTab';
import DatasetsYearlyDistribution from '../datasets/datasetsYearlyDistribution';
import AffiliationsTab from '../affiliationsTab';
import ActionsAffiliations from '../actions/actionsAffiliations';

export default function Datasets({
  allAffiliations,
  allDatasets,
  data,
  selectedAffiliations,
  selectedDatasets,
  setSelectedAffiliations,
  setSelectedDatasets,
  tagAffiliations,
  tagDatasets,
}) {
  const [tab, setTab] = useState('selectAffiliations');

  if (allDatasets?.length === 0) {
    return <div>No datasets detected.</div>;
  }
  return (
    <>
      <Row>
        <Col>
          <Title as="h2" look="h6" className="fr-mt-1w">
            🗃 Find the datasets affiliated to your institution
          </Title>
        </Col>
        <Col>
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
              checked={tab === 'listOfDatasets'}
              label="🗃 List of datasets"
              value="listOfDatasets"
            />
            <SegmentedElement
              checked={tab === 'insights'}
              label="📊 Insights"
              value="insights"
            />
          </SegmentedControl>
        </Col>
      </Row>
      {tab === 'selectAffiliations' && (
        <>
          <Row>
            <Col xs="12">
              <div className="fr-callout  fr-callout--pink-tuile">
                <Title as="h3" look="h6">
                  Select the raw affiliations corresponding to your institution
                </Title>
                <p className="fr-callout__text fr-text--sm">
                  🔎 The array below summarizes the most frequent raw
                  affiliation strings retrieved in the French Open Science
                  Monitor data and in OpenAlex for your query.
                  <br />
                  🤔 You can validate ✅ or exclude ❌ each of them, whether it
                  actually corresponds to your institution or not. If an
                  affiliation is validated, it will also validate all the works
                  with that affiliation string.
                  <br />
                  🤖 The second column indicates the ROR automatically computed
                  by OpenAlex. Sometimes, they can be inaccurate or missing. If
                  any errors, please use the first tab to send feedback.
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
          {tab === 'listOfDatasets' && (
            <>
              <ActionsDatasets allDatasets={allDatasets} />
              <DatasetsTab
                datasets={allDatasets}
                publishers={data?.datasets?.publishers ?? {}}
                selectedDatasets={selectedDatasets}
                setSelectedDatasets={setSelectedDatasets}
                tagDatasets={tagDatasets}
                types={data?.datasets?.types ?? {}}
                years={data?.datasets?.years ?? {}}
              />
            </>
          )}
          {tab === 'insights'
            && (allDatasets.filter((dataset) => dataset.status === 'validated')
              .length > 0 ? (
                <Row>
                  <Col xs="6">
                    <DatasetsYearlyDistribution
                      allDatasets={allDatasets}
                      field="publisher"
                    />
                  </Col>
                  <Col xs="6">
                    <DatasetsYearlyDistribution
                      allDatasets={allDatasets}
                      field="type"
                    />
                  </Col>
                  <Col xs="6">
                    <DatasetsYearlyDistribution
                      allDatasets={allDatasets}
                      field="format"
                    />
                  </Col>
                  <Col xs="6">
                    <DatasetsYearlyDistribution
                      allDatasets={allDatasets}
                      field="client_id"
                    />
                  </Col>
                  <Col xs="6">
                    <DatasetsYearlyDistribution
                      allDatasets={allDatasets}
                      field="affiliations"
                      subfield="rawAffiliation"
                    />
                  </Col>
                </Row>
              ) : (
                <div className="fr-callout fr-icon-information-line">
                  <h3 className="fr-callout__title">
                    You did not validate any datasets
                  </h3>
                  <p className="fr-callout__text">
                    Please validate affiliations or datasets to see insights about
                    it.
                  </p>
                </div>
              ))}
        </Col>
      </Row>
    </>
  );
}

Datasets.propTypes = {
  allAffiliations: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      nameHtml: PropTypes.string.isRequired,
      status: PropTypes.string.isRequired,
      works: PropTypes.arrayOf(PropTypes.string).isRequired,
      worksNumber: PropTypes.number.isRequired,
    }),
  ).isRequired,
  allDatasets: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      status: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired,
      format: PropTypes.string.isRequired,
      client_id: PropTypes.string.isRequired,
      rawAffiliation: PropTypes.string.isRequired,
      validatedAffiliation: PropTypes.string.isRequired,
      validated: PropTypes.bool.isRequired,
    }),
  ).isRequired,
  data: PropTypes.shape({
    datasets: PropTypes.shape({
      publishers: PropTypes.object,
      types: PropTypes.object,
      years: PropTypes.object,
    }),
  }).isRequired,
  selectedAffiliations: PropTypes.arrayOf(PropTypes.object).isRequired,
  selectedDatasets: PropTypes.arrayOf(PropTypes.string).isRequired,
  setSelectedAffiliations: PropTypes.func.isRequired,
  setSelectedDatasets: PropTypes.func.isRequired,
  tagAffiliations: PropTypes.func.isRequired,
  tagDatasets: PropTypes.func.isRequired,
};
