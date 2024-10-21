import { Container, Tab, Tabs, TextInput } from '@dataesr/dsfr-plus';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { getMentions } from '../utils/works';

const DEFAULT_ROWS = 50;

export default function Mentions() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentTab, setCurrentTab] = useState(0);
  const [doi, setDoi] = useState('');
  const [from, setFrom] = useState(0);
  const [loading, setLoading] = useState(false);
  const [mentions, setMentions] = useState([]);
  const [rows, setRows] = useState(DEFAULT_ROWS);
  const [search, setSearch] = useState('');
  const [timer, setTimer] = useState();
  const [totalRecords, setTotalRecords] = useState(0);
  const [lazyState, setlazyState] = useState({
    filters: { doi: { value: '', matchMode: 'contains' } },
    first: 0,
    page: 1,
    rows: DEFAULT_ROWS,
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
    />
  );
  const usedTemplate = (rowData) => (
    <i
      className={`fr-mr-1w ${
        rowData.mention_context.used
          ? 'fr-icon-check-line'
          : 'fr-icon-close-line'
      }`}
    />
  );

  // Events
  const onFilter = (event) => setDoi(event?.filters?.doi?.value ?? '');
  const onPage = (event) => {
    setFrom(event.first);
    setRows(event.rows);
  };

  const loadLazyData = async () => {
    setLoading(true);
    if (searchParams.get('search') && searchParams.get('search')?.length > 0) {
      const data = await getMentions({
        doi: searchParams.get('doi'),
        from: searchParams.get('from'),
        search: searchParams.get('search'),
        size: searchParams.get('size'),
        type: currentTab === 0 ? 'software' : 'datasets',
      });
      setMentions(data?.mentions ?? []);
      setTotalRecords(data?.count ?? 0);
    }
    setLoading(false);
  };

  // Effects
  useEffect(() => setFrom(0), [currentTab]);

  useEffect(() => {
    if (timer) {
      clearTimeout(timer);
    }
    const timerTmp = setTimeout(() => {
      setSearchParams((params) => {
        params.set('doi', doi);
        params.set('from', from);
        params.set('search', search);
        params.set('size', rows);
        return params;
      });
    }, 800);
    setTimer(timerTmp);
    // The timer should not be tracked
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doi, from, search, rows]);

  useEffect(() => {
    setlazyState({
      ...lazyState,
      first: parseInt(searchParams.get('from'), 10),
      rows: searchParams.get('size'),
      filters: {
        ...lazyState.filters,
        doi: {
          ...lazyState.filters.doi,
          value: searchParams.get('doi'),
        },
      },
    });
  }, [currentTab, searchParams]);

  useEffect(() => {
    loadLazyData();
  }, [lazyState]);

  return (
    <Container as="section" className="fr-mt-4w mentions">
      <TextInput
        disableAutoValidation
        hint="Example: Coq"
        label="Search"
        onChange={(e) => setSearch(e.target.value)}
        value={search}
      />
      <Tabs defaultActiveIndex={currentTab} onTabChange={(i) => setCurrentTab(i)}>
        <Tab label="Software">
          <DataTable
            currentPageReportTemplate="{first} to {last} of {totalRecords}"
            dataKey="id"
            filterDisplay="row"
            filters={lazyState.filters}
            first={lazyState.first}
            lazy
            loading={loading}
            onFilter={onFilter}
            onPage={onPage}
            paginator
            paginatorPosition="bottom"
            paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
            rows={rows}
            rowsPerPageOptions={[20, 50, 100]}
            scrollable
            size="small"
            stripedRows
            style={{ fontSize: '14px', lineHeight: '13px' }}
            tableStyle={{ minWidth: '50rem' }}
            totalRecords={totalRecords}
            value={mentions}
          >
            <Column
              body={doiTemplate}
              field="doi"
              filter
              filterPlaceholder="Search DOI"
              header="DOI"
            />
            <Column field="type" header="Type" />
            <Column field="rawForm" header="Raw Form" />
            <Column body={contextTemplate} field="context" header="Context" />
            <Column
              body={usedTemplate}
              field="mention.mention_context.used"
              header="Used"
            />
            <Column
              body={createdTemplate}
              field="mention.mention_context.created"
              header="Created"
            />
            <Column
              body={sharedTemplate}
              field="mention.mention_context.shared"
              header="Shared"
            />
          </DataTable>
        </Tab>
        <Tab label="Datasets">
          <DataTable
            currentPageReportTemplate="{first} to {last} of {totalRecords}"
            dataKey="id"
            filterDisplay="row"
            filters={lazyState.filters}
            first={lazyState.first}
            lazy
            loading={loading}
            onFilter={onFilter}
            onPage={onPage}
            paginator
            paginatorPosition="bottom"
            paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
            rows={rows}
            rowsPerPageOptions={[20, 50, 100]}
            scrollable
            size="small"
            stripedRows
            style={{ fontSize: '14px', lineHeight: '13px' }}
            tableStyle={{ minWidth: '50rem' }}
            totalRecords={totalRecords}
            value={mentions}
          >
            <Column
              body={doiTemplate}
              field="doi"
              filter
              filterPlaceholder="Search DOI"
              header="DOI"
            />
            <Column field="type" header="Type" />
            <Column field="rawForm" header="Raw Form" />
            <Column body={contextTemplate} field="context" header="Context" />
            <Column
              body={usedTemplate}
              field="mention.mention_context.used"
              header="Used"
            />
            <Column
              body={createdTemplate}
              field="mention.mention_context.created"
              header="Created"
            />
            <Column
              body={sharedTemplate}
              field="mention.mention_context.shared"
              header="Shared"
            />
          </DataTable>
        </Tab>
      </Tabs>
    </Container>
  );
}
