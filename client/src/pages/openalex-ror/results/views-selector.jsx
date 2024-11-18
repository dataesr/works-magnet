import { Button, Col, Row } from '@dataesr/dsfr-plus';

import PropTypes from 'prop-types';
import { useSearchParams } from 'react-router-dom';

import useToast from '../../../hooks/useToast';
import { getAffiliationsCorrections } from '../../../utils/curations';
import { isRor } from '../../../utils/ror';

import ListView from './list-view';
import DataTableView from './datatable-view';

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
          <Col>
            <input
              className="fr-ml-2w"
              type="checkbox"
            />
          </Col>
          <Col xs="8">
            <span className="fr-icon-search-line" />
            <i className="fr-mx-1w">
              Filter results
            </i>
            <input
              onChange={(e) => setFilteredAffiliationName(e.target.value)}
              style={{
                border: '1px solid #ced4da',
                borderRadius: '4px',
                padding: '0.375rem 0.75rem',
                width: '600px',
              }}
              value={filteredAffiliationName}
            />
            <Button
              className=" fr-ml-1w "
              icon="delete-line"
              onClick={() => setFilteredAffiliationName('')}
              size="sm"
              variant="text"
            />

          </Col>
          <Col xs="3" className="text-right">
            <Button
              color="beige-gris-galet"
              icon="filter-line"
              size="sm"
            >
              filters
            </Button>
            <Button onClick={() => changeView('table')} icon="table-line" size="sm" color="beige-gris-galet" />
            <Button onClick={() => changeView('list')} icon="list-unordered" size="sm" color="beige-gris-galet" />
          </Col>
        </Row>
      </div>
      {searchParams.get('view') === 'table' ? (
        <DataTableView
          onRowEditComplete={onRowEditComplete}
          setSelectedOpenAlex={setSelectedOpenAlex}
          selectedOpenAlex={selectedOpenAlex}
          allAffiliations={allAffiliations}
          undo={undo}
        />
      ) : (
        <ListView
          onRowEditComplete={onRowEditComplete}
          setSelectedOpenAlex={setSelectedOpenAlex}
          selectedOpenAlex={selectedOpenAlex}
          setFilteredAffiliationName={setFilteredAffiliationName}
          allAffiliations={allAffiliations}
        />
      )}
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
