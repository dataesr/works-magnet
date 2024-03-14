import { Button, Col, Modal, ModalClose, ModalContent, ModalFooter, ModalTitle, Row, TextInput } from '@dataesr/react-dsfr';
import PropTypes from 'prop-types';
import { useSearchParams } from 'react-router-dom';
import { useState } from 'react';
import useToast from '../../hooks/useToast';

import { sendGitHubIssue } from '../../utils/github';

const emailRegex = new RegExp(/^[A-Za-z0-9_!#$%&'*+\/=?`{|}~^.-]+@[A-Za-z0-9.-]+$/, 'gm');

export default function ActionsOpenalexFeedback({
  allOpenalexCorrections
}) {
  const [searchParams] = useSearchParams();
  const [modalOpen, setModalOpen] = useState(false);
  const [userEmail, setUserEmail] = useState(null);
  const { toast } = useToast();

  const openModal = () => {
    setModalOpen((prev) => !prev);
  };

  const toastOpenAlex = () => {
    toast({
      description: `${allOpenalexCorrections.length} corrections to OpenAlex have been saved - see <a href="https://github.com/dataesr/openalex-affiliations/issues" target="_blank">https://github.com/dataesr/openalex-affiliations/issues</a>`,
      id: 'saveOpenAlex',
      title: 'OpenAlex corrections sent',
      toastType: 'success',
    });
  };

  const feedback = () => {
    sendGitHubIssue({ data: allOpenalexCorrections, email: userEmail });
    toastOpenAlex();
  };

  return (
    <Row className="fr-mb-1w">
      <Col className="text-right">
        <>
          <Modal isOpen={modalOpen}>
            <ModalClose
              onClick={() => { openModal(); }}
            >
              Close
            </ModalClose>
            <ModalTitle>
              Improve OpenAlex data
            </ModalTitle>
            <ModalContent>
              {`You corrected RoR matching for ${allOpenalexCorrections.length} raw affiliations strings.`}
              <TextInput
                label="Please indicate your email "
                type="email"
                required
                withAutoValidation
                onChange={(e) => setUserEmail(e.target.value)}
              />
            </ModalContent>
            <ModalFooter>
              <div>
                <Button
                  title="Send feedback to OpenAlex"
                  onClick={() => { feedback(); }}
                  disabled={!allOpenalexCorrections.length > 0 || !userEmail}
                >
                  Send feedback to OpenAlex
                </Button>
              </div>
            </ModalFooter>
          </Modal>
          <Button
            onClick={() => openModal()}
            disabled={!allOpenalexCorrections.length > 0}
          >
            Send feedback to OpenAlex
          </Button>
        </>
      </Col>
    </Row>
  );
}

ActionsOpenalexFeedback.propTypes = {
  allOpenalexCorrections: PropTypes.arrayOf(PropTypes.shape({
    affiliations: PropTypes.arrayOf(PropTypes.object),
    allIds: PropTypes.arrayOf(PropTypes.object).isRequired,
    datasource: PropTypes.arrayOf(PropTypes.string).isRequired,
    id: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
  })).isRequired,
};
