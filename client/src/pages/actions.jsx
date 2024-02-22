import { Col, File, Row } from '@dataesr/react-dsfr';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Tooltip } from 'react-tooltip';

import Button from '../components/button';
import ButtonDropdown from '../components/button-dropdown';
import { export2json, importJson } from '../utils/files';
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
  const [searchParams, setSearchParams] = useSearchParams();
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
            onClick={() => export2json({ decidedAffiliations, label: 'affiliations', searchParams })}
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
          <ButtonDropdown data={allDatasets} label="datasets" searchParams={searchParams} />
          <ButtonDropdown data={allPublications} label="publications" searchParams={searchParams} />
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
    key: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    works: PropTypes.arrayOf(PropTypes.string).isRequired,
    worksNumber: PropTypes.number.isRequired,
  })).isRequired,
  allDatasets: PropTypes.arrayOf(PropTypes.shape({
    affiliations: PropTypes.arrayOf(PropTypes.object).isRequired,
    allIds: PropTypes.arrayOf(PropTypes.object).isRequired,
    datasource: PropTypes.arrayOf(PropTypes.string).isRequired,
    id: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
  })).isRequired,
  allPublications: PropTypes.arrayOf(PropTypes.shape({
    affiliations: PropTypes.arrayOf(PropTypes.object).isRequired,
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
