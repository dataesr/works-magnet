import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import PropTypes from 'prop-types';

import { hasCorrectionTemplate, nameTemplate, rorTemplate, worksExampleTemplate } from '../utils/templates';

export default function OpenalexView({
  allAffiliations,
  setAllOpenalexCorrections,
}) {
  const cellEditor = (options) => {
    const a = 1;
    return <InputTextarea type="text" value={options.value} onChange={(e) => options.editorCallback(e.target.value)} />;
  };
  const onCellEditComplete = async (e) => {
    const { rowData, column, newValue, field, originalEvent: event } = e;
    if (newValue !== rowData[field]) {
      rowData[field] = newValue;
      rowData.hasCorrection = true;
      const newCorrections = [];
      allAffiliations.filter((aff) => aff.hasCorrection).forEach((aff) => {
        const correction = { rawAffiliationString: aff.name, rorsInOpenAlex: aff.rors, correctedRors: aff.rorsToCorrect, worksExample: aff.worksExample };
        newCorrections.push(correction);
      });
      setAllOpenalexCorrections(newCorrections);
    }
  };

  return (
    <DataTable
      currentPageReportTemplate="{first} to {last} of {totalRecords}"
      dataKey="key"
      filterDisplay="row"
      metaKeySelection
      paginator
      paginatorPosition="top bottom"
      paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks  NextPageLink LastPageLink RowsPerPageDropdown"
      rows={200}
      rowsPerPageOptions={[50, 200, 1000, 5000]}
      scrollable
      scrollHeight="600px"
      size="small"
      sortField="worksNumber"
      sortOrder={-1}
      stripedRows
      style={{ fontSize: '11px', lineHeight: '10px' }}
      tableStyle={{ minWidth: '50rem' }}
      value={allAffiliations}
      editMode="cell"
    >
      <Column field="nameHtml" header="Raw affiliation" body={nameTemplate} style={{ maxWidth: '250px' }} />
      <Column field="rorHtml" header="RoR computed by OpenAlex" body={rorTemplate} style={{ maxWidth: '200px' }} />
      <Column field="rorsToCorrect" header="RoRs to correct" style={{ maxWidth: '200px' }} editor={(options) => cellEditor(options)} onCellEditComplete={onCellEditComplete} />
      <Column field="hasCorrection" header="Corrected ?" body={hasCorrectionTemplate} style={{ maxWidth: '100px' }} sortable />
      <Column field="worksExamples" header="Examples of works" body={worksExampleTemplate} style={{ maxWidth: '200px' }} />
      <Column field="worksNumber" header="Number of works" style={{ maxWidth: '100px' }} sortable />
    </DataTable>
  );
}

OpenalexView.propTypes = {
  allAffiliations: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.isRequired,
    source: PropTypes.string.isRequired,
    nameHtml: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    works: PropTypes.arrayOf(PropTypes.string).isRequired,
    worksNumber: PropTypes.number.isRequired,
  })).isRequired,
  setAllOpenalexCorrections: PropTypes.func.isRequired,
};
