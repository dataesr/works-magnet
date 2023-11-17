import PropTypes from 'prop-types';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';

import { nameTemplate, statusTemplate } from '../utils/templates';

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
      paginatorPosition="both"
      paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
      rows={50}
      rowsPerPageOptions={[25, 50, 100, 200]}
      scrollable
      selection={selectedAffiliations}
      selectionPageOnly
      size="small"
      sortField="worksNumber"
      sortOrder={-1}
      stripedRows
      style={{ fontSize: '11px', lineHeight: '10px' }}
      tableStyle={{ minWidth: '50rem' }}
      value={allAffiliations}
    >
      <Column selectionMode="multiple" />
      <Column field="status" header="Status" body={statusTemplate} />
      <Column field="nameHtml" header="Affiliation" body={nameTemplate} />
      <Column field="worksNumber" header="Number of works" sortable />
      <Column field="matches" header="Number of unique matches" sortable />
    </DataTable>
  );
}

AffiliationsView.propTypes = {
  allAffiliations: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    matches: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    nameHtml: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    works: PropTypes.arrayOf(PropTypes.string).isRequired,
    worksNumber: PropTypes.number.isRequired,
  })).isRequired,
  selectedAffiliations: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    matches: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    nameHtml: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    works: PropTypes.arrayOf(PropTypes.string).isRequired,
    worksNumber: PropTypes.number.isRequired,
  })).isRequired,
  setSelectedAffiliations: PropTypes.func.isRequired,
};
