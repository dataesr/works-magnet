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
  Select,
  SelectOption,
  Tab,
  Tabs,
  Text,
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

const DEFAULT_CORRECTION = false;
const DEFAULT_FROM = 0;
const DEFAULT_SEARCH = '';
const DEFAULT_SIZE = 50;
const DEFAULT_SORTBY = '';
const DEFAULT_SORTORDER = '';
const DEFAULT_TYPE = 'software';

export default function Mentions() {
  const [corrections, setCorrections] = useState('');
  const [correctionsUsed, setCorrectionsUsed] = useState(DEFAULT_CORRECTION);
  const [correctionsCreated, setCorrectionsCreated] = useState(DEFAULT_CORRECTION);
  const [correctionsShared, setCorrectionsShared] = useState(DEFAULT_CORRECTION);
  const [correctionsType, setCorrectionsType] = useState('dataset');
  const [fixedMenu, setFixedMenu] = useState(false);
  const [isModalCharacterizationsOpen, setIsModalCharacterizationsOpen] = useState(false);
  const [isModalSendOpen, setIsModalSendOpen] = useState(false);
  const [isModalTypesOpen, setIsModalTypesOpen] = useState(false);
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

  const switchCharacterizationsModal = () => setIsModalCharacterizationsOpen((previousState) => !previousState);
  const switchSendModal = () => setIsModalSendOpen((previousState) => !previousState);
  const switchTypesModal = () => setIsModalTypesOpen((previousState) => !previousState);

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
    const correctedMentions = mentions
      .filter((correctedMention) => correctedMention.hasCorrection)
      .map((correctedMention) => ({
        id: correctedMention.id,
        doi: correctedMention.doi,
        texts: [
          {
            text: correctedMention.context,
            class_attributes: {
              classification: {
                used: {
                  value: correctedMention.mention_context.used,
                  score: 1.0,
                  previousValue: correctedMention.mention_context_original.used,
                },
                created: {
                  value: correctedMention.mention_context.created,
                  score: 1.0,
                  previousValue:
                    correctedMention.mention_context_original.created,
                },
                shared: {
                  value: correctedMention.mention_context.shared,
                  score: 1.0,
                  previousValue:
                    correctedMention.mention_context_original.shared,
                },
              },
            },
          },
        ],
      }));
    setCorrections(correctedMentions);
    setSelectedMentions([]);
    setCorrectionsUsed(DEFAULT_CORRECTION);
    setCorrectionsCreated(DEFAULT_CORRECTION);
    setCorrectionsShared(DEFAULT_CORRECTION);
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
  const undo = (mentionsTmp, resetMention) => {
    setMentions(
      mentionsTmp.map((mention) => {
        if (mention.id === resetMention.id) {
          return {
            ...mention,
            hasCorrection: false,
            mention_context: resetMention.mention_context_original,
            type: resetMention.type_original,
          };
        }
        return mention;
      }),
    );
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
    const correctedMentions = mentions
      .filter((correctedMention) => correctedMention.hasCorrection)
      .map((correctedMention) => ({
        id: correctedMention.id,
        doi: correctedMention.doi,
        type: correctedMention.type,
        previousType: correctedMention.type_original,
      }));
    setCorrections(correctedMentions);
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
  const typeTemplate = (rowData) => (
    <Text bold={rowData.hasCorrectionType} className="fr-mb-0">
      {rowData.type}
    </Text>
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
        const mentionsTmp = data?.mentions ?? [];
        setMentions(
          mentionsTmp.map((mention) => {
            mention.undo = () => undo(mentionsTmp, mention);
            return mention;
          }),
        );
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
      <Modal isOpen={isModalSendOpen} hide={switchSendModal}>
        <ModalTitle>Send mentions corrections</ModalTitle>
        <ModalContent>
          {`You corrected ${corrections.length} mention${
            corrections.length > 1 ? 's' : ''
          }.`}
          <TextInput
            className="fr-mt-1w"
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
          <Button onClick={switchType} title="Validate modifications">
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
