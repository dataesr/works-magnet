import PropTypes from 'prop-types';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';

import {
  affiliationTemplate,
} from '../../../utils/templates';

export default function AffiliationsView({
  affiliationsDataTable,
  selectedAffiliation,
  setSelectedAffiliation,
}) {
  return (
    <DataTable
      currentPageReportTemplate="{first} to {last} of {totalRecords}"
      filterDisplay="row"
      paginator
      paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
      rows={25}
      rowsPerPageOptions={[25, 50, 100, 200]}
      dataKey="id"
      metaKeySelection
      onSelectionChange={(e) => setSelectedAffiliation(e.value)}
      selection={selectedAffiliation}
      scrollable
      size="small"
      stripedRows
      style={{ fontSize: '11px', lineHeight: '15px' }}
      tableStyle={{ minWidth: '50rem' }}
      value={affiliationsDataTable}
    >
      <Column selectionMode="single" headerStyle={{ width: '3rem' }} />
      <Column field="datasource" header="Datasource" style={{ minWidth: '10px' }} />
      <Column filter filterMatchMode="contains" body={affiliationTemplate} field="affiliation" header="Affiliation" style={{ minWidth: '10px' }} />
      <Column showFilterMenu={false} field="publications" body={(rowData) => rowData.publications.length} header="Number of publications" style={{ minWidth: '10px' }} />
    </DataTable>
  );
}

AffiliationsView.propTypes = {
  affiliationsDataTable: PropTypes.arrayOf(PropTypes.shape({
    affiliations: PropTypes.string.isRequired,
  })).isRequired,
  selectedAffiliation: PropTypes.shape({
    affiliations: PropTypes.string,
    publications: PropTypes.arrayOf(PropTypes.object),
  }).isRequired,
  setSelectedAffiliation: PropTypes.func.isRequired,
};
