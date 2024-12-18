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

import { affiliations2Template, authorsTemplate, hasCorrectionTemplate } from '../utils/templates';
import useToast from '../hooks/useToast';
import { getMentions } from '../utils/works';

const { VITE_WS_HOST } = import.meta.env;

const DEFAULT_FROM = 0;
const DEFAULT_SEARCH = '';
const DEFAULT_SIZE = 50;
const DEFAULT_SORTBY = '';
const DEFAULT_SORTORDER = '';
const DEFAULT_TYPE = 'software';

export default function Mentions() {
  const [corrections, setCorrections] = useState('');
  const [correctionsUsed, setCorrectionsUsed] = useState(true);
  const [correctionsCreated, setCorrectionsCreated] = useState(true);
  const [correctionsShared, setCorrectionsShared] = useState(true);
  const [fixedMenu, setFixedMenu] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  // Hooks
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
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
    onOpen: () => console.log('Websocket opened'),
    onClose: () => console.log('Websocket closed'),
    shouldReconnect: () => true,
  });

  // Methods
  const addCorrections = () => {
    const correctedMentions = selectedMentions.map((selectedMention) => ({
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
    const correctedIds = correctedMentions.map((correctedMention) => correctedMention.id);
    setMentions(mentions.map((mention) => {
      if (correctedIds.includes(mention.id)) {
        mention.hasCorrection = true;
        mention.mention_context.used = correctionsUsed;
        mention.mention_context.created = correctionsCreated;
        mention.mention_context.shared = correctionsShared;
      }
      return mention;
    }));
    setCorrections([...corrections, ...correctedMentions]);
    setSelectedMentions([]);
    setCorrectionsUsed(true);
    setCorrectionsCreated(true);
    setCorrectionsShared(true);
  };
  const switchModal = () => setIsModalOpen((prev) => !prev);
  const feedback = async () => {
    try {
      sendJsonMessage({ data: corrections, email: userEmail, type: 'mentions-characterizations' });
      toast({
        autoDismissAfter: 5000,
        description: 'Your corrections are currently submitted to the <a href="https://github.com/dataesr/mentions-characterizations/issues" target="_blank">Github repository</a>',
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
      switchModal();
    }
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
  const doiTemplate = (rowData) => (
    <a href={`https://doi.org/${rowData.doi}`}>{rowData.doi}</a>
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
    searchParams.set('from', parseInt(event.first, 10));
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
      setLoading(true);
      setUrlSearchParams({
        from: searchParams.get('from'),
        search: searchParams.get('search'),
        size: searchParams.get('size'),
        sortBy: searchParams.get('sort-by'),
        sortOrder: searchParams.get('sort-order'),
        type: searchParams.get('type'),
      });
    }
  }, [searchParams, setSearchParams]);
  useEffect(() => {
    const getData = async () => {
      const data = await getMentions(urlSearchParams);
      setMentions(data?.mentions ?? []);
      setTotalRecords(data?.count ?? 0);
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
          key="mention-used"
          onClick={() => setCorrectionsUsed(!correctionsUsed)}
          size="lg"
          style={{ display: 'block', width: '100%', textAlign: 'left' }}
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
          className="fr-mb-1w fr-pl-1w button"
          color="blue-ecume"
          disabled={!selectedMentions.length}
          key="mention-created"
          onClick={() => setCorrectionsCreated(!correctionsCreated)}
          size="lg"
          style={{ display: 'block', width: '100%', textAlign: 'left' }}
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
          className="fr-mb-1w fr-pl-1w button"
          color="blue-ecume"
          disabled={!selectedMentions.length}
          key="mention-shared"
          onClick={() => setCorrectionsShared(!correctionsShared)}
          size="lg"
          style={{ display: 'block', width: '100%', textAlign: 'left' }}
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
        <Button
          className="fr-mb-1w fr-pl-1w button"
          color="blue-ecume"
          disabled={!selectedMentions.length}
          key="add-ror"
          onClick={() => addCorrections()}
          size="lg"
          style={{ display: 'block', width: '100%', textAlign: 'left' }}
          title="Add ROR"
        >
          <i
            className="fr-icon-send-plane-line fr-mr-2w"
            style={{ color: '#000091' }}
          />
          Add corrections
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
      <Button
        disabled={!corrections.length > 0}
        onClick={switchModal}
        size="sm"
      >
        {`Send ${corrections.length} correction${corrections.length > 1 ? 's' : ''}`}
      </Button>
      <Modal isOpen={isModalOpen} hide={switchModal}>
        <ModalTitle>Improve mentions characterizations</ModalTitle>
        <ModalContent>
          {`You corrected characterizations for ${corrections.length} mention${corrections.length > 1 ? 's' : ''}.`}
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
            title={`Send ${corrections.length} correction${corrections.length > 1 ? 's' : ''}`}
          >
            {`Send ${corrections.length} correction${corrections.length > 1 ? 's' : ''}`}
          </Button>
        </ModalFooter>
      </Modal>
      <Tabs
        defaultActiveIndex={0}
        onTabChange={(i) => setUrlSearchParams({
          ...urlSearchParams,
          type: i === 0 ? 'software' : 'datasets',
        })}
      >
        <Tab label="Software">
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
            <Column selectionMode="multiple" headerStyle={{ width: '3rem' }} />
            <Column body={doiTemplate} field="doi" header="DOI" sortable />
            <Column field="rawForm" header="Raw Form" sortable />
            <Column body={contextTemplate} field="context" header="Context" />
            <Column
              body={usedTemplate}
              field="mention.mention_context.used"
              header="Used"
              sortable
            />
            <Column
              body={createdTemplate}
              field="mention.mention_context.created"
              header="Created"
              sortable
            />
            <Column
              body={sharedTemplate}
              field="mention.mention_context.shared"
              header="Shared"
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
          {corrections && corrections.length > 0 && (
            <code>
              <pre>{JSON.stringify(corrections, null, 4)}</pre>
            </code>
          )}
        </Tab>
        <Tab label="Datasets">
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
            <Column selectionMode="multiple" headerStyle={{ width: '3rem' }} />
            <Column body={doiTemplate} field="doi" header="DOI" sortable />
            <Column field="rawForm" header="Raw Form" sortable />
            <Column body={contextTemplate} field="context" header="Context" />
            <Column
              body={usedTemplate}
              field="mention.mention_context.used"
              header="Used"
              sortable
            />
            <Column
              body={createdTemplate}
              field="mention.mention_context.created"
              header="Created"
              sortable
            />
            <Column
              body={sharedTemplate}
              field="mention.mention_context.shared"
              header="Shared"
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
