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
      description: `${allOpenalexCorrections.length} correction(s) to OpenAlex have been saved - 
        see <a href="https://github.com/dataesr/openalex-affiliations/issues" target="_blank">https://github.com/dataesr/openalex-affiliations/issues</a>`,
      id: 'saveOpenAlex',
      title: 'OpenAlex corrections sent',
      toastType: 'success',
    });
    openModal();
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
        size="sm"
      >
        Send feedback to OpenAlex
      </Button>
      <Modal isOpen={isModalOpen} hide={openModal}>
        <ModalTitle>
          Improve OpenAlex data
        </ModalTitle>
        <ModalContent>
          {`You corrected RoR matching for ${allOpenalexCorrections.length} raw affiliation(s) string(s).`}
          <TextInput
            label="Please indicate your email. Only an encrpted version of your email will be public."
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
  allOpenalexCorrections: PropTypes.arrayOf(
    PropTypes.shape({
      rawAffiliationString: PropTypes.string.isRequired,
      rorsInOpenAlex: PropTypes.arrayOf(PropTypes.object).isRequired,
      correctedRors: PropTypes.string.isRequired,
      worksExample: PropTypes.arrayOf(PropTypes.object).isRequired,
      worksOpenAlex: PropTypes.arrayOf(PropTypes.string).isRequired,
    }),
  ).isRequired,
};
