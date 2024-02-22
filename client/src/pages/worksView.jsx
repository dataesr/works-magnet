import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import PropTypes from 'prop-types';

import {
  affiliationsTemplate,
  allIdsTemplate,
  authorsTemplate,
  datasourceTemplate,
  statusTemplate,
} from '../utils/templates';

export default function WorksView({
  selectedWorks,
  setSelectedWorks,
  works,
}) {
  return (
    <DataTable
      currentPageReportTemplate="{first} to {last} of {totalRecords}"
      dataKey="id"
      filterDisplay="row"
      metaKeySelection={false}
      onSelectionChange={(e) => setSelectedWorks(e.value)}
      paginator
      paginatorPosition="bottom"
      paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks  NextPageLink LastPageLink RowsPerPageDropdown"
      rows={50}
      rowsPerPageOptions={[50, 200, 1000, 5000]}
      scrollable
      selection={selectedWorks}
      selectionPageOnly
      size="small"
      stripedRows
      style={{ fontSize: '11px', lineHeight: '10px' }}
      value={works}
    >
      <Column selectionMode="multiple" />
      <Column field="status" header="Status" body={statusTemplate} />
      <Column field="allIds" header="Ids" body={allIdsTemplate} />
      <Column field="datasource" header="Source" body={datasourceTemplate} />
      <Column field="type" header="Type" />
      <Column field="year" header="Year" />
      <Column field="publisher" header="Publisher" />
      <Column field="affiliationsHtml" header="Affiliations" body={affiliationsTemplate} />
      <Column field="authors" header="Authors" body={authorsTemplate} style={{ minWidth: '200px' }} />
      <Column field="title" header="Title" style={{ minWidth: '200px' }} />
      <Column field="fr_publications_linked" header="Linked Article" />
      <Column field="fr_authors_orcid" header="My institution author ORCID" />
      <Column field="fr_authors_name" header="My institution author name" />
    </DataTable>
  );
}

WorksView.propTypes = {
  selectedWorks: PropTypes.arrayOf(PropTypes.shape({
    affiliations: PropTypes.arrayOf(PropTypes.object).isRequired,
    allIds: PropTypes.arrayOf(PropTypes.object).isRequired,
    authors: PropTypes.arrayOf(PropTypes.string).isRequired,
    datasource: PropTypes.arrayOf(PropTypes.string).isRequired,
    id: PropTypes.string.isRequired,
    publisher: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
  })).isRequired,
  setSelectedWorks: PropTypes.func.isRequired,
  works: PropTypes.arrayOf(PropTypes.shape({
    affiliations: PropTypes.arrayOf(PropTypes.object).isRequired,
    allIds: PropTypes.arrayOf(PropTypes.object).isRequired,
    authors: PropTypes.arrayOf(PropTypes.string).isRequired,
    datasource: PropTypes.arrayOf(PropTypes.string).isRequired,
    id: PropTypes.string.isRequired,
    publisher: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
  })).isRequired,
};
