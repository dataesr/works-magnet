import { Breadcrumb, Button, Col, Container, Link, Row, Text, TextInput, Title } from '@dataesr/dsfr-plus';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import Header from '../../layout/header';
import { FieldFromKey, FieldSelector } from './components/search-utils';

const DEFAULT_SEARCH = '';

export default function MentionsSearch() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [advancedQuery, setAdvancedQuery] = useState([]);
  const [esQuery, setEsQuery] = useState('');
  const [operator, setOperator] = useState('and');
  const [searchInput, setSearchInput] = useState(DEFAULT_SEARCH);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [terms, setTerms] = useState([{
    key: 'all',
    operator: 'and', // unnecessary for the first term
    order: 0,
    value: '',
  }]);

  const updateQuery = () => {
    let esQueryTmp = '';
    terms.forEach((param, index) => {
      if (index > 0) {
        esQueryTmp = `(${esQueryTmp} ${param.operator.toUpperCase()} `;
      }
      if (param.key === 'all') {
        esQueryTmp += '*';
      } else if (param.key === 'mention') {
        esQueryTmp += 'context';
      } else if (param.key === 'doi') {
        esQueryTmp += 'doi';
      } else if (param.key === 'affiliation') {
        esQueryTmp += 'affiliations.*';
      } else if (param.key === 'author') {
        esQueryTmp += 'authors.*';
      } else if (param.key === 'used') {
        esQueryTmp += 'mention_context.used';
      } else if (param.key === 'created') {
        esQueryTmp += 'mention_context.created';
      } else if (param.key === 'shared') {
        esQueryTmp += 'mention_context.shared';
      } else if (param.key === 'mentionType') {
        esQueryTmp += 'type';
      }
      esQueryTmp += `:${param.value}`;
      if (index > 0) {
        esQueryTmp += ')';
      }
    });
    setEsQuery(esQueryTmp);
  };

  useEffect(() => {
    updateQuery();
  }, [terms]);

  useEffect(() => {
    // URLSearchParams to esQuery if advanced search
    if (searchParams.get('advanced') === '1') {
      const advancedQueryTmp = [];
      const search = searchParams.get('search');
      if (search) {
        const termsArray = search.match(/\(([^)]+)\)/g) || [search];
        termsArray.forEach((term, index) => {
          const [key, value] = term.replace(/[()]/g, '').split(':');
          advancedQueryTmp.push({
            key: key === '*' ? 'all' : key,
            operator: index === 0 ? null : 'and',
            value,
            order: index,
          });
        });
      }
      setTerms(advancedQueryTmp);
      updateQuery();
    } else { // else to searchInput
      setSearchInput(searchParams.get('search') || DEFAULT_SEARCH);
    }
  }, []);

  const setAdvancedSearchTermValues = (term, newValue) => {
    const newTerms = terms.map((t) => {
      if (t.order === term.order) {
        return { ...t, value: newValue };
      }
      return t;
    });
    setTerms(newTerms);
  };

  const setAdvancedSearchTermKeys = (term, index, key, newValue) => {
    const newTerms = terms.map((t) => {
      if (t.order === index) {
        return { ...t, key, value: newValue };
      }
      return t;
    });
    setTerms(newTerms);
  };

  console.log('terms', terms);

  return (
    <div style={{ minHeight: '700px' }}>
      <Header />
      <Container>
        <Breadcrumb className="fr-pt-4w fr-mt-0 fr-mb-2w">
          <Link href="/">
            Home
          </Link>
          <Link current>
            Search software and dataset mentions in the full-text
          </Link>
        </Breadcrumb>
      </Container>
      <Container as="section" className="filters fr-my-5w">
        {!showAdvanced ? (
          <>
            <Row className="fr-mt-5w fr-ml-5w">
              <Col>
                <Title as="h2" look="h6">
                  Simple search
                </Title>
                <Text className="fr-ml-1w">
                  <i>
                    Search for mentions of software and datasets in the full-text of scientific articles.
                  </i>
                </Text>
              </Col>
            </Row>
            <Row className="fr-mx-5w" gutters>
              <Col>
                <TextInput
                  hint='Example "Coq" or "Cern"'
                  messageType=""
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => {
                    if ([9, 13].includes(e.keyCode) && searchInput) {
                      e.preventDefault();
                      navigate(`/mentions/results?search=${searchInput}`);
                    }
                  }}
                  type="text"
                  value={searchInput}
                />
              </Col>
              <Col md={2} className=" fr-mt-4w">
                <Button
                  color="blue-ecume"
                  icon="search-line"
                  onClick={() => navigate(`/mentions/results?search=${esQuery}`)}
                  style={{ width: '100%' }}
                  title="Search"
                >
                  Search
                </Button>
              </Col>
              <Col md={12} className="fr-mb-5w">
                <Button
                  color="beige-gris-galet"
                  className="fr-pl-0"
                  onClick={() => setShowAdvanced(true)}
                  title="Switch to advanced search"
                  variant="text"
                >
                  Switch to advanced search
                </Button>
              </Col>
            </Row>
          </>
        )
          : (
            <>
              <Row className="fr-mt-5w fr-ml-5w">
                <Col>
                  <Title as="h2" look="h6">
                    Advanced search
                  </Title>
                  <Text className="fr-ml-1w">
                    This advanced search replaces the search above.
                    <br />
                    You can add terms to refine an advanced search
                  </Text>
                </Col>
              </Row>
              {
                terms.map((term, index) => (
                  <Row gutters>
                    {
                      term.order > 0 && (
                        <Col md={2}>
                          <select
                            className="fr-select fr-mt-4w fr-ml-5w"
                            onChange={(e) => {
                              setTerms(terms.map((t) => {
                                if (t.order === term.order) {
                                  return { ...t, operator: e.target.value };
                                }
                                return t;
                              }));
                            }}
                            value={term.operator}
                          >
                            <option value="and">AND</option>
                            <option value="or">OR</option>
                          </select>
                        </Col>
                      )
                    }
                    <Col className="fr-ml-5w">
                      <FieldFromKey term={term} setAdvancedSearchTermValues={setAdvancedSearchTermValues} />
                    </Col>
                    <Col className="fr-mt-3w" md={term.order > 0 ? 2 : 13}>
                      <FieldSelector term={term} index={index} setAdvancedSearchTermKeys={setAdvancedSearchTermKeys} />
                    </Col>
                    <Col className="fr-pt-5w">
                      {
                        (term.order === terms.length - 1) ? (
                          <Button
                            color="beige-gris-galet"
                            onClick={() => {
                              setTerms([...terms, {
                                key: 'all',
                                operator: 'and',
                                order: terms.length,
                                value: '',
                              }]);
                            }}
                          >
                            + Add
                          </Button>
                        ) : (
                          <Button
                            color="beige-gris-galet"
                            icon="delete-line"
                            onClick={() => {
                              const newTerms = terms.filter((t) => t.order !== term.order);
                              setTerms(newTerms);
                            }}
                            variant="text"
                          />
                        )
                      }
                    </Col>
                  </Row>
                ))
              }
              {(esQuery.length > 0) && (
                <Row className="fr-ml-1w fr-mr-5w fr-mt-3w" gutters>
                  <Col className="fr-mr-5w es-query">
                    <span className="title">
                      Query
                    </span>
                    <div className="content">
                      {esQuery}
                    </div>
                  </Col>
                </Row>
              )}
              <Row className="fr-mb-5w fr-mt-3w fr-mx-5w">
                <Col md={10}>
                  <Button
                    color="beige-gris-galet"
                    className="fr-pl-0"
                    onClick={() => setShowAdvanced(false)}
                    title="Switch to simple search"
                    variant="text"
                  >
                    Switch to simple search
                  </Button>
                </Col>
                <Col>
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      className="fr-mr-1w"
                      color="beige-gris-galet"
                      icon="delete-line"
                      onClick={() => {
                        setTerms([{
                          key: 'all',
                          operator: 'and',
                          order: 0,
                          value: '',
                        }]);
                      }}
                      title="Clear"
                    >
                      Clear
                    </Button>
                    <Button
                      color="blue-ecume"
                      icon="search-line"
                      onClick={() => navigate(`/mentions/results?search=${esQuery}${showAdvanced ? '&advanced=1' : ''}`)}
                      title="Search"
                    >
                      Search
                    </Button>
                  </div>
                </Col>
              </Row>
            </>
          )}
      </Container>
    </div>
  );
}
