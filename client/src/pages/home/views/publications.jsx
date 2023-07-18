import PropTypes from 'prop-types';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';

import {
  affiliationsTemplate,
  authorsTemplate,
} from '../../../utils/fields';

export default function PublicationsView({
  paginatorLeft,
  paginatorRight,
  publicationsDataTable,
  setSelectedPublications,
  selectedPublications,
}) {
  return (
    <DataTable
      currentPageReportTemplate="{first} to {last} of {totalRecords}"
      filterDisplay="row"
      paginator
      paginatorLeft={paginatorLeft}
      paginatorPosition="both"
      paginatorRight={paginatorRight}
      paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
      rows={25}
      rowsPerPageOptions={[25, 50, 100, 200]}
      dataKey="id"
      dragSelection
      metaKeySelection={false}
      onSelectionChange={(e) => setSelectedPublications(e.value)}
      selection={selectedPublications}
      scrollable
      size="small"
      stripedRows
      style={{ fontSize: '11px', lineHeight: '15px' }}
      tableStyle={{ minWidth: '50rem' }}
      value={publicationsDataTable}
      groupRowsBy="identifier"
      sortField="identifier"
      rowGroupMode="rowspan"
    >
      <Column selectionMode="multiple" headerStyle={{ width: '3rem' }} />
      <Column field="identifier" header="Identifier" />
      <Column field="datasource" header="Datasource" style={{ minWidth: '10px' }} />
      <Column filter filterMatchMode="contains" showFilterMenu={false} field="id" header="ID" style={{ minWidth: '10px' }} sortable />
      <Column filter filterMatchMode="contains" showFilterMenu={false} field="doi" header="DOI" style={{ minWidth: '10px' }} sortable />
      <Column filter filterMatchMode="contains" showFilterMenu={false} field="hal_id" header="HAL Id" style={{ minWidth: '10px' }} />
      <Column filter filterMatchMode="contains" body={affiliationsTemplate} field="affiliations" header="Affiliations" style={{ minWidth: '10px' }} />
      <Column filter filterMatchMode="contains" body={authorsTemplate} field="authors" header="Authors" style={{ minWidth: '10px' }} />
      <Column filter filterMatchMode="contains" showFilterMenu={false} field="title" header="Title" style={{ minWidth: '10px' }} />
    </DataTable>
  );
}

PublicationsView.propTypes = {
  paginatorLeft: PropTypes.node.isRequired,
  paginatorRight: PropTypes.node.isRequired,
  publicationsDataTable: PropTypes.arrayOf(PropTypes.shape({
    identifier: PropTypes.string.isRequired,
    datasource: PropTypes.string.isRequired,
    doi: PropTypes.string.isRequired,
    hal_id: PropTypes.string.isRequired,
    affiliations: PropTypes.arrayOf(PropTypes.string).isRequired,
    authors: PropTypes.arrayOf(PropTypes.string).isRequired,
    title: PropTypes.string.isRequired,
  })).isRequired,
  setSelectedPublications: PropTypes.func.isRequired,
  selectedPublications: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    datasource: PropTypes.string.isRequired,
    doi: PropTypes.string.isRequired,
    hal_id: PropTypes.string.isRequired,
    affiliations: PropTypes.arrayOf(PropTypes.string).isRequired,
    authors: PropTypes.arrayOf(PropTypes.string).isRequired,
    title: PropTypes.string.isRequired,
  })).isRequired,
};
