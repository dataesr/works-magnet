import {
  Button,
  Checkbox,
  CheckboxGroup,
  Col,
  Row,
  Select,
} from '@dataesr/react-dsfr';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getRorNames } from '../utils/ror';

import TagInput from '../components/tag-input';

const START_YEAR = 2010;
const years = [...Array(new Date().getFullYear() - START_YEAR + 1).keys()].map((year) => (year + START_YEAR).toString()).map((year) => ({ label: year, value: year }));

export default function Filters({ sendQuery }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentSearchParams, setCurrentSearchParams] = useState({});
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [onInputAffiliationsHandler, setOnInputAffiliationsHandler] = useState(false);
  const [tags, setTags] = useState([]);

  useEffect(() => {
    const getData = async () => {
      if (searchParams.size === 0) {
        setSearchParams({
          affiliations: [],
          datasets: false,
          endYear: '2021',
          startYear: '2021',
        });
        setTags([]);
      } else {
        setCurrentSearchParams({
          affiliations: searchParams.getAll('affiliations'),
          datasets: searchParams.get('datasets') === 'true',
          endYear: searchParams.get('endYear'),
          startYear: searchParams.get('startYear'),
        });
        const affiliations = searchParams.getAll('affiliations');
        const queries = affiliations.map((affiliation) => getRorNames(affiliation));
        const rorNames = await Promise.all(queries);
        let allTags = [
          ...affiliations.map((affiliation) => ({ label: affiliation, source: 'user' })),
          ...rorNames.flat().map((name) => ({ label: name, source: 'ror' })),
        ];
        allTags = [...new Map(allTags.map((v) => [v.label.toLowerCase(), v])).values()];
        setTags(allTags);
      }
    };
    getData();
  }, [searchParams, setSearchParams]);

  const onTagsChange = async (affiliations) => {
    setSearchParams({ ...currentSearchParams, affiliations: affiliations.filter((affiliation) => affiliation.source === 'user').map((affiliation) => affiliation.label) });
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
    sendQuery(currentSearchParams);
  };

  return (
    <Row gutters alignItems="top">
      <Col n="5">
        <TagInput
          hint="Press ENTER to search for several terms / expressions. If several, an OR operator is used."
          label="Affiliation name"
          message={message}
          messageType={messageType}
          onTagsChange={onTagsChange}
          tags={tags}
          onInputHandler={setOnInputAffiliationsHandler}
        />
      </Col>
      <Col n="1">
        <Select
          hint="&nbsp;"
          label="Start year"
          options={years}
          selected={currentSearchParams.startYear}
          onChange={(e) => setSearchParams({ ...currentSearchParams, startYear: e.target.value })}
        />
      </Col>
      <Col n="1">
        <Select
          hint="&nbsp;"
          label="End year"
          options={years}
          selected={currentSearchParams.endYear}
          onChange={(e) => setSearchParams({ ...currentSearchParams, endYear: e.target.value })}
        />
      </Col>
      <Col n="2">
        <CheckboxGroup
          hint="&nbsp;"
          legend="&nbsp;"
        >
          <Checkbox
            label="Search for datasets only"
            checked={currentSearchParams?.datasets ?? false}
            onChange={(e) => setSearchParams({ ...currentSearchParams, datasets: e.target.checked })}
          />
        </CheckboxGroup>
      </Col>
      <Col n="2">
        <Button
          icon="ri-search-line"
          onClick={checkAndSendQuery}
        >
          Search works
        </Button>
      </Col>
    </Row>
  );
}

Filters.propTypes = {
  sendQuery: PropTypes.func.isRequired,
};
