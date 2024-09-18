import {
  Button,
  Modal,
  ModalContent,
  ModalFooter,
  ModalTitle,
  TextInput,
} from '@dataesr/dsfr-plus';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';

import useToast from '../../hooks/useToast';
import { sendGitHubIssue } from '../../utils/github';

export default function ActionsOpenalexFeedback({ allOpenalexCorrections, uuid }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userEmail, setUserEmail] = useState(null);
  const [validEmail, setValidEmail] = useState(null);
  const { toast } = useToast();

  const switchModal = () => setIsModalOpen((prev) => !prev);

  const feedback = async () => {
    try {
      sendGitHubIssue({ data: allOpenalexCorrections, email: userEmail, uuid });
    } catch (error) {
      toast({
        description: error.message,
        id: 'errorOpenAlex',
        title: 'Error while sending OpenAlex corrections',
        toastType: 'error',
      });
    } finally {
      switchModal();
    }
  };

  useEffect(() => {
    const emailRegex = new RegExp(
      /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i,
    );
    const testEmail = (email) => setValidEmail(emailRegex.test(email) ? email : null);
    const timeOutId = setTimeout(() => testEmail(userEmail), 500);
    return () => clearTimeout(timeOutId);
  }, [userEmail]);

  return (
    <>
      <Button
        disabled={!allOpenalexCorrections.length > 0}
        onClick={switchModal}
        size="sm"
      >
        Send feedback to OpenAlex
      </Button>
      <Modal isOpen={isModalOpen} hide={switchModal}>
        <ModalTitle>Improve OpenAlex data</ModalTitle>
        <ModalContent>
          {`You corrected RoR matching for ${allOpenalexCorrections.length} raw affiliation(s) string(s).`}
          <TextInput
            label="Please indicate your email. Only an encrypted version of your email will be public."
            onChange={(e) => setUserEmail(e.target.value)}
            required
            type="email"
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
  allOpenalexCorrections: PropTypes.arrayOf(
    PropTypes.shape({
      rawAffiliationString: PropTypes.string.isRequired,
      rorsInOpenAlex: PropTypes.arrayOf(PropTypes.object).isRequired,
      correctedRors: PropTypes.string.isRequired,
      worksExample: PropTypes.arrayOf(PropTypes.object).isRequired,
      worksOpenAlex: PropTypes.arrayOf(PropTypes.string).isRequired,
    }),
  ).isRequired,
  uuid: PropTypes.string.isRequired,
};
