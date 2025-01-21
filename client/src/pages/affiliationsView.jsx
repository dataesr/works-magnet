import { Col, Row, Toggle } from '@dataesr/dsfr-plus';
import { FilterMatchMode } from 'primereact/api';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import PropTypes from 'prop-types';
import { useState } from 'react';

import {
  nameTemplate,
  rorTemplate,
  statusRowFilterTemplate,
  statusTemplate,
  worksExampleTemplate,
} from '../utils/templates';

export default function AffiliationsView({
  allAffiliations,
  filteredAffiliationName,
  selectedAffiliations,
  setFilteredAffiliationName,
  setSelectedAffiliations,
}) {
  const [filters] = useState({ status: { matchMode: FilterMatchMode.IN, value: null } });
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
        Search in affiliations name
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
      dataKey="key"
      filterDisplay="row"
      filters={filters}
      metaKeySelection
      onSelectionChange={(e) => setSelectedAffiliations(e.value)}
      paginator
      paginatorLeft={paginatorLeft}
      paginatorPosition="top bottom"
      paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
      rows={100}
      rowsPerPageOptions={[50, 100, 200, 500]}
      scrollable
      selection={selectedAffiliations}
      selectionPageOnly={selectionPageOnly}
      size="small"
      sortField="worksNumber"
      sortOrder={-1}
      stripedRows
      style={{ fontSize: '14px', lineHeight: '13px' }}
      tableStyle={{ minWidth: '50rem' }}
      value={allAffiliations}
    >
      <Column selectionMode="multiple" />
      <Column
        body={statusTemplate}
        field="status"
        filter
        filterElement={statusRowFilterTemplate}
        filterMenuStyle={{ width: '14rem' }}
        header="Status"
        showFilterMenu={false}
        style={{ maxWidth: '150px' }}
      />
      <Column
        field="nameHtml"
        header="Affiliation"
        body={nameTemplate}
        style={{ maxWidth: '250px' }}
      />
      <Column
        field="rorHtml"
        header="ROR computed by OpenAlex"
        body={rorTemplate}
        style={{ maxWidth: '150px' }}
        sortable
        sortField="rorsNumber"
      />
      <Column
        field="worksExamples"
        header="Examples of works"
        body={worksExampleTemplate}
        style={{ maxWidth: '200px' }}
      />
      <Column
        field="worksNumber"
        header="Number of works"
        style={{ maxWidth: '100px' }}
        sortable
      />
    </DataTable>
  );
}

AffiliationsView.propTypes = {
  allAffiliations: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      nameHtml: PropTypes.string.isRequired,
      status: PropTypes.string.isRequired,
      works: PropTypes.arrayOf(PropTypes.string).isRequired,
      worksNumber: PropTypes.number.isRequired,
    }),
  ).isRequired,
  filteredAffiliationName: PropTypes.string.isRequired,
  selectedAffiliations: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      nameHtml: PropTypes.string.isRequired,
      status: PropTypes.string.isRequired,
      works: PropTypes.arrayOf(PropTypes.string).isRequired,
      worksNumber: PropTypes.number.isRequired,
    }),
  ).isRequired,
  setFilteredAffiliationName: PropTypes.func.isRequired,
  setSelectedAffiliations: PropTypes.func.isRequired,
};
