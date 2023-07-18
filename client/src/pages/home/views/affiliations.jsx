import PropTypes from 'prop-types';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';

import {
  affiliationsTemplate,
} from '../../../utils/fields';

export default function AffiliationsView({
  paginatorLeft,
  paginatorRight,
  affiliationsDataTable,
}) {
  return (
    <DataTable
      style={{ fontSize: '11px', lineHeight: '15px' }}
      size="small"
      value={affiliationsDataTable}
      paginator
      rows={25}
      rowsPerPageOptions={[25, 50, 100, 200]}
      tableStyle={{ minWidth: '50rem' }}
      paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
      currentPageReportTemplate="{first} to {last} of {totalRecords}"
      paginatorLeft={paginatorLeft}
      paginatorPosition="both"
      paginatorRight={paginatorRight}
      filterDisplay="row"
      scrollable
      stripedRows
    >
      <Column filter filterMatchMode="contains" body={affiliationsTemplate} field="affiliation" header="affiliations" style={{ minWidth: '10px' }} />
      <Column showFilterMenu={false} field="publicationsNumber" header="publicationsNumber" style={{ minWidth: '10px' }} />
    </DataTable>
  );
}

AffiliationsView.propTypes = {
  paginatorLeft: PropTypes.node.isRequired,
  paginatorRight: PropTypes.node.isRequired,
  affiliationsDataTable: PropTypes.arrayOf(PropTypes.shape({
    affiliations: PropTypes.arrayOf(PropTypes.string).isRequired,
    publicationsNumber: PropTypes.number.isRequired,
  })).isRequired,
};
