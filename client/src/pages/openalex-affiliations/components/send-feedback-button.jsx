import {
  Button,
  Modal,
  ModalContent,
  ModalFooter,
  ModalTitle,
  TextInput,
} from '@dataesr/dsfr-plus';
import Cookies from 'js-cookie';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import useWebSocket from 'react-use-websocket';

const { VITE_APP_DEFAULT_YEAR, VITE_WS_HOST } = import.meta.env;

export default function SendFeedbackButton({ addNotice, className, corrections, resetCorrections }) {
  const [searchParams] = useSearchParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userEmail, setUserEmail] = useState(Cookies.get('works-magnet-user-email'), '');
  const [validEmail, setValidEmail] = useState(null);

  const switchModal = () => setIsModalOpen((prev) => !prev);

  const { sendJsonMessage } = useWebSocket(`${VITE_WS_HOST}/ws`, {
    onError: (event) => {
      console.error(event);
      addNotice({
        message: 'Error while sending affiliations corrections.<br />'
          + 'Please reload the page.<br />'
          + 'If needed, deactivate your ad blocker.<br />'
          + 'If needed, contact the tech team <a href="mailto:bso@recherche.gouv.fr">bso@recherche.gouv.fr</a>',
        type: 'error',
      });
    },
    onMessage: (event) => {
      const { description, toastType } = JSON.parse(event.data);
      addNotice({
        message: description ?? '',
        type: toastType ?? 'info',
      });
    },
  });

  const sendFeedback = async () => {
    try {
      Cookies.set('works-magnet-user-email', userEmail);
      const data = corrections.map((correction) => ({
        endYear: searchParams.get('endYear') ?? VITE_APP_DEFAULT_YEAR,
        name: correction.name,
        rors: [...correction.rors, ...correction.addList].filter((ror) => !correction.removeList.includes(ror.rorId)),
        rorsToCorrect: correction.rorsToCorrect,
        startYear: searchParams.get('startYear') ?? VITE_APP_DEFAULT_YEAR,
        worksExample: correction.worksExample,
        worksOpenAlex: correction.worksOpenAlex,
      }));
      sendJsonMessage({ data, email: userEmail, type: 'openalex-affiliations' });
      addNotice({
        message: 'Your corrections are currently submitted to the <a href="https://github.com/dataesr/openalex-affiliations/issues" target="_blank">Github repository</a>',
        type: 'info',
      });
      resetCorrections();
    } catch (error) {
      addNotice({
        message: error.message,
        type: 'error',
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
            onKeyDown={(e) => {
              if (e.key === 'Enter' && corrections.length > 0 && validEmail) {
                sendFeedback();
              }
            }}
            required
            type="email"
            value={userEmail}
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
  addNotice: PropTypes.func,
  className: PropTypes.string,
  corrections: PropTypes.arrayOf(PropTypes.shape({
    addList: PropTypes.arrayOf(PropTypes.object).isRequired,
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
  addNotice: () => { },
  className: '',
};
