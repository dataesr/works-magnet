import {
  Button,
  Col,
  Container,
  Modal,
  ModalContent,
  Row,
  Select,
  SelectOption,
  TextInput,
} from '@dataesr/dsfr-plus';
import { Steps } from 'intro.js-react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

import TagInput from '../../components/tag-input';
import Header from '../../layout/header';
import { cleanRor, getRorData, isRor } from '../../utils/ror';

import 'intro.js/introjs.css';

const { VITE_APP_TAG_LIMIT } = import.meta.env;

const START_YEAR = 2010;
// Generate an array of objects with all years from START_YEAR
const years = [...Array(new Date().getFullYear() - START_YEAR + 1).keys()]
  .map((year) => (year + START_YEAR).toString())
  .map((year) => ({ label: year, value: year }));

export default function OpenalexAffiliationsSearch() {
  const { search } = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [currentSearchParams, setCurrentSearchParams] = useState({});
  const [deletedAffiliations, setDeletedAffiliations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [onInputAffiliationsHandler, setOnInputAffiliationsHandler] = useState(false);
  const [excludedRors, setExcludedRors] = useState('');
  const [searchedAffiliations, setSearchedAffiliations] = useState([]);
  const [tags, setTags] = useState([]);

  const steps = [
    {
      element: '.step-ror-to-add',
      intro: 'Searched affiliations. Can be ROR or string. Press ENTER to validate. OR boolean.',
      position: 'right',
      tooltipClass: 'myTooltipClass',
      highlightClass: 'myHighlightClass',
    },
    {
      element: '.step-ror-to-exclude',
      intro: 'Excluded ROR. Only ROR. Separate by space.',
    },
    {
      element: '.step-year-start',
      intro: 'Filter on publication year between start and end, included',
    },
    {
      element: '.step-search-works',
      intro: '⏳ Finally run the search. It can take a while ',
    },
  ];

  useEffect(() => {
    if (searchParams.size < 4) {
      // Set default params values
      setSearchParams({
        affiliations: searchParams.getAll('affiliations') ?? [],
        deletedAffiliations: searchParams.getAll('deletedAffiliations') ?? [],
        endYear: searchParams.get('endYear') ?? '2023',
        excludedRors: searchParams.get('excludedRors') ?? '',
        getRorChildren: searchParams.get('getRorChildren') ?? '0',
        startYear: searchParams.get('startYear') ?? '2023',
      });
      setTags([]);
    } else {
      setIsLoading(true);
      const affiliations = searchParams.getAll('affiliations') || [];
      const deletedAffiliations1 = searchParams.getAll('deletedAffiliations') || [];
      setCurrentSearchParams({
        affiliations,
        deletedAffiliations: deletedAffiliations1,
        endYear: searchParams.get('endYear') ?? '2023',
        excludedRors: searchParams.get('excludedRors') ?? '',
        getRorChildren: searchParams.get('getRorChildren') ?? '0',
        startYear: searchParams.get('startYear') ?? '2023',
      });
      setExcludedRors(currentSearchParams.excludedRors);
      const newSearchedAffiliations = affiliations.filter(
        (affiliation) => !searchedAffiliations.includes(affiliation),
      );
      if (newSearchedAffiliations.length > 0) {
        setSearchedAffiliations(affiliations);
      }
      const newDeletedAffiliations = deletedAffiliations1.filter(
        (affiliation) => !deletedAffiliations.includes(affiliation),
      )
        + deletedAffiliations.filter(
          (affiliation) => !deletedAffiliations1.includes(affiliation),
        );
      if (newDeletedAffiliations.length > 0) {
        setDeletedAffiliations(deletedAffiliations1);
      }
      setIsLoading(false);
    }
  }, [deletedAffiliations, searchedAffiliations, searchParams, setSearchParams, currentSearchParams.excludedRors]);

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

      const allTags = [];
      const knownTags = {};

      filteredSearchedAffiliation.forEach((affiliation) => {
        const label = cleanRor(affiliation);
        if (isRor(label)) {
          allTags.push({
            isDisabled: false,
            label,
            source: 'user',
            type: 'rorId',
          });
        } else {
          allTags.push({
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
            allTags.push({
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
              allTags.push({
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

      setTags(allTags);
      setIsLoading(false);
    };

    getData();
  }, [currentSearchParams.getRorChildren, deletedAffiliations, searchedAffiliations]);

  const onTagsChange = async (_affiliations, _deletedAffiliations) => {
    const affiliations = _affiliations
      .filter((affiliation) => affiliation.source === 'user')
      .map((affiliation) => affiliation.label);
    const deletedAffiliations1 = [
      ...new Set(
        _deletedAffiliations
          .map((affiliation) => affiliation.label)
          .concat(currentSearchParams.deletedAffiliations || []),
      ),
    ].filter(
      (item) => !_affiliations.map((affiliation) => affiliation.label).includes(item),
    );
    setSearchParams({
      ...currentSearchParams,
      affiliations,
      deletedAffiliations: deletedAffiliations1,
    });
  };

  const checkAndSendQuery = () => {
    if (onInputAffiliationsHandler) {
      setMessageType('error');
      setMessage(
        "Don't forget to validate the Affiliations input by pressing the return key.",
      );
      return;
    }
    if (searchedAffiliations.length === 0) {
      setMessageType('error');
      setMessage('You must provide at least one affiliation.');
      return;
    }
    setMessageType('');
    setMessage('');
    const _searchParams = new URLSearchParams(search);
    _searchParams.set('excludedRors', excludedRors);
    navigate(`/openalex-affiliations/results?${_searchParams.toString()}`);
  };

  const switchGetRorChildren = () => setSearchParams({ ...currentSearchParams, getRorChildren: currentSearchParams.getRorChildren === '1' ? '0' : '1' });

  const removeAllAffiliations = () => {
    setSearchParams({
      ...currentSearchParams,
      affiliations: [],
      deletedAffiliations: [],
    });
    setSearchedAffiliations([]);
  };

  const NB_TAGS_STICKY = 2;
  const tagsDisplayed = tags.slice(0, NB_TAGS_STICKY);

  if (tags.length > NB_TAGS_STICKY) {
    tagsDisplayed.push({ label: '...' });
  }

  return (
    <>
      <Header />
      <Steps
        enabled={true}
        initialStep={0}
        steps={steps}
        onExit={() => {}}
      />
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
                    >
                      {years.map((year) => (
                        <SelectOption
                          color="blue-cumulus"
                          key={year.value}
                          selected={
                            year.value === currentSearchParams.startYear
                          }
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
                    >
                      {years.map((year) => (
                        <SelectOption
                          color="blue-cumulus"
                          key={year.value}
                          selected={
                            year.value === currentSearchParams.startYear
                          }
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
                  message={message}
                  messageType={messageType}
                  onInputHandler={setOnInputAffiliationsHandler}
                  onTagsChange={onTagsChange}
                  removeAllAffiliations={removeAllAffiliations}
                  seeMoreAfter={0}
                  switchGetRorChildren={switchGetRorChildren}
                  tags={tags}
                />
              </Col>
              <Col xs="12">
                <TextInput
                  hint="You can focus on recall issues in OpenAlex (missing ROR). This way, only affiliation strings that are NOT matched in OpenAlex to this specific ROR will be retrieved. If several ROR to exclude, separate them by space."
                  label="ROR to exclude: exclude affiliation strings already mapped to a specific ROR in OpenAlex"
                  onChange={(e) => setExcludedRors(e.target.value)}
                  value={excludedRors}
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
      <Container as="section" className="filters fr-my-5w">
        <Row className="fr-pt-2w fr-pr-2w fr-pb-0 fr-pl-2w">
          <Col className="step-ror-to-add" xs="8">
            <TagInput
              getRorChildren={currentSearchParams.getRorChildren === '1'}
              hint="Press ENTER to search for several terms / expressions. If several, an OR operator is used."
              isLoading={isLoading}
              isRequired
              label="Affiliation name, ROR of your institution"
              message={message}
              messageType={messageType}
              onInputHandler={setOnInputAffiliationsHandler}
              onTagsChange={onTagsChange}
              removeAllAffiliations={removeAllAffiliations}
              seeMoreAction={(e) => {
                setIsOpen(true);
                e.preventDefault();
              }}
              switchGetRorChildren={switchGetRorChildren}
              tags={tags}
            />
          </Col>
          <Col offsetXs="1" className="text-right fr-pl-3w">
            <Row gutters verticalAlign="bottom">
              <Col className="step-year-start">
                <Select
                  aria-label="Select a start year for search"
                  buttonLabel={currentSearchParams.startYear}
                  label="Start year"
                  onSelectionChange={(startYear) => setSearchParams({ ...currentSearchParams, startYear })}
                >
                  {years.map((year) => (
                    <SelectOption
                      color="blue-cumulus"
                      key={year.value}
                      selected={year.value === currentSearchParams.startYear}
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
                >
                  {years.map((year) => (
                    <SelectOption
                      color="blue-cumulus"
                      key={year.value}
                      selected={year.value === currentSearchParams.startYear}
                    >
                      {year.label}
                    </SelectOption>
                  ))}
                </Select>
              </Col>
            </Row>
          </Col>
        </Row>
        <Row className="fr-pt-0 fr-pr-2w fr-pb-2w fr-pl-2w">
          <Col className="step-ror-to-exclude" xs="8">
            <TextInput
              hint="You can focus on recall issues in OpenAlex (missing ROR). This way, only affiliation strings that are NOT matched in OpenAlex to this specific ROR will be retrieved. If several ROR to exclude, separate them by space."
              label="ROR to exclude: exclude affiliation strings already mapped to a specific ROR in OpenAlex"
              onChange={(e) => {
                setExcludedRors(e.target.value);
              }}
              value={excludedRors}
            />
          </Col>
          <Col offsetXs="1" className="fr-pl-3w step-search-works text-right">
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
    </>
  );
}
