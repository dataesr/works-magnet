import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import {
  Button,
  Modal, ModalContent, ModalFooter, ModalTitle,
  TextInput,
} from '@dataesr/dsfr-plus';
import useToast from '../../hooks/useToast';
import { sendGitHubIssue } from '../../utils/github';

export default function ActionsOpenalexFeedback({ allOpenalexCorrections }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userEmail, setUserEmail] = useState(null);
  const [validEmail, setValidEmail] = useState(null);
  const { toast } = useToast();

  const openModal = () => {
    setIsModalOpen((prev) => !prev);
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
    const testEmail = (email) => setValidEmail(emailRegex.test(email) ? email : null);
    const timeOutId = setTimeout(() => testEmail(userEmail), 500);
    return () => clearTimeout(timeOutId);
  }, [userEmail]);

  return (
    <>
      <Button
        disabled={!allOpenalexCorrections.length > 0}
        onClick={openModal}
      >
        Send feedback to OpenAlex
      </Button>
      <Modal isOpen={isModalOpen} hide={openModal}>
        <ModalTitle>
          Improve OpenAlex data
        </ModalTitle>
        <ModalContent>
          {`You corrected RoR matching for ${allOpenalexCorrections.length} raw affiliations strings.`}
          <TextInput
            label="Please indicate your email"
            onChange={(e) => setUserEmail(e.target.value)}
            required
            type="email"
            withAutoValidation
          />
        </ModalContent>
        <ModalFooter>
          <Button
            disabled={!allOpenalexCorrections.length > 0 || !validEmail}
            onClick={feedback}
            title="Send feedback to OpenAlex"
          >
            Send feedback to OpenAlex
          </Button>
        </ModalFooter>
      </Modal>
    </>
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
