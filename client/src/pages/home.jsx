import { useState, useEffect } from 'react';
import {
  Button,
  CheckboxGroup, Checkbox,
  Container, Row, Col,
  Icon,
  // Text,
  TextInput,
} from '@dataesr/react-dsfr';
// import { useQuery } from '@tanstack/react-query';
import TagInput from '../components/tag-input';
import getQuery from '../utils/queries';

const {
  VITE_API_URL,
  VITE_API_AUTH,
} = import.meta.env;

// async function getHello() {
//   return fetch('/api/hello').then((response) => {
//     if (response.ok) return response.json();
//     return "Oops... La requète à l'API n'a pas fonctionné";
//   });
// }
const sources = ['bso', 'openalex'];

export default function Home() {
  // const { data, isLoading } = useQuery({ queryKey: ['hello'], queryFn: getHello });

  const [datasources, setDatasources] = useState(sources);
  const [affiliations, setAffiliations] = useState([]);
  const [affiliationsToExclude, setAffiliationsToExclude] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [authorsToExclude, setAuthorsToExclude] = useState([]);
  const [startYear, setStartYear] = useState();
  const [endYear, setEndYear] = useState();
  const [options, setOptions] = useState({});
  const [data, setData] = useState([]);
  const [viewMoreFilters, setViewMoreFilters] = useState(false);

  useEffect(() => {
    const getData = async () => {
      const params = {
        method: 'POST',
        body: JSON.stringify(getQuery(options)),
        headers: {
          'content-type': 'application/json',
          Authorization: VITE_API_AUTH,
        },
      };
      const response = await fetch(VITE_API_URL, params);
      const jsonResponse = await response.json();
      setData(jsonResponse.hits.hits);
    };
    if (options.filters) getData();
  }, [options]);

  const sendQuery = () => {
    setOptions({
      datasource: 'bso',
      filters: {
        affiliations,
        affiliationsToExclude,
        authors,
        authorsToExclude,
        startYear,
        endYear,
      },
    });
  };

  const onCheckBoxChange = (label) => {
    if (!datasources.includes(label)) {
      setDatasources([...datasources, label]);
    } else {
      setDatasources(datasources.filter((item) => item !== label));
    }
  };

  return (
    <Container className="fr-my-5w" as="section">
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
            onClick={() => sendQuery()}
            size="sm"
          >
            <Icon name="ri-search-fill" />
            Search
          </Button>
        </Col>
      </Row>
      {
        data && (
          <table>
            <thead>
              <tr>
                <th>DOI</th>
                <th>Title</th>
                <th>Authors</th>
                <th>Year</th>
                <th>URL</th>
                <th>Affiliations</th>
              </tr>
            </thead>
            <tbody>
              {
                data.map((item) => (
                  <tr key={item._id}>
                    <td>{item._source.doi}</td>
                    <td>{item._source.title}</td>
                    <td>{item._source.authors.map((author) => author.full_name).join(', ')}</td>
                    <td>{item._source.year}</td>
                    <td>{item._source.url}</td>
                    <td>{item._source.affiliations.map((affiliation) => affiliation.name)}</td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        )
      }
    </Container>
  );
}
