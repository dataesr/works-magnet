import {
  Button,
  Checkbox,
  CheckboxGroup,
  Col,
  Icon,
  Row,
  TextInput,
} from '@dataesr/react-dsfr';
import PropTypes from 'prop-types';
import { useState } from 'react';

import TagInput from '../../components/tag-input';

const sources = [{ key: 'bso', label: 'BSO' }, { key: 'openalex', label: 'OpenAlex' }];
const identifiers = ['crossref', 'hal_id', 'datacite'];

export default function Options({ sendQuery }) {
  const [affiliations, setAffiliations] = useState(['Ingénierie-Biologie-Santé Lorraine', 'UMS 2008', 'IBSLOR', 'UMS2008', 'UMS CNRS 2008']);
  const [affiliationsToExclude, setAffiliationsToExclude] = useState([]);
  const [affiliationsToInclude, setAffiliationsToInclude] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [authorsToExclude, setAuthorsToExclude] = useState([]);
  const [dataIdentifiers, setDataIdentifiers] = useState(identifiers);
  const [datasources, setDatasources] = useState(sources);
  const [endYear, setEndYear] = useState(2021);
  const [moreOptions, setMoreOptions] = useState(false);
  const [startYear, setStartYear] = useState(2021);

  const onDatasourcesChange = (key) => {
    if (!datasources.map((datasource) => datasource.key).includes(key)) {
      setDatasources([...datasources, { key, label: key }]);
    } else {
      setDatasources(datasources.filter((datasource) => datasource.key !== key));
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
        <Col n="6">
          <TagInput
            hint="At least one of these affiliations should be present, OR operator"
            label="Affiliations"
            onTagsChange={(tags) => { setAffiliations(tags); }}
            tags={affiliations}
          />
        </Col>
        <Col n="6">
          <TagInput
            hint="At least one of these authors should be present, OR operator. This option won't work on OpenAlex"
            label="Authors"
            onTagsChange={(tags) => { setAuthors(tags); }}
            tags={authors}
          />
        </Col>
      </Row>
      {
        moreOptions && (
          <>
            <Row gutters>
              <Col n="6">
                <TagInput
                  hint="All these affiliations must be present, AND operator"
                  label="Affiliations to include mandatory"
                  onTagsChange={(tags) => { setAffiliationsToInclude(tags); }}
                  tags={affiliationsToInclude}
                />
              </Col>
            </Row>
            <Row gutters>
              <Col n="6">
                <TagInput
                  hint="None of these affiliations msut be present, AND operator"
                  label="Affiliations to exclude"
                  onTagsChange={(tags) => { setAffiliationsToExclude(tags); }}
                  tags={affiliationsToExclude}
                />
              </Col>
              <Col n="6">
                <TagInput
                  hint="None of these authors msut be present, AND operator"
                  label="Authors to exclude"
                  onTagsChange={(tags) => { setAuthorsToExclude(tags); }}
                  tags={authorsToExclude}
                />
              </Col>
            </Row>
          </>
        )
      }
      <Row gutters>
        <Col n="3">
          Datasources:
          <CheckboxGroup isInline>
            {
              sources.map((source) => (
                <Checkbox
                  checked={datasources.map((datasource) => datasource.key).includes(source.key)}
                  key={source.key}
                  label={source.label}
                  onChange={() => onDatasourcesChange(source.key)}
                  size="sm"
                />
              ))
            }
          </CheckboxGroup>
        </Col>
        <Col n="3">
          {
            datasources.map((datasource) => datasource.key).includes('bso') && (
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
        <Col n="3">
          <TextInput label="Start year" onChange={(e) => setStartYear(e.target.value)} value={startYear} />
        </Col>
        <Col n="3">
          <TextInput label="End year" onChange={(e) => setEndYear(e.target.value)} value={endYear} />
        </Col>
      </Row>
      <Row gutters>
        <Col className="text-right">
          <Button
            onClick={() => setMoreOptions(!moreOptions)}
            secondary
            size="sm"
          >
            {moreOptions ? 'Less options' : 'More options'}
          </Button>
          <Button
            onClick={() => sendQuery({
              affiliations,
              affiliationsToExclude,
              affiliationsToInclude,
              authors,
              authorsToExclude,
              dataIdentifiers,
              datasources,
              endYear,
              startYear,
            })}
            size="sm"
          >
            <Icon name="ri-search-line" />
            Search
          </Button>
        </Col>
      </Row>
    </>
  );
}

Options.propTypes = {
  sendQuery: PropTypes.func.isRequired,
};
