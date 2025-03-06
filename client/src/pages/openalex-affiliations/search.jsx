import {
  Breadcrumb,
  Button,
  Col,
  Container,
  Link,
  Modal,
  ModalContent,
  Row,
  Select,
  SelectOption,
} from '@dataesr/dsfr-plus';
import introJs from 'intro.js';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

import TagInput from '../../components/tag-input';
import Header from '../../layout/header';
import { cleanRor, getRorData, isRor } from '../../utils/ror';

import 'intro.js/introjs.css';

const { VITE_APP_DEFAULT_YEAR, VITE_APP_TAG_LIMIT } = import.meta.env;
const START_YEAR = 1850;

// Generate an array of objects with all years from START_YEAR
const years = [...Array(new Date().getFullYear() - Number(START_YEAR) + 1).keys()]
  .sort((a, b) => b - a)
  .map((year) => (year + Number(START_YEAR)).toString())
  .map((year) => ({ label: year, value: year }));

export default function Search() {
  const { search } = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [currentSearchParams, setCurrentSearchParams] = useState({});
  const [deletedAffiliations, setDeletedAffiliations] = useState([]);
  const [excludedMessage, setExcludedMessage] = useState('');
  const [excludedMessageType, setExcludedMessageType] = useState('');
  const [excludedRors, setExcludedRors] = useState([]);
  const [excludedTags, setExcludedTags] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [onInputAffiliationsHandler, setOnInputAffiliationsHandler] = useState(false);
  const [searchedAffiliations, setSearchedAffiliations] = useState([]);
  const [searchedMessage, setSearchedMessage] = useState('');
  const [searchedMessageType, setSearchedMessageType] = useState('');
  const [searchedTags, setSearchedTags] = useState([]);

  const NB_TAGS_STICKY = 2;
  const searchedTagsDisplayed = searchedTags.slice(0, NB_TAGS_STICKY);

  const checkAndSendQuery = () => {
    if (onInputAffiliationsHandler) {
      setSearchedMessageType('error');
      setSearchedMessage(
        "Don't forget to validate the Affiliations input by pressing the return key.",
      );
      return;
    }
    if (searchedAffiliations.length === 0) {
      setSearchedMessageType('error');
      setSearchedMessage('You must provide at least one affiliation.');
      return;
    }
    setSearchedMessageType('');
    setSearchedMessage('');
    const _searchParams = new URLSearchParams(search);
    navigate(`/openalex-affiliations/results?${_searchParams.toString()}`);
  };

  const clearSearch = () => {
    setSearchParams({
      affiliations: [],
      deletedAffiliations: [],
      endYear: VITE_APP_DEFAULT_YEAR,
      excludedRors: [],
      getRorChildren: '0',
      startYear: VITE_APP_DEFAULT_YEAR,
    });
    setSearchedAffiliations([]);
    setExcludedRors([]);
  };

  const onExcludedTagsChange = (tags) => {
    setExcludedMessage('');
    setExcludedMessageType('');
    const _excludedRors = tags
      .filter((tag) => tag.source === 'user')
      .map((tag) => cleanRor(tag.label))
      .filter((tag) => {
        if (isRor(tag)) {
          return true;
        }
        setExcludedMessage('Please add a correct ROR');
        setExcludedMessageType('error');
        return false;
      });
    setSearchParams({
      ...currentSearchParams,
      excludedRors: _excludedRors,
    });
  };

  const onSearchedTagsChange = async (tags, _deletedAffiliations) => {
    const affiliations = tags
      .filter((tag) => tag.source === 'user')
      .map((tag) => tag.label);
    const deletedAffiliations1 = [
      ...new Set(
        _deletedAffiliations
          .map((affiliation) => affiliation.label)
          .concat(currentSearchParams.deletedAffiliations || []),
      ),
    ].filter(
      (item) => !tags.map((tag) => tag.label).includes(item),
    );
    setSearchParams({
      ...currentSearchParams,
      affiliations,
      deletedAffiliations: deletedAffiliations1,
    });
  };

  const switchGetRorChildren = () => setSearchParams({ ...currentSearchParams, getRorChildren: currentSearchParams.getRorChildren === '1' ? '0' : '1' });

  useEffect(() => {
    if (searchParams.size < 3) {
      // Set default params values
      setSearchParams({
        affiliations: searchParams.getAll('affiliations') ?? [],
        deletedAffiliations: searchParams.getAll('deletedAffiliations') ?? [],
        endYear: searchParams.get('endYear') ?? VITE_APP_DEFAULT_YEAR,
        excludedRors: searchParams.getAll('excludedRors') ?? [],
        getRorChildren: searchParams.get('getRorChildren') ?? '0',
        startYear: searchParams.get('startYear') ?? VITE_APP_DEFAULT_YEAR,
      });
      setSearchedTags([]);
      setExcludedTags([]);
    } else {
      setIsLoading(true);
      const affiliations = searchParams.getAll('affiliations') || [];
      const _deletedAffiliations = searchParams.getAll('deletedAffiliations') || [];
      const _excludedRors = searchParams.getAll('excludedRors') || [];
      setCurrentSearchParams({
        affiliations,
        deletedAffiliations: _deletedAffiliations,
        endYear: searchParams.get('endYear') ?? VITE_APP_DEFAULT_YEAR,
        excludedRors: _excludedRors,
        getRorChildren: searchParams.get('getRorChildren') ?? '0',
        startYear: searchParams.get('startYear') ?? VITE_APP_DEFAULT_YEAR,
      });
      const newSearchedAffiliations = affiliations.filter(
        (affiliation) => !searchedAffiliations.includes(affiliation),
      );
      if (newSearchedAffiliations.length > 0) {
        setSearchedAffiliations(affiliations);
      }
      const newDeletedAffiliations = _deletedAffiliations.filter(
        (affiliation) => !deletedAffiliations.includes(affiliation),
      )
        + deletedAffiliations.filter(
          (affiliation) => !_deletedAffiliations.includes(affiliation),
        );
      if (newDeletedAffiliations.length > 0) {
        setDeletedAffiliations(_deletedAffiliations);
      }
      const newExcludedRors = _excludedRors.filter((ror) => !excludedRors.includes(ror))
        + excludedRors.filter((ror) => !_excludedRors.includes(ror));
      if (newExcludedRors.length > 0) {
        setExcludedRors(_excludedRors);
      }
      setIsLoading(false);
    }
  }, [deletedAffiliations, excludedRors, searchedAffiliations, searchParams, setSearchParams]);

  useEffect(() => {
    const getData = async () => {
      setIsLoading(true);
      const filteredSearchedAffiliation = searchedAffiliations.filter(
        (affiliation) => !deletedAffiliations.includes(affiliation),
      );
      const queries = filteredSearchedAffiliation.map((affiliation) => getRorData(affiliation, currentSearchParams.getRorChildren === '1'));
      let rorNames = await Promise.all(queries);
      rorNames = rorNames.filter(
        (rorName) => !deletedAffiliations.includes(rorName),
      );

      const knownTags = {};
      const searchedTagsTmp = [];

      filteredSearchedAffiliation.forEach((affiliation) => {
        const label = cleanRor(affiliation);
        if (isRor(label)) {
          searchedTagsTmp.push({
            isDisabled: false,
            label,
            source: 'user',
            type: 'rorId',
          });
        } else {
          searchedTagsTmp.push({
            isDisabled: affiliation.length < VITE_APP_TAG_LIMIT,
            label: affiliation,
            source: 'user',
            type: 'affiliationString',
          });
        }
        knownTags[label.toLowerCase()] = 1;
      });

      rorNames.flat().forEach((rorElt) => {
        if (knownTags[rorElt.rorId.toLowerCase()] === undefined) {
          if (!deletedAffiliations.includes(rorElt.rorId)) {
            searchedTagsTmp.push({
              isDisabled: false,
              label: rorElt.rorId,
              source: 'ror',
              type: 'rorId',
            });
            knownTags[rorElt.rorId.toLowerCase()] = 1;
          }
        }

        rorElt.names.forEach((rorName) => {
          if (knownTags[rorName.toLowerCase()] === undefined) {
            if (!deletedAffiliations.includes(rorName)) {
              const isDangerous = rorName.length < 4;
              searchedTagsTmp.push({
                isDisabled: rorName.length < VITE_APP_TAG_LIMIT,
                isDangerous,
                label: rorName,
                rorId: rorElt.rorId,
                source: 'ror',
                type: 'affiliationString',
              });
              knownTags[rorName.toLowerCase()] = 1;
            }
          }
        });
      });

      const excludedTagsTmp = excludedRors.map((excludedRor) => ({
        isDisabled: false,
        label: excludedRor,
        source: 'user',
        type: 'excludedRor',
      }));
      setSearchedTags(searchedTagsTmp);
      setExcludedTags(excludedTagsTmp);
      setIsLoading(false);
    };

    getData();
  }, [currentSearchParams.getRorChildren, deletedAffiliations, excludedRors, searchedAffiliations]);

  useEffect(() => {
    introJs().setOptions({
      dontShowAgain: true,
      dontShowAgainCookie: 'introjs-dontShowAgain-search',
      showStepNumbers: true,
      steps: [
        {
          element: document.querySelector('.step-ror-to-add'),
          intro: '<ul><li>Searched affiliations</li><li>Can be either ROR or string</li><li>Press ENTER to search for several terms / expressions.</li><li>If several, an OR operator is used.</li></ul>',
          title: 'Tutorial',
        },
        {
          element: document.querySelector('.step-ror-to-exclude'),
          intro: '<ul><li>ROR to exclude</li><li>ROR only</li><li>Press ENTER to search for several terms / expressions.</li><li>If several, an OR operator is used.</li></ul>',
          title: 'Tutorial',
        },
        {
          element: document.querySelector('.step-year-start'),
          intro: 'Filter on publication year between start and end',
          title: 'Tutorial',
        },
        {
          element: document.querySelector('.step-search-works'),
          intro: 'Click here to run the search. ⏳ It can take a while',
          title: 'Tutorial',
        },
      ],
    }).start();
    document.getElementById('introjs-dontShowAgain')?.click();
  }, []);

  if (searchedTags.length > NB_TAGS_STICKY) {
    searchedTagsDisplayed.push({ label: '...' });
  }

  return (
    <div style={{ minHeight: '700px' }}>
      <Header />
      <Modal isOpen={isOpen} hide={() => setIsOpen(false)} size="xl">
        <ModalContent>
          <Container as="section" className="filters fr-my-5w">
            <Row className="fr-p-2w">
              <Col xs="12" className="fr-pb-3w">
                <Row gutters verticalAlign="bottom">
                  <Col>
                    <Select
                      aria-label="Select a start year for search"
                      buttonLabel={currentSearchParams.startYear}
                      label="Start year"
                      onSelectionChange={(startYear) => setSearchParams({ ...currentSearchParams, startYear })}
                      selectedKey={currentSearchParams.startYear}
                    >
                      {years.map((year) => (
                        <SelectOption
                          color="blue-cumulus"
                          key={year.value}
                        >
                          {year.label}
                        </SelectOption>
                      ))}
                    </Select>
                  </Col>
                  <Col>
                    <Select
                      aria-label="Select an end year for search"
                      buttonLabel={currentSearchParams.endYear}
                      label="End year"
                      onSelectionChange={(endYear) => setSearchParams({ ...currentSearchParams, endYear })}
                      selectedKey={currentSearchParams.endYear}
                    >
                      {years.map((year) => (
                        <SelectOption
                          color="blue-cumulus"
                          key={year.value}
                        >
                          {year.label}
                        </SelectOption>
                      ))}
                    </Select>
                  </Col>
                </Row>
              </Col>
              <Col xs="12">
                <TagInput
                  getRorChildren={currentSearchParams.getRorChildren === '1'}
                  hint="Press ENTER to search for several terms / expressions. If several, an OR operator is used."
                  isLoading={isLoading}
                  isRequired
                  label="Affiliation name, ROR of your institution"
                  message={searchedMessage}
                  messageType={searchedMessageType}
                  onInputHandler={setOnInputAffiliationsHandler}
                  onTagsChange={onSearchedTagsChange}
                  seeMoreAfter={0}
                  switchGetRorChildren={switchGetRorChildren}
                  tags={searchedTags}
                />
              </Col>
              <Col xs="12">
                <TagInput
                  hint={(
                    <div>
                      You can focus on recall issues in OpenAlex (missing ROR). This way, only affiliation strings that are NOT matched in OpenAlex to this specific ROR will be retrieved.
                      <br />
                      Press ENTER to search for several terms / expressions. If several, an OR operator is used.
                    </div>
                  )}
                  label="ROR to exclude: exclude affiliation strings already mapped to a specific ROR in OpenAlex"
                  message={excludedMessage}
                  messageType={excludedMessageType}
                  onTagsChange={onExcludedTagsChange}
                  tags={excludedTags}
                />
              </Col>
              <Col xs="12">
                <Button
                  className="fr-mt-2w"
                  disabled={searchParams.getAll('affiliations').length === 0}
                  icon="search-line"
                  onClick={checkAndSendQuery}
                >
                  Search works
                </Button>
              </Col>
            </Row>
          </Container>
        </ModalContent>
      </Modal>
      <Container>
        <Breadcrumb className="fr-pt-4w fr-mt-0 fr-mb-2w">
          <Link href="/">
            Home
          </Link>
          <Link current>
            Search raw affiliations and ROR in OpenAlex
          </Link>
        </Breadcrumb>
      </Container>
      <Container as="section" className="filters fr-my-5w">
        <Row className="fr-pt-2w fr-pr-2w fr-pb-0 fr-pl-2w">
          <Col className="step-ror-to-add" xs={12} md={8}>
            <TagInput
              getRorChildren={currentSearchParams.getRorChildren === '1'}
              hint="Press ENTER to search for several terms / expressions. If several, an OR operator is used."
              isLoading={isLoading}
              isRequired
              label="Affiliation name, ROR of your institution"
              message={searchedMessage}
              messageType={searchedMessageType}
              onInputHandler={setOnInputAffiliationsHandler}
              onTagsChange={onSearchedTagsChange}
              seeMoreAction={(e) => {
                setIsOpen(true);
                e.preventDefault();
              }}
              switchGetRorChildren={switchGetRorChildren}
              tags={searchedTags}
            />
          </Col>
          <Col offsetMd="1" className="fr-mt-4w" style={{ minHeight: '180px' }}>
            <Row gutters verticalAlign="bottom">
              <Col className="step-year-start">
                <Select
                  aria-label="Select a start year for search"
                  buttonLabel={currentSearchParams.startYear}
                  label="Start year"
                  onSelectionChange={(startYear) => setSearchParams({ ...currentSearchParams, startYear })}
                  selectedKey={currentSearchParams.startYear}
                >
                  {years.map((year) => (
                    <SelectOption
                      color="blue-cumulus"
                      key={year.value}
                    >
                      {year.label}
                    </SelectOption>
                  ))}
                </Select>
              </Col>
              <Col>
                <Select
                  aria-label="Select an end year for search"
                  buttonLabel={currentSearchParams.endYear}
                  label="End year"
                  onSelectionChange={(endYear) => setSearchParams({ ...currentSearchParams, endYear })}
                  selectedKey={currentSearchParams.endYear}
                >
                  {years.map((year) => (
                    <SelectOption
                      color="blue-cumulus"
                      key={year.value}
                    >
                      {year.label}
                    </SelectOption>
                  ))}
                </Select>
              </Col>
            </Row>
          </Col>
        </Row>
        <Row className="fr-p-2w fr-pt-0" style={{ minHeight: '150px' }}>
          <Col className="step-ror-to-exclude" xs={12} md={8}>
            <TagInput
              hint={(
                <div>
                  You can focus on recall issues in OpenAlex (missing ROR). This way, only affiliation strings that are NOT matched in OpenAlex to this specific ROR will be retrieved.
                  <br />
                  Press ENTER to search for several terms / expressions. If several, an OR operator is used.
                </div>
              )}
              label="ROR to exclude: exclude affiliation strings already mapped to a specific ROR in OpenAlex"
              message={excludedMessage}
              messageType={excludedMessageType}
              onTagsChange={onExcludedTagsChange}
              tags={excludedTags}
            />
          </Col>
        </Row>
        <Row>
          <Col className="fr-pl-3w fr-my-3w step-search-works text-right">
            <Button
              aria-label="Clear search"
              className="fr-mr-md-1w"
              disabled={searchParams.getAll('affiliations').length === 0 && searchParams.getAll('excludedRors').length === 0}
              icon="delete-line"
              onClick={clearSearch}
              title="Clear search"
            >
              Clear search
            </Button>
            <Button
              aria-label="Search affiliations"
              disabled={searchParams.getAll('affiliations').length === 0}
              icon="search-line"
              onClick={checkAndSendQuery}
              title="Search affiliations"
            >
              Search affiliations
            </Button>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
