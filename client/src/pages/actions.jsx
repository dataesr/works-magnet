import { Col, File, Row } from '@dataesr/react-dsfr';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Tooltip } from 'react-tooltip';

import Button from '../components/button';
import { export2Csv, export2FosmCsv, export2json, export2jsonl, importJson } from '../utils/file';
import { status } from '../config';

export default function Actions({
  allAffiliations,
  allDatasets,
  allPublications,
  options,
  setAllAffiliations,
  setAllPublications,
  tagAffiliations,
}) {
  const [, setSearchParams] = useSearchParams();
  const [displayFileUpload, setDisplayFileUpload] = useState(false);

  const decidedAffiliations = allAffiliations.filter((affiliation) => affiliation.status !== status.tobedecided.id);

  return (
    <>
      <Row className="fr-mb-1w">
        <Col className="text-right">
          <Button
            data-tooltip-id="save-affiliations-button"
            disabled={!decidedAffiliations.length}
            icon="ri-save-line"
            onClick={() => export2json({ decidedAffiliations })}
            size="sm"
          >
            Save decided affiliations
          </Button>
          <Tooltip id="save-affiliations-button" hidden={!decidedAffiliations.length}>
            Save the decided affiliations in order to restore it later
          </Tooltip>
          <Button
            data-tooltip-id="restore-affiliations-button"
            icon="ri-file-upload-line"
            onClick={() => setDisplayFileUpload(true)}
            secondary
            size="sm"
          >
            Restore affiliations
          </Button>
          <Tooltip id="restore-affiliations-button">
            Restore affiliations from saved file
          </Tooltip>
          <Button
            data-tooltip-id="export-datasets-csv-button"
            disabled={!allDatasets.length}
            icon="ri-save-line"
            onClick={() => export2Csv({ data: allDatasets, label: 'datasets' })}
            size="sm"
          >
            Export datasets (minimal data)
          </Button>
          <Tooltip id="export-datasets-csv-button" hidden={!allDatasets.length}>
            Export all datasets in CSV
          </Tooltip>
          <Button
            data-tooltip-id="export-datasets-jsonl-button"
            disabled={!allDatasets.length}
            icon="ri-save-line"
            onClick={() => export2jsonl({ data: allDatasets, label: 'datasets' })}
            size="sm"
          >
            Export datasets (complete data)
          </Button>
          <Tooltip id="export-datasets-jsonl-button" hidden={!allDatasets.length}>
            Export all datasets in JSONL
          </Tooltip>
          <Button
            data-tooltip-id="export-publications-csv-button"
            disabled={!allPublications.length}
            icon="ri-save-line"
            onClick={() => export2Csv({ data: allPublications, label: 'publications' })}
            size="sm"
          >
            Export publications (minimal data)
          </Button>
          <Tooltip id="export-publications-csv-button" hidden={!allPublications.length}>
            Export all publications in CSV
          </Tooltip>
          <Button
            data-tooltip-id="export-publications-jsonl-button"
            disabled={!allPublications.length}
            icon="ri-save-line"
            onClick={() => export2jsonl({ data: allPublications, label: 'publications' })}
            size="sm"
          >
            Export publications (complete data)
          </Button>
          <Tooltip id="export-publications-jsonl-button" hidden={!allPublications.length}>
            Export all publications in JSONL
          </Tooltip>
          <Button
            data-tooltip-id="export-fosm-button"
            disabled={!allPublications.length}
            icon="ri-save-line"
            onClick={() => export2FosmCsv(allPublications)}
            size="sm"
          >
            Custom export for French OSM
          </Button>
          <Tooltip id="export-fosm-button" hidden={!allPublications.length}>
            Export the
            {' '}
            <b>validated</b>
            {' '}
            publications in the format needed to build a local French OSM in CSV
          </Tooltip>
        </Col>
      </Row>
      {displayFileUpload && (
        <Row className="fr-mb-1w">
          <Col>
            <File
              accept=".json"
              hint="Select JSON file to restore from previous state"
              label="JSON file"
              onChange={(e) => { importJson(e, options, setAllAffiliations, setAllPublications, setSearchParams, tagAffiliations); setDisplayFileUpload(false); }}
            />
          </Col>
        </Row>
      )}
    </>
  );
}

Actions.propTypes = {
  allAffiliations: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.isRequired,
    nameHtml: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    works: PropTypes.arrayOf(PropTypes.string).isRequired,
    worksNumber: PropTypes.number.isRequired,
  })).isRequired,
  allDatasets: PropTypes.arrayOf(PropTypes.shape({
    affiliations: PropTypes.arrayOf(PropTypes.string).isRequired,
    allIds: PropTypes.arrayOf(PropTypes.object).isRequired,
    datasource: PropTypes.arrayOf(PropTypes.string).isRequired,
    id: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
  })).isRequired,
  allPublications: PropTypes.arrayOf(PropTypes.shape({
    affiliations: PropTypes.arrayOf(PropTypes.string).isRequired,
    allIds: PropTypes.arrayOf(PropTypes.object).isRequired,
    datasource: PropTypes.arrayOf(PropTypes.string).isRequired,
    id: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
  })).isRequired,
  options: PropTypes.object.isRequired,
  setAllAffiliations: PropTypes.func.isRequired,
  setAllPublications: PropTypes.func.isRequired,
  tagAffiliations: PropTypes.func.isRequired,
};
