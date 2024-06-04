import {
  Badge,
  Button,
  Checkbox,
  Col,
  Container,
  Modal,
  ModalContent,
  Row,
  SegmentedControl,
  SegmentedElement,
  Select,
  SelectOption,
  Tag,
  TagGroup,
  Title,
} from '@dataesr/dsfr-plus';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import Ribbon from '../components/ribbon';
import TagInput from '../components/tag-input';
import { getRorData, isRor } from '../utils/ror';

const {
  VITE_APP_NAME,
  VITE_APP_TAG_LIMIT,
  VITE_HEADER_TAG,
  VITE_HEADER_TAG_COLOR,
} = import.meta.env;

const START_YEAR = 2010;
// Generate an array of objects with all years from START_YEAR
const years = [...Array(new Date().getFullYear() - START_YEAR + 1).keys()]
  .map((year) => (year + START_YEAR).toString())
  .map((year) => ({ label: year, value: year }));

const normalizeStr = (x) => x.replaceAll(',', ' ').replaceAll('  ', ' ');

export default function Filters({
  isFetched,
  isSticky,
  sendQuery,
  setIsSticky,
}) {
  const [searchParams, setSearchParams] = useSearchParams();

  const [currentSearchParams, setCurrentSearchParams] = useState({});
  const [deletedAffiliations, setDeletedAffiliations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [getRoRChildren, setGetRoRChildren] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [onInputAffiliationsHandler, setOnInputAffiliationsHandler] = useState(false);
  const [searchedAffiliations, setSearchedAffiliations] = useState([]);
  const [tags, setTags] = useState([]);

  useEffect(() => {
    const getData = async () => {
      if (searchParams.size === 0) {
        // default values
        setSearchParams({
          affiliations: [],
          datasets: false,
          deletedAffiliations: [],
          endYear: '2023',
          startYear: '2023',
          view: '',
        });
        setTags([]);
      } else {
        setIsLoading(true);
        const affiliations = searchParams.getAll('affiliations') || [];
        const deletedAffiliations1 = searchParams.getAll('deletedAffiliations') || [];

        setCurrentSearchParams({
          affiliations,
          datasets: searchParams.get('datasets') === 'true',
          deletedAffiliations: deletedAffiliations1,
          endYear: searchParams.get('endYear', '2023'),
          startYear: searchParams.get('startYear', '2023'),
          view: searchParams.get('view', ''),
        });

        const newSearchedAffiliations = affiliations.filter(
          (affiliation) => !searchedAffiliations.includes(affiliation),
        );
        if (newSearchedAffiliations.length > 0) {
          setSearchedAffiliations(affiliations);
        }
        const newDeletedAffiliations = deletedAffiliations1.filter(
          (affiliation) => !deletedAffiliations.includes(affiliation),
        );
        if (newDeletedAffiliations.length > 0) {
          setDeletedAffiliations(deletedAffiliations1);
        }

        setIsLoading(false);
      }
    };
    getData();
  }, [deletedAffiliations, getRoRChildren, searchedAffiliations, searchParams, setSearchParams]);

  useEffect(() => {
    const getData = async () => {
      setIsLoading(true);
      const queries = searchedAffiliations.map((affiliation) => getRorData(affiliation, getRoRChildren));
      let rorNames = await Promise.all(queries);
      rorNames = rorNames.filter(
        (rorName) => !deletedAffiliations.includes(rorName),
      );

      const allTags = [];
      const knownTags = {};

      searchedAffiliations.forEach((affiliation) => {
        const label = affiliation
          .replace('https://ror.org/', '')
          .replace('ror.org/', '');
        if (isRor(label)) {
          allTags.push({
            disable: label.length < VITE_APP_TAG_LIMIT,
            label,
            source: 'user',
            type: 'rorId',
          });
        } else {
          allTags.push({
            disable: affiliation.length < VITE_APP_TAG_LIMIT,
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
              disable: rorElt.rorId.length < VITE_APP_TAG_LIMIT,
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
                disable: rorName.length < VITE_APP_TAG_LIMIT,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deletedAffiliations, getRoRChildren, searchedAffiliations]);

  // eslint-disable-next-line no-shadow
  const onTagsChange = async (affiliations, deletedAffiliations) => {
    const previousDeleted = currentSearchParams.deletedAffiliations || [];
    setSearchParams({
      ...currentSearchParams,
      affiliations: affiliations
        .filter((affiliation) => affiliation.source === 'user')
        .map((affiliation) => affiliation.label),
      deletedAffiliations: deletedAffiliations
        .filter((affiliation) => affiliation.source !== 'user')
        .map((affiliation) => affiliation.label)
        .concat(previousDeleted),
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
    const queryParams = { ...currentSearchParams };
    queryParams.affiliationStrings = tags
      .filter((tag) => !tag.disable && tag.type === 'affiliationString')
      .map((tag) => normalizeStr(tag.label));
    queryParams.rors = tags
      .filter((tag) => !tag.disable && tag.type === 'rorId')
      .map((tag) => tag.label);
    if (
      queryParams.affiliationStrings.length === 0
      && queryParams.rors.length === 0
    ) {
      setMessageType('error');
      setMessage(
        `You must provide at least one affiliation longer than ${VITE_APP_TAG_LIMIT} letters.`,
      );
      return;
    }
    sendQuery(queryParams);
    setIsOpen(false);
    setIsSticky(true);
  };

  const NB_TAGS_STICKY = 2;
  const tagsDisplayed = tags.slice(0, NB_TAGS_STICKY);

  if (tags.length > NB_TAGS_STICKY) {
    tagsDisplayed.push({ label: '...' });
  }

  return (
    <>
      {isSticky ? (
        <Container fluid as="section" className="filters sticky">
          <Row verticalAlign="top" className="fr-p-1w">
            <Ribbon />
            <Col
              xs="2"
              className="cursor-pointer"
              offsetXs="1"
              onClick={() => setIsSticky(false)}
            >
              <Title as="h1" look="h6" className="fr-m-0">
                {VITE_APP_NAME}
                {VITE_HEADER_TAG && (
                  <Badge
                    className="fr-ml-1w"
                    color={VITE_HEADER_TAG_COLOR}
                    size="sm"
                  >
                    {VITE_HEADER_TAG}
                  </Badge>
                )}
              </Title>
            </Col>
            <Col>
              <Row>
                <Col
                  className="cursor-pointer"
                  onClick={(e) => {
                    setIsOpen(true);
                    e.preventDefault();
                  }}
                >
                  <TagGroup>
                    <Tag color="blue-ecume" key="tag-sticky-years" size="sm">
                      {`${currentSearchParams.startYear} - ${currentSearchParams.endYear}`}
                    </Tag>
                    {tagsDisplayed.map((tag) => (
                      <Tag
                        color="blue-ecume"
                        key={`tag-sticky-${tag.label}`}
                        size="sm"
                      >
                        {tag.label}
                      </Tag>
                    ))}
                  </TagGroup>
                </Col>
                <Col className="text-right">
                  <SegmentedControl
                    id="segSelector"
                    name="segSelector"
                    onChangeValue={(view) => setSearchParams({ ...currentSearchParams, view })}
                  >
                    <SegmentedElement
                      checked={currentSearchParams.view === 'openalex'}
                      label="Improve OpenAlex (RoRs)"
                      value="openalex"
                    />
                    <SegmentedElement
                      checked={currentSearchParams.view === 'publications'}
                      label="Publications corpus"
                      value="publications"
                    />
                    <SegmentedElement
                      checked={currentSearchParams.view === 'datasets'}
                      label="Datasets corpus"
                      value="datasets"
                    />
                  </SegmentedControl>
                </Col>
              </Row>
            </Col>
          </Row>
        </Container>
      ) : (
        <>
          <Container as="section" className="filters fr-my-5w">
            <Row className="fr-p-2w">
              <Col xs="8">
                <TagInput
                  getRoRChildren={getRoRChildren}
                  hint="Press ENTER to search for several terms / expressions. If several, an OR operator is used."
                  isLoading={isLoading}
                  label="Affiliation name, RoR identifier"
                  message={message}
                  messageType={messageType}
                  onInputHandler={setOnInputAffiliationsHandler}
                  onTagsChange={onTagsChange}
                  seeMoreAction={(e) => {
                    setIsOpen(true);
                    e.preventDefault();
                  }}
                  setGetRoRChildren={setGetRoRChildren}
                  tags={tags}
                />
              </Col>
              <Col offsetXs="1" className="text-right fr-pl-3w">
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
                  <Col>
                    <Checkbox
                      checked={currentSearchParams?.datasets ?? false}
                      label="Search for datasets only"
                      onChange={(e) => setSearchParams({
                        ...currentSearchParams,
                        datasets: e.target.checked,
                      })}
                    />
                  </Col>
                </Row>
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
          {isFetched && false && (
            <Container as="section" className="fr-my-3w">
              <Row>
                <Col style={{ textAlign: 'center' }}>
                  <SegmentedControl
                    id="segSelector"
                    name="segSelector"
                    onChangeValue={(view) => setSearchParams({ ...currentSearchParams, view })}
                  >
                    <SegmentedElement
                      checked={currentSearchParams.view === 'openalex'}
                      label="1.Improve RoR matching in OpenAlex"
                      value="openalex"
                    />
                    <SegmentedElement
                      checked={currentSearchParams.view === 'publications'}
                      label="Publications corpus"
                      value="publications"
                    />
                    <SegmentedElement
                      checked={currentSearchParams.view === 'datasets'}
                      label="Datasets corpus"
                      value="datasets"
                    />
                  </SegmentedControl>
                </Col>
              </Row>
            </Container>
          )}
        </>
      )}
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
                  <Col>
                    <Checkbox
                      checked={currentSearchParams?.datasets ?? false}
                      label="Search for datasets only"
                      onChange={(e) => setSearchParams({
                        ...currentSearchParams,
                        datasets: e.target.checked,
                      })}
                    />
                  </Col>
                </Row>
              </Col>
              <Col xs="12">
                <TagInput
                  getRoRChildren={getRoRChildren}
                  hint="Press ENTER to search for several terms / expressions. If several, an OR operator is used."
                  isLoading={isLoading}
                  label="Affiliation name, RoR identifier"
                  message={message}
                  messageType={messageType}
                  onInputHandler={setOnInputAffiliationsHandler}
                  onTagsChange={onTagsChange}
                  seeMoreAfter={0}
                  setGetRoRChildren={setGetRoRChildren}
                  tags={tags}
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
    </>
  );
}

Filters.propTypes = {
  isFetched: PropTypes.bool.isRequired,
  isSticky: PropTypes.bool.isRequired,
  sendQuery: PropTypes.func.isRequired,
  setIsSticky: PropTypes.func.isRequired,
};
