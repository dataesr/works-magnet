import { Button, Col, File, Row } from '@dataesr/react-dsfr';
import PropTypes from 'prop-types';
import { useState } from 'react';

import { export2json, importJson } from '../../utils/file';

export default function Actions({
  options,
  setOptions,
  setSortedPublications,
  sortedPublications,
}) {
  const [displayFileUpload, setDisplayFileUpload] = useState(false);

  return (
    <Row>
      <Col className="text-right">
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
            onChange={(e) => importJson(e, setSortedPublications, setOptions)}
          />
        )}
        <Button
          disabled={sortedPublications.length === 0}
          icon="ri-save-line"
          onClick={() => export2json(sortedPublications, options)}
          size="sm"
          colors={['success']}
        >
          Save
        </Button>
      </Col>
    </Row>
  );
}

Actions.propTypes = {
  options: PropTypes.object.isRequired,
  setSortedPublications: PropTypes.func.isRequired,
  setOptions: PropTypes.func.isRequired,
  sortedPublications: PropTypes.arrayOf(PropTypes.shape({
    action: PropTypes.string,
    identifier: PropTypes.string,
  })).isRequired,
};
