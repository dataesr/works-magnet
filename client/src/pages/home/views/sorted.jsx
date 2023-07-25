import { Select } from '@dataesr/react-dsfr';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import PropTypes from 'prop-types';

import {
  affiliationsTemplate,
  allIdsTemplate,
  authorsTemplate,
} from '../../../utils/templates';

const options = [
  { label: 'To keep', value: 'keep' },
  { label: 'To exclude', value: 'exclude' },
  { label: 'To sort', value: 'sort' },
];

export default function ActionsView({
  setSortedPublications,
  sortedPublications,
}) {
  const changePublicationsActions = (e, rowData) => {
    const { value } = e.target;
    if (value === rowData.action) return;
    const newActions = [...sortedPublications];

    if (value === 'sort') {
      const newData = newActions.filter((row) => row.identifier !== rowData.identifier);
      setSortedPublications(newData);
    } else {
      const newData = newActions.map((row) => {
        if (row.identifier === rowData.identifier) {
          return { ...row, action: value };
        }
        return row;
      });
      setSortedPublications(newData);
    }
  };

  const actionsTemplate = (rowData) => (
    <Select
      onChange={(e) => changePublicationsActions(e, rowData)}
      options={options}
      selected={rowData.action}
    />
  );

  return (
    <DataTable
      style={{ fontSize: '11px', lineHeight: '15px' }}
      size="small"
      value={sortedPublications}
      paginator
      rows={25}
      rowsPerPageOptions={[25, 50, 100, 200]}
      tableStyle={{ minWidth: '50rem' }}
      paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
      currentPageReportTemplate="{first} to {last} of {totalRecords}"
      filterDisplay="row"
      scrollable
      stripedRows
    >
      <Column field="action" header="Actions" body={actionsTemplate} showFilterMenu={false} style={{ minWidth: '130px' }} />
      <Column field="allIdsHtml" header="Identifiers" body={allIdsTemplate} filter filterMatchMode="contains" />
      <Column field="datasource" header="Source" style={{ minWidth: '10px' }} />
      <Column field="type" header="Type" style={{ minWidth: '10px' }} />
      <Column field="affiliations" header="Affiliations" body={affiliationsTemplate} filter filterMatchMode="contains" style={{ minWidth: '500px' }} />
      <Column field="authorsHtml" header="Authors" body={authorsTemplate} filter filterMatchMode="contains" style={{ minWidth: '10px' }} />
      <Column field="title" header="Title" filter filterMatchMode="contains" showFilterMenu={false} style={{ minWidth: '10px' }} />
    </DataTable>
  );
}

ActionsView.propTypes = {
  setSortedPublications: PropTypes.func.isRequired,
  sortedPublications: PropTypes.arrayOf(PropTypes.shape({
    action: PropTypes.string,
    identifier: PropTypes.string,
  })).isRequired,
};
