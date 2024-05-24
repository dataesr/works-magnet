import { Col, Row, Toggle } from '@dataesr/dsfr-plus';
import { FilterMatchMode } from 'primereact/api';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { MultiSelect } from 'primereact/multiselect';
import PropTypes from 'prop-types';
import { useState } from 'react';

import {
  affiliationsTemplate,
  allIdsTemplate,
  authorsTemplate,
  datasourceTemplate,
  statusRowFilterTemplate,
  statusTemplate,
} from '../utils/templates';

import './publicationsView.scss';

export default function PublicationsView({
  filteredAffiliationName,
  selectedWorks,
  setFilteredAffiliationName,
  setSelectedWorks,
  works,
  years,
}) {
  const [filters] = useState({
    status: { value: null, matchMode: FilterMatchMode.IN },
    years: { value: null, matchMode: FilterMatchMode.EQUALS },
  });
  const [selectionPageOnly, setSelectionPageOnly] = useState(true);

  const yearRowFilterTemplate = (options) => (
    <MultiSelect
      className="p-column-filter"
      maxSelectedLabels={1}
      onChange={(e) => options.filterApplyCallback(e.value)}
      optionLabel="name"
      options={Object.keys(years).map((year) => ({
        name: `${year} (${years[year]})`,
        value: year,
      }))}
      placeholder="Any"
      style={{ maxWidth: '9rem', minWidth: '9rem' }}
      value={options.value}
    />
  );

  const paginatorLeft = () => (
    <Row>
      <Col xs="4">
        <Toggle
          checked={selectionPageOnly}
          hint="Or select all"
          label="Select page"
          name="Select page only"
          onChange={(e) => setSelectionPageOnly(e.target.checked)}
        />
      </Col>
      <Col xs="8">
        <i className="fr-icon-search-line fr-mr-1w" />
        Search in any field
        <input
          className="fr-ml-1w"
          onChange={(e) => setFilteredAffiliationName(e.target.value)}
          style={{
            border: '1px solid #ced4da',
            borderRadius: '4px',
            padding: '0.375rem 0.75rem',
            width: '500px',
          }}
          value={filteredAffiliationName}
        />
      </Col>
    </Row>
  );

  return (
    <DataTable
      className="justify-content-end"
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
        filterMenuStyle={{ width: '14rem' }}
        header="Status"
        showFilterMenu={false}
        style={{ minWidth: '150px' }}
      />
      <Column
        field="allIds"
        header="Ids"
        footer="Ids"
        body={allIdsTemplate}
        style={{ maxWidth: '180px' }}
      />
      <Column
        field="datasource"
        header="Source"
        footer="Source"
        body={datasourceTemplate}
        style={{ maxWidth: '80px' }}
      />
      <Column field="type" header="Type" style={{ maxWidth: '90px' }} />
      <Column
        field="year"
        header="Year"
        style={{ maxWidth: '150px' }}
        showFilterMenu={false}
        filter
        filterElement={yearRowFilterTemplate}
      />
      <Column
        field="publisher"
        header="Publisher"
        style={{ maxWidth: '70px' }}
      />
      <Column
        field="affiliationsHtml"
        header="Affiliations"
        body={affiliationsTemplate}
        style={{ maxWidth: '220px' }}
      />
      <Column
        field="authors"
        header="Authors"
        body={authorsTemplate}
        style={{ minWidth: '150px' }}
      />
      <Column field="title" header="Title" style={{ minWidth: '150px' }} />
    </DataTable>
  );
}

PublicationsView.propTypes = {
  filteredAffiliationName: PropTypes.string.isRequired,
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
  setFilteredAffiliationName: PropTypes.func.isRequired,
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
  years: PropTypes.object.isRequired,
};
