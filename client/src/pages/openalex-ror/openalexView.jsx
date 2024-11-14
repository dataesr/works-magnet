import { Button, Col, Row } from '@dataesr/dsfr-plus';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { InputTextarea } from 'primereact/inputtextarea';
import PropTypes from 'prop-types';
import { useSearchParams } from 'react-router-dom';

import useToast from '../../hooks/useToast';
import { getAffiliationsCorrections } from '../../utils/curations';
import { isRor } from '../../utils/ror';
import {
  correctionTemplate,
  hasCorrectionTemplate,
  nameTemplate,
  rorTemplate,
  worksExampleTemplate,
} from '../../utils/templates';

export default function OpenalexView({
  allAffiliations,
  filteredAffiliationName,
  selectedOpenAlex,
  setAllOpenalexCorrections,
  setFilteredAffiliationName,
  setSelectedOpenAlex,
  undo,
}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();

  const cellEditor = (options) => (
    <InputTextarea
      id="editor-ror"
      onChange={(e) => options.editorCallback(e.target.value)}
      type="text"
      value={options.value}
    />
  );

  const changeView = (view) => {
    searchParams.set('view', view);
    setSearchParams(searchParams);
  };

  const onRowEditComplete = async (edit) => {
    const { data, newData } = edit;
    let isValid = true;
    const newValue = newData.rorsToCorrect.trim();
    if (newValue !== data.rorsToCorrect) {
      newValue.split(';').forEach((x) => {
        if (!isRor(x) && x.length > 0) {
          isValid = false;
          toast({
            description: `"${x}" is not a valid ROR`,
            id: 'rorError',
            title: 'Invalid ROR identifier',
            toastType: 'error',
          });
        }
      });
      if (isValid) {
        const rorsToCorrect = [...new Set(newValue.split(';'))].join(';');
        data.rorsToCorrect = rorsToCorrect;
        data.hasCorrection = data.rors.map((r) => r.rorId).join(';') !== rorsToCorrect;
        setAllOpenalexCorrections(getAffiliationsCorrections(allAffiliations));
      }
    }
  };

  return (
    <>
      <div className="wm-internal-actions">
        <Row>
          <Col xs="1">
            <Button onClick={() => changeView('table')} icon="table-line" size="sm" color="beige-gris-galet" />
            <Button onClick={() => changeView('list')} icon="list-unordered" size="sm" color="beige-gris-galet" />
          </Col>
          <Col xs="5">
            <i className="fr-icon-search-line fr-mr-1w" />
            Search in affiliations name
            <input
              className="fr-ml-1w"
              onChange={(e) => setFilteredAffiliationName(e.target.value)}
              style={{
                border: '1px solid #ced4da',
                borderRadius: '4px',
                padding: '0.375rem 0.75rem',
                width: '100%',
              }}
              value={filteredAffiliationName}
            />
          </Col>
        </Row>
      </div>
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
    </>
  );
}

OpenalexView.propTypes = {
  allAffiliations: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      nameHtml: PropTypes.string.isRequired,
      source: PropTypes.string.isRequired,
      status: PropTypes.string.isRequired,
      works: PropTypes.arrayOf(PropTypes.string).isRequired,
      worksNumber: PropTypes.number.isRequired,
    }),
  ).isRequired,
  filteredAffiliationName: PropTypes.string.isRequired,
  selectedOpenAlex: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      nameHtml: PropTypes.string.isRequired,
      source: PropTypes.string.isRequired,
      status: PropTypes.string.isRequired,
      works: PropTypes.arrayOf(PropTypes.string).isRequired,
      worksNumber: PropTypes.number.isRequired,
    }),
  ).isRequired,
  setAllOpenalexCorrections: PropTypes.func.isRequired,
  setFilteredAffiliationName: PropTypes.func.isRequired,
  setSelectedOpenAlex: PropTypes.func.isRequired,
  undo: PropTypes.func.isRequired,
};
