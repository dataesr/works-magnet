import { Container, Fieldset, Radio, TextInput } from '@dataesr/dsfr-plus';
import { FilterMatchMode } from 'primereact/api';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { getMentions } from '../utils/works';

export default function Mentions() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [from, setFrom] = useState(0);
  const [filters] = useState({
    doi: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });
  const [loading, setLoading] = useState(false);
  const [mentions, setMentions] = useState([]);
  const [search, setSearch] = useState('');
  const [size, setSize] = useState(20);
  const [timer, setTimer] = useState();
  const [totalRecords, setTotalRecords] = useState(0);
  const [type, setType] = useState('software');
  const [lazyState, setlazyState] = useState({
    first: 0,
    rows: 20,
    page: 1,
    sortField: null,
    sortOrder: null,
    filters: {
      doi: { value: '', matchMode: 'contains' },
    },
  });

  const usedTemplate = (rowData) => (rowData.mention_context.used ? 'True' : 'False');
  const createdTemplate = (rowData) => (rowData.mention_context.created ? 'True' : 'False');
  const sharedTemplate = (rowData) => (rowData.mention_context.shared ? 'True' : 'False');

  const doiTemplate = (rowData) => (
    <a href={`https://doi.org/${rowData.doi}`}>{rowData.doi}</a>
  );

  const onPage = (event) => setFrom(event.first);

  const loadLazyData = async () => {
    setLoading(true);
    // imitate delay of a backend call
    if (
      searchParams.get('search')
      && searchParams.get('search')?.length > 0
    ) {
      const data = await getMentions({
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

  useEffect(() => {
    if (timer) {
      clearTimeout(timer);
    }
    const timerTmp = setTimeout(() => {
      setSearchParams((params) => {
        params.set('from', from);
        params.set('search', search);
        params.set('size', size);
        params.set('type', type);
        return params;
      });
    }, 500);
    setTimer(timerTmp);
    // The timer should not be tracked
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from, search, size, type]);

  useEffect(() => {
    setlazyState({
      ...lazyState,
      first: searchParams.get('from'),
      // search: searchParams.get('search'),
      rows: searchParams.get('size'),
      // type: searchParams.get('type'),
      filters: {
        ...lazyState.filters,
        doi: {
          ...lazyState.filters.doi,
          value: searchParams.get('search'),
        },
      },
    });
    // setType(searchParams.get('type'));
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
        dataKey="id"
        filterDisplay="row"
        filters={filters}
        first={lazyState.first}
        lazy
        loading={loading}
        onPage={onPage}
        paginator
        rows={size}
        rowsPerPageOptions={[size, 50, 100]}
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
