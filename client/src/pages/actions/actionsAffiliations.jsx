import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import {
  Button,
  Container, Row, Col,
  Modal, ModalContent,
  Title,
} from '@dataesr/dsfr-plus';
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
  const decidedAffiliations = allAffiliations?.filter((affiliation) => affiliation.status !== status.tobedecided.id) || [];
  const [isModalOpen, setIsModalOpen] = useState(false);
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
    toast({
      description: `${decidedAffiliations.length} affiliations are now flagged`,
      id: 'importAffiliations',
      title: 'Affiliations imported',
      toastType: 'success',
    });
  };

  return (
    <div className="text-right">
      <Modal isOpen={isModalOpen} hide={() => setIsModalOpen(!isModalOpen)}>
        <ModalContent>
          <Title as="h2" look="h5">
            <i className="ri-save-line fr-mr-1w" />
            Save the decided affiliations
          </Title>
          <Container className="fr-mb-5w">
            <Row>
              <Col>
                <p>
                  Save the decided affiliations in order to restore it later
                </p>
                <Button
                  data-tooltip-id="save-affiliations-button"
                  disabled={!decidedAffiliations.length}
                  onClick={() => onExport()}
                >
                  <i className="ri-save-line fr-mr-1w" />
                  Save decided affiliations
                </Button>
              </Col>
            </Row>
          </Container>
          <hr />
          <Title as="h2" look="h5">
            <i className="ri-file-upload-line fr-mr-1w" />
            Restore affiliations
          </Title>
          <Container>
            <Row>
              <Col>
                <p>
                  Restore affiliations from saved file
                </p>
                <File
                  accept=".json"
                  onChange={(e) => { onImport(e); }}
                />
              </Col>
            </Row>
          </Container>
        </ModalContent>
      </Modal>

      <Button
        icon="save-line"
        onClick={() => setIsModalOpen(!isModalOpen)}
        size="sm"
      >
        Save & restore
      </Button>
    </div>
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
