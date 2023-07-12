import { useState, useEffect } from 'react';
import {
  Container, Row, Col,
  Table,
} from '@dataesr/react-dsfr';
import Filters from './filters';
import getQuery from '../../utils/queries';

const {
  VITE_API_URL,
  VITE_API_AUTH,
} = import.meta.env;

export default function Home() {
  const [options, setOptions] = useState({});
  const [data, setData] = useState([]);
  const columns = [
    { label: 'action', name: 'action' },
    { label: 'doi', name: 'doi' },
    { label: 'Title', name: 'title' },
    { label: 'Authors', name: 'authors' },
    { label: 'year', name: 'year' },
    { label: 'url', name: 'url' },
    { label: 'affiliations', name: 'affiliations' },
  ];
  const getAffiliationsField = (affiliations) => {
    const nbAffiliations = affiliations.length;
    if (nbAffiliations === 0) return '';
    if (nbAffiliations === 1) return affiliations[0].name;
    return `${affiliations[0].name} et al. (${nbAffiliations - 1})`;
  };
  const getAuthorsField = (authors) => {
    const nbAuthors = authors.length;
    if (nbAuthors === 0) return '';
    if (nbAuthors === 1) return authors[0].full_name;
    return `${authors[0].full_name} et al. (${nbAuthors - 1})`;
  };

  useEffect(() => {
    const getData = async () => {
      const params = {
        method: 'POST',
        query: JSON.stringify(getQuery(options)),
        headers: {
          'content-type': 'application/json',
          Authorization: VITE_API_AUTH,
        },
      };
      const response = await fetch(VITE_API_URL, params);
      const jsonResponse = await response.json();
      const dataTable = jsonResponse.hits.hits.map((item, index) => ({
        affiliations: getAffiliationsField(item._source.affiliations),
        authors: getAuthorsField(item._source.authors),
        doi: item._source.doi,
        id: index,
        title: item._source.title,
        url: item._source.url,
        year: item._source.year,
        action: actions.find((action) => action.doi === item._source.doi)?.action,
      }));
      setData(dataTable);
    };
    if (options.filters) getData();
  }, [options]);

  const sendQuery = (filters) => {
    setOptions({
      datasource: 'bso',
      filters: {
        affiliations: filters.affiliations,
        affiliationsToExclude: filters.affiliationsToExclude,
        authors: filters.authors,
        authorsToExclude: filters.authorsToExclude,
        startYear: filters.startYear,
        endYear: filters.endYear,
      },
    });
  };

  // keep || reject
  const actions = [
    { doi: '10.1007/s13595-016-0554-5', action: 'keep' },
  ];

  return (
    <Container className="fr-my-5w" as="section">
      <Filters
        sendQuery={sendQuery}
      />
      {
        data && (
          <Table
            columns={columns}
            data={data}
            rowKey="undefined"
          />
        )
      }
    </Container>
  );
}
