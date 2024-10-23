import {
  Button,
  Col,
  Container,
  Row,
  Tab,
  Tabs,
  TextInput,
} from '@dataesr/dsfr-plus';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { affiliations2Template, authorsTemplate } from '../utils/templates';
import { getMentions } from '../utils/works';

const DEFAULT_FROM = 0;
const DEFAULT_SEARCH = '';
const DEFAULT_SIZE = 50;
const DEFAULT_SORTBY = '';
const DEFAULT_SORTORDER = '';
const DEFAULT_TYPE = 'software';

export default function Mentions() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [correctionsUsed, setCorrectionsUsed] = useState(true);
  const [correctionsCreated, setCorrectionsCreated] = useState(true);
  const [correctionsShared, setCorrectionsShared] = useState(true);
  const [fixedMenu, setFixedMenu] = useState(false);
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
          {`selected mention${selectedMentions.length === 1 ? '' : 's'}`}
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
          onClick={() => {}}
          size="lg"
          style={{ display: 'block', width: '100%', textAlign: 'left' }}
          title="Add ROR"
        >
          <i
            className="fr-icon-send-plane-line fr-mr-2w"
            style={{ color: '#000091' }}
          />
          Send feedbacks
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
              body={affiliations2Template}
              field="affiliations"
              header="Affiliations"
            />
            <Column body={authorsTemplate} field="authors" header="Authors" />
          </DataTable>
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
              body={affiliations2Template}
              field="affiliations"
              header="Affiliations"
            />
            <Column body={authorsTemplate} field="authors" header="Authors" />
          </DataTable>
        </Tab>
      </Tabs>
    </Container>
  );
}
