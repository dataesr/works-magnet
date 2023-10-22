import {
  Alert,
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

import TagInput from '../../components/tag-input';

const identifiers = ['crossref', 'hal_id', 'datacite'];
const sources = [{ key: 'bso', label: 'French OSM' }, { key: 'openalex', label: 'OpenAlex' }];
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
        dataIdentifiers: identifiers,
        datasources: sources.map((source) => source.key),
        endYear: '2021',
        startYear: '2021',
      });
    } else {
      setCurrentSearchParams({
        affiliations: searchParams.getAll('affiliations'),
        dataIdentifiers: searchParams.getAll('dataIdentifiers'),
        datasources: searchParams.getAll('datasources'),
        endYear: searchParams.get('endYear'),
        startYear: searchParams.get('startYear'),
      });
    }
  }, [searchParams, setSearchParams]);

  const onIdentifiersChange = (label) => {
    const { dataIdentifiers } = currentSearchParams;
    if (dataIdentifiers.includes(label)) {
      setSearchParams({ ...currentSearchParams, dataIdentifiers: dataIdentifiers.filter((item) => item !== label) });
    } else {
      setSearchParams({ ...currentSearchParams, dataIdentifiers: [...dataIdentifiers, label] });
    }
  };

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
        <Col n="3">
          {
            currentSearchParams?.datasources && currentSearchParams.datasources.includes('bso') && (
              <>
                BSO Identifiers:
                <CheckboxGroup isInline>
                  {
                    identifiers.map((identifier) => (
                      <Checkbox
                        checked={currentSearchParams.dataIdentifiers.includes(identifier)}
                        key={identifier}
                        label={identifier}
                        onChange={() => onIdentifiersChange(identifier)}
                        size="sm"
                      />
                    ))
                  }
                </CheckboxGroup>
              </>
            )
          }
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
