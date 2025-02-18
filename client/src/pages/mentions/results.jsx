import {
  Breadcrumb,
  Button,
  Col,
  Container,
  Link,
  Modal,
  ModalContent,
  ModalFooter,
  ModalTitle,
  Row,
  Text,
  TextInput,
  Toggle,
} from '@dataesr/dsfr-plus';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import useWebSocket from 'react-use-websocket';

import useToast from '../../hooks/useToast';
import Header from '../../layout/header';
import MentionsList from './components/mentions-list.tsx';

import './styles.scss';

const DEFAULT_FROM = 0;
const DEFAULT_SEARCH = '';
const DEFAULT_SIZE = 50;
const DEFAULT_SORTBY = 'doi';
const DEFAULT_SORTORDER = 'asc';
const DEFAULT_TYPE = 'software';

const { VITE_API, VITE_WS_HOST } = import.meta.env;

export default function MentionsResults() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();

  const [created, setCreated] = useState(false);
  const [isCorrectionsModalOpen, setIsCorrectionsModalOpen] = useState(false);
  const [mentions, setMentions] = useState([]);
  const [mentionsWithCorrection, setMentionsWithCorrection] = useState([]);
  const [params, setParams] = useState({
    from: DEFAULT_FROM,
    search: DEFAULT_SEARCH,
    size: DEFAULT_SIZE,
    sortBy: DEFAULT_SORTBY,
    sortOrder: DEFAULT_SORTORDER,
    type: DEFAULT_TYPE,
  });
  const [shared, setShared] = useState(false);
  const [type, setType] = useState(params.type);
  const [used, setUsed] = useState(false);
  const [userEmail, setUserEmail] = useState(null);
  const [validEmail, setValidEmail] = useState(null);

  const { sendJsonMessage } = useWebSocket(`${VITE_WS_HOST}/ws`, {
    onError: (event) => console.error(event),
    onMessage: (event) => {
      const { autoDismissAfter, description, title, toastType } = JSON.parse(
        event.data,
      );
      return toast({
        autoDismissAfter: autoDismissAfter ?? 10000,
        description: description ?? '',
        id: 'websocket',
        title: title ?? 'Message returned by the WebSocket',
        toastType: toastType ?? 'info',
      });
    },
    shouldReconnect: () => true,
  });

  const switchCorrectionsModal = () => setIsCorrectionsModalOpen((previousState) => !previousState);

  const sendFeedback = async () => {
    try {
      sendJsonMessage({
        data: mentionsWithCorrection,
        email: userEmail,
        type: 'mentions-characterizations',
      });
      toast({
        autoDismissAfter: 5000,
        description:
          'Your corrections are currently submitted to the <a href="https://github.com/dataesr/mentions-characterizations/issues" target="_blank">Github repository</a>',
        id: 'initMentions',
        title: 'Mentions characterizations submitted',
      });
    } catch (e) {
      toast({
        description: e.message,
        id: 'errorMentions',
        title: 'Error while sending mentions characterizations',
        toastType: 'error',
      });
    } finally {
      switchCorrectionsModal();
    }
  };

  const getMentions = async (options) => {
    const response = await fetch(`${VITE_API}/mentions`, {
      body: JSON.stringify(options),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    });
    return response.json();
  };

  const updateMentions = () => {
    // Update selected mentions with values of used, created, shared and type
    const updatedMentions = mentions.filter((mention) => mention.selected).map((mention) => ({
      ...mention,
      mention_context: {
        created,
        shared,
        used,
      },
      type,
    }));

    // Update existing corrections or add new ones
    const newMentionsWithCorrection = [...mentionsWithCorrection];
    updatedMentions.forEach((updatedMention) => {
      const existingIndex = newMentionsWithCorrection.findIndex((m) => m.id === updatedMention.id);
      if (existingIndex !== -1) {
        newMentionsWithCorrection[existingIndex] = updatedMention;
      } else {
        newMentionsWithCorrection.push(updatedMention);
      }
    });
    setMentionsWithCorrection(newMentionsWithCorrection);
    // Reset values
    setCreated(false);
    setShared(false);
    setType(DEFAULT_TYPE);
    setUsed(false);
    // unselect all mentions
    setMentions(mentions.map((mention) => ({ ...mention, selected: false })));
  };

  const { data, error, isLoading } = useQuery(['mentions', JSON.stringify(params)], () => {
    if (params?.search.length > 0) return getMentions(params);
    return {};
  });

  useEffect(() => {
    if (data && data.mentions && data.mentions.length > 0) {
      // first call
      if (Number(params.from) === 0) {
        setMentions(data.mentions);
      }
      // next calls
      if (Number(params.from) >= mentions.length && mentions.length < data.count) {
        setMentions([...mentions, ...data.mentions]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, params.from]);

  useEffect(() => {
    // Set default params values
    if (searchParams.size === 0) {
      setSearchParams({
        from: DEFAULT_FROM,
        search: DEFAULT_SEARCH,
        size: DEFAULT_SIZE,
        'sort-by': DEFAULT_SORTBY,
        'sort-order': DEFAULT_SORTORDER,
        type: DEFAULT_TYPE,
      });
    } else {
      setParams({
        from: searchParams.get('from') || DEFAULT_FROM,
        search: searchParams.get('search') || DEFAULT_SEARCH,
        size: searchParams.get('size') || DEFAULT_SIZE,
        sortBy: searchParams.get('sort-by') || DEFAULT_SORTBY,
        sortOrder: searchParams.get('sort-order') || DEFAULT_SORTORDER,
        type: searchParams.get('type') || DEFAULT_TYPE,
      });
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    const emailRegex = /^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/i;
    const testEmail = (email) => setValidEmail(emailRegex.test(email) ? email : null);
    const timeOutId = setTimeout(() => testEmail(userEmail), 500);
    return () => clearTimeout(timeOutId);
  }, [userEmail]);

  return (
    <div style={{ minHeight: '700px' }}>
      <Header />

      <Modal isOpen={isCorrectionsModalOpen} hide={switchCorrectionsModal}>
        <ModalTitle>Improve Mentions metadata</ModalTitle>
        <ModalContent>
          {`You corrected ${mentionsWithCorrection.length} mention${mentionsWithCorrection.length > 1 ? 's' : ''}.`}
          <TextInput
            className="fr-mt-1w"
            label="Please indicate your email. Only an encrypted version of your email will be public."
            onChange={(e) => setUserEmail(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && mentionsWithCorrection.length > 0 && validEmail) {
                sendFeedback();
              }
            }}
            required
            type="email"
          />
        </ModalContent>
        <ModalFooter>
          <Button
            aria-label={`Send ${mentionsWithCorrection.length} correction${mentionsWithCorrection.length > 1 ? 's' : ''}`}
            disabled={!mentionsWithCorrection.length > 0 || !validEmail}
            onClick={sendFeedback}
            title={`Send ${mentionsWithCorrection.length} correction${mentionsWithCorrection.length > 1 ? 's' : ''}`}
          >
            {`Send ${mentionsWithCorrection.length} correction${mentionsWithCorrection.length > 1 ? 's' : ''}`}
          </Button>
        </ModalFooter>
      </Modal>

      <main className="wm-bg">
        {(isLoading) && (
          <Container style={{ textAlign: 'center', minHeight: '600px' }} className="fr-pt-5w wm-font">
            <div className="fr-mb-5w wm-message fr-pt-10w">
              Loading data, please wait...
              <br />
              <br />
              <span className="loader fr-my-5w">Loading</span>
            </div>
          </Container>
        )}

        {error && (
          <Row gutters className="fr-mb-16w">
            <Col xs="12">
              <Text>Error while fetching data, please try again later or contact the team (see footer).</Text>
            </Col>
          </Row>
        )}

        {!isLoading && data && (
          <Container fluid className="wm-mentions fr-mx-5w">
            <Row>
              <Breadcrumb className="fr-my-1w">
                <Link href="/">Home</Link>
                <Link href={`/mentions/search?search=${params.search}`}>Search software and dataset mentions in the full-text</Link>
                <Link current>See results and make corrections</Link>
              </Breadcrumb>
            </Row>

            <Row className="actions fr-mb-1w">
              <Col>
                <Row gutters>
                  <Col md={7}>
                    <div className="corrections-box">
                      <span>
                        <strong>
                          {mentions.filter((mention) => mention?.selected).length}
                        </strong>
                        {' '}
                        {mentions.filter((mention) => mention?.selected).length <= 1 ? 'mention' : 'mentions'}
                        {' '}
                        selected
                      </span>
                      <select
                        className="fr-select"
                        disabled={mentions.filter((mention) => mention?.selected).length === 0}
                        onChange={(e) => setType(e.target.value)}
                        value={type}
                      >
                        <option value="software">Software</option>
                        <option value="dataset">Dataset</option>
                      </select>
                      <Toggle
                        checked={used}
                        disabled={mentions.filter((mention) => mention?.selected).length === 0}
                        label="Used"
                        onChange={(e) => setUsed(e.target.checked)}
                      />
                      <Toggle
                        checked={created}
                        disabled={mentions.filter((mention) => mention?.selected).length === 0}
                        label="Created"
                        onChange={(e) => setCreated(e.target.checked)}
                      />
                      <Toggle
                        checked={shared}
                        disabled={mentions.filter((mention) => mention?.selected).length === 0}
                        label="Shared"
                        onChange={(e) => setShared(e.target.checked)}
                      />
                      <Button
                        color="green-bourgeon"
                        disabled={mentions.filter((mention) => mention?.selected).length === 0}
                        onClick={() => { updateMentions(); }}
                        size="sm"
                      >
                        Apply corrections
                      </Button>
                    </div>
                  </Col>
                  <Col className="text-right">
                    <Button
                      disabled={mentionsWithCorrection.length === 0}
                      onClick={() => { switchCorrectionsModal(); }}
                      size="sm"
                    >
                      {`Send ${mentionsWithCorrection.length} correction${mentionsWithCorrection.length > 1 ? 's' : ''}`}
                    </Button>
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <i>
                      <strong>{mentions.length}</strong>
                      {' '}
                      {mentions.length === 1 ? 'mention' : 'mentions'}
                      {' '}
                      displayed out of
                      {' '}
                      <strong>{data.count}</strong>
                      {' '}
                      detected
                    </i>
                  </Col>
                </Row>
              </Col>
            </Row>

            <Row className="results">
              <Col>
                <MentionsList
                  mentions={mentions}
                  mentionsWithCorrection={mentionsWithCorrection}
                  searchParams={searchParams}
                  setMentionsWithCorrection={setMentionsWithCorrection}
                  setSearchParams={setSearchParams}
                  setSelectedMentions={setMentions}
                />
              </Col>
            </Row>

            {data.count > mentions.length && (
              <div className="text-center">
                <Button
                  className="fr-mt-2w"
                  onClick={() => setParams({ ...params, from: params.from + params.size })}
                  size="sm"
                >
                  Load more mentions
                </Button>
              </div>
            )}
          </Container>
        )}
      </main>
    </div>
  );
}
