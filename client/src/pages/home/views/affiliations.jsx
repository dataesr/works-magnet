import PropTypes from 'prop-types';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';

import {
  nameTemplate,
  statusFilterTemplate,
  statusTemplate,
} from '../../../utils/templates';

export default function AffiliationsView({
  allAffiliations,
  selectedAffiliations,
  setSelectedAffiliations,
}) {
  return (
    <DataTable
      currentPageReportTemplate="{first} to {last} of {totalRecords}"
      dataKey="id"
      filterDisplay="row"
      metaKeySelection
      onSelectionChange={(e) => setSelectedAffiliations(e.value)}
      paginator
      paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
      rows={25}
      rowsPerPageOptions={[25, 50, 100, 200]}
      scrollable
      selection={selectedAffiliations}
      size="small"
      sortField="works"
      sortOrder={-1}
      stripedRows
      style={{ fontSize: '11px', lineHeight: '10px' }}
      tableStyle={{ minWidth: '50rem' }}
      value={allAffiliations}
    >
      <Column selectionMode="multiple" />
      <Column field="status" header="Status" body={statusTemplate} filter showFilterMenu={false} filterElement={statusFilterTemplate} />
      <Column field="name" header="Affiliation" body={nameTemplate} filter filterMatchMode="contains" filterPlaceholder="Search by affiliation" />
      <Column field="works" header="Number of works" sortable />
      <Column field="matches" header="Number of matches" sortable />
    </DataTable>
  );
}

AffiliationsView.propTypes = {
  allAffiliations: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    matches: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    works: PropTypes.arrayOf(PropTypes.string).isRequired,
  })).isRequired,
  selectedAffiliations: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    works: PropTypes.arrayOf(PropTypes.string).isRequired,
  })).isRequired,
  setSelectedAffiliations: PropTypes.func.isRequired,
};
