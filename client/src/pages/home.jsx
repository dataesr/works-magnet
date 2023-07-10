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

// async function getHello() {
//   return fetch('/api/hello').then((response) => {
//     if (response.ok) return response.json();
//     return "Oops... La requète à l'API n'a pas fonctionné";
//   });
// }
const sources = ['bso', 'openAlex', 'hal', 'pubMed'];

export default function Home() {
  // const { data, isLoading } = useQuery({ queryKey: ['hello'], queryFn: getHello });

  const [affiliations, setAffiliations] = useState([]);
  const [affiliationsToExclude, setAffiliationsToExclude] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [startYear, setStartYear] = useState();
  const [endYear, setEndYear] = useState();
  const [dataSources, setDataSources] = useState(sources);

  const [query, setQuery] = useState({});
  const [data, setData] = useState();
  const [viewMoreFilters, setViewMoreFilters] = useState(false);

  useEffect(() => {
    const getData = async () => {
      console.log('query-getData()', query);
      setData('data');
    };
    if (query.query) getData();
  }, [query]);

  const sendQuery = () => {
    setQuery({
      dataSources,
      query: {
        affiliations,
        affiliationsToExclude,
        authors,
        startYear,
        endYear,
      },
    });
  };

  const onCheckBoxChange = (label) => {
    if (!dataSources.includes(label)) {
      setDataSources([...dataSources, label]);
    } else {
      setDataSources(dataSources.filter((item) => item !== label));
    }
  };

  return (
    <Container className="fr-my-5w">
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
      <Row gutters alignItems="bottom">
        <Col n="4">
          <CheckboxGroup isInline>
            {
              sources.map((source) => (
                <Checkbox label={source} checked={dataSources.includes(source)} size="sm" onChange={() => onCheckBoxChange(source)} />
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
      {/* <Text>{isLoading ? 'Chargement...' : data?.hello}</Text> */}
    </Container>
  );
}
