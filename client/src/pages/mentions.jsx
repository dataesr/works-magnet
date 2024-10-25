/* eslint-disable no-param-reassign */
import {
  Button,
  Col,
  Container,
  Modal,
  ModalContent,
  ModalFooter,
  ModalTitle,
  Row,
  Tab,
  Tabs,
  TextInput,
} from '@dataesr/dsfr-plus';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import useWebSocket from 'react-use-websocket';

import useToast from '../hooks/useToast';
import {
  affiliations2Template,
  authorsTemplate,
  doiTemplate,
  hasCorrectionTemplate,
} from '../utils/templates';
import { capitalize, getMentions } from '../utils/works';

const { VITE_WS_HOST } = import.meta.env;

const DEFAULT_CORRECTION_USED = false;
const DEFAULT_CORRECTION_CREATED = false;
const DEFAULT_CORRECTION_SHARED = false;
const DEFAULT_FROM = 0;
const DEFAULT_SEARCH = '';
const DEFAULT_SIZE = 50;
const DEFAULT_SORTBY = '';
const DEFAULT_SORTORDER = '';
const DEFAULT_TYPE = 'software';

export default function Mentions() {
  const [corrections, setCorrections] = useState('');
  const [correctionsUsed, setCorrectionsUsed] = useState(
    DEFAULT_CORRECTION_USED,
  );
  const [correctionsCreated, setCorrectionsCreated] = useState(
    DEFAULT_CORRECTION_CREATED,
  );
  const [correctionsShared, setCorrectionsShared] = useState(
    DEFAULT_CORRECTION_SHARED,
  );
  const [fixedMenu, setFixedMenu] = useState(false);
  const [isModalCharacterizationsOpen, setIsModalCharacterizationsOpen] = useState(false);
  const [isModalSendOpen, setIsModalSendOpen] = useState(false);
  const [loading, setLoading] = useState(false);
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
  });
  const [userEmail, setUserEmail] = useState(null);
  const [validEmail, setValidEmail] = useState(null);

  const switchCharacterizationsModal = () => setIsModalCharacterizationsOpen((prev) => !prev);
  const switchSendModal = () => setIsModalSendOpen((prev) => !prev);

  // Hooks
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
    onOpen: () => console.log('Websocket opened'),
    onClose: () => console.log('Websocket closed'),
    shouldReconnect: () => true,
  });

  // Methods
  const addCorrections = () => {
    const correctedMentions = selectedMentions
      .filter(
        (selectedMention) => selectedMention.mention_context.used !== correctionsUsed
          || selectedMention.mention_context.created !== correctionsCreated
          || selectedMention.mention_context.shared !== correctionsShared,
      )
      .map((selectedMention) => ({
        id: selectedMention.id,
        doi: selectedMention.doi,
        texts: [
          {
            text: selectedMention.context,
            class_attributes: {
              classification: {
                used: {
                  value: correctionsUsed,
                  score: 1.0,
                  previousValue: selectedMention.mention_context.used,
                },
                created: {
                  value: correctionsCreated,
                  score: 1.0,
                  previousValue: selectedMention.mention_context.created,
                },
                shared: {
                  value: correctionsShared,
                  score: 1.0,
                  previousValue: selectedMention.mention_context.shared,
                },
              },
            },
          },
        ],
      }));
    const correctedIds = correctedMentions.map(
      (correctedMention) => correctedMention.id,
    );
    setMentions(
      mentions.map((mention) => {
        if (correctedIds.includes(mention.id)) {
          mention.hasCorrection = true;
          mention.mention_context.used = correctionsUsed;
          mention.mention_context.created = correctionsCreated;
          mention.mention_context.shared = correctionsShared;
        }
        return mention;
      }),
    );
    setCorrections([...corrections, ...correctedMentions]);
    setSelectedMentions([]);
    setCorrectionsUsed(DEFAULT_CORRECTION_USED);
    setCorrectionsCreated(DEFAULT_CORRECTION_CREATED);
    setCorrectionsShared(DEFAULT_CORRECTION_SHARED);
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
    } catch (error) {
      toast({
        description: error.message,
        id: 'errorMentions',
        title: 'Error while sending mentions characterizations',
        toastType: 'error',
      });
    } finally {
      switchSendModal();
    }
  };
  const switchType = () => {
    const correctedMentions = selectedMentions.map((selectedMention) => ({
      id: selectedMention.id,
      doi: selectedMention.doi,
      type: selectedMention.type === 'software' ? 'dataset' : 'software',
      previousType: selectedMention.type,
    }));
    const correctedIds = correctedMentions.map(
      (correctedMention) => correctedMention.id,
    );
    setMentions(
      mentions.map((mention) => {
        if (correctedIds.includes(mention.id)) {
          mention.hasCorrection = true;
          mention.type = mention.type === 'software' ? 'dataset' : 'software';
        }
        return mention;
      }),
    );
    setCorrections([...corrections, ...correctedMentions]);
    setSelectedMentions([]);
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
      }`}
      style={{ color: rowData.mention_context.shared ? '#8dc572' : '#be6464' }}
    />
  );
  const usedTemplate = (rowData) => (
    <i
      className={`fr-mr-1w ${
        rowData.mention_context.used
          ? 'fr-icon-check-line'
          : 'fr-icon-close-line'
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
      });
    } else {
      setUrlSearchParams({
        from: searchParams.get('from'),
        search: searchParams.get('search'),
        size: searchParams.get('size'),
        sortBy: searchParams.get('sort-by'),
        sortOrder: searchParams.get('sort-order'),
        type: searchParams.get('type'),
      });
      setSearch(searchParams.get('search'));
    }
  }, [searchParams, setSearchParams]);
  useEffect(() => {
    const getData = async () => {
      setLoading(true);
      if (urlSearchParams?.search?.length > 0) {
        const data = await getMentions(urlSearchParams);
        setMentions(data?.mentions ?? []);
        setTotalRecords(data?.count ?? 0);
      } else {
        setMentions([]);
        setTotalRecords(0);
      }
      setLoading(false);
    };
    getData();
  }, [urlSearchParams]);
  useEffect(() => {
    const emailRegex = /^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/i;
    const testEmail = (email) => setValidEmail(emailRegex.test(email) ? email : null);
    const timeOutId = setTimeout(() => testEmail(userEmail), 500);
    return () => clearTimeout(timeOutId);
  }, [userEmail]);

  return (
    <Container as="section" className="fr-mt-4w mentions">
      <div
        className={`actions-menu ${fixedMenu ? 'action-menu-fixed' : ''}`}
        title="actions"
      >
        <div
          className={`selected-item ${selectedMentions.length && 'selected'}`}
        >
          <span className="number">{selectedMentions.length}</span>
          {`selected mention${selectedMentions.length > 1 ? 's' : ''}`}
        </div>
        <Button
          className="fr-mb-1w fr-pl-1w button"
          color="blue-ecume"
          disabled={!selectedMentions.length}
          key="correct-characterizations"
          onClick={() => switchCharacterizationsModal()}
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
          onClick={() => switchType()}
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
      <Modal isOpen={isModalSendOpen} hide={switchSendModal}>
        <ModalTitle>Improve mentions characterizations</ModalTitle>
        <ModalContent>
          {`You corrected characterizations for ${corrections.length} mention${
            corrections.length > 1 ? 's' : ''
          }.`}
          <TextInput
            label="Please indicate your email. Only an encrypted version of your email will be public."
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
                correctionsCreated ? 'fr-icon-check-line' : 'fr-icon-close-line'
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
                correctionsShared ? 'fr-icon-check-line' : 'fr-icon-close-line'
              }`}
              style={{ color: correctionsShared ? '#8dc572' : '#be6464' }}
            />
            {' '}
            Shared
          </Button>
        </ModalContent>
        <ModalFooter>
          <Button onClick={addCorrections} title="Validate modifications">
            Validate modifications
          </Button>
        </ModalFooter>
      </Modal>
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
              loading={loading}
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
                style={{ maxWidth: '115px' }}
              />
              <Column
                body={affiliations2Template}
                field="affiliations"
                header="Affiliations"
              />
              <Column body={authorsTemplate} field="authors" header="Authors" />
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
              loading={loading}
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
              />
              <Column body={authorsTemplate} field="authors" header="Authors" />
            </DataTable>
          )}
          {corrections && corrections.length > 0 && (
            <code>
              <pre>{JSON.stringify(corrections, null, 4)}</pre>
            </code>
          )}
        </Tab>
      </Tabs>
    </Container>
  );
}
