import { Col, Row, TextInput, Toggle } from '@dataesr/dsfr-plus';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { InputTextarea } from 'primereact/inputtextarea';
import PropTypes from 'prop-types';
import { useState } from 'react';

import useToast from '../hooks/useToast';
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
  filteredAffiliationId,
  filteredAffiliationName,
  setAllOpenalexCorrections,
  setFilteredAffiliationId,
  setFilteredAffiliationName,
}) {
  const [selectionPageOnly, setSelectionPageOnly] = useState(true);

  const cellEditor = (options) => (
    <InputTextarea
      type="text"
      value={options.value}
      onChange={(e) => options.editorCallback(e.target.value)}
    />
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
        data.hasCorrection = true;
        const newCorrections = [];
        allAffiliations
          .filter((aff) => aff.hasCorrection)
          .forEach((aff) => {
            const correction = {
              rawAffiliationString: aff.name,
              rorsInOpenAlex: aff.rors,
              correctedRors: aff.rorsToCorrect,
              worksExample: aff.worksExample,
            };
            newCorrections.push(correction);
          });
        setAllOpenalexCorrections(newCorrections);
      }
    }
  };

  const paginatorLeft = () => (
    <Row>
      <Col xs="2">
        <div className="before-toggle">Select all</div>
      </Col>
      <Col xs="2">
        <Toggle
          checked={selectionPageOnly}
          label="Select page"
          name="Select page only"
          onChange={(e) => setSelectionPageOnly(e.target.checked)}
        />
      </Col>
      <Col xs="4">
        <TextInput
          className="fr-ml-1w"
          hint="Use regex"
          icon="search-line"
          label="Search in affiliations name"
          onChange={(e) => setFilteredAffiliationName(e.target.value)}
          value={filteredAffiliationName}
        />
      </Col>
      <Col xs="4">
        <TextInput
          className="fr-ml-1w"
          hint={(
            <>
              Use regex
              {' '}
              <i>(ex: ^((?!MY_ROR).)*$ to exclude a specific RoR)</i>
            </>
          )}
          icon="search-line"
          label="Search in affiliations RoR"
          onChange={(e) => setFilteredAffiliationId(e.target.value)}
          value={filteredAffiliationId}
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
      rows={100}
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
        header="RoR computed by OpenAlex"
        body={rorTemplate}
        style={{ maxWidth: '200px' }}
      />
      <Column
        field="rorsToCorrect"
        header="Click to improve / edit RoRs"
        body={correctionTemplate}
        style={{ maxWidth: '200px' }}
        editor={(options) => cellEditor(options)}
      />
      <Column
        rowEditor
        headerStyle={{ width: '10%', minWidth: '8rem' }}
        bodyStyle={{ textAlign: 'center' }}
      />
      <Column
        field="hasCorrection"
        header="Modified by user?"
        body={hasCorrectionTemplate}
        style={{ maxWidth: '120px' }}
        sortable
      />
      <Column
        field="worksExamples"
        header="Examples of works"
        body={worksExampleTemplate}
        style={{ maxWidth: '200px' }}
      />
      <Column
        field="worksNumber"
        header="Number of works"
        style={{ maxWidth: '100px' }}
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
  filteredAffiliationId: PropTypes.string.isRequired,
  filteredAffiliationName: PropTypes.string.isRequired,
  setAllOpenalexCorrections: PropTypes.func.isRequired,
  setFilteredAffiliationId: PropTypes.func.isRequired,
  setFilteredAffiliationName: PropTypes.func.isRequired,
};
