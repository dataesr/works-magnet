import { Container, Fieldset, Radio, TextInput } from '@dataesr/dsfr-plus';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { getMentions } from '../utils/works';

const DEFAULT_ROWS = 50;

export default function Mentions() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [doi, setDoi] = useState('');
  const [from, setFrom] = useState(0);
  const [loading, setLoading] = useState(false);
  const [mentions, setMentions] = useState([]);
  const [search, setSearch] = useState('');
  const [rows, setRows] = useState(DEFAULT_ROWS);
  const [timer, setTimer] = useState();
  const [totalRecords, setTotalRecords] = useState(0);
  const [type, setType] = useState('software');
  const [lazyState, setlazyState] = useState({
    filters: { doi: { value: '', matchMode: 'contains' } },
    first: 0,
    page: 1,
    rows: DEFAULT_ROWS,
    sortField: null,
    sortOrder: null,
  });

  // Templates
  const createdTemplate = (rowData) => (rowData.mention_context.created ? 'True' : 'False');
  const doiTemplate = (rowData) => (
    <a href={`https://doi.org/${rowData.doi}`}>{rowData.doi}</a>
  );
  const sharedTemplate = (rowData) => (rowData.mention_context.shared ? 'True' : 'False');
  const usedTemplate = (rowData) => (rowData.mention_context.used ? 'True' : 'False');

  // Events
  const onFilter = (event) => setDoi(event?.filters?.doi?.value ?? '');
  const onPage = (event) => {
    setFrom(event.first);
    setRows(event.rows);
  };
  const onSort = (event) => setlazyState(event);

  const loadLazyData = async () => {
    setLoading(true);
    if (searchParams.get('search') && searchParams.get('search')?.length > 0) {
      const data = await getMentions({
        doi: searchParams.get('doi'),
        from: searchParams.get('from'),
        search: searchParams.get('search'),
        size: searchParams.get('size'),
        type: searchParams.get('type'),
      });
      setMentions(data?.mentions ?? []);
      setTotalRecords(data?.count ?? 0);
    }
    setLoading(false);
  };

  // Effects
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
        params.set('type', type);
        return params;
      });
    }, 800);
    setTimer(timerTmp);
    // The timer should not be tracked
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doi, from, search, rows, type]);

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
  }, [searchParams]);

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
      <Fieldset isInline legend="Type">
        <Radio
          checked={type === 'software'}
          label="Software"
          name="type"
          onChange={() => setType('software')}
          value="software"
        />
        <Radio
          checked={type === 'datasets'}
          label="Datasets"
          name="type"
          onChange={() => setType('datasets')}
          value="datasets"
        />
      </Fieldset>
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
        onSort={onSort}
        paginator
        paginatorPosition="top bottom"
        paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
        rows={rows}
        rowsPerPageOptions={[20, 50, 100]}
        scrollable
        size="small"
        sortField={lazyState.sortField}
        sortOrder={lazyState.sortOrder}
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
        <Column field="context" header="Context" />
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
      </DataTable>
    </Container>
  );
}
