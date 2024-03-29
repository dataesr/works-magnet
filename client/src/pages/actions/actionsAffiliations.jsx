import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import {
  Button,
  Row, Col,
} from '@dataesr/dsfr-plus';
import { Tooltip } from 'react-tooltip';
import useToast from '../../hooks/useToast';

import { status } from '../../config';
import { export2json, importJson } from '../../utils/files';
import File from '../../components/File';

export default function ActionsAffiliations({
  allAffiliations,
  tagAffiliations,
}) {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [displayFileUpload, setDisplayFileUpload] = useState(false);
  const decidedAffiliations = allAffiliations?.filter((affiliation) => affiliation.status !== status.tobedecided.id) || [];
  const onExport = () => {
    export2json({ data: decidedAffiliations, label: 'affiliations', searchParams });
    toast({
      description: `${decidedAffiliations.length} affiliations have been saved`,
      id: 'saveAffiliations',
      title: 'Affiliations saved',
      toastType: 'info',
    });
  };
  const onImport = (e) => {
    importJson(e, tagAffiliations);
    setDisplayFileUpload(false);
    toast({
      description: `${decidedAffiliations.length} affiliations are now flagged`,
      id: 'importAffiliations',
      title: 'Affiliations imported',
      toastType: 'success',
    });
  };

  // TODO: Add icons
  return (
    <>
      <Row className="fr-mb-1w">
        <Col className="text-right">
          <Button
            data-tooltip-id="save-affiliations-button"
            disabled={!decidedAffiliations.length}
            // icon="ri-save-line"
            onClick={() => onExport()}
            size="sm"
          >
            Save decided affiliations
          </Button>
          <Tooltip id="save-affiliations-button" hidden={!decidedAffiliations.length}>
            Save the decided affiliations in order to restore it later
          </Tooltip>
          <Button
            data-tooltip-id="restore-affiliations-button"
            // icon="file-upload-line"
            onClick={() => setDisplayFileUpload(true)}
            secondary
            variant="secondary"
            size="sm"
          >
            Restore affiliations
          </Button>
          <Tooltip id="restore-affiliations-button">
            Restore affiliations from saved file
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
              onChange={(e) => { onImport(e); }}
            />
          </Col>
        </Row>
      )}
    </>
  );
}

ActionsAffiliations.propTypes = {
  allAffiliations: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.isRequired,
    nameHtml: PropTypes.string.isRequired,
    key: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    works: PropTypes.arrayOf(PropTypes.string).isRequired,
    worksNumber: PropTypes.number.isRequired,
  })).isRequired,
  tagAffiliations: PropTypes.func.isRequired,
};
