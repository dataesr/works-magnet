import { Button, Col, Row, Toggle } from '@dataesr/dsfr-plus';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { InputTextarea } from 'primereact/inputtextarea';
import PropTypes from 'prop-types';
import { useState } from 'react';

import useToast from '../hooks/useToast';
import { getCorrections } from '../utils/openalex';
import { isRor } from '../utils/ror';
import {
  correctionTemplate,
  hasCorrectionTemplate,
  nameTemplate,
  rorTemplate,
  worksExampleTemplate,
} from '../utils/templates';

export default function OpenalexView({
  allAffiliations,
  setAllOpenalexCorrections,
  setFilteredAffiliationName,
  filteredAffiliationName,
}) {
  const [selectionPageOnly, setSelectionPageOnly] = useState(true);

  const cellEditor = (options) => (
    <Row gutters>
      <Col>
        <InputTextarea
          type="text"
          id="mytext"
          value={options.value}
          onChange={(e) => options.editorCallback(e.target.value)}
        />
      </Col>
      <Col>
        <Button
          variant="info"
          size="sm"
          disabled={options.rowData.rors.map((r) => r.rorId).join(';') === options.value}
          icon="delete-line"
          onClick={() => { options.editorCallback(options.rowData.rors.map((r) => r.rorId).join(';')); }}
        >
          UNDO
        </Button>
      </Col>
    </Row>
  );
  const { toast } = useToast();

  const onRowEditComplete = async (edit) => {
    const { data, newData } = edit;
    let isValid = true;
    const newValue = newData.rorsToCorrect.trim();
    if (newValue !== data.rorsToCorrect) {
      newValue.split(';').forEach((x) => {
        if (!isRor(x) && x.length > 0) {
          isValid = false;
          toast({
            description: `${x} is not a valid RoR`,
            id: 'rorError',
            title: 'Invalid RoR identifier',
            toastType: 'error',
          });
        }
      });
      if (isValid) {
        data.rorsToCorrect = newValue;
        if (data.rors.map((r) => r.rorId).join(';') !== newValue) {
          data.hasCorrection = true;
        } else {
          data.hasCorrection = false;
        }
        const newCorrections = getCorrections(allAffiliations);
        setAllOpenalexCorrections(newCorrections);
      }
    }
  };

  const paginatorLeft = () => (
    <Row>
      <Col xs="2">
        <div className="before-toggle">Select all</div>
      </Col>
      <Col xs="3">
        <Toggle
          checked={selectionPageOnly}
          label="Select page"
          name="Select page only"
          onChange={(e) => setSelectionPageOnly(e.target.checked)}
        />
      </Col>
      <Col xs="7">
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
  );

  return (
    <DataTable
      currentPageReportTemplate="{first} to {last} of {totalRecords}"
      dataKey="key"
      editMode="row"
      filterDisplay="row"
      metaKeySelection
      onRowEditComplete={onRowEditComplete}
      paginator
      paginatorLeft={paginatorLeft}
      paginatorPosition="top bottom"
      paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
      rows={50}
      rowsPerPageOptions={[50, 100, 200, 500]}
      scrollable
      selectionPageOnly={selectionPageOnly}
      size="small"
      sortField="worksNumber"
      sortOrder={-1}
      stripedRows
      style={{ fontSize: '14px', lineHeight: '13px' }}
      tableStyle={{ minWidth: '50rem' }}
      value={allAffiliations}
    >
      <Column
        field="nameHtml"
        header="OpenAlex Raw affiliation"
        body={nameTemplate}
        style={{ maxWidth: '250px' }}
      />
      <Column
        field="rorHtml"
        sortField="rorsNumber"
        header="RoR computed by OpenAlex"
        body={rorTemplate}
        style={{ maxWidth: '200px' }}
        sortable
      />
      <Column
        field="rorsToCorrect"
        header="Click to improve / edit RoRs"
        body={correctionTemplate}
        style={{ maxWidth: '190px' }}
        editor={(options) => cellEditor(options)}
      />
      <Column
        rowEditor
        headerStyle={{ width: '10%', minWidth: '8rem' }}
        bodyStyle={{ textAlign: 'center' }}
        style={{ maxWidth: '80px' }}
      />
      <Column
        field="hasCorrection"
        header="Modified by user?"
        body={hasCorrectionTemplate}
        style={{ maxWidth: '110px' }}
        sortable
      />
      <Column
        field="worksExamples"
        sortField="worksNumber"
        header="Works"
        body={worksExampleTemplate}
        style={{ maxWidth: '150px' }}
        sortable
      />
    </DataTable>
  );
}

OpenalexView.propTypes = {
  allAffiliations: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      source: PropTypes.string.isRequired,
      nameHtml: PropTypes.string.isRequired,
      status: PropTypes.string.isRequired,
      works: PropTypes.arrayOf(PropTypes.string).isRequired,
      worksNumber: PropTypes.number.isRequired,
    }),
  ).isRequired,
  setAllOpenalexCorrections: PropTypes.func.isRequired,
  setFilteredAffiliationName: PropTypes.func.isRequired,
  filteredAffiliationName: PropTypes.string.isRequired,
};
