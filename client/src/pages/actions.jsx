import { Col, File, Row } from '@dataesr/react-dsfr';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Tooltip } from 'react-tooltip';

import Button from '../components/button';
import { export2BsoCsv, export2json, importJson } from '../utils/file';
import { status } from '../config';

export default function Actions({
  allAffiliations,
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
            data-tooltip-id="save-session-button"
            disabled={!allAffiliations.length || !allPublications.length}
            icon="ri-save-line"
            onClick={() => export2json({ allAffiliations, allPublications, options })}
            size="sm"
          >
            Save session
          </Button>
          <Tooltip id="save-session-button" hidden={!allAffiliations.length || !allPublications.length}>
            Save your ongoing work into a file that could be restored later
          </Tooltip>
          <Button
            data-tooltip-id="restore-session-button"
            icon="ri-file-upload-line"
            onClick={() => setDisplayFileUpload(true)}
            secondary
            size="sm"
          >
            Restore session
          </Button>
          <Tooltip id="restore-session-button">
            Restore a previous work from saved file
          </Tooltip>
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
            data-tooltip-id="export-fosm-button"
            disabled={!allPublications.length}
            icon="ri-save-line"
            onClick={() => export2BsoCsv(allPublications)}
            size="sm"
          >
            Export French OSM
          </Button>
          <Tooltip id="export-fosm-button" hidden={!allPublications.length}>
            Export the selected publications in the format needed to build a local French OSM
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
    id: PropTypes.string.isRequired,
    matches: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    nameHtml: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    works: PropTypes.arrayOf(PropTypes.string).isRequired,
    worksNumber: PropTypes.number.isRequired,
  })).isRequired,
  allPublications: PropTypes.arrayOf(PropTypes.shape({
    affiliations: PropTypes.arrayOf(PropTypes.object).isRequired,
    allIds: PropTypes.arrayOf(PropTypes.object).isRequired,
    datasource: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
  })).isRequired,
  options: PropTypes.object.isRequired,
  setAllAffiliations: PropTypes.func.isRequired,
  setAllPublications: PropTypes.func.isRequired,
  tagAffiliations: PropTypes.func.isRequired,
};
