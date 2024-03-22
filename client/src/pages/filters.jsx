import {
  Badge,
  Button,
  Checkbox,
  CheckboxGroup,
  Col,
  Icon,
  Row,
  Select,
  Tag,
} from '@dataesr/react-dsfr';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import TagInput from '../components/tag-input';
import useScroll from '../hooks/useScroll';
import { getRorData, isRor } from '../utils/ror';

const { VITE_APP_TAG_LIMIT } = import.meta.env;

const START_YEAR = 2010;
const years = [...Array(new Date().getFullYear() - START_YEAR + 1).keys()].map((year) => (year + START_YEAR).toString()).map((year) => ({ label: year, value: year }));

const normalizeStr = (x) => x.replaceAll(',', ' ').replaceAll('  ', ' ');
export default function Filters({ sendQuery }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentSearchParams, setCurrentSearchParams] = useState({});
  const [isSticky, setIsSticky] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [onInputAffiliationsHandler, setOnInputAffiliationsHandler] = useState(false);
  const [tags, setTags] = useState([]);
  const [getRoRChildren, setGetRoRChildren] = useState(false);
  const { scrollTop } = useScroll();

  useEffect(() => {
    const filters = document.querySelector('.filters');
    const heightFilters = filters.getBoundingClientRect().height;

    if (scrollTop > heightFilters - 100) {
      document.querySelector('html').classList.add('filters-sticky');
      setIsSticky(true);
    } else {
      document.querySelector('html').classList.remove('filters-sticky');
      setIsSticky(false);
    }
  }, [scrollTop]);

  useEffect(() => {
    const getData = async () => {
      if (searchParams.size === 0) {
        setSearchParams({
          affiliations: [],
          deletedAffiliations: [],
          datasets: false,
          endYear: '2023',
          startYear: '2023',
        });
        setTags([]);
      } else {
        setCurrentSearchParams({
          affiliations: searchParams.getAll('affiliations'),
          deletedAffiliations: searchParams.getAll('deletedAffiliations'),
          datasets: searchParams.get('datasets') === 'true',
          endYear: searchParams.get('endYear', '2023'),
          startYear: searchParams.get('startYear', '2023'),
        });
        const affiliations = searchParams.getAll('affiliations');
        const deletedAffiliations = searchParams.getAll('deletedAffiliations') || [];
        const queries = affiliations.map((affiliation) => getRorData(affiliation, getRoRChildren));
        let rorNames = await Promise.all(queries);
        rorNames = rorNames.filter((aff) => !deletedAffiliations.includes(aff));
        const allTags = [];
        const knownTags = {};
        setMessageType('');
        setMessage('');
        affiliations.forEach((affiliation) => {
          if (isRor(affiliation)) {
            const label = affiliation.replace('https://ror.org/', '').replace('ror.org/', '');
            allTags.push({ disable: label.length < VITE_APP_TAG_LIMIT, label, source: 'user', type: 'rorId' });
          } else {
            allTags.push({ disable: affiliation.length < VITE_APP_TAG_LIMIT, label: affiliation, source: 'user', type: 'affiliationString' });
          }
          knownTags[affiliation.toLowerCase()] = 1;
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
      }
    };
    getData();
  }, [searchParams, setSearchParams, getRoRChildren]);

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
    // TO REVIEW
    queryParams.affiliationStrings = tags.filter((tag) => !tag.disable && tag.type === 'affiliationString').map((tag) => normalizeStr(tag.label)).slice(0, 100);
    queryParams.rors = tags.filter((tag) => !tag.disable && tag.type === 'rorId').map((tag) => tag.label).slice(0, 100);
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
        <Row alignItems="top">
          <Col n="2">
            Filters :
          </Col>
          <Col n="2">
            <Badge
              colorFamily="brown-cafe-creme"
              text={currentSearchParams.startYear}
            />
            <span className="fr-mx-1w">-</span>
            <Badge
              colorFamily="brown-cafe-creme"
              text={currentSearchParams.endYear}
            />
          </Col>
          <Col n="2">
            {tags.map((tag) => (
              <Badge
                colorFamily="brown-cafe-creme"
                isSmall
                key={tag.label}
                text={tag.label}
              />
            ))}
          </Col>
        </Row>
      ) : (
        <Row gutters alignItems="top" className="fr-p-5w">
          <Col n="2">
            <Select
              label="Start year"
              onChange={(e) => setSearchParams({ ...currentSearchParams, startYear: e.target.value })}
              options={years}
              selected={currentSearchParams.startYear}
            />
          </Col>
          <Col n="2">
            <Select
              label="End year"
              onChange={(e) => setSearchParams({ ...currentSearchParams, endYear: e.target.value })}
              options={years}
              selected={currentSearchParams.endYear}
            />
          </Col>
          <Col n="3">
            <CheckboxGroup
              legend="&nbsp;"
            >
              <Checkbox
                checked={currentSearchParams?.datasets ?? false}
                label="Search for datasets only"
                onChange={(e) => setSearchParams({ ...currentSearchParams, datasets: e.target.checked })}
              />
            </CheckboxGroup>
          </Col>
          <Col n="5">
            <Button
              icon="ri-search-line"
              onClick={checkAndSendQuery}
            >
              Search works
            </Button>
          </Col>
          <Col n="12">
            <TagInput
              getRoRChildren={getRoRChildren}
              hint="Press ENTER to search for several terms / expressions. If several, an OR operator is used."
              label="Affiliation name, RoR identifier"
              message={message}
              messageType={messageType}
              onInputHandler={setOnInputAffiliationsHandler}
              onTagsChange={onTagsChange}
              setGetRoRChildren={setGetRoRChildren}
              tags={tags}
            />
          </Col>
        </Row>
      )}
    </>
  );
}

Filters.propTypes = {
  sendQuery: PropTypes.func.isRequired,
};
