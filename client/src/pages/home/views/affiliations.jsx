import PropTypes from 'prop-types';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';

import { nameTemplate } from '../../../utils/templates';

export default function AffiliationsView({
  affiliationsDataTable,
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
      stripedRows
      style={{ fontSize: '11px', lineHeight: '15px' }}
      tableStyle={{ minWidth: '50rem' }}
      value={affiliationsDataTable}
    >
      <Column selectionMode="multiple" headerStyle={{ width: '3rem' }} />
      <Column field="datasource" header="Datasource" style={{ minWidth: '10px' }} />
      <Column filter filterMatchMode="contains" body={nameTemplate} field="affiliation" header="Affiliation" style={{ minWidth: '10px' }} filterPlaceholder="Search by affiliation" />
      <Column showFilterMenu={false} field="publications" body={(rowData) => rowData.publications.length} header="Number of publications" style={{ minWidth: '10px' }} />
    </DataTable>
  );
}

AffiliationsView.propTypes = {
  affiliationsDataTable: PropTypes.arrayOf(PropTypes.shape({
    datasource: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    publications: PropTypes.arrayOf(PropTypes.object).isRequired,
  })).isRequired,
  selectedAffiliation: PropTypes.arrayOf(PropTypes.shape({
    datasource: PropTypes.string,
    id: PropTypes.string,
    name: PropTypes.string,
    publications: PropTypes.arrayOf(PropTypes.object),
  })).isRequired,
  setSelectedAffiliation: PropTypes.func.isRequired,
};
