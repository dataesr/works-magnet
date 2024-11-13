import {
  Button,
  Container, Row, Col,
  Modal, ModalContent, ModalFooter, ModalTitle,
  Text,
  TextInput,
} from '@dataesr/dsfr-plus';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import useToast from '../../hooks/useToast';
import Header from '../../layout/header';
import { getAffiliationsCorrections } from '../../utils/curations';
import { isRor } from '../../utils/ror';
import { normalize, capitalize, removeDiacritics } from '../../utils/strings';
import { getWorks } from '../../utils/works';

import 'primereact/resources/primereact.min.css';
import 'primereact/resources/themes/lara-light-indigo/theme.css';

import { status } from '../../config';

import ExportErrorsButton from './export-errors-button';
import OpenalexView from './openalexView';
import SendFeedbackButton from './send-feedback-button';

const { VITE_APP_TAG_LIMIT } = import.meta.env;

export default function Affiliations() {
  const [searchParams] = useSearchParams();
  const [affiliations, setAffiliations] = useState([]);
  const [allOpenalexCorrections, setAllOpenalexCorrections] = useState([]);
  const [options, setOptions] = useState({});
  const { toast } = useToast();

  const [action, setAction] = useState();
  const [filteredAffiliations, setFilteredAffiliations] = useState([]);
  const [filteredAffiliationName, setFilteredAffiliationName] = useState('');
  const [filteredStatus] = useState([
    status.tobedecided.id,
    status.validated.id,
    status.excluded.id,
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [ror, setRor] = useState('');
  const [selectedOpenAlex, setSelectedOpenAlex] = useState([]);
  const [timer, setTimer] = useState();

  const { data, error, isFetched, isFetching, refetch } = useQuery({
    queryKey: ['openalex-ror', JSON.stringify(options)],
    queryFn: () => getWorks(options, toast),
    enabled: false,
  });

  const undo = (id) => {
    const newAffiliations = affiliations.map((affiliation) => {
      if (affiliation.id === id) {
        // eslint-disable-next-line no-param-reassign
        affiliation.hasCorrection = false;
        // eslint-disable-next-line no-param-reassign
        affiliation.rorsToCorrect = affiliation.rors
          .map((r) => r.rorId)
          .join(';');
      }
      return affiliation;
    });
    setAffiliations(newAffiliations);
    setAllOpenalexCorrections(getAffiliationsCorrections(newAffiliations));
  };

  useEffect(() => {
    const queryParams = {
      endYear: searchParams.get('endYear') ?? '2023',
      startYear: searchParams.get('startYear') ?? '2023',
    };
    queryParams.affiliationStrings = [];
    queryParams.deletedAffiliations = [];
    queryParams.rors = [];
    queryParams.rorExclusions = [];
    searchParams.getAll('affiliations').forEach((item) => {
      if (isRor(item)) {
        queryParams.rors.push(item);
      } else {
        queryParams.affiliationStrings.push(normalize(item));
      }
    });
    searchParams.getAll('deletedAffiliations').forEach((item) => {
      if (isRor(item)) {
        queryParams.rorExclusions.push(item);
      } else {
        queryParams.deletedAffiliations.push(normalize(item));
      }
    });
    if (
      queryParams.affiliationStrings.length === 0
      && queryParams.rors.length === 0
    ) {
      console.error(
        `You must provide at least one affiliation longer than ${VITE_APP_TAG_LIMIT} letters.`,
      );
      return;
    }
    setOptions(queryParams);
  }, [searchParams]);

  useEffect(() => {
    if (Object.keys(options).length > 0) refetch();
  }, [options, refetch]);

  useEffect(() => {
    setAffiliations(data?.affiliations ?? []);
  }, [data]);

  const actionToOpenAlex = (_action, _selectedOpenAlex, _ror) => {
    _selectedOpenAlex.map((item) => {
      let rorsToCorrect = item.rorsToCorrect.trim().split(';');
      if (action === 'add') {
        rorsToCorrect.push(_ror);
      } else if (action === 'remove') {
        rorsToCorrect = rorsToCorrect.filter((item2) => item2 !== _ror);
      }
      // eslint-disable-next-line no-param-reassign
      item.rorsToCorrect = [...new Set(rorsToCorrect)].join(';');
      // eslint-disable-next-line no-param-reassign
      item.hasCorrection = item.rors.map((r) => r.rorId).join(';') !== item.rorsToCorrect;
      return item;
    });
    setAllOpenalexCorrections(getAffiliationsCorrections(_selectedOpenAlex));
  };

  useEffect(() => {
    if (timer) {
      clearTimeout(timer);
    }
    const timerTmp = setTimeout(() => {
      const openAlexAffiliations = affiliations.filter((affiliation) => affiliation.source === 'OpenAlex');
      const filteredAffiliationsTmp = openAlexAffiliations.filter((affiliation) => {
        const regex = new RegExp(removeDiacritics(filteredAffiliationName));
        return regex.test(
          affiliation.key.replace('[ source: ', '').replace(' ]', ''),
        );
      });
      // Recompute corrections only when the array has changed
      if (filteredAffiliationsTmp.length !== filteredAffiliations.length) {
        setAllOpenalexCorrections(
          getAffiliationsCorrections(filteredAffiliationsTmp),
        );
      }
      setFilteredAffiliations(filteredAffiliationsTmp);
    }, 500);
    setTimer(timerTmp);
    // The timer should not be tracked
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [affiliations, filteredAffiliationName, filteredStatus]);

  return (
    <>
      <Header isSticky />
      <Container fluid as="main" className="wm-bg">
        {isFetching && (
          <Container style={{ textAlign: 'center', minHeight: '600px' }} className="fr-pt-5w wm-font">
            <div className="fr-mb-5w wm-message fr-pt-10w">
              Loading data from OpenAlex, please wait...
              <br />
              <br />
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/OpenAlex_logo_2021.svg/320px-OpenAlex_logo_2021.svg.png" alt="OpenAlex" />
              <br />
              <span className="loader fr-my-5w">Loading</span>
            </div>
          </Container>
        )}

        {error && (
          <Row gutters className="fr-mb-16w">
            <Col xs="12">
              <Text>
                Error while fetching data, please try again later or contact the
                team (see footer).
              </Text>
            </Col>
          </Row>
        )}

        {!isFetching && isFetched && (
          <Row>
            <Col md={2}>
              params:
            </Col>
            <Col md={10}>
              <div className="wm-bg wm-content">
                <Modal isOpen={isModalOpen} hide={() => setIsModalOpen((prev) => !prev)}>
                  <ModalTitle>
                    {`${capitalize(action)} ROR to ${
            selectedOpenAlex.length
          } OpenAlex affiliation${selectedOpenAlex.length > 1 ? 's' : ''}`}
                  </ModalTitle>
                  <ModalContent>
                    <TextInput
                      label={`Which ROR do you want to ${action} ?`}
                      message={isRor(ror) ? 'ROR valid' : 'ROR invalid'}
                      messageType={isRor(ror) ? 'valid' : 'error'}
                      onChange={(e) => setRor(e.target.value)}
                      required
                    />
                  </ModalContent>
                  <ModalFooter>
                    <Button
                      disabled={!isRor(ror)}
                      onClick={() => {
                        actionToOpenAlex(action, selectedOpenAlex, ror);
                        setRor('');
                        setIsModalOpen((prev) => !prev);
                      }}
                      title="Send feedback to OpenAlex"
                    >
                      {capitalize(action)}
                    </Button>
                  </ModalFooter>
                </Modal>
                <div className="wm-actions">
                  <div className="wm-external-actions">
                    <span className="wm-text fr-mb-3w">
                      <span>{selectedOpenAlex.length}</span>
                      {` selected affiliation${selectedOpenAlex.length === 1 ? '' : 's'}`}
                    </span>
                    <Button
                      className="fr-ml-5w fr-mr-1w"
                      color="beige-gris-galet"
                      disabled={!selectedOpenAlex.length}
                      icon="add-circle-line"
                      key="add-ror"
                      onClick={() => {
                        setAction('add');
                        setIsModalOpen((prev) => !prev);
                      }}
                      size="sm"
                      title="Add ROR"
                    >
                      Add ROR
                    </Button>
                    <Button
                      className="fr-mr-1w"
                      color="beige-gris-galet"
                      disabled={!selectedOpenAlex.length}
                      icon="close-circle-line"
                      key="remove-ror"
                      onClick={() => {
                        setAction('remove');
                        setIsModalOpen((prev) => !prev);
                      }}
                      size="sm"
                      title="Remove ROR"
                    >
                      Remove ROR
                    </Button>
                    <ExportErrorsButton
                      allOpenalexCorrections={allOpenalexCorrections}
                      options={options}
                    />
                    <SendFeedbackButton
                      allOpenalexCorrections={allOpenalexCorrections}
                    />
                  </div>
                  <div className="wm-internal-actions">
                    actions relatives au tableau du dessous
                  </div>
                </div>
                <OpenalexView
                  allAffiliations={filteredAffiliations}
                  filteredAffiliationName={filteredAffiliationName}
                  selectedOpenAlex={selectedOpenAlex}
                  setAllOpenalexCorrections={setAllOpenalexCorrections}
                  setFilteredAffiliationName={setFilteredAffiliationName}
                  setSelectedOpenAlex={setSelectedOpenAlex}
                  undo={undo}
                />
              </div>
            </Col>
          </Row>
        )}
      </Container>
    </>
  );
}
