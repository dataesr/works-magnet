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
} from '@dataesr/dsfr-plus';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import useWebSocket from 'react-use-websocket';

import ButtonDropdown from '../../components/button-dropdown';
import useToast from '../../hooks/useToast';
import Header from '../../layout/header';
import CustomToggle from './components/custom-toggle/index';
import MentionsList from './components/mentions-list.tsx';

import './styles.scss';

const DEFAULT_ADVANCED = 0;
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
    advanced: DEFAULT_ADVANCED,
    from: DEFAULT_FROM,
    search: DEFAULT_SEARCH,
    size: DEFAULT_SIZE,
    sortBy: DEFAULT_SORTBY,
    sortOrder: DEFAULT_SORTORDER,
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
    const data = [];
    mentionsWithCorrection.forEach((mentionWithCorrection) => {
      if (mentionWithCorrection.type_original !== mentionWithCorrection.type) {
        data.push({
          doi: mentionWithCorrection.doi,
          id: mentionWithCorrection.id,
          previousType: mentionWithCorrection.type_original,
          text: mentionWithCorrection.context,
          type: mentionWithCorrection.type,
        });
      }
      if (
        mentionWithCorrection.mention_context.created !== mentionWithCorrection.mention_context_original.created
        || mentionWithCorrection.mention_context.shared !== mentionWithCorrection.mention_context_original.shared
        || mentionWithCorrection.mention_context.used !== mentionWithCorrection.mention_context_original.used
      ) {
        data.push({
          doi: mentionWithCorrection.doi,
          id: mentionWithCorrection.id,
          texts: [{
            text: [mentionWithCorrection.context],
            class_attributes: {
              classification: {
                created: {
                  previousValue: mentionWithCorrection.mention_context_original.created,
                  score: 1,
                  value: mentionWithCorrection.mention_context.created,
                },
                shared: {
                  previousValue: mentionWithCorrection.mention_context_original.shared,
                  score: 1,
                  value: mentionWithCorrection.mention_context.shared,
                },
                used: {
                  previousValue: mentionWithCorrection.mention_context_original.used,
                  score: 1,
                  value: mentionWithCorrection.mention_context.used,
                },
              },
            },
          }],
        });
      }
    });
    try {
      sendJsonMessage({
        data,
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

  const transformCsv = (items) => items.map((item) => {
    const formattedItem = {
      ...item,
      mention_context_created: item.mention_context.created,
      mention_context_shared: item.mention_context.shared,
      mention_context_used: item.mention_context.used,
      mention_context_original_created: item.mention_context_original.created,
      mention_context_original_shared: item.mention_context_original.shared,
      mention_context_original_used: item.mention_context_original.used,
      software_name_normalizedForm: item['software-name'].normalizedForm,
      software_name_rawForm: item['software-name'].rawForm,
    };
    delete formattedItem.mention_context;
    delete formattedItem.mention_context_original;
    delete formattedItem['software-name'];
    return formattedItem;
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
        advanced: DEFAULT_ADVANCED,
        from: DEFAULT_FROM,
        search: DEFAULT_SEARCH,
        size: DEFAULT_SIZE,
        'sort-by': DEFAULT_SORTBY,
        'sort-order': DEFAULT_SORTORDER,
      });
    } else {
      setParams({
        advanced: searchParams.get('advanced') || DEFAULT_ADVANCED,
        from: searchParams.get('from') || DEFAULT_FROM,
        search: searchParams.get('search') || DEFAULT_SEARCH,
        size: searchParams.get('size') || DEFAULT_SIZE,
        sortBy: searchParams.get('sort-by') || DEFAULT_SORTBY,
        sortOrder: searchParams.get('sort-order') || DEFAULT_SORTORDER,
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
                <Link href={`/mentions/search?search=${params.search}&advanced=${params.advanced}`}>Search software and dataset mentions in the full-text</Link>
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
                        <option value="dataset">Dataset</option>
                        <option value="software">Software</option>
                        <option value="none">None</option>
                      </select>
                      <CustomToggle
                        checked={used}
                        disabled={mentions.filter((mention) => mention?.selected).length === 0}
                        label="Used"
                        onChange={(e) => setUsed(e.target.checked)}
                      />
                      <CustomToggle
                        checked={created}
                        disabled={mentions.filter((mention) => mention?.selected).length === 0}
                        label="Created"
                        onChange={(e) => setCreated(e.target.checked)}
                      />
                      <CustomToggle
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
                    <ButtonDropdown data={mentions} label="mentions" searchParams={searchParams} size="sm" transformCsv={transformCsv} />
                    <Button
                      className="fr-ml-1w"
                      color="blue-ecume"
                      disabled={mentionsWithCorrection.length === 0}
                      icon="send-plane-fill"
                      onClick={() => switchCorrectionsModal()}
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
