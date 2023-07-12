import { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  CheckboxGroup, Checkbox,
  Row, Col,
  Icon,
  TextInput,
} from '@dataesr/react-dsfr';
import TagInput from '../../components/tag-input';

const sources = ['bso', 'openalex'];

export default function Filters({
  sendQuery,
}) {
  const [viewMoreFilters, setViewMoreFilters] = useState(false);
  const [datasources, setDatasources] = useState(sources);
  const [affiliations, setAffiliations] = useState([]);
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
        <Col className="text-right">
          <Button
            onClick={() => sendQuery({
              affiliations,
              affiliationsToExclude,
              authors,
              authorsToExclude,
              startYear,
              endYear,
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
