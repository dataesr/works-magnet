import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import PropTypes from 'prop-types';

import {
  affiliationsTemplate,
  allIdsTemplate,
  authorsTemplate,
} from '../../../utils/templates';

export default function PublicationsView({
  publicationsDataTable,
  selectedPublications,
  setSelectedPublications,
}) {
  return (
    <DataTable
      currentPageReportTemplate="{first} to {last} of {totalRecords}"
      dataKey="id"
      filterDisplay="row"
      metaKeySelection={false}
      onSelectionChange={(e) => setSelectedPublications(e.value)}
      paginator
      paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
      rows={25}
      rowsPerPageOptions={[25, 50, 100, 200]}
      scrollable
      selection={selectedPublications}
      size="small"
      stripedRows
      style={{ fontSize: '11px', lineHeight: '15px' }}
      tableStyle={{ minWidth: '50rem' }}
      value={publicationsDataTable}
    >
      <Column selectionMode="multiple" headerStyle={{ width: '3rem' }} />
      <Column field="allIds" header="Identifiers" body={allIdsTemplate} />
      <Column field="datasource" header="Source" style={{ minWidth: '10px' }} />
      <Column field="type" header="Type" style={{ minWidth: '10px' }} />
      <Column filter filterMatchMode="contains" body={affiliationsTemplate} field="affiliations" header="Affiliations" style={{ minWidth: '500px' }} />
      <Column filter filterMatchMode="contains" body={authorsTemplate} field="authors" header="Authors" style={{ minWidth: '10px' }} />
      <Column filter filterMatchMode="contains" showFilterMenu={false} field="title" header="Title" style={{ minWidth: '10px' }} />
    </DataTable>
  );
}

PublicationsView.propTypes = {
  publicationsDataTable: PropTypes.arrayOf(PropTypes.shape({
    affiliations: PropTypes.arrayOf(PropTypes.object).isRequired,
    allIds: PropTypes.arrayOf(PropTypes.object).isRequired,
    authors: PropTypes.arrayOf(PropTypes.object).isRequired,
    datasource: PropTypes.string.isRequired,
    identifier: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
  })).isRequired,
  setSelectedPublications: PropTypes.func.isRequired,
  selectedPublications: PropTypes.arrayOf(PropTypes.shape({
    affiliations: PropTypes.arrayOf(PropTypes.object).isRequired,
    authors: PropTypes.arrayOf(PropTypes.object).isRequired,
    datasource: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
  })).isRequired,
};
