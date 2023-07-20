import PropTypes from 'prop-types';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';

import {
  affiliationsTemplate,
} from '../../../utils/fields';

export default function AffiliationsView({
  affiliationsDataTable,
  selectedAffiliations,
  setSelectedAffiliations,
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
      onSelectionChange={(e) => setSelectedAffiliations(e.value)}
      selection={selectedAffiliations}
      scrollable
      size="small"
      stripedRows
      style={{ fontSize: '11px', lineHeight: '15px' }}
      tableStyle={{ minWidth: '50rem' }}
      value={affiliationsDataTable}
    >
      <Column selectionMode="single" headerStyle={{ width: '3rem' }} />
      <Column field="datasource" header="Datasource" style={{ minWidth: '10px' }} />
      <Column filter filterMatchMode="contains" body={affiliationsTemplate} field="affiliation" header="Affiliations" style={{ minWidth: '10px' }} />
      <Column showFilterMenu={false} field="publicationsNumber" header="Number of publications" style={{ minWidth: '10px' }} />
    </DataTable>
  );
}

AffiliationsView.propTypes = {
  affiliationsDataTable: PropTypes.arrayOf(PropTypes.shape({
    affiliations: PropTypes.string.isRequired,
    publicationsNumber: PropTypes.number.isRequired,
  })).isRequired,
  selectedAffiliations: PropTypes.arrayOf(PropTypes.shape({
    affiliations: PropTypes.arrayOf(PropTypes.string).isRequired,
    publicationsNumber: PropTypes.number.isRequired,
    publications: PropTypes.arrayOf(PropTypes.string).isRequired,
  })).isRequired,
  setSelectedAffiliations: PropTypes.func.isRequired,
};
