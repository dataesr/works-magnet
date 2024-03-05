import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { FilterMatchMode } from 'primereact/api';
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

export default function PublicationsView({
  selectedWorks,
  setSelectedWorks,
  works,
}) {
  const [filters] = useState({ status: { value: null, matchMode: FilterMatchMode.IN } });
  return (
    <DataTable
      currentPageReportTemplate="{first} to {last} of {totalRecords}"
      dataKey="id"
      filterDisplay="row"
      filters={filters}
      metaKeySelection={false}
      onSelectionChange={(e) => setSelectedWorks(e.value)}
      paginator
      paginatorPosition="top bottom"
      paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks  NextPageLink LastPageLink RowsPerPageDropdown"
      rows={100}
      rowsPerPageOptions={[50, 100, 200, 500]}
      scrollable
      scrollHeight="700px"
      selection={selectedWorks}
      selectionPageOnly
      size="small"
      stripedRows
      style={{ fontSize: '11px', lineHeight: '10px' }}
      value={works}
    >
      <Column selectionMode="multiple" />
      <Column field="status" header="Status" body={statusTemplate} style={{ minWidth: '150px' }} showFilterMenu={false} filterMenuStyle={{ width: '14rem' }} filter filterElement={statusRowFilterTemplate} />
      <Column field="allIds" header="Ids" body={allIdsTemplate} style={{ maxWidth: '180px' }} />
      <Column field="datasource" header="Source" body={datasourceTemplate} style={{ maxWidth: '80px' }} />
      <Column field="type" header="Type" style={{ maxWidth: '90px' }} />
      <Column field="year" header="Year" style={{ maxWidth: '70px' }} />
      <Column field="publisher" header="Publisher" style={{ maxWidth: '70px' }} />
      <Column field="affiliationsHtml" header="Affiliations" body={affiliationsTemplate} style={{ maxWidth: '220px' }} />
      <Column field="authors" header="Authors" body={authorsTemplate} style={{ minWidth: '150px' }} />
      <Column field="title" header="Title" style={{ minWidth: '150px' }} />
    </DataTable>
  );
}

PublicationsView.propTypes = {
  selectedWorks: PropTypes.arrayOf(PropTypes.shape({
    affiliations: PropTypes.arrayOf(PropTypes.object).isRequired,
    allIds: PropTypes.arrayOf(PropTypes.object).isRequired,
    authors: PropTypes.arrayOf(PropTypes.string).isRequired,
    datasource: PropTypes.arrayOf(PropTypes.string).isRequired,
    id: PropTypes.string.isRequired,
    publisher: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
  })).isRequired,
  setSelectedWorks: PropTypes.func.isRequired,
  works: PropTypes.arrayOf(PropTypes.shape({
    affiliations: PropTypes.arrayOf(PropTypes.object).isRequired,
    allIds: PropTypes.arrayOf(PropTypes.object).isRequired,
    authors: PropTypes.arrayOf(PropTypes.string).isRequired,
    datasource: PropTypes.arrayOf(PropTypes.string).isRequired,
    id: PropTypes.string.isRequired,
    publisher: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
  })).isRequired,
};
