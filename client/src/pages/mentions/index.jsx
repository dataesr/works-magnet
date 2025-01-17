/* eslint-disable no-param-reassign */
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
  Select,
  SelectOption,
  Tab,
  Tabs,
  Text,
  TextInput,
} from '@dataesr/dsfr-plus';
import { useQuery } from '@tanstack/react-query';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import useWebSocket from 'react-use-websocket';

import MentionListItem from '../../components/mention-list/item';
import useToast from '../../hooks/useToast';
import Header from '../../layout/header';
import { getMentionsCorrections } from '../../utils/curations';
import { capitalize } from '../../utils/strings';
import {
  affiliations2Template,
  authorsTemplate,
  doiTemplate,
  hasCorrectionTemplate,
} from '../../utils/templates';
import { getMentions } from '../../utils/works';

const { VITE_WS_HOST } = import.meta.env;

const DEFAULT_CORRECTION = false;
const DEFAULT_FROM = 0;
const DEFAULT_SEARCH = '';
const DEFAULT_SIZE = 50;
const DEFAULT_SORTBY = '';
const DEFAULT_SORTORDER = '';
const DEFAULT_TYPE = 'software';
const DEFAULT_VIEW = 'table';

export default function Mentions() {
  // State
  const [corrections, setCorrections] = useState('');
  const [correctionsUsed, setCorrectionsUsed] = useState(DEFAULT_CORRECTION);
  const [correctionsCreated, setCorrectionsCreated] = useState(DEFAULT_CORRECTION);
  const [correctionsShared, setCorrectionsShared] = useState(DEFAULT_CORRECTION);
  const [correctionsType, setCorrectionsType] = useState('dataset');
  const [fixedMenu, setFixedMenu] = useState(false);
  const [isModalCharacterizationsOpen, setIsModalCharacterizationsOpen] = useState(false);
  const [isModalSendOpen, setIsModalSendOpen] = useState(false);
  const [isModalTypesOpen, setIsModalTypesOpen] = useState(false);
  const [mentions, setMentions] = useState([]);
  const [search, setSearch] = useState(DEFAULT_SEARCH);
  const [selectAll, setSelectAll] = useState(false);
  const [selectedMentions, setSelectedMentions] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [urlSearchParams, setUrlSearchParams] = useState({
    from: DEFAULT_FROM,
    search: DEFAULT_SEARCH,
    size: DEFAULT_SIZE,
    sortBy: DEFAULT_SORTBY,
    sortOrder: DEFAULT_SORTORDER,
    type: DEFAULT_TYPE,
    view: DEFAULT_VIEW,
  });
  const [userEmail, setUserEmail] = useState(null);
  const [validEmail, setValidEmail] = useState(null);

  const switchCharacterizationsModal = () => setIsModalCharacterizationsOpen((previousState) => !previousState);
  const switchSendModal = () => setIsModalSendOpen((previousState) => !previousState);
  const switchTypesModal = () => setIsModalTypesOpen((previousState) => !previousState);

  // Hooks
  const { data, error, isFetching, refetch } = useQuery({
    queryKey: ['mentions', JSON.stringify(urlSearchParams)],
    queryFn: () => {
      setMentions([]);
      setTotalRecords(0);
      if (urlSearchParams?.search?.length > 0) return getMentions(urlSearchParams);
      return {};
    },
    enabled: false,
  });
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
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
        title: title ?? 'Message renvoyé par le WebSocket',
        toastType: toastType ?? 'info',
      });
    },
    shouldReconnect: () => true,
  });

  // Methods
  const addCorrections = () => {
    const selectedMentionsIds = selectedMentions.map(
      (selectedMention) => selectedMention.id,
    );
    setMentions(
      mentions.map((mention) => {
        if (selectedMentionsIds.includes(mention.id)) {
          mention.mention_context.used = correctionsUsed;
          mention.mention_context.created = correctionsCreated;
          mention.mention_context.shared = correctionsShared;
        }
        mention.hasCorrection = mention.mention_context.used
            !== mention.mention_context_original.used
          || mention.mention_context.created
            !== mention.mention_context_original.created
          || mention.mention_context.shared
            !== mention.mention_context_original.shared
          || mention.type !== mention.type_original;
        return mention;
      }),
    );
    setCorrections(getMentionsCorrections(mentions));
    setCorrectionsUsed(DEFAULT_CORRECTION);
    setCorrectionsCreated(DEFAULT_CORRECTION);
    setCorrectionsShared(DEFAULT_CORRECTION);
    setSelectedMentions([]);
    switchCharacterizationsModal();
  };

  const feedback = async () => {
    try {
      sendJsonMessage({
        data: corrections,
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
      switchSendModal();
    }
  };

  const undo = (id) => {
    const mentionsTmp = mentions.map((mention) => {
      if (mention.id === id) {
        mention.hasCorrection = false;
        mention.hasCorrectionType = false;
        mention.mention_context = JSON.parse(
          JSON.stringify(mention.mention_context_original),
        );
        mention.type = mention.type_original;
      }
      return mention;
    });
    setMentions(mentionsTmp);
    setCorrections(getMentionsCorrections(mentionsTmp));
  };

  const switchType = () => {
    const selectedMentionsIds = selectedMentions.map(
      (selectedMention) => selectedMention.id,
    );
    setMentions(
      mentions.map((mention) => {
        if (selectedMentionsIds.includes(mention.id)) {
          mention.type = correctionsType;
        }
        mention.hasCorrection = mention.mention_context.used
            !== mention.mention_context_original.used
          || mention.mention_context.created
            !== mention.mention_context_original.created
          || mention.mention_context.shared
            !== mention.mention_context_original.shared
          || mention.type !== mention.type_original;
        mention.hasCorrectionType = mention.type !== mention.type_original;
        return mention;
      }),
    );
    setCorrections(getMentionsCorrections(mentions));
    setSelectedMentions([]);
    switchTypesModal();
  };

  // Templates
  const contextTemplate = (rowData) => (
    <span dangerouslySetInnerHTML={{ __html: rowData.context }} />
  );

  const createdTemplate = (rowData) => (
    <i
      className={`fr-mr-1w ${
        rowData.mention_context.created
          ? 'fr-icon-check-line'
          : 'fr-icon-close-line'
      } ${
        rowData.mention_context.created
        !== rowData.mention_context_original.created
          ? 'fr-icon--lg'
          : 'fr-icon'
      }`}
      style={{ color: rowData.mention_context.created ? '#8dc572' : '#be6464' }}
    />
  );

  const sharedTemplate = (rowData) => (
    <i
      className={`fr-mr-1w ${
        rowData.mention_context.shared
          ? 'fr-icon-check-line'
          : 'fr-icon-close-line'
      } ${
        rowData.mention_context.shared
        !== rowData.mention_context_original.shared
          ? 'fr-icon--lg'
          : 'fr-icon'
      }`}
      style={{ color: rowData.mention_context.shared ? '#8dc572' : '#be6464' }}
    />
  );

  const typeTemplate = (rowData) => (
    <Text bold={rowData.hasCorrectionType} className="fr-mb-0">
      {rowData.type}
    </Text>
  );

  const usedTemplate = (rowData) => (
    <i
      className={`fr-mr-1w fr-icon ${
        rowData.mention_context.used
          ? 'fr-icon-check-line'
          : 'fr-icon-close-line'
      } ${
        rowData.mention_context.used !== rowData.mention_context_original.used
          ? 'fr-icon--lg'
          : 'fr-icon'
      }`}
      style={{ color: rowData.mention_context.used ? '#8dc572' : '#be6464' }}
    />
  );

  // Events
  const onPage = (event) => {
    searchParams.set('from', event.first);
    searchParams.set('size', event.rows);
    setSearchParams(searchParams);
  };

  const onSelectAllChange = (event) => {
    if (event.checked) {
      setSelectAll(true);
      setSelectedMentions(mentions);
    } else {
      setSelectAll(false);
      setSelectedMentions([]);
    }
  };

  const onSort = (event) => {
    searchParams.set('sort-by', event.sortField);
    searchParams.set('sort-order', event.sortOrder === 1 ? 'asc' : 'desc');
    setSearchParams(searchParams);
  };

  const onSubmit = () => {
    searchParams.set('search', search);
    setSearchParams(searchParams);
  };

  const onTabChange = (index) => {
    searchParams.set('type', index === 0 ? 'software' : 'datasets');
    setSearchParams(searchParams);
  };

  // Effects
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
        view: DEFAULT_VIEW,
      });
    } else {
      setUrlSearchParams({
        from: searchParams.get('from'),
        search: searchParams.get('search'),
        size: searchParams.get('size'),
        sortBy: searchParams.get('sort-by'),
        sortOrder: searchParams.get('sort-order'),
        type: searchParams.get('type'),
        view: searchParams.get('view'),
      });
      setSearch(searchParams.get('search'));
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    refetch();
  }, [refetch, urlSearchParams]);

  useEffect(() => {
    setMentions(data?.mentions ?? []);
    setTotalRecords(data?.count ?? 0);
  }, [data]);

  useEffect(() => {
    const emailRegex = /^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/i;
    const testEmail = (email) => setValidEmail(emailRegex.test(email) ? email : null);
    const timeOutId = setTimeout(() => testEmail(userEmail), 500);
    return () => clearTimeout(timeOutId);
  }, [userEmail]);

  return (
    <>
      <Header />
      <Container as="section" className="fr-mt-4w mentions">
        <Breadcrumb className="fr-pt-4w fr-mt-0 fr-mb-2w">
          <Link href="/">
            Home
          </Link>
          <Link current>
            Search software and dataset mentions in the full-text
          </Link>
        </Breadcrumb>
        <div
          className={`actions-menu ${fixedMenu ? 'action-menu-fixed' : ''}`}
          title="actions"
        >
          <div
            className={`selected-item ${selectedMentions.length && ' selected'}`}
          >
            <span className="number">{selectedMentions.length}</span>
            {` selected mention${selectedMentions.length > 1 ? 's' : ''}`}
          </div>
          <Button
            className="fr-mb-1w fr-pl-1w button"
            color="blue-ecume"
            disabled={!selectedMentions.length}
            key="correct-characterizations"
            onClick={switchCharacterizationsModal}
            size="lg"
            style={{ display: 'block', width: '100%', textAlign: 'left' }}
            title="Correct characterizations"
          >
            <i
              className="fr-icon-feedback-line fr-mr-2w"
              style={{ color: '#c78006' }}
            />
            Modify used/created/shared
          </Button>
          <Button
            className="fr-mb-1w fr-pl-1w button"
            color="blue-ecume"
            disabled={!selectedMentions.length}
            key="switch-type"
            onClick={switchTypesModal}
            size="lg"
            style={{ display: 'block', width: '100%', textAlign: 'left' }}
            title={`Switch type from ${capitalize(urlSearchParams.type)} to ${
              urlSearchParams.type === 'software' ? 'Datasets' : 'Software'
            }`}
          >
            <i
              className="fr-icon-file-line fr-mr-2w"
              style={{ color: '#be6464' }}
            />
            Modify type dataset/software
          </Button>
          <div className="text-right">
            <Button
              onClick={() => setFixedMenu(!fixedMenu)}
              size="sm"
              variant="tertiary"
            >
              {fixedMenu ? (
                <i className="ri-pushpin-fill" />
              ) : (
                <i className="ri-pushpin-line" />
              )}
            </Button>
          </div>
        </div>
        <Row>
          <Col md={10} xs={12}>
            <Row>
              <Col className="fr-pr-2w fr-mb-2w" md={2} xs={12}>
                <div className="label">Search</div>
                <div className="hint">Example "Coq" or "Cern"</div>
              </Col>
              <Col md={10} xs={12}>
                <TextInput
                  disableAutoValidation
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      onSubmit();
                    }
                  }}
                  value={search}
                />
              </Col>
            </Row>
          </Col>
          <Col className="fr-pl-2w fr-mt-1w" md={2} xs={12}>
            <Button onClick={onSubmit} style={{ verticalAlign: 'bottom' }}>
              Search mentions
            </Button>
          </Col>
        </Row>

        {/*
        <Row className="fr-mb-2w">
          <Button
            disabled={!corrections.length > 0}
            onClick={switchSendModal}
            size="sm"
          >
            {`Send ${corrections.length} correction${
              corrections.length > 1 ? 's' : ''
            }`}
          </Button>
        </Row>
        */}

        <Modal
          isOpen={isModalCharacterizationsOpen}
          hide={switchCharacterizationsModal}
        >
          <ModalTitle>Modify used/created/shared</ModalTitle>
          <ModalContent>
            <Button
              className="fr-mb-1w fr-mr-1w fr-ml-1w fr-pl-1w button"
              variant="tertiary"
              key="mention-used"
              onClick={() => setCorrectionsUsed(!correctionsUsed)}
              size="lg"
              title="Used"
            >
              <i
                className={`${
                  correctionsUsed ? 'fr-icon-check-line' : 'fr-icon-close-line'
                }`}
                style={{ color: correctionsUsed ? '#8dc572' : '#be6464' }}
              />
              {' '}
              Used
            </Button>
            <Button
              className="fr-mb-1w fr-mr-1w fr-ml-1w fr-pl-1w button"
              variant="tertiary"
              key="mention-created"
              onClick={() => setCorrectionsCreated(!correctionsCreated)}
              size="lg"
              title="Created"
            >
              <i
                className={`${
                  correctionsCreated
                    ? 'fr-icon-check-line'
                    : 'fr-icon-close-line'
                }`}
                style={{ color: correctionsCreated ? '#8dc572' : '#be6464' }}
              />
              {' '}
              Created
            </Button>
            <Button
              className="fr-mb-1w fr-mr-1w fr-ml-1w fr-pl-1w button"
              variant="tertiary"
              key="mention-shared"
              onClick={() => setCorrectionsShared(!correctionsShared)}
              size="lg"
              title="Shared"
            >
              <i
                className={`${
                  correctionsShared
                    ? 'fr-icon-check-line'
                    : 'fr-icon-close-line'
                }`}
                style={{ color: correctionsShared ? '#8dc572' : '#be6464' }}
              />
              {' '}
              Shared
            </Button>
          </ModalContent>
          <ModalFooter>
            <Button
              onClick={addCorrections}
              title={`Validate modification${
                corrections.length > 1 ? 's' : ''
              }`}
            >
              {`Validate modification${corrections.length > 1 ? 's' : ''}`}
            </Button>
          </ModalFooter>
        </Modal>
        <Modal isOpen={isModalSendOpen} hide={switchSendModal}>
          <ModalTitle>Send mentions corrections</ModalTitle>
          <ModalContent>
            {`You corrected ${corrections.length} mention${
              corrections.length > 1 ? 's' : ''
            }.`}
            <TextInput
              className="fr-mt-1w"
              label="Please indicate your email. Only an encrypted version of your email </Modal>will be public."
              onChange={(e) => setUserEmail(e.target.value)}
              required
              type="email"
            />
          </ModalContent>
          <ModalFooter>
            <Button
              disabled={!corrections.length > 0 || !validEmail}
              onClick={feedback}
              title={`Send ${corrections.length} correction${
                corrections.length > 1 ? 's' : ''
              }`}
            >
              {`Send ${corrections.length} correction${
                corrections.length > 1 ? 's' : ''
              }`}
            </Button>
          </ModalFooter>
        </Modal>
        <Modal isOpen={isModalTypesOpen} hide={switchTypesModal}>
          <ModalTitle>Modify type dataset/software</ModalTitle>
          <ModalContent>
            <Select
              aria-label="Select a type"
              onSelectionChange={(type) => setCorrectionsType(type)}
              selectedKey={correctionsType}
            >
              <SelectOption key="dataset">Dataset</SelectOption>
              <SelectOption key="software">Software</SelectOption>
              <SelectOption key="">None</SelectOption>
            </Select>
          </ModalContent>
          <ModalFooter>
            <Button
              onClick={switchType}
              title={`Validate modification${
                corrections.length > 1 ? 's' : ''
              }`}
            >
              {`Validate modification${corrections.length > 1 ? 's' : ''}`}
            </Button>
          </ModalFooter>
        </Modal>

        {/*
        <span style={{ display: 'block', textAlign: 'right' }}>
          <Button
            onClick={() => {
              searchParams.set('view', 'table');
              setSearchParams(searchParams);
            }}
          >
            <i className="fr-icon fr-icon-table-fill" />
          </Button>
          <Button
            onClick={() => {
              searchParams.set('view', 'grid');
              setSearchParams(searchParams);
            }}
          >
            <i className="fr-icon fr-icon-layout-grid-fill" />
          </Button>
        </span>
        */}

        {error && (
          <Row gutters className="fr-mb-16w">
            <Col xs="12">
              <div>
                Error while fetching data, please try again later or contact the
                team (see footer).
              </div>
            </Col>
          </Row>
        )}

        {searchParams.get('view') === 'table' && (
          <Tabs
            defaultActiveIndex={urlSearchParams.type === 'software' ? 0 : 1}
            onTabChange={(index) => onTabChange(index)}
          >
            <Tab label="Software">
              {urlSearchParams.type === 'software' && (
                <DataTable
                  currentPageReportTemplate="{first} to {last} of {totalRecords}"
                  dataKey="id"
                  first={parseInt(urlSearchParams.from, 10)}
                  lazy
                  loading={isFetching}
                  onPage={onPage}
                  onSelectAllChange={onSelectAllChange}
                  onSelectionChange={(e) => setSelectedMentions(e.value)}
                  onSort={onSort}
                  paginator
                  paginatorPosition="bottom"
                  paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
                  rows={parseInt(urlSearchParams.size, 10)}
                  rowsPerPageOptions={[20, 50, 100]}
                  scrollable
                  selectAll={selectAll}
                  selection={selectedMentions}
                  size="small"
                  sortField={urlSearchParams.sortBy}
                  sortOrder={urlSearchParams.sortOrder === 'asc' ? 1 : -1}
                  stripedRows
                  style={{ fontSize: '14px', lineHeight: '13px' }}
                  tableStyle={{ minWidth: '50rem' }}
                  totalRecords={totalRecords}
                  value={mentions}
                >
                  <Column
                    selectionMode="multiple"
                    headerStyle={{ width: '3rem' }}
                  />
                  <Column
                    body={doiTemplate}
                    field="doi"
                    header="DOI"
                    sortable
                    style={{ minWidth: '145px', maxWidth: '145px' }}
                  />
                  <Column
                    body={typeTemplate}
                    field="type"
                    header="Type"
                    style={{ minWidth: '100px', maxWidth: '100px' }}
                  />
                  <Column
                    field="rawForm"
                    header="Raw Form"
                    sortable
                    style={{ minWidth: '100px', maxWidth: '100px' }}
                  />
                  <Column
                    body={contextTemplate}
                    field="context"
                    header="Context"
                    style={{ minWidth: '380px', maxWidth: '380px' }}
                  />
                  <Column
                    body={usedTemplate}
                    field="mention.mention_context.used"
                    header="Used"
                    style={{ minWidth: '70px', maxWidth: '70px' }}
                    sortable
                  />
                  <Column
                    body={createdTemplate}
                    field="mention.mention_context.created"
                    header="Created"
                    style={{ minWidth: '80px', maxWidth: '80px' }}
                    sortable
                  />
                  <Column
                    body={sharedTemplate}
                    field="mention.mention_context.shared"
                    header="Shared"
                    style={{ minWidth: '80px', maxWidth: '80px' }}
                    sortable
                  />
                  <Column
                    body={(rowData) => hasCorrectionTemplate(rowData, undo)}
                    field="hasCorrection"
                    header="Modified by user?"
                    sortable
                    style={{ maxWidth: '115px' }}
                  />
                  <Column
                    body={affiliations2Template}
                    field="affiliations"
                    header="Affiliations"
                    style={{ minWidth: '150px', maxWidth: '150px' }}
                  />
                  <Column
                    body={authorsTemplate}
                    field="authors"
                    header="Authors"
                  />
                </DataTable>
              )}
              {corrections && corrections.length > 0 && (
                <code>
                  <pre>{JSON.stringify(corrections, null, 4)}</pre>
                </code>
              )}
            </Tab>
            <Tab label="Datasets">
              {urlSearchParams.type === 'datasets' && (
                <DataTable
                  currentPageReportTemplate="{first} to {last} of {totalRecords}"
                  dataKey="id"
                  first={parseInt(urlSearchParams.from, 10)}
                  lazy
                  loading={isFetching}
                  onPage={onPage}
                  onSelectAllChange={onSelectAllChange}
                  onSelectionChange={(e) => setSelectedMentions(e.value)}
                  onSort={onSort}
                  paginator
                  paginatorPosition="bottom"
                  paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
                  rows={parseInt(urlSearchParams.size, 10)}
                  rowsPerPageOptions={[20, 50, 100]}
                  scrollable
                  selectAll={selectAll}
                  selection={selectedMentions}
                  size="small"
                  sortField={urlSearchParams.sortBy}
                  sortOrder={urlSearchParams.sortOrder === 'asc' ? 1 : -1}
                  stripedRows
                  style={{ fontSize: '14px', lineHeight: '13px' }}
                  tableStyle={{ minWidth: '50rem' }}
                  totalRecords={totalRecords}
                  value={mentions}
                >
                  <Column
                    selectionMode="multiple"
                    headerStyle={{ width: '3rem' }}
                  />
                  <Column
                    body={doiTemplate}
                    field="doi"
                    header="DOI"
                    sortable
                    style={{ minWidth: '145px', maxWidth: '145px' }}
                  />
                  <Column
                    body={typeTemplate}
                    field="type"
                    header="Type"
                    style={{ minWidth: '100px', maxWidth: '100px' }}
                  />
                  <Column
                    field="rawForm"
                    header="Raw Form"
                    sortable
                    style={{ minWidth: '100px', maxWidth: '100px' }}
                  />
                  <Column
                    body={contextTemplate}
                    field="context"
                    header="Context"
                    style={{ minWidth: '380px', maxWidth: '380px' }}
                  />
                  <Column
                    body={usedTemplate}
                    field="mention.mention_context.used"
                    header="Used"
                    style={{ minWidth: '70px', maxWidth: '70px' }}
                    sortable
                  />
                  <Column
                    body={createdTemplate}
                    field="mention.mention_context.created"
                    header="Created"
                    style={{ minWidth: '80px', maxWidth: '80px' }}
                    sortable
                  />
                  <Column
                    body={sharedTemplate}
                    field="mention.mention_context.shared"
                    header="Shared"
                    style={{ minWidth: '80px', maxWidth: '80px' }}
                    sortable
                  />
                  <Column
                    body={hasCorrectionTemplate}
                    field="hasCorrection"
                    header="Modified by user?"
                    sortable
                    style={{ maxWidth: '110px' }}
                  />
                  <Column
                    body={affiliations2Template}
                    field="affiliations"
                    header="Affiliations"
                    style={{ minWidth: '150px', maxWidth: '150px' }}
                  />
                  <Column
                    body={authorsTemplate}
                    field="authors"
                    header="Authors"
                  />
                </DataTable>
              )}
              {corrections && corrections.length > 0 && (
                <code>
                  <pre>{JSON.stringify(corrections, null, 4)}</pre>
                </code>
              )}
            </Tab>
          </Tabs>
        )}
        {searchParams.get('view') === 'grid' && (
          <>
            <div
              style={{
                display: 'flex',
                backgroundColor: '#eee',
                borderBottom: '2px solid #000',
              }}
              className="fr-py-1w"
            >
              <div className="fr-pl-2w">
                <input type="checkbox" />
              </div>
              <Button
                disabled={!corrections.length > 0}
                onClick={switchSendModal}
                size="sm"
              >
                {`Send ${corrections.length} correction${
                  corrections.length > 1 ? 's' : ''
                }`}
              </Button>
            </div>
            <ul style={{ listStyle: 'none' }}>
              {mentions.map((mention) => (
                <MentionListItem
                  key={mention.id}
                  mention={mention}
                />
              ))}
            </ul>
          </>
        )}
      </Container>
    </>
  );
}
