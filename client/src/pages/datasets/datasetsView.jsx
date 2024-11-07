import { Col, Row, Toggle } from '@dataesr/dsfr-plus';
import { FilterMatchMode } from 'primereact/api';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import PropTypes from 'prop-types';
import { useState } from 'react';

import {
  affiliationsTemplate,
  allIdsTemplate,
  frAuthorsTemplate,
  linkedDOITemplate,
  linkedORCIDTemplate,
  statusRowFilterTemplate,
  statusTemplate,
} from '../../utils/templates';

export default function DatasetsView({
  filteredAffiliationName,
  selectedWorks,
  setFilteredAffiliationName,
  setSelectedWorks,
  works,
}) {
  const [filters] = useState({
    publisher: { value: null, matchMode: FilterMatchMode.IN },
    status: { value: null, matchMode: FilterMatchMode.IN },
    type: { value: null, matchMode: FilterMatchMode.IN },
  });
  const [selectionPageOnly, setSelectionPageOnly] = useState(true);

  const paginatorLeft = () => (
    <Row>
      <Col xs="2">
        <div className="before-toggle">Select all</div>
      </Col>
      <Col xs="3">
        <Toggle
          checked={selectionPageOnly}
          label="Select page"
          name="Select page only"
          onChange={(e) => setSelectionPageOnly(e.target.checked)}
        />
      </Col>
      <Col xs="7">
        <i className="fr-icon-search-line fr-mr-1w" />
        Search in any field
        <input
          className="fr-ml-1w"
          onChange={(e) => setFilteredAffiliationName(e.target.value)}
          style={{
            border: '1px solid #ced4da',
            borderRadius: '4px',
            padding: '0.375rem 0.75rem',
            width: '100%',
          }}
          value={filteredAffiliationName}
        />
      </Col>
    </Row>
  );

  return (
    <DataTable
      currentPageReportTemplate="{first} to {last} of {totalRecords}"
      dataKey="id"
      filterDisplay="row"
      filters={filters}
      metaKeySelection={false}
      onSelectionChange={(e) => setSelectedWorks(e.value)}
      paginator
      paginatorLeft={paginatorLeft}
      paginatorPosition="top bottom"
      paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
      rows={100}
      rowsPerPageOptions={[50, 100, 200, 500]}
      scrollable
      selection={selectedWorks}
      selectionPageOnly={selectionPageOnly}
      size="small"
      sortOrder={1}
      stripedRows
      style={{ fontSize: '14px', lineHeight: '13px' }}
      value={works}
    >
      <Column selectionMode="multiple" />
      <Column
        body={statusTemplate}
        field="status"
        filter
        filterElement={statusRowFilterTemplate}
        header="Status"
        showFilterMenu={false}
        style={{ minWidth: '140px', maxWidth: '140px' }}
      />
      <Column
        body={allIdsTemplate}
        field="allIds"
        header="Ids"
        style={{ maxWidth: '180px' }}
      />
      <Column
        field="type"
        header="Type"
        showFilterMenu={false}
        sortable
        style={{ maxWidth: '90px' }}
      />
      <Column
        field="year"
        header="Year"
        sortable
        style={{ maxWidth: '70px' }}
      />
      <Column
        field="publisher"
        header="Publisher"
        sortable
        style={{ minWidth: '95px', maxWidth: '95px' }}
      />
      <Column
        body={affiliationsTemplate}
        field="affiliationsHtml"
        header="Affiliations"
        sortable
        sortField="nbAffiliations"
        style={{ maxWidth: '220px' }}
      />
      <Column
        body={linkedDOITemplate}
        field="fr_publications_linked"
        header="Linked Article"
        sortable
        sortField="nbPublicationsLinked"
        style={{ minWidth: '160px', maxWidth: '160px' }}
      />
      <Column
        body={linkedORCIDTemplate}
        field="fr_authors_orcid"
        header="My institution author ORCID"
        sortable
        sortField="nbOrcid"
        style={{ maxWidth: '150px' }}
      />
      <Column
        body={frAuthorsTemplate}
        field="fr_authors_name"
        header="My institution author name"
        sortable
        sortField="nbAuthorsName"
        style={{ maxWidth: '150px' }}
      />
    </DataTable>
  );
}

DatasetsView.propTypes = {
  selectedWorks: PropTypes.arrayOf(
    PropTypes.shape({
      affiliations: PropTypes.arrayOf(PropTypes.object).isRequired,
      allIds: PropTypes.arrayOf(PropTypes.object).isRequired,
      authors: PropTypes.arrayOf(PropTypes.string).isRequired,
      datasource: PropTypes.arrayOf(PropTypes.string).isRequired,
      id: PropTypes.string.isRequired,
      publisher: PropTypes.string.isRequired,
      status: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired,
    }),
  ).isRequired,
  setSelectedWorks: PropTypes.func.isRequired,
  works: PropTypes.arrayOf(
    PropTypes.shape({
      affiliations: PropTypes.arrayOf(PropTypes.object).isRequired,
      allIds: PropTypes.arrayOf(PropTypes.object).isRequired,
      authors: PropTypes.arrayOf(PropTypes.string).isRequired,
      datasource: PropTypes.arrayOf(PropTypes.string).isRequired,
      id: PropTypes.string.isRequired,
      publisher: PropTypes.string.isRequired,
      status: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired,
    }),
  ).isRequired,
  filteredAffiliationName: PropTypes.string.isRequired,
  setFilteredAffiliationName: PropTypes.func.isRequired,
};
