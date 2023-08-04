import { Col, File, Row } from '@dataesr/react-dsfr';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import Button from '../../components/button';

import { export2BsoCsv, export2json, importJson } from '../../utils/file';

export default function Actions({
  allAffiliations,
  allWorks,
  options,
  setAllAffiliations,
  setAllWorks,
}) {
  const [, setSearchParams] = useSearchParams();
  const [displayFileUpload, setDisplayFileUpload] = useState(false);

  return (
    <>
      <Row className="fr-mb-1w">
        <Col>
          <Button
            icon="ri-file-upload-line"
            onClick={() => setDisplayFileUpload(true)}
            secondary
            size="sm"
          >
            Restore from file
          </Button>
          <Button
            disabled={!allWorks.length}
            icon="ri-save-line"
            onClick={() => export2json(allAffiliations, allWorks, options)}
            size="sm"
          >
            Save work to file
          </Button>
        </Col>
        <Col className="text-right">
          <Button
            disabled={!allWorks.length}
            icon="ri-save-line"
            onClick={() => export2BsoCsv(allWorks)}
            size="sm"
          >
            Create export file
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
              onChange={(e) => importJson(e, setAllAffiliations, setSearchParams, setAllWorks)}
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
  allWorks: PropTypes.arrayOf(PropTypes.shape({
    affiliations: PropTypes.arrayOf(PropTypes.object).isRequired,
    allIds: PropTypes.arrayOf(PropTypes.object).isRequired,
    authors: PropTypes.arrayOf(PropTypes.object).isRequired,
    datasource: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
  })).isRequired,
  options: PropTypes.object.isRequired,
  setAllAffiliations: PropTypes.func.isRequired,
  setAllWorks: PropTypes.func.isRequired,
};
