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

import { authorsTemplate } from '../utils/templates';
import { getMentions } from '../utils/works';

const DEFAULT_ROWS = 50;

export default function Mentions() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentTab, setCurrentTab] = useState(0);
  const [affiliation, setAffiliation] = useState('');
  const [author, setAuthor] = useState('');
  const [doi, setDoi] = useState('');
  const [from, setFrom] = useState(0);
  const [loading, setLoading] = useState(false);
  const [mentions, setMentions] = useState([]);
  const [rows, setRows] = useState(DEFAULT_ROWS);
  const [search, setSearch] = useState('');
  const [totalRecords, setTotalRecords] = useState(0);
  const [lazyState, setlazyState] = useState({
    first: 0,
    page: 1,
    rows: DEFAULT_ROWS,
  });

  // Templates
  const affiliationsTemplate = (rowData) => (
    <ul>
      {rowData.affiliations.slice(0, 3).map((_affiliation) => (
        <li>{_affiliation}</li>
      ))}
    </ul>
  );
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
      style={{ color:
          rowData.mention_context.created
            ? '#8dc572'
            : '#be6464',
      }}
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
      style={{ color:
          rowData.mention_context.shared
            ? '#8dc572'
            : '#be6464',
      }}
    />
  );
  const usedTemplate = (rowData) => (
    <i
      className={`fr-mr-1w ${
        rowData.mention_context.used
          ? 'fr-icon-check-line'
          : 'fr-icon-close-line'
      }`}
      style={{ color:
          rowData.mention_context.used
            ? '#8dc572'
            : '#be6464',
      }}
    />
  );

  // Events
  const loadLazyData = async () => {
    setLoading(true);
    const data = await getMentions({
      affiliation: searchParams.get('affiliation'),
      author: searchParams.get('author'),
      doi: searchParams.get('doi'),
      from: searchParams.get('from'),
      search: searchParams.get('search'),
      size: searchParams.get('size'),
      type: currentTab === 0 ? 'software' : 'datasets',
    });
    setMentions(data?.mentions ?? []);
    setTotalRecords(data?.count ?? 0);
    setLoading(false);
  };
  const onPage = (event) => {
    setFrom(event.first);
    setRows(event.rows);
  };
  const onSubmit = () => {
    setSearchParams((params) => {
      params.set('affiliation', affiliation);
      params.set('author', author);
      params.set('doi', doi);
      params.set('from', from);
      params.set('search', search);
      params.set('size', rows);
      return params;
    });
  };

  // Effects
  useEffect(() => setFrom(0), [currentTab]);
  useEffect(() => {
    setlazyState({
      ...lazyState,
      first: parseInt(searchParams.get('from'), 10),
      rows: searchParams.get('size'),
    });
  }, [currentTab, searchParams]);
  useEffect(() => {
    loadLazyData();
  }, [lazyState]);

  return (
    <Container as="section" className="fr-mt-4w mentions">
      <Row>
        <Col md={10} xs={12}>
          <Row>
            <Col className="fr-pr-2w fr-mb-2w" md={3} xs={12}>
              <div className="label">Search</div>
              <div className="hint">Example "Coq"</div>
            </Col>
            <Col md={9} xs={12}>
              <TextInput
                disableAutoValidation
                // hint="Example: Coq"
                // label="Search"
                onChange={(e) => setSearch(e.target.value)}
                value={search}
              />
            </Col>
          </Row>
          <Row style={{ display: 'none' }}>
            <Col className="fr-pr-2w" md={3} xs={12}>
              <div className="label">Affiliation</div>
              <div className="hint">Example "Cern"</div>
            </Col>
            <Col md={9} xs={12}>
              <TextInput
                disableAutoValidation
                // hint="Example: Coq"
                // label="Search"
                onChange={(e) => setAffiliation(e.target.value)}
                value={affiliation}
              />
            </Col>
          </Row>
          <Row style={{ display: 'none' }}>
            <Col className="fr-pr-2w" md={3} xs={12}>
              <div className="label">Author</div>
              <div className="hint">Example "Bruno Latour"</div>
            </Col>
            <Col md={9} xs={12}>
              <TextInput
                disableAutoValidation
                // hint="Example: Coq"
                // label="Search"
                onChange={(e) => setAuthor(e.target.value)}
                value={author}
              />
            </Col>
          </Row>
          <Row className="fr-mb-2w" style={{ display: 'none' }}>
            <Col className="fr-pr-2w" md={3} xs={12}>
              <div className="label">DOI</div>
              <div className="hint">
                Example "10.4000/proceedings.elpub.2019.20"
              </div>
            </Col>
            <Col md={9} xs={12}>
              <TextInput
                disableAutoValidation
                // hint="Example: Coq"
                // label="Search"
                onChange={(e) => setDoi(e.target.value)}
                value={doi}
              />
            </Col>
          </Row>
        </Col>
        <Col className="fr-pl-2w" md={2} xs={12}>
          <Button onClick={onSubmit} style={{ verticalAlign: 'bottom' }}>
            Search mentions
          </Button>
        </Col>
      </Row>
      <Tabs
        defaultActiveIndex={currentTab}
        onTabChange={(i) => setCurrentTab(i)}
      >
        <Tab label="Software">
          <DataTable
            currentPageReportTemplate="{first} to {last} of {totalRecords}"
            dataKey="id"
            first={lazyState.first}
            lazy
            loading={loading}
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
            <Column body={doiTemplate} field="doi" header="DOI" />
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
            <Column
              body={affiliationsTemplate}
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
            first={lazyState.first}
            lazy
            loading={loading}
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
            <Column body={doiTemplate} field="doi" header="DOI" />
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
            <Column
              body={affiliationsTemplate}
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
