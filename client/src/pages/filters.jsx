import {
  Badge,
  Button,
  Checkbox,
  Container, Row, Col,
  SegmentedControl, SegmentedElement,
  Select, SelectOption,
  TagGroup, Tag,
  Title,
} from '@dataesr/dsfr-plus';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import Ribbon from '../components/ribbon';
import TagInput from '../components/tag-input';
import useScroll from '../hooks/useScroll';
import { getRorData, isRor } from '../utils/ror';

const {
  VITE_APP_NAME,
  VITE_HEADER_TAG,
  VITE_HEADER_TAG_COLOR,
} = import.meta.env;
const { VITE_APP_TAG_LIMIT } = import.meta.env;

const START_YEAR = 2010;
// Generate an array of objects with all years from START_YEAR
const years = [...Array(new Date().getFullYear() - START_YEAR + 1).keys()].map((year) => (year + START_YEAR).toString()).map((year) => ({ label: year, value: year }));

const normalizeStr = (x) => x.replaceAll(',', ' ').replaceAll('  ', ' ');

export default function Filters({ sendQuery, view }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentSearchParams, setCurrentSearchParams] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const [getRoRChildren, setGetRoRChildren] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [onInputAffiliationsHandler, setOnInputAffiliationsHandler] = useState(false);
  const [tags, setTags] = useState([]);
  const { scrollTop } = useScroll();

  useEffect(() => {
    if (!isSticky && scrollTop > 50) {
      setIsSticky(true);
    } else if (isSticky && scrollTop < 50) {
      setIsSticky(false);
    }
  }, [isSticky, scrollTop]);

  useEffect(() => {
    const getData = async () => {
      if (searchParams.size === 0) { // default values
        setSearchParams({
          affiliations: [],
          datasets: false,
          deletedAffiliations: [],
          endYear: '2023',
          startYear: '2023',
          view,
        });
        setTags([]);
      } else {
        setIsLoading(true);
        const affiliations = searchParams.getAll('affiliations');
        const deletedAffiliations = searchParams.getAll('deletedAffiliations') || [];

        setCurrentSearchParams({
          affiliations,
          datasets: searchParams.get('datasets') === 'true',
          deletedAffiliations,
          endYear: searchParams.get('endYear', '2023'),
          startYear: searchParams.get('startYear', '2023'),
          view: searchParams.get('view', view),
        });

        const queries = affiliations.map((affiliation) => getRorData(affiliation, getRoRChildren));
        let rorNames = await Promise.all(queries);
        rorNames = rorNames.filter((rorName) => !deletedAffiliations.includes(rorName));

        const allTags = [];
        const knownTags = {};
        setMessageType('');
        setMessage('');

        affiliations.forEach((affiliation) => {
          const label = affiliation.replace('https://ror.org/', '').replace('ror.org/', '');
          if (isRor(label)) {
            allTags.push({ disable: label.length < VITE_APP_TAG_LIMIT, label, source: 'user', type: 'rorId' });
          } else {
            allTags.push({ disable: affiliation.length < VITE_APP_TAG_LIMIT, label: affiliation, source: 'user', type: 'affiliationString' });
          }
          knownTags[label.toLowerCase()] = 1;
        });

        rorNames.flat().forEach((rorElt) => {
          if (knownTags[rorElt.rorId.toLowerCase()] === undefined) {
            if (!deletedAffiliations.includes(rorElt.rorId)) {
              allTags.push({ disable: rorElt.rorId.length < VITE_APP_TAG_LIMIT, label: rorElt.rorId, source: 'ror', type: 'rorId' });
              knownTags[rorElt.rorId.toLowerCase()] = 1;
            }
          }

          rorElt.names.forEach((rorName) => {
            if (knownTags[rorName.toLowerCase()] === undefined) {
              if (!deletedAffiliations.includes(rorName)) {
                const isDangerous = rorName.length < 4;
                allTags.push({ disable: rorName.length < VITE_APP_TAG_LIMIT, label: rorName, source: 'ror', type: 'affiliationString', rorId: rorElt.rorId, isDangerous });
                knownTags[rorName.toLowerCase()] = 1;
              }
            }
          });
        });
        setTags(allTags);
        setIsLoading(false);
      }
    };
    getData();
  }, [getRoRChildren, searchParams, setSearchParams, view]);

  const onTagsChange = async (affiliations, deletedAffiliations) => {
    const previousDeleted = currentSearchParams.deletedAffiliations || [];
    setSearchParams({
      ...currentSearchParams,
      affiliations: affiliations.filter((affiliation) => affiliation.source === 'user').map((affiliation) => affiliation.label),
      deletedAffiliations: deletedAffiliations.filter((affiliation) => affiliation.source !== 'user').map((affiliation) => affiliation.label).concat(previousDeleted),
    });
  };

  const checkAndSendQuery = () => {
    if (onInputAffiliationsHandler) {
      setMessageType('error');
      setMessage('Don\'t forget to validate the Affiliations input by pressing the return key.');
      return;
    }
    if (currentSearchParams.affiliations.length === 0) {
      setMessageType('error');
      setMessage('You must provide at least one affiliation.');
      return;
    }
    setMessageType('');
    setMessage('');
    const queryParams = { ...currentSearchParams };
    queryParams.affiliationStrings = tags.filter((tag) => !tag.disable && tag.type === 'affiliationString').map((tag) => normalizeStr(tag.label));
    queryParams.rors = tags.filter((tag) => !tag.disable && tag.type === 'rorId').map((tag) => tag.label);
    if (queryParams.affiliationStrings.length === 0 && queryParams.rors.length === 0) {
      setMessageType('error');
      setMessage(`You must provide at least one affiliation longer than ${VITE_APP_TAG_LIMIT} letters.`);
      return;
    }
    sendQuery(queryParams);
  };

  return (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <>
      {isSticky ? (
        <Container fluid as="section" className="filters fr-my-5w">
          <Row verticalAlign="top" className="fr-p-2w">
            <Ribbon />
            <Col xs="2" offsetXs="1">
              <Title as="h1" look="h6" className="fr-m-0">
                {VITE_APP_NAME}
                <br />
                {VITE_HEADER_TAG && (
                  <Badge
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
                <Col xs="1" className="text-right fr-pr-1w">
                  <Title title="Selected filters" className="fr-icon-filter-line" as="h2" look="h4" />
                </Col>
                <Col>
                  <TagGroup>
                    <Tag color="blue-ecume">
                      {`${currentSearchParams.startYear} - ${currentSearchParams.endYear}`}
                    </Tag>
                    {tags.slice(0, 5).map((tag) => (
                      <Tag color="blue-ecume">
                        {tag.label}
                      </Tag>
                    ))}
                    {(tags.length > 5) && <span>...</span>}
                  </TagGroup>
                </Col>
                <Col className="text-right">
                  <SegmentedControl
                    id="segSelector"
                    name="segSelector"
                    onChange={(e) => setSearchParams({ ...currentSearchParams, view: e.target.value })}
                  >
                    <SegmentedElement
                      checked={currentSearchParams.view === 'openalex'}
                      label="Improve OpenAlex"
                      value="openalex"
                    />
                    <SegmentedElement
                      checked={currentSearchParams.view === 'publications'}
                      label="Find affliliated publications"
                      value="publications"
                    />
                    <SegmentedElement
                      checked={currentSearchParams.view === 'datasets'}
                      label="Find affliated datasets"
                      value="datasets"
                    />
                  </SegmentedControl>
                </Col>
              </Row>
            </Col>
          </Row>
        </Container>
      ) : (
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
                setGetRoRChildren={setGetRoRChildren}
                tags={tags}
              />
            </Col>
            <Col offsetXs="1" className="text-right fr-pl-3w">
              <Row gutters verticalAlign="bottom">
                <Col>
                  <Select
                    aria-label="Select a start year for search"
                    label="Start year"
                    buttonLabel={currentSearchParams.startYear}
                    onChange={(e) => setSearchParams({ ...currentSearchParams, startYear: e.target.value })}
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
                    onChange={(e) => setSearchParams({ ...currentSearchParams, endYear: e.target.value })}
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
                  <Checkbox
                    checked={currentSearchParams?.datasets ?? false}
                    label="Search for datasets only"
                    onChange={(e) => setSearchParams({ ...currentSearchParams, datasets: e.target.checked })}
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
      )}
    </>
  );
}

Filters.propTypes = {
  sendQuery: PropTypes.func.isRequired,
  view: PropTypes.string.isRequired,
};
