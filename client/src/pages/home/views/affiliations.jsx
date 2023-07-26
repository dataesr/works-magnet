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
      onSelectionChange={(e) => setSelectedAffiliations(e.value.map((affiliation) => ({ id: affiliation.id, publications: affiliation.publications })))}
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
      <Column filter filterMatchMode="contains" body={nameTemplate} field="name" header="Affiliation" style={{ minWidth: '10px' }} filterPlaceholder="Search by affiliation" />
      <Column showFilterMenu={false} field="publications" body={(rowData) => rowData.publications.length} header="Number of publications" style={{ minWidth: '10px' }} />
    </DataTable>
  );
}

AffiliationsView.propTypes = {
  affiliationsDataTable: PropTypes.arrayOf(PropTypes.shape({
    datasource: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    publications: PropTypes.arrayOf(PropTypes.string).isRequired,
  })).isRequired,
  selectedAffiliations: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string,
    publications: PropTypes.arrayOf(PropTypes.string),
  })).isRequired,
  setSelectedAffiliations: PropTypes.func.isRequired,
};
