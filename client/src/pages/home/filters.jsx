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

import TagInput from '../../components/tag-input';

const identifiers = ['crossref', 'hal_id', 'datacite'];
const sources = [{ key: 'bso', label: 'BSO' }, { key: 'openalex', label: 'OpenAlex' }];
const years = ['2010', '2011', '2012', '2013', '2014', '2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023'].map((year) => ({ label: year, value: year }));

export default function Filters({ sendQuery }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [affiliations, setAffiliations] = useState(searchParams.size ? searchParams.getAll('affiliations') : ['Ingénierie-Biologie-Santé Lorraine', 'UMS 2008', 'IBSLOR', 'UMS2008', 'UMS CNRS 2008']);
  const [affiliationsToExclude, setAffiliationsToExclude] = useState(searchParams.size ? searchParams.getAll('affiliationsToExclude') : []);
  const [affiliationsToInclude, setAffiliationsToInclude] = useState(searchParams.size ? searchParams.getAll('affiliationsToInclude') : []);
  const [authors, setAuthors] = useState(searchParams.size ? searchParams.getAll('authors') : []);
  const [authorsToExclude, setAuthorsToExclude] = useState(searchParams.size ? searchParams.getAll('authorsToExclude') : []);
  const [dataIdentifiers, setDataIdentifiers] = useState(searchParams.size ? searchParams.getAll('dataIdentifiers') : identifiers);
  const [datasources, setDatasources] = useState(searchParams.size ? searchParams.getAll('datasources') : sources.map((source) => source.key));
  const [endYear, setEndYear] = useState(searchParams.size ? searchParams.getAll('endYear')?.[0] : '2021');
  const [moreOptions, setMoreOptions] = useState(searchParams.size ? searchParams.getAll('moreOptions')?.[0] === 'true' : false);
  const [startYear, setStartYear] = useState(searchParams.size ? searchParams.getAll('startYear')?.[0] : '2021');

  useEffect(() => {
    setSearchParams({
      affiliations,
      affiliationsToExclude,
      affiliationsToInclude,
      authors,
      authorsToExclude,
      dataIdentifiers,
      datasources,
      endYear,
      moreOptions,
      startYear,
    });
  }, [affiliations, affiliationsToExclude, affiliationsToInclude, authors, authorsToExclude, dataIdentifiers, datasources, endYear, moreOptions, setSearchParams, startYear]);

  const onDatasourcesChange = (key) => {
    if (datasources.includes(key)) {
      setDatasources(datasources.filter((datasource) => datasource !== key));
    } else {
      setDatasources([...datasources, key]);
    }
  };
  const onIdentifiersChange = (label) => {
    if (!dataIdentifiers.includes(label)) {
      setDataIdentifiers([...dataIdentifiers, label]);
    } else {
      setDataIdentifiers(dataIdentifiers.filter((item) => item !== label));
    }
  };

  return (
    <>
      <Row gutters>
        <Col n="5">
          <TagInput
            hint="Name, Grid, RNSR, RoR, HAL structId or viaf. At least one of these affiliations should be present, OR operator"
            label="Affiliations"
            onTagsChange={(tags) => { setAffiliations(tags); }}
            tags={affiliations}
          />
        </Col>
        <Col n="5">
          <TagInput
            hint="At least one of these authors should be present, OR operator. BSO database only"
            label="Authors"
            onTagsChange={(tags) => { setAuthors(tags); }}
            tags={authors}
          />
        </Col>
        <Col n="2" className="fr-pt-4w">
          Datasources:
          <CheckboxGroup>
            {
              sources.map((source) => (
                <Checkbox
                  checked={datasources.includes(source.key)}
                  key={source.key}
                  label={source.label}
                  onChange={() => onDatasourcesChange(source.key)}
                  size="sm"
                />
              ))
            }
          </CheckboxGroup>
        </Col>
      </Row>
      {
        moreOptions && (
          <>
            <Row gutters>
              <Col n="5">
                <TagInput
                  hint="All these affiliations must be present, AND operator"
                  label="Affiliations to include mandatory"
                  onTagsChange={(tags) => { setAffiliationsToInclude(tags); }}
                  tags={affiliationsToInclude}
                />
              </Col>
              <Col n="5">
                <TagInput
                  hint="None of these authors must be present, AND operator"
                  label="Authors to exclude"
                  onTagsChange={(tags) => { setAuthorsToExclude(tags); }}
                  tags={authorsToExclude}
                />
              </Col>
            </Row>
            <Row gutters>
              <Col n="5">
                <TagInput
                  hint="None of these affiliations must be present, AND operator"
                  label="Affiliations to exclude"
                  onTagsChange={(tags) => { setAffiliationsToExclude(tags); }}
                  tags={affiliationsToExclude}
                />
              </Col>
            </Row>
          </>
        )
      }
      <Row gutters alignItems="bottom">
        <Col n="5">
          <Row gutters>
            <Col>
              <Select label="Start year" options={years} selected={startYear} onChange={(e) => setStartYear(e.target.value)} />
            </Col>
            <Col>
              <Select label="End year" options={years} selected={endYear} onChange={(e) => setEndYear(e.target.value)} />
            </Col>
          </Row>
        </Col>
        {
          moreOptions && (
            <Col n="3">
              {
                datasources.includes('bso') && (
                  <>
                    BSO Identifiers:
                    <CheckboxGroup isInline>
                      {
                        identifiers.map((identifier) => (
                          <Checkbox
                            checked={dataIdentifiers.includes(identifier)}
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
          )
        }

        <Col className="text-right">
          <Button
            onClick={() => setMoreOptions(!moreOptions)}
            secondary
            size="sm"
            icon="ri-filter-line"
          >
            {moreOptions ? 'Less filters' : 'More filters'}
          </Button>
          <Button
            icon="ri-search-line"
            onClick={() => sendQuery({
              affiliations,
              affiliationsToExclude,
              affiliationsToInclude,
              authors,
              authorsToExclude,
              dataIdentifiers,
              datasources,
              endYear,
              moreOptions,
              startYear,
            })}
            size="sm"
          >
            Search
          </Button>
        </Col>
      </Row>
    </>
  );
}

Filters.propTypes = {
  sendQuery: PropTypes.func.isRequired,
};
