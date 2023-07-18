import PropTypes from 'prop-types';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';

import {
  affiliationsTemplate,
  allIdsTemplate,
  authorsTemplate,
} from '../../../utils/fields';

export default function PublicationsView({
  publicationsDataTable,
  setSelectedPublications,
  selectedPublications,
}) {
  return (
    <DataTable
      currentPageReportTemplate="{first} to {last} of {totalRecords}"
      filterDisplay="row"
      paginator
      paginatorPosition="both"
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
    >
      <Column selectionMode="multiple" headerStyle={{ width: '3rem' }} />
      <Column field="identifier" header="Identifier" />
      <Column field="allIds" header="Identifiers" body={allIdsTemplate} />
      <Column field="datasource" header="Datasource" style={{ minWidth: '10px' }} />
      {/* <Column filter filterMatchMode="contains" showFilterMenu={false} field="id" header="ID" style={{ minWidth: '10px' }} sortable /> */}
      {/* <Column filter filterMatchMode="contains" showFilterMenu={false} field="doi" header="DOI" style={{ minWidth: '10px' }} sortable /> */}
      {/* <Column filter filterMatchMode="contains" showFilterMenu={false} field="hal_id" header="HAL Id" style={{ minWidth: '10px' }} /> */}
      <Column filter filterMatchMode="contains" body={affiliationsTemplate} field="affiliations" header="Affiliations" style={{ minWidth: '500px' }} />
      <Column filter filterMatchMode="contains" body={authorsTemplate} field="authors" header="Authors" style={{ minWidth: '10px' }} />
      <Column filter filterMatchMode="contains" showFilterMenu={false} field="title" header="Title" style={{ minWidth: '10px' }} />
    </DataTable>
  );
}

PublicationsView.propTypes = {
  publicationsDataTable: PropTypes.arrayOf(PropTypes.shape({
    affiliations: PropTypes.string.isRequired,
    authors: PropTypes.string.isRequired,
    datasource: PropTypes.string.isRequired,
    doi: PropTypes.string,
    hal_id: PropTypes.string,
    identifier: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
  })).isRequired,
  setSelectedPublications: PropTypes.func.isRequired,
  selectedPublications: PropTypes.arrayOf(PropTypes.shape({
    affiliations: PropTypes.string.isRequired,
    authors: PropTypes.string.isRequired,
    datasource: PropTypes.string.isRequired,
    doi: PropTypes.string,
    hal_id: PropTypes.string,
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
  })).isRequired,
};
