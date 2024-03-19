import { Button, Col, Modal, ModalClose, ModalContent, ModalFooter, ModalTitle, Row, TextInput } from '@dataesr/react-dsfr';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';

import useToast from '../../hooks/useToast';
import { sendGitHubIssue } from '../../utils/github';

export default function ActionsOpenalexFeedback({ allOpenalexCorrections }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [userEmail, setUserEmail] = useState(null);
  const [validEmail, setValidEmail] = useState(null);
  const { toast } = useToast();

  const openModal = () => {
    setModalOpen((prev) => !prev);
  };

  const feedback = () => {
    sendGitHubIssue({ data: allOpenalexCorrections, email: userEmail });
    toast({
      description: `${allOpenalexCorrections.length} corrections to OpenAlex have been saved - 
        see <a href="https://github.com/dataesr/openalex-affiliations/issues" target="_blank">https://github.com/dataesr/openalex-affiliations/issues</a>`,
      id: 'saveOpenAlex',
      title: 'OpenAlex corrections sent',
      toastType: 'success',
    });
  };

  useEffect(() => {
    const emailRegex = new RegExp(/^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i);
    const testEmail = (email) => {
      if (emailRegex.test(email)) {
        setValidEmail(email);
      } else {
        setValidEmail(null);
      }
    };
    const timeOutId = setTimeout(() => testEmail(userEmail), 500);
    return () => clearTimeout(timeOutId);
  }, [userEmail]);

  return (
    <Row className="fr-mb-1w">
      <Col className="text-right">
        <>
          <Modal isOpen={modalOpen}>
            <ModalClose
              onClick={openModal}
            >
              Close
            </ModalClose>
            <ModalTitle>
              Improve OpenAlex data
            </ModalTitle>
            <ModalContent>
              {`You corrected RoR matching for ${allOpenalexCorrections.length} raw affiliations strings.`}
              <TextInput
                label="Please indicate your email"
                type="email"
                required
                withAutoValidation
                onChange={(e) => setUserEmail(e.target.value)}
              />
            </ModalContent>
            <ModalFooter>
              <div>
                <Button
                  disabled={!allOpenalexCorrections.length > 0 || !validEmail}
                  onClick={feedback}
                  title="Send feedback to OpenAlex"
                >
                  Send feedback to OpenAlex
                </Button>
              </div>
            </ModalFooter>
          </Modal>
          <Button
            disabled={!allOpenalexCorrections.length > 0}
            size="sm"
            onClick={openModal}
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
