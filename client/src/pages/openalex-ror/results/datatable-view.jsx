import PropTypes from 'prop-types';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { InputTextarea } from 'primereact/inputtextarea';

import {
  correctionTemplate,
  hasCorrectionTemplate,
  nameTemplate,
  rorTemplate,
  worksExampleTemplate,
} from '../../../utils/templates';

export default function DataTableView({
  onRowEditComplete,
  setSelectedOpenAlex,
  selectedOpenAlex,
  allAffiliations,
  undo,
}) {
  const cellEditor = (options) => (
    <InputTextarea
      id="editor-ror"
      onChange={(e) => options.editorCallback(e.target.value)}
      type="text"
      value={Array.isArray(options?.value) ? options.value?.map((v) => v.rorId).join(';') : options.value}
    />
  );

  return (
    <DataTable
      currentPageReportTemplate="{first} to {last} of {totalRecords}"
      dataKey="key"
      editMode="row"
      metaKeySelection
      onRowEditComplete={onRowEditComplete}
      onSelectionChange={(e) => setSelectedOpenAlex(e.value)}
      scrollable
      scrollHeight="800px"
      selection={selectedOpenAlex}
      size="small"
      sortField="worksNumber"
      sortOrder={-1}
      stripedRows
      style={{ fontSize: '14px', lineHeight: '13px' }}
      tableStyle={{ minWidth: '50rem' }}
      value={allAffiliations}
      virtualScrollerOptions={{ itemSize: 46 }}
    >
      <Column selectionMode="multiple" />
      <Column
        body={nameTemplate}
        field="nameHtml"
        header="OpenAlex Raw affiliation"
        style={{ maxWidth: '250px' }}
      />
      <Column
        body={rorTemplate}
        field="rorHtml"
        header="ROR computed by OpenAlex"
        sortable
        sortField="rorsNumber"
        style={{ maxWidth: '200px' }}
      />
      <Column
        body={correctionTemplate}
        editor={(options) => cellEditor(options)}
        field="rorsToCorrect"
        header="Click to improve / edit RORs"
        style={{ maxWidth: '190px' }}
      />
      <Column
        bodyStyle={{ textAlign: 'center' }}
        headerStyle={{ width: '10%', minWidth: '8rem' }}
        rowEditor
        style={{ maxWidth: '80px' }}
      />
      <Column
        body={(rowData) => hasCorrectionTemplate(rowData, undo)}
        field="hasCorrection"
        header="Modified by user?"
        sortable
        style={{ maxWidth: '115px' }}
      />
      <Column
        body={worksExampleTemplate}
        field="worksExamples"
        header="Works"
        sortable
        sortField="worksNumber"
        style={{ maxWidth: '150px' }}
      />
    </DataTable>
  );
}

DataTableView.propTypes = {
  onRowEditComplete: PropTypes.func.isRequired,
  setSelectedOpenAlex: PropTypes.func.isRequired,
  selectedOpenAlex: PropTypes.array.isRequired,
  allAffiliations: PropTypes.array.isRequired,
  undo: PropTypes.func.isRequired,
};
