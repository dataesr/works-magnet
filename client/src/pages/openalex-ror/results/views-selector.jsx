import { Badge,
  Button,
  Col, Row,
  Modal, ModalContent, ModalFooter, ModalTitle,
} from '@dataesr/dsfr-plus';
import { useState } from 'react';
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
  const [isModalOpen, setIsModalOpen] = useState(false);
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
              checked={selectedOpenAlex.length === allAffiliations.length}
              className="fr-ml-2w"
              onChange={() => {
                if (selectedOpenAlex.length === 0) {
                  setSelectedOpenAlex(allAffiliations);
                } else {
                  setSelectedOpenAlex([]);
                }
              }}
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
              className="fr-mr-1w"
              color="beige-gris-galet"
              icon="filter-line"
              onClick={() => setIsModalOpen((prev) => !prev)}
              size="sm"
            >
              sorts & filters
              {/* TODO: add number of active filters */}
              {/* <Badge
                className="fr-ml-1w"
                color="yellow-tournesol"
              >
                3
              </Badge> */}
            </Button>
            <Button onClick={() => changeView('table')} icon="table-line" size="sm" color="beige-gris-galet" />
            <Button onClick={() => changeView('list')} icon="list-unordered" size="sm" color="beige-gris-galet" />
          </Col>
        </Row>
      </div>
      {searchParams.get('view') === 'table' ? (
        <DataTableView
          allAffiliations={allAffiliations}
          onRowEditComplete={onRowEditComplete}
          selectedOpenAlex={selectedOpenAlex}
          setSelectedOpenAlex={setSelectedOpenAlex}
          undo={undo}
        />
      ) : (
        <ListView
          allAffiliations={allAffiliations}
          selectedOpenAlex={selectedOpenAlex}
          setFilteredAffiliationName={setFilteredAffiliationName}
          setSelectedOpenAlex={setSelectedOpenAlex}
        />
      )}
      <Modal isOpen={isModalOpen} hide={() => setIsModalOpen((prev) => !prev)} size="xl">
        <ModalTitle>
          Sorts & filters
        </ModalTitle>
        <ModalContent>
          Sort on number of ROR id per affiliation - ASC
          <br />
          Sort on number of ROR id per affiliation - DESC
          <br />
          show only affiliations with no ROR id
          <br />
          show only affiliations with corrections
          <br />
          show only affiliations with no corrections
          <br />
          filter by ROR country (multi-select on only present countries)
        </ModalContent>
        <ModalFooter>
          <Button
            color="blue-ecume"
            // disabled={removeList.length === 0 && addList.length === 0}
            onClick={() => {
              // applyActions();
              setIsModalOpen((prev) => !prev);
            }}
            title="Close"
          >
            Apply all
          </Button>
        </ModalFooter>
      </Modal>
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
