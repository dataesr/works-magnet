import {
  Badge,
  Button,
  Checkbox,
  Col,
  Modal, ModalContent, ModalFooter, ModalTitle,
  Row,
  Spinner,
  Text,
} from '@dataesr/dsfr-plus';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';

import getFlagEmoji from '../../../utils/flags';
import RorBadge from '../components/ror-badge';
import RorName from '../components/ror-name';
import WorksList from '../components/works-list';

export default function ListView({
  affiliationsCount,
  filteredAffiliations,
  removeRorFromAddList,
  setFilteredAffiliationName,
  setSelectAffiliations,
  toggleRemovedRor,
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isColorInfoModalOpen, setIsColorInfoModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectSortOnNumberOfRors, setSelectSortOnNumberOfRors] = useState('default');
  const [selectShowAffiliations, setSelectShowAffiliations] = useState('all');
  const [selectRorCountry, setSelectRorCountry] = useState('all');
  const [sortsAndFilters, setSortsAndFilters] = useState({
    sortOnNumberOfRors: 'default',
    showAffiliations: 'all',
    rorCountry: 'all',
  });
  const [sortedOrFilteredAffiliations, setSortedOrFilteredAffiliations] = useState(filteredAffiliations);

  const defineRorColor = [];
  const dsColors = ['green-archipel', 'purple-glycine', 'pink-tuile', 'green-menthe', 'brown-cafe-creme'];
  const rorCount = {};
  sortedOrFilteredAffiliations.forEach((affiliation) => {
    affiliation.rors.forEach((ror) => {
      if (rorCount[ror.rorId]) {
        rorCount[ror.rorId] += 1;
      } else {
        rorCount[ror.rorId] = 1;
      }
    });
  });
  const sortedRor = Object.keys(rorCount).sort((a, b) => rorCount[b] - rorCount[a]);
  defineRorColor.push(...sortedRor.slice(0, 5).map((ror, index) => ({ ror, color: dsColors[index % dsColors.length] })));

  useEffect(() => {
    setIsLoading(true);
    // Deep copy of filteredAffiliations object
    let initialAffiliations = JSON.parse(JSON.stringify(filteredAffiliations));
    if (sortsAndFilters.sortOnNumberOfRors === 'numberASC') {
      initialAffiliations.sort((a, b) => a.rors.length - b.rors.length);
    } else if (sortsAndFilters.sortOnNumberOfRors === 'numberDESC') {
      initialAffiliations.sort((a, b) => b.rors.length - a.rors.length);
    } else if (sortsAndFilters.sortOnNumberOfRors === 'empty') {
      initialAffiliations = initialAffiliations.filter((affiliation) => affiliation.rors.length === 0);
    }

    if (sortsAndFilters.showAffiliations === 'onlyWithCorrections') {
      initialAffiliations = initialAffiliations.filter((affiliation) => affiliation.addList.length > 0 || affiliation.removeList.length > 0);
    } else if (sortsAndFilters.showAffiliations === 'onlyWithNoCorrection') {
      initialAffiliations = initialAffiliations.filter((affiliation) => affiliation.addList.length === 0 && affiliation.removeList.length === 0);
    }

    if (sortsAndFilters.rorCountry !== 'all') {
      initialAffiliations = initialAffiliations.filter((affiliation) => affiliation.rors.some((ror) => ror.rorCountry === sortsAndFilters.rorCountry));
    }

    setSortedOrFilteredAffiliations(initialAffiliations);
    setIsLoading(false);
  }, [filteredAffiliations, sortsAndFilters]);

  return (
    <>
      <div
        className="wm-internal-actions"
        style={{ position: 'sticky', top: '44px', zIndex: 10 }}
      >
        <Row>
          <Col xs="3">
            <Checkbox
              checked={sortedOrFilteredAffiliations.find((affiliation) => !affiliation.selected) === undefined}
              onChange={() => {
                setSelectAffiliations(sortedOrFilteredAffiliations.map((affiliation) => affiliation.id));
              }}
            />
            <span className="wm-text fr-mb-3w fr-ml-6w">
              <Badge color="brown-opera">
                {sortedOrFilteredAffiliations.filter((affiliation) => affiliation.selected)?.length || 0}
              </Badge>
              <i>
                {` selected affiliation${sortedOrFilteredAffiliations.filter((affiliation) => affiliation.selected)?.length === 1 ? '' : 's'} / ${filteredAffiliations.length}`}
              </i>
            </span>
          </Col>
          <Col xs="7">
            <span className="fr-icon-search-line fr-mx-1w" />
            <input
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && search.length > 0) {
                  setFilteredAffiliationName(search);
                }
              }}
              style={{
                border: '1px solid #ced4da',
                borderRadius: '4px',
                padding: '0.375rem 0.75rem',
                width: '600px',
                backgroundColor: 'white',
              }}
              value={search}
            />
            <Button
              aria-label="Search in affiliations"
              className="fr-ml-1w"
              color="blue-ecume"
              disabled={!search.length}
              onClick={() => setFilteredAffiliationName(search)}
              size="sm"
              title="Search in affiliations"
            >
              Search in affiliations
            </Button>
            <Button
              aria-label="Clear search"
              className="fr-ml-1w"
              color="blue-ecume"
              disabled={sortedOrFilteredAffiliations.length === affiliationsCount}
              icon="delete-line"
              onClick={() => { setSearch(''); setFilteredAffiliationName(''); }}
              size="sm"
              style={{ verticalAlign: 'bottom' }}
              title="Clear search"
            />
          </Col>
          <Col xs="2" className="text-right">
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
            <Button
              aria-label="Open colors info modal"
              color="beige-gris-galet"
              onClick={() => setIsColorInfoModalOpen((prev) => !prev)}
              size="sm"
              icon="palette-fill"
            />
            <Modal isOpen={isColorInfoModalOpen} hide={() => setIsColorInfoModalOpen((prev) => !prev)} size="md">
              <ModalTitle>
                Additional information for colors
              </ModalTitle>
              <ModalContent>
                <Text>
                  RORs are grouped, summed and sorted for all the affiliations displayed. A colour is assigned to the most represented
                  <br />
                  <br />
                  A colour is assigned to a single ROR
                  <br />
                  <br />
                  Here is the order of colours from most to least represented
                  <br />
                  <i>Most represented</i>
                  <span
                    className="wm-dot fr-mr-2w fr-ml-1w"
                    style={{
                      backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--green-archipel'),
                    }}
                  />
                  <span
                    className="wm-dot fr-mr-2w"
                    style={{
                      backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--purple-glycine'),
                    }}
                  />
                  <span
                    className="wm-dot fr-mr-2w"
                    style={{
                      backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--pink-tuile'),
                    }}
                  />
                  <span
                    className="wm-dot fr-mr-2w"
                    style={{
                      backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--green-menthe'),
                    }}
                  />
                  <span
                    className="wm-dot fr-mr-2w"
                    style={{
                      backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--brown-cafe-creme'),
                    }}
                  />
                  <span
                    className="wm-dot fr-mr-1w"
                    style={{
                      backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--beige-gris-galet'),
                    }}
                  />
                  <i>Less represented</i>
                </Text>
              </ModalContent>
            </Modal>
          </Col>
        </Row>
      </div>
      {isLoading ? (
        <Spinner size={48} />
      ) : (
        <div>
          <ul className="wm-list">
            {
              sortedOrFilteredAffiliations.map((affiliation) => (
                <li
                  className={affiliation.selected ? 'selected' : ''}
                  key={affiliation.key}
                >
                  <Row>
                    <Col>
                      <div style={{ display: 'inline-flex' }}>
                        <div style={{ display: 'inline-block', width: '20px' }}>
                          <Checkbox
                            checked={affiliation.selected}
                            name="affiliations"
                            onChange={() => setSelectAffiliations([affiliation.id])}
                          />
                          <br />
                          {
                            (affiliation.hasCorrection) && (
                              <span className="fr-icon-warning-fill fr-icon--sm" style={{ color: '#B34000' }} />
                            )
                          }
                        </div>
                        <div className="fr-ml-1w" style={{ display: 'inline-block', maxWidth: '95%' }}>
                          <Text
                            as="span"
                            onClick={() => setSelectAffiliations([affiliation.id])}
                            style={{ cursor: 'pointer' }}
                          >
                            <div dangerouslySetInnerHTML={{ __html: affiliation.nameHtml.replace(' [ source: OpenAlex ]', '') }} />
                          </Text>
                          <WorksList works={affiliation.works} />
                        </div>
                      </div>
                    </Col>
                    <Col md={4}>
                      <table className="wm-table">
                        <tbody>
                          {affiliation.rorsToCorrect.map((rorToCorrect) => (
                            <tr key={`openalex-affiliations-affiliations-${rorToCorrect.rorId}`}>
                              <td>
                                <RorBadge
                                  isRemoved={affiliation.removeList.includes(rorToCorrect.rorId)}
                                  ror={rorToCorrect}
                                  rorColor={defineRorColor.find((item) => item.ror === rorToCorrect.rorId)?.color || 'beige-gris-galet'}
                                  setFilteredAffiliationName={setFilteredAffiliationName}
                                  removeRor={() => toggleRemovedRor(affiliation.id, rorToCorrect.rorId)}
                                />
                                <br />
                                <RorName
                                  isRemoved={affiliation.removeList.includes(rorToCorrect.rorId)}
                                  ror={rorToCorrect}
                                />
                              </td>
                            </tr>
                          ))}
                          {affiliation.addList.map((ror) => (
                            <tr key={`openalex-affiliations-affiliations-${ror.rorId}`}>
                              <td>
                                <RorBadge
                                  ror={ror}
                                  rorColor={defineRorColor.find((item) => item.ror === ror.rorId)?.color || 'beige-gris-galet'}
                                  setFilteredAffiliationName={setFilteredAffiliationName}
                                  removeRor={() => removeRorFromAddList(affiliation.id, ror.rorId)}
                                />
                                <br />
                                <RorName ror={ror} />
                                <Badge
                                  className="fr-ml-1w"
                                  color="blue-cumulus"
                                >
                                  Added
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </Col>
                  </Row>
                </li>
              ))
            }
          </ul>
        </div>
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
                onChange={(e) => setSelectShowAffiliations(e.target.value)}
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
                  [...new Set(filteredAffiliations.flatMap((affiliation) => affiliation.rors.map((ror) => ror.rorCountry)))]
                    .filter((country) => !!country)
                    .sort((a, b) => new Intl.DisplayNames(['en'], { type: 'region' }).of(a).localeCompare(new Intl.DisplayNames(['en'], { type: 'region' }).of(b)))
                    .sort((a, b) => filteredAffiliations.filter((aff) => aff.rors.some((r) => r.rorCountry === b)).length - filteredAffiliations.filter((aff) => aff.rors.some((r) => r.rorCountry === a)).length)
                    .map((country) => (
                      <option
                        key={country}
                        value={country}
                      >
                        {getFlagEmoji(country)}
                        {` ${new Intl.DisplayNames(['en'], { type: 'region' }).of(country)} (${filteredAffiliations.filter((aff) => aff.rors.some((r) => r.rorCountry === country)).length})`}
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

ListView.propTypes = {
  affiliationsCount: PropTypes.number.isRequired,
  filteredAffiliations: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      nameHtml: PropTypes.string.isRequired,
      source: PropTypes.string.isRequired,
      status: PropTypes.string.isRequired,
      works: PropTypes.arrayOf(PropTypes.string).isRequired,
      worksNumber: PropTypes.number.isRequired,
    }),
  ).isRequired,
  removeRorFromAddList: PropTypes.func.isRequired,
  setFilteredAffiliationName: PropTypes.func.isRequired,
  setSelectAffiliations: PropTypes.func.isRequired,
  toggleRemovedRor: PropTypes.func.isRequired,
};
