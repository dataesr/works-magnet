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

const sources = ['bso', 'openalex'];
const identifiers = ['Crossref', 'HAL', 'Datacite'];

export default function Filters({
  sendQuery,
}) {
  const [viewMoreFilters, setViewMoreFilters] = useState(false);
  const [datasources, setDatasources] = useState(sources);
  const [dataidentifiers, setDataIdentifiers] = useState(identifiers);
  const [affiliations, setAffiliations] = useState(['Ingénierie-Biologie-Santé Lorraine', 'UMS 2008', 'IBSLOR', 'UMS2008', 'UMS CNRS 2008']);
  const [affiliationsToExclude, setAffiliationsToExclude] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [authorsToExclude, setAuthorsToExclude] = useState([]);
  const [startYear, setStartYear] = useState();
  const [endYear, setEndYear] = useState();

  const onCheckBoxChange = (label) => {
    if (!datasources.includes(label)) {
      setDatasources([...datasources, label]);
    } else {
      setDatasources(datasources.filter((item) => item !== label));
    }
  };
  const onCheckBoxChangeIdentifier = (label) => {
    if (!dataidentifiers.includes(label)) {
      setDataIdentifiers([...dataidentifiers, label]);
    } else {
      setDataIdentifiers(dataidentifiers.filter((item) => item !== label));
    }
  };
  return (
    <>
      <Row alignItems="bottom">
        <Col className="text-right">
          <Button
            onClick={() => setViewMoreFilters(!viewMoreFilters)}
            secondary
            size="sm"
          >
            More filters
          </Button>
        </Col>
      </Row>
      <TagInput
        hint=""
        label="Affiliations"
        onTagsChange={(tags) => { setAffiliations(tags); }}
        tags={affiliations}
      />
      {
        viewMoreFilters && (
          <TagInput
            hint=""
            label="Affiliations to exclude"
            onTagsChange={(tags) => { setAffiliationsToExclude(tags); }}
            tags={affiliationsToExclude}
          />
        )
      }
      <TagInput
        hint=""
        label="Authors"
        onTagsChange={(tags) => { setAuthors(tags); }}
        tags={authors}
      />
      {
        viewMoreFilters && (
          <TagInput
            hint=""
            label="Authors to exclude"
            onTagsChange={(tags) => { setAuthorsToExclude(tags); }}
            tags={authorsToExclude}
          />
        )
      }
      <Row gutters alignItems="bottom">
        <Col n="4">
          <CheckboxGroup isInline>
            Datasources:
            {
              sources.map((source) => (
                <Checkbox
                  checked={datasources.includes(source)}
                  key={source}
                  label={source}
                  onChange={() => onCheckBoxChange(source)}
                  size="sm"
                />
              ))
            }
          </CheckboxGroup>
        </Col>
      </Row>
      <Row gutters alignItems="bottom">
        <Col n="4">
          <CheckboxGroup isInline>
            Idenfiers:
            {
              identifiers.map((identifier) => (
                <Checkbox
                  checked={dataidentifiers.includes(identifier)}
                  key={identifier}
                  label={identifier}
                  onChange={() => onCheckBoxChangeIdentifier(identifier)}
                  size="sm"
                />
              ))
            }
          </CheckboxGroup>
        </Col>
      </Row>
      <Row>
        {
          viewMoreFilters && (
            <>
              <Col>
                <TextInput label="Start year" onChange={(e) => setStartYear(e.target.value)} value={startYear} />
              </Col>
              <Col>
                <TextInput label="End year" onChange={(e) => setEndYear(e.target.value)} value={endYear} />
              </Col>
            </>
          )
        }
      </Row>
      <Row>
        <Col className="text-right">
          <Button
            onClick={() => sendQuery({
              affiliations,
              affiliationsToExclude,
              authors,
              authorsToExclude,
              startYear,
              endYear,
              datasources,
            })}
            size="sm"
          >
            <Icon name="ri-search-fill" />
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
