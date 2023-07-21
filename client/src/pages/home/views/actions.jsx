import { Select } from '@dataesr/react-dsfr';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import PropTypes from 'prop-types';

import {
  affiliationsTemplate,
  allIdsTemplate,
  authorsTemplate,
} from '../../../utils/fields';

const options = [
  { label: 'To keep', value: 'keep' },
  { label: 'To exclude', value: 'exclude' },
  { label: 'To sort', value: 'sort' },
];

export default function ActionsView({
  data,
  setActions,
}) {
  const changePublicationsActions = (e, rowData) => {
    const { value } = e.target;
    if (value === rowData.action) return;
    if (value === 'sort') {
      const newData = data.filter((row) => row.identifier !== rowData.identifier);
      setActions(newData);
    } else {
      const newData = data.map((row) => {
        if (row.identifier === rowData.identifier) {
          return { ...row, action: value };
        }
        return row;
      });
      setActions(newData);
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
      value={data}
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
      <Column body={actionsTemplate} showFilterMenu={false} field="action" header="Actions" style={{ minWidth: '130px' }} />
      <Column field="allIds" header="Identifiers" body={allIdsTemplate} />
      <Column field="datasource" header="Datasource" style={{ minWidth: '10px' }} />
      <Column filter filterMatchMode="contains" body={affiliationsTemplate} field="affiliations" header="Affiliations" style={{ minWidth: '500px' }} />
      <Column filter filterMatchMode="contains" body={authorsTemplate} field="authors" header="Authors" style={{ minWidth: '10px' }} />
      <Column filter filterMatchMode="contains" showFilterMenu={false} field="title" header="Title" style={{ minWidth: '10px' }} />
    </DataTable>
  );
}

ActionsView.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({
    affiliations: PropTypes.string.isRequired,
    authors: PropTypes.arrayOf(PropTypes.object).isRequired,
    datasource: PropTypes.string.isRequired,
    doi: PropTypes.string,
    hal_id: PropTypes.string,
    id: PropTypes.string.isRequired,
    identifier: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
  })).isRequired,
  setActions: PropTypes.func.isRequired,
};
