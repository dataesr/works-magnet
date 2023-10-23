import { Col, File, Row } from '@dataesr/react-dsfr';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Tooltip } from 'react-tooltip';

import Button from '../../components/button';
import { export2BsoCsv, export2json, importJson } from '../../utils/file';

export default function Actions({
  allAffiliations,
  allPublications,
  options,
  setAllAffiliations,
  setAllPublications,
}) {
  const [, setSearchParams] = useSearchParams();
  const [displayFileUpload, setDisplayFileUpload] = useState(false);

  return (
    <>
      <Row className="fr-mb-1w">
        <Col className="text-right">
          <Button
            data-tooltip-id="restore-session-button"
            icon="ri-file-upload-line"
            onClick={() => setDisplayFileUpload(true)}
            size="sm"
          >
            Restore session
          </Button>
          <Tooltip id="restore-session-button" hidden={!allPublications.length}>
            Restore a previous work from saved file
          </Tooltip>
          <Button
            data-tooltip-id="save-session-button"
            disabled={!allPublications.length}
            icon="ri-save-line"
            onClick={() => export2json(allAffiliations, allPublications, options)}
            secondary
            size="sm"
          >
            Save session
          </Button>
          <Tooltip id="save-session-button" hidden={!allPublications.length}>
            Save your ongoing work into a file that could be restored later
          </Tooltip>
          <Button
            disabled={!allPublications.length}
            icon="ri-save-line"
            onClick={() => export2BsoCsv(allPublications)}
            size="sm"
          >
            Export BSO
          </Button>
        </Col>
      </Row>
      {displayFileUpload && (
        <Row className="fr-mb-1w">
          <Col>
            <File
              accept=".json"
              hint="Select JSON file to restore from previous state"
              label="JSON file"
              onChange={(e) => importJson(e, setAllAffiliations, setSearchParams, setAllPublications)}
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
    publications: PropTypes.arrayOf(PropTypes.string).isRequired,
    publicationsNumber: PropTypes.number.isRequired,
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
};
