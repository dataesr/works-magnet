import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { FilterMatchMode } from 'primereact/api';
import PropTypes from 'prop-types';
import { useState } from 'react';

import { nameTemplate, rorTemplate, statusRowFilterTemplate, statusTemplate, worksExampleTemplate } from '../utils/templates';

export default function AffiliationsView({
  allAffiliations,
  selectedAffiliations,
  setSelectedAffiliations,
}) {
  const [filters] = useState({ status: { value: null, matchMode: FilterMatchMode.IN } });

  return (
    <DataTable
      currentPageReportTemplate="{first} to {last} of {totalRecords}"
      dataKey="key"
      filterDisplay="row"
      filters={filters}
      metaKeySelection
      onSelectionChange={(e) => setSelectedAffiliations(e.value)}
      paginator
      paginatorPosition="top bottom"
      paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks  NextPageLink LastPageLink RowsPerPageDropdown"
      rows={100}
      rowsPerPageOptions={[50, 100, 200, 500]}
      scrollable
      scrollHeight="700px"
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
      <Column field="status" header="Status" body={statusTemplate} style={{ maxWidth: '150px' }} showFilterMenu={false} filterMenuStyle={{ width: '14rem' }} filter filterElement={statusRowFilterTemplate} />
      <Column field="nameHtml" header="Affiliation" body={nameTemplate} style={{ maxWidth: '250px' }} />
      <Column field="rorHtml" header="RoR computed by OpenAlex" body={rorTemplate} style={{ maxWidth: '150px' }} />
      <Column field="worksExamples" header="Examples of works" body={worksExampleTemplate} style={{ maxWidth: '200px' }} />
      <Column field="worksNumber" header="Number of works" style={{ maxWidth: '100px' }} sortable />
    </DataTable>
  );
}

AffiliationsView.propTypes = {
  allAffiliations: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.isRequired,
    nameHtml: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    works: PropTypes.arrayOf(PropTypes.string).isRequired,
    worksNumber: PropTypes.number.isRequired,
  })).isRequired,
  selectedAffiliations: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.isRequired,
    nameHtml: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    works: PropTypes.arrayOf(PropTypes.string).isRequired,
    worksNumber: PropTypes.number.isRequired,
  })).isRequired,
  setSelectedAffiliations: PropTypes.func.isRequired,
};
