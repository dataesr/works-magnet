import { Button, Checkbox, Col, File, Row } from '@dataesr/react-dsfr';
import PropTypes from 'prop-types';
import { useState } from 'react';

import { export2json, importJson } from '../../utils/file';

export default function Actions({
  actions,
  options,
  selectedAffiliations,
  selectedPublications,
  setOptions,
  setViewAllPublications,
  tagAffiliation,
  tagLines,
  viewAllPublications,
}) {
  const [displayFileUpload, setDisplayFileUpload] = useState(false);

  return (
    <Row>
      <Col n="4">
        <Checkbox
          checked={viewAllPublications}
          label="View all publications"
          onChange={() => setViewAllPublications(!viewAllPublications)}
          size="sm"
        />
      </Col>
      <Col className="text-right">
        <Button
          className="fr-mb-1w"
          disabled={selectedAffiliations.length === 0}
          icon="ri-check-fill"
          onClick={() => { tagAffiliation(selectedAffiliations, 'keep'); }}
          secondary
        >
          Keep all
        </Button>
        <Button
          className="fr-mb-1w"
          disabled={selectedAffiliations.length === 0}
          icon="ri-close-fill"
          onClick={() => { tagAffiliation(selectedAffiliations, 'exclude'); }}
          secondary
        >
          Exclude all
        </Button>
      </Col>
      <Col className="text-right">
        <Button
          className="fr-mb-1w"
          disabled={selectedPublications.length === 0}
          icon="ri-check-fill"
          onClick={() => { tagLines(selectedPublications, 'keep'); }}
          secondary
        >
          Keep
        </Button>
        <Button
          className="fr-mb-1w"
          disabled={selectedPublications.length === 0}
          icon="ri-close-fill"
          onClick={() => { tagLines(selectedPublications, 'exclude'); }}
          secondary
        >
          Exclude
        </Button>
        <Button
          icon="ri-save-line"
          onClick={() => export2json(actions, options)}
        >
          Save
        </Button>
        <Button
          className="fr-mb-1w"
          icon="ri-file-upload-line"
          onClick={() => setDisplayFileUpload(true)}
          secondary
        >
          Restore from file
        </Button>
        {displayFileUpload && (
          <File
            accept=".json"
            hint="Select JSON file to restore from previous state"
            label="JSON file"
            onChange={(e) => importJson(e, setOptions)}
          />
        )}
      </Col>
    </Row>
  );
}

Actions.propTypes = {
  selectedAffiliations: PropTypes.arrayOf(PropTypes.shape({
    affiliations: PropTypes.arrayOf(PropTypes.string).isRequired,
    publications: PropTypes.arrayOf(PropTypes.string).isRequired,
    publicationsNumber: PropTypes.number.isRequired,
  })).isRequired,
  selectedPublications: PropTypes.arrayOf(PropTypes.shape({
    affiliations: PropTypes.arrayOf(PropTypes.string).isRequired,
    authors: PropTypes.arrayOf(PropTypes.string).isRequired,
    datasource: PropTypes.string.isRequired,
    doi: PropTypes.string.isRequired,
    hal_id: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    identifier: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
  })).isRequired,
  setViewAllPublications: PropTypes.func.isRequired,
  tagAffiliation: PropTypes.func.isRequired,
  tagLines: PropTypes.func.isRequired,
  viewAllPublications: PropTypes.bool.isRequired,
};
