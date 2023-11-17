import {
  Button,
  Col,
  Row,
  Select,
} from '@dataesr/react-dsfr';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import TagInput from '../components/tag-input';

const years = ['2010', '2011', '2012', '2013', '2014', '2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023'].map((year) => ({ label: year, value: year }));

export default function Filters({ sendQuery }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentSearchParams, setCurrentSearchParams] = useState({});
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [onInputAffiliationsHandler, setOnInputAffiliationsHandler] = useState(false);

  useEffect(() => {
    if (searchParams.size === 0) {
      setSearchParams({
        affiliations: [],
        endYear: '2021',
        startYear: '2021',
      });
    } else {
      setCurrentSearchParams({
        affiliations: searchParams.getAll('affiliations'),
        endYear: searchParams.get('endYear'),
        startYear: searchParams.get('startYear'),
      });
    }
  }, [searchParams, setSearchParams]);

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
          label="Affiliation raw name"
          message={message}
          messageType={messageType}
          onTagsChange={(affiliations) => setSearchParams({ ...currentSearchParams, affiliations })}
          tags={currentSearchParams.affiliations}
          onInputHandler={setOnInputAffiliationsHandler}
        />
      </Col>
      <Col n="2">
        <Select
          hint="&nbsp;"
          label="Start year"
          options={years}
          selected={currentSearchParams.startYear}
          onChange={(e) => setSearchParams({ ...currentSearchParams, startYear: e.target.value })}
        />
      </Col>
      <Col n="2">
        <Select
          hint="&nbsp;"
          label="End year"
          options={years}
          selected={currentSearchParams.endYear}
          onChange={(e) => setSearchParams({ ...currentSearchParams, endYear: e.target.value })}
        />
      </Col>
      <Col>
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
