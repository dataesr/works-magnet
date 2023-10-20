import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import PropTypes from 'prop-types';

import {
  affiliationsTemplate,
  allIdsTemplate,
  authorsTemplate,
  sourcesFilterTemplate,
  statusFilterTemplate,
  statusTemplate,
  typeFilterTemplate,
} from '../../../utils/templates';

export default function PublicationsView({
  allPublications,
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
      paginatorPosition="both"
      paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
      rows={50}
      rowsPerPageOptions={[25, 50, 100, 200]}
      scrollable
      selection={selectedPublications}
      selectionPageOnly
      size="small"
      stripedRows
      style={{ fontSize: '11px', lineHeight: '10px' }}
      value={allPublications}
    >
      <Column selectionMode="multiple" />
      <Column field="status" header="Status" body={statusTemplate} filter showFilterMenu={false} filterElement={statusFilterTemplate} style={{ minWidth: '10px' }} />
      <Column field="allIdsHtml" header="Ids" body={allIdsTemplate} filter filterMatchMode="contains" filterPlaceholder="Search by id" />
      <Column field="datasource" header="Source" filter showFilterMenu={false} filterElement={sourcesFilterTemplate} filterMatchMode="contains" />
      <Column field="type" header="Type" filter showFilterMenu={false} filterElement={typeFilterTemplate} filterMatchMode="equals" />
      <Column field="affiliationsHtml" header="Affiliations" body={affiliationsTemplate} filter filterField="affiliationsSearch" filterMatchMode="contains" filterPlaceholder="Search by affiliation" style={{ minWidth: '300px' }} />
      <Column field="authorsHtml" header="Authors" body={authorsTemplate} filter filterMatchMode="contains" filterPlaceholder="Search by author" style={{ minWidth: '10px' }} />
      <Column field="title" header="Title" filter filterMatchMode="contains" showFilterMenu={false} filterPlaceholder="Search by title" style={{ minWidth: '10px' }} />
    </DataTable>
  );
}

PublicationsView.propTypes = {
  allPublications: PropTypes.arrayOf(PropTypes.shape({
    affiliations: PropTypes.arrayOf(PropTypes.object).isRequired,
    allIds: PropTypes.arrayOf(PropTypes.object).isRequired,
    authors: PropTypes.arrayOf(PropTypes.object).isRequired,
    datasource: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
  })).isRequired,
  selectedPublications: PropTypes.arrayOf(PropTypes.shape({
    affiliations: PropTypes.arrayOf(PropTypes.object).isRequired,
    allIds: PropTypes.arrayOf(PropTypes.object).isRequired,
    authors: PropTypes.arrayOf(PropTypes.object).isRequired,
    datasource: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
  })).isRequired,
  setSelectedPublications: PropTypes.func.isRequired,
};
