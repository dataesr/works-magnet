import PropTypes from 'prop-types';
import { Button } from '@dataesr/react-dsfr';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';

import {
  affiliationsTemplate,
  authorsTemplate,
} from '../../../utils/fields';

export default function ActionsView({
  data,
}) {
  const paginatorRight = <Button icon="ri-download-fill" text>Download</Button>;

  return (
    <DataTable
      style={{ fontSize: '11px', lineHeight: '15px' }}
      size="small"
      value={data}
      paginator
      paginatorPosition="both"
      rows={25}
      rowsPerPageOptions={[25, 50, 100, 200]}
      tableStyle={{ minWidth: '50rem' }}
      paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
      currentPageReportTemplate="{first} to {last} of {totalRecords}"
      // paginatorLeft={paginatorLeft}
      paginatorRight={paginatorRight}
      filterDisplay="row"
      scrollable
      stripedRows
    >
      <Column filter filterMatchMode="contains" showFilterMenu={false} field="id" header="ID" style={{ minWidth: '10px' }} sortable />
      <Column filter filterMatchMode="contains" showFilterMenu={false} field="doi" header="DOI" style={{ minWidth: '10px' }} sortable />
      <Column filter filterMatchMode="contains" showFilterMenu={false} field="hal_id" header="HAL Id" style={{ minWidth: '10px' }} />
      <Column filter filterMatchMode="contains" body={affiliationsTemplate} field="affiliations" header="Affiliations" style={{ minWidth: '10px' }} />
      <Column filter filterMatchMode="contains" body={authorsTemplate} field="authors" header="Authors" style={{ minWidth: '10px' }} />
      <Column filter filterMatchMode="contains" showFilterMenu={false} field="title" header="Title" style={{ minWidth: '10px' }} />
    </DataTable>
  );
}

ActionsView.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({
    identifier: PropTypes.string.isRequired,
    datasource: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    doi: PropTypes.string.isRequired,
    hal_id: PropTypes.string.isRequired,
    affiliations: PropTypes.arrayOf(PropTypes.string).isRequired,
    authors: PropTypes.arrayOf(PropTypes.string).isRequired,
    title: PropTypes.string.isRequired,
  })).isRequired,
};
