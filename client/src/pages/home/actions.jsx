import { Col, File, Row } from '@dataesr/react-dsfr';
import PropTypes from 'prop-types';
import { useState } from 'react';
import Button from '../../components/button';

import { export2BsoCsv, export2json, importJson } from '../../utils/file';

export default function Actions({
  affiliationsDataTable,
  options,
  publicationsDataTable,
  setAffiliationsDataTable,
  setOptions,
  setPublicationsDataTable,
}) {
  const [displayFileUpload, setDisplayFileUpload] = useState(false);

  return (
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
        {displayFileUpload && (
          <File
            accept=".json"
            hint="Select JSON file to restore from previous state"
            label="JSON file"
            onChange={(e) => importJson(e, setAffiliationsDataTable, setPublicationsDataTable, setOptions)}
          />
        )}
        <Button
          disabled={publicationsDataTable.length === 0}
          icon="ri-save-line"
          onClick={() => export2json(affiliationsDataTable, options, publicationsDataTable)}
          size="sm"
        >
          Save work to file
        </Button>
      </Col>
      <Col className="text-right">
        <Button
          disabled={publicationsDataTable.length === 0}
          icon="ri-save-line"
          onClick={() => export2BsoCsv(publicationsDataTable)}
          size="sm"
        >
          Create local BSO file
        </Button>
      </Col>
    </Row>
  );
}

Actions.propTypes = {
  affiliationsDataTable: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    publications: PropTypes.arrayOf(PropTypes.string).isRequired,
  })).isRequired,
  options: PropTypes.object.isRequired,
  publicationsDataTable: PropTypes.arrayOf(PropTypes.shape({
    affiliations: PropTypes.arrayOf(PropTypes.object).isRequired,
    allIds: PropTypes.arrayOf(PropTypes.object).isRequired,
    authors: PropTypes.arrayOf(PropTypes.object).isRequired,
    datasource: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
  })).isRequired,
  setAffiliationsDataTable: PropTypes.func.isRequired,
  setOptions: PropTypes.func.isRequired,
  setPublicationsDataTable: PropTypes.func.isRequired,
};
