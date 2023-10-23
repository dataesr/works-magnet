import {
  Alert,
  Button,
  Col,
  Row,
  Select,
} from '@dataesr/react-dsfr';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import TagInput from '../../components/tag-input';

const years = ['2010', '2011', '2012', '2013', '2014', '2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023'].map((year) => ({ label: year, value: year }));

export default function Filters({ sendQuery }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentSearchParams, setCurrentSearchParams] = useState({});
  const [message, setMessage] = useState('');
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
      setMessage('Don\'t forget to validate the Affiliations input by pressing the return key.');
      return;
    }
    if (currentSearchParams.affiliations.length === 0) {
      setMessage('You must provide at least one affiliation.');
      return;
    }
    setMessage('');
    sendQuery(currentSearchParams);
  };

  return (
    <>
      <Row gutters>
        <Col n="5">
          <TagInput
            hint="At least one of these affiliations should be present, OR operator"
            label="Affiliations (Name, Grid, RNSR, RoR, HAL structId or viaf)"
            onTagsChange={(affiliations) => setSearchParams({ ...currentSearchParams, affiliations })}
            tags={currentSearchParams.affiliations}
            onInputHandler={setOnInputAffiliationsHandler}
          />
        </Col>
      </Row>
      <Row gutters alignItems="bottom">
        <Col n="5">
          <Row gutters>
            <Col>
              <Select label="Start year" options={years} selected={currentSearchParams.startYear} onChange={(e) => setSearchParams({ ...currentSearchParams, startYear: e.target.value })} />
            </Col>
            <Col>
              <Select label="End year" options={years} selected={currentSearchParams.endYear} onChange={(e) => setSearchParams({ ...currentSearchParams, endYear: e.target.value })} />
            </Col>
          </Row>
        </Col>
        <Col className="text-right">
          <Button
            icon="ri-search-line"
            onClick={checkAndSendQuery}
            size="sm"
          >
            Search works
          </Button>
        </Col>
      </Row>
      {
        message && (
          <Row className="fr-mt-1w">
            <Col>
              <Alert type="error" description={message} />
            </Col>
          </Row>
        )
      }
    </>
  );
}

Filters.propTypes = {
  sendQuery: PropTypes.func.isRequired,
};
