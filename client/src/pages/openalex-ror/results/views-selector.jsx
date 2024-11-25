import { Badge,
  Button,
  Col, Row,
  Modal, ModalContent, ModalFooter, ModalTitle,
  ButtonGroup,
} from '@dataesr/dsfr-plus';
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSearchParams } from 'react-router-dom';

import useToast from '../../../hooks/useToast';
import { getAffiliationsCorrections } from '../../../utils/curations';
import { isRor } from '../../../utils/ror';

import ListView from './list-view';
import DataTableView from './datatable-view';
import getFlagEmoji from '../../../utils/flags';

export default function OpenalexView({
  allAffiliations,
  allOpenalexCorrections,
  filteredAffiliationName,
  selectedOpenAlex,
  setAllOpenalexCorrections,
  setFilteredAffiliationName,
  setSelectedOpenAlex,
  undo,
}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectSortOnNumberOfRors, setSelectSortOnNumberOfRors] = useState('default');
  const [selectShowAffiliations, setSelectShowAffiliations] = useState('all');
  const [selectRorCountry, setSelectRorCountry] = useState('all');

  const [sortsAndFilters, setSortsAndFilters] = useState({
    sortOnNumberOfRors: 'default',
    showAffiliations: 'all',
    rorCountry: 'all',
  });
  const [sortedOrFilteredAffiliations, setSortedOrFilteredAffiliations] = useState(allAffiliations);
  const { toast } = useToast();

  useEffect(() => {
    // Deep copy of allAffiliations object
    const initialAffiliations = JSON.parse(JSON.stringify(allAffiliations));
    if (sortsAndFilters.sortOnNumberOfRors === 'default') {
      setSortedOrFilteredAffiliations(initialAffiliations);
    }
    if (sortsAndFilters.sortOnNumberOfRors === 'numberASC') {
      setSortedOrFilteredAffiliations(initialAffiliations.sort((a, b) => a.rors.length - b.rors.length));
    }
    if (sortsAndFilters.sortOnNumberOfRors === 'numberDESC') {
      setSortedOrFilteredAffiliations(initialAffiliations.sort((a, b) => b.rors.length - a.rors.length));
    }
    if (sortsAndFilters.sortOnNumberOfRors === 'empty') {
      setSortedOrFilteredAffiliations(initialAffiliations.filter((affiliation) => affiliation.rors.length === 0));
    }
    if (sortsAndFilters.showAffiliations === 'all') {
      setSortedOrFilteredAffiliations(initialAffiliations);
    }
    if (sortsAndFilters.showAffiliations === 'onlyWithCorrections') {
      setSortedOrFilteredAffiliations(initialAffiliations.filter((affiliation) => affiliation.hasCorrection));
    }
    if (sortsAndFilters.showAffiliations === 'onlyWithNoCorrection') {
      setSortedOrFilteredAffiliations(initialAffiliations.filter((affiliation) => !affiliation.hasCorrection));
    }
    if (sortsAndFilters.rorCountry === 'all') {
      setSortedOrFilteredAffiliations(initialAffiliations);
    }
    if (sortsAndFilters.rorCountry !== 'all') {
      setSortedOrFilteredAffiliations(initialAffiliations.filter((affiliation) => affiliation.rors.some((ror) => ror.rorCountry === sortsAndFilters.rorCountry)));
    }
  }, [allAffiliations, sortsAndFilters]);

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
        setAllOpenalexCorrections([...allOpenalexCorrections, ...getAffiliationsCorrections(allAffiliations)]);
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
            <span className="fr-icon-search-line fr-mx-1w" />
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
              aria-label="Sorts & filters"
              className="fr-mr-1w"
              color="beige-gris-galet"
              icon="filter-line"
              onClick={() => setIsModalOpen((prev) => !prev)}
              size="sm"
              title="Sorts & filters"
            >
              Sorts & filters
              <Badge
                className="fr-ml-1w"
                color="green-bourgeon"
              >
                {Object.values(sortsAndFilters).filter((value) => value !== 'default' && value !== 'all').length}
              </Badge>
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
          allAffiliations={sortedOrFilteredAffiliations}
          allOpenalexCorrections={allOpenalexCorrections}
          selectedOpenAlex={selectedOpenAlex}
          setFilteredAffiliationName={setFilteredAffiliationName}
          setSelectedOpenAlex={setSelectedOpenAlex}
        />
      )}
      <Modal isOpen={isModalOpen} hide={() => setIsModalOpen((prev) => !prev)} size="md">
        <ModalTitle>
          Sorts & filters
        </ModalTitle>
        <ModalContent>
          <div className="fr-select-group fr-mt-7w">
            <label className="fr-label" htmlFor="select-sort-on-number-of-rors">
              Sort on number of ROR
              <select
                className="fr-select"
                id="select-sort-on-number-of-rors"
                onChange={(e) => {
                  setSelectSortOnNumberOfRors(e.target.value);
                }}
                value={selectSortOnNumberOfRors}
              >
                <option value="" disabled hidden>Select an option</option>
                <option value="default">Default</option>
                <option value="numberASC">Ascending</option>
                <option value="numberDESC">Descending</option>
                <option value="empty">No ROR detected</option>
              </select>
            </label>
          </div>

          <div className="fr-select-group fr-mt-7w">
            <label className="fr-label" htmlFor="select-show-affiliations">
              Filter on affiliations corrections
              <select
                className="fr-select"
                id="select-show-affiliations"
                onChange={(e) => {
                  setSelectShowAffiliations(e.target.value);
                }}
                value={selectShowAffiliations}
              >
                <option value="all">All affiliations</option>
                <option value="onlyWithCorrections">Only those with corrections</option>
                <option value="onlyWithNoCorrection">Only those without corrections</option>
              </select>
            </label>
          </div>

          <div className="fr-select-group fr-mt-7w">
            <label className="fr-label" htmlFor="select-ror-country">
              Filter by ROR country
              <select
                className="fr-select"
                id="select-ror-country"
                onChange={(e) => {
                  setSelectRorCountry(e.target.value);
                }}
                value={selectRorCountry}
              >
                <option value="all">All countries</option>
                {
                  [...new Set(allAffiliations.flatMap((affiliation) => affiliation.rors.map((ror) => ror.rorCountry)))]
                    .sort((a, b) => allAffiliations.filter((aff) => aff.rors.some((r) => r.rorCountry === b)).length - allAffiliations.filter((aff) => aff.rors.some((r) => r.rorCountry === a)).length)
                    .map((country) => (
                      <option
                        key={country}
                        value={country}
                      >
                        {getFlagEmoji(country)}
                        {` ${new Intl.DisplayNames(['en'], { type: 'region' }).of(country)} (${allAffiliations.filter((aff) => aff.rors.some((r) => r.rorCountry === country)).length})`}
                      </option>
                    ))
                }
              </select>
            </label>
          </div>
        </ModalContent>
        <ModalFooter style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            onClick={() => {
              setSelectSortOnNumberOfRors('default');
              setSelectShowAffiliations('all');
              setSelectRorCountry('all');
            }}
          >
            Reset to default
          </Button>

          <Button
            onClick={() => {
              setSortsAndFilters({
                sortOnNumberOfRors: selectSortOnNumberOfRors,
                showAffiliations: selectShowAffiliations,
                rorCountry: selectRorCountry,
              });
              setIsModalOpen((prev) => !prev);
            }}
          >
            Apply & close
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
  allOpenalexCorrections: PropTypes.array.isRequired,
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
