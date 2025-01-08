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
import useWebSocket from 'react-use-websocket';

import useToast from '../../../hooks/useToast';

const { VITE_WS_HOST } = import.meta.env;

export default function SendFeedbackButton({ className, corrections, resetCorrections }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userEmail, setUserEmail] = useState(null);
  const [validEmail, setValidEmail] = useState(null);
  const { toast } = useToast();

  const switchModal = () => setIsModalOpen((prev) => !prev);

  const { sendJsonMessage } = useWebSocket(`${VITE_WS_HOST}/ws`, {
    onError: (event) => console.error(event),
    onMessage: (event) => {
      const { autoDismissAfter, description, title, toastType } = JSON.parse(event.data);
      return toast({
        autoDismissAfter: autoDismissAfter ?? 10000,
        description: description ?? '',
        id: 'websocket',
        title: title ?? 'Message renvoyé par le WebSocket',
        toastType: toastType ?? 'info',
      });
    },
    shouldReconnect: () => true,
  });

  const sendFeedback = async () => {
    try {
      const data = corrections.map((correction) => ({
        ...correction,
        rors: [...correction.rors, ...correction.addList].filter((ror) => !correction.removeList.includes(ror.rorId)),
      }));
      sendJsonMessage({ data, email: userEmail, type: 'openalex-affiliations' });
      toast({
        autoDismissAfter: 5000,
        description: 'Your corrections are currently submitted to the <a href="https://github.com/dataesr/openalex-affiliations/issues" target="_blank">Github repository</a>',
        id: 'initOpenAlex',
        title: 'OpenAlex corrections submitted',
      });
      resetCorrections();
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
    const emailRegex = /^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/i;
    const testEmail = (email) => setValidEmail(emailRegex.test(email) ? email : null);
    const timeOutId = setTimeout(() => testEmail(userEmail), 500);
    return () => clearTimeout(timeOutId);
  }, [userEmail]);

  return (
    <>
      <Button
        aria-label="Send feedback to OpenAlex"
        className={className}
        color="blue-ecume"
        disabled={!corrections.length > 0}
        icon="send-plane-fill"
        onClick={switchModal}
        size="sm"
        title="Send feedback to OpenAlex"
      >
        Send feedback to OpenAlex
      </Button>
      <Modal isOpen={isModalOpen} hide={switchModal}>
        <ModalTitle>Improve OpenAlex data</ModalTitle>
        <ModalContent>
          {`You corrected ROR matching for ${corrections.length} raw
          affiliation${(corrections.length === 1) ? '' : 's'}
          string${(corrections.length === 1) ? '' : 's'}.`}
          <TextInput
            label="Please indicate your email. Only an encrypted version of your email will be public."
            onChange={(e) => setUserEmail(e.target.value)}
            required
            type="email"
          />
        </ModalContent>
        <ModalFooter>
          <Button
            aria-label="Send feedback to OpenAlex"
            disabled={!corrections.length > 0 || !validEmail}
            onClick={sendFeedback}
            title="Send feedback to OpenAlex"
          >
            Send feedback to OpenAlex
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}

SendFeedbackButton.propTypes = {
  className: PropTypes.string,
  corrections: PropTypes.arrayOf(PropTypes.shape({
    addList: PropTypes.arrayOf(PropTypes.string).isRequired,
    hasCorrection: PropTypes.bool.isRequired,
    name: PropTypes.string.isRequired,
    nameHtml: PropTypes.string.isRequired,
    removeList: PropTypes.arrayOf(PropTypes.string).isRequired,
    rors: PropTypes.arrayOf(PropTypes.shape({
      rorCountry: PropTypes.string.isRequired,
      rorId: PropTypes.string.isRequired,
      rorName: PropTypes.string.isRequired,
    })).isRequired,
    rorsNumber: PropTypes.number.isRequired,
    rorsToCorrect: PropTypes.arrayOf(PropTypes.shape({
      rorCountry: PropTypes.string.isRequired,
      rorId: PropTypes.string.isRequired,
      rorName: PropTypes.string.isRequired,
    })).isRequired,
    selected: PropTypes.bool.isRequired,
    source: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    works: PropTypes.arrayOf(PropTypes.string).isRequired,
    worksExample: PropTypes.arrayOf(PropTypes.shape({
      id_type: PropTypes.string.isRequired,
      id_value: PropTypes.string.isRequired,
    })).isRequired,
    worksNumber: PropTypes.number.isRequired,
    worksOpenAlex: PropTypes.arrayOf(PropTypes.string).isRequired,
  })).isRequired,
  resetCorrections: PropTypes.func.isRequired,
};

SendFeedbackButton.defaultProps = {
  className: '',
};
