import { Breadcrumb, Button, Col, Container, Link, Row, Text, TextInput, Title, Toggle } from '@dataesr/dsfr-plus';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import Header from '../../layout/header';

const DEFAULT_SEARCH = '';

export default function MentionsSearch() {
  const [searchInput, setSearchInput] = useState(DEFAULT_SEARCH);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const [field, setField] = useState('field');
  const [operator, setOperator] = useState('and');
  const [type, setType] = useState('dataset');
  const [used, setUsed] = useState(false);
  const [created, setCreated] = useState(false);
  const [shared, setShared] = useState(false);
  const [searchInputAuthor, setSearchInputAuthor] = useState('');
  const [searchInputAffiliation, setSearchInputAffiliation] = useState('');
  const [advancedParams, setAdvancedParams] = useState([]);

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialSearch = searchParams.get('search') || DEFAULT_SEARCH;
  useState(() => {
    setSearchInput(initialSearch);
  }, []);

  const addParameter = () => {
    if (field === 'Type of mention') {
      setAdvancedParams([...advancedParams, { field, operator, value: type }]);
      setType('dataset');
      document.getElementById('mentionType').querySelector('select').focus();
    } else if (field === 'Charaterization') {
      setAdvancedParams([...advancedParams, { field, operator, used, created, shared }]);
      setUsed(false);
      setCreated(false);
      setShared(false);
      document.getElementById('mentionCharaterization').querySelector('input').focus();
    } else if (field === 'Author') {
      setAdvancedParams([...advancedParams, { field, operator, value: searchInputAuthor }]);
      setSearchInputAuthor('');
      document.getElementById('mentionAuthor').querySelector('input').focus();
    } else if (field === 'Affiliation') {
      setAdvancedParams([...advancedParams, { field, operator, value: searchInputAffiliation }]);
      setSearchInputAffiliation('');
      document.getElementById('mentionAffiliation').querySelector('input').focus();
    }
  };

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
        <Row className="fr-m-5w" gutters>
          <Col>
            <TextInput
              hint='Example "Coq" or "Cern"'
              label="Search mentions"
              messageType=""
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if ([9, 13].includes(e.keyCode) && searchInput) {
                  e.preventDefault();
                  navigate(`/${pathname.split('/')[1]}/results?search=${searchInput}`);
                }
              }}
              type="text"
              value={searchInput}
            />
          </Col>
          <Col className="text-right fr-mr-5w" md={3}>
            <Button
              className="fr-mt-7w"
              color="beige-gris-galet"
              title="Advanced search"
              variant="secondary"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              {showAdvanced ? 'Hide advanced search' : 'Advanced search'}
            </Button>
          </Col>
        </Row>

        <div
          className="fr-ml-5w"
          style={{
            maxHeight: showAdvanced ? '600px' : '0',
            overflow: 'hidden',
            transition: 'max-height 0.8s ease-in-out',
            borderLeft: '6px solid #6A6156',
          }}
        >
          <Row className="fr-ml-1w fr-mr-5w" gutters>
            <Col>
              <Title as="h2" look="h6">
                Advanced parameters
              </Title>
              Add terms to refine your search
              <Row gutters>
                <Col md={3}>
                  <select
                    className="fr-select"
                    onChange={(e) => setField(e.target.value)}
                    value={field}
                  >
                    <option value="-">All fields</option>
                    <option value="Type of mention">Type of mention</option>
                    <option value="Charaterization">Charaterization</option>
                    <option value="Author">Author</option>
                    <option value="Affiliation">Affiliation</option>
                  </select>
                </Col>
                <Col md={2}>

                  <select
                    className="fr-select"
                    id="operator"
                    onChange={(e) => setOperator(e.target.value)}
                    value={operator}
                  >
                    <option value="and">AND</option>
                    <option value="or">OR</option>
                    <option value="not">NOT</option>
                  </select>
                </Col>
                <Col>
                  {
                    (field !== '-') && (
                      <Button
                        color="beige-gris-galet"
                        onClick={() => { addParameter(); }}
                        title="Add"
                      >
                        Add
                      </Button>
                    )
                  }
                </Col>
              </Row>
              <Row gutters>
                <Col md={6}>
                  {
                    (field === 'Type of mention') && (
                      <div id="mentionType">
                        <select
                          className="fr-select"
                          onChange={(e) => setType(e.target.value)}
                          value={type}
                        >
                          <option value="dataset">Dataset</option>
                          <option value="software">Software</option>
                          <option value="none">Neither</option>
                        </select>
                      </div>
                    )
                  }
                  {
                    (field === 'Charaterization') && (
                      <div id="mentionCharaterization" style={{ display: 'flex', gap: '1rem' }}>
                        <Toggle
                          checked={used}
                          label="Used"
                          onChange={(e) => setUsed(e.target.checked)}
                        />
                        <Toggle
                          checked={shared}
                          label="Shared"
                          onChange={(e) => setShared(e.target.checked)}
                        />
                        <Toggle
                          checked={created}
                          label="Created"
                          onChange={(e) => setCreated(e.target.checked)}
                        />
                      </div>
                    )
                  }
                  {
                    (field === 'Author') && (
                      <div id="mentionAuthor">
                        <TextInput
                          hint='Example "John Doe"'
                          label="Author"
                          messageType=""
                          onChange={(e) => setSearchInputAuthor(e.target.value)}
                          type="text"
                          value={searchInputAuthor}
                        />
                      </div>
                    )
                  }
                  {
                    (field === 'Affiliation') && (
                      <div id="mentionAffiliation">
                        <TextInput
                          hint='Example "Cern"'
                          label="Affiliation"
                          messageType=""
                          onChange={(e) => setSearchInputAffiliation(e.target.value)}
                          type="text"
                          value={searchInputAffiliation}
                        />
                      </div>
                    )
                  }
                </Col>
              </Row>
              {
                advancedParams.length > 0 && (
                  <Row className="fr-mt-2w">
                    <Col>
                      <i>
                        <strong>{advancedParams.length}</strong>
                        {' '}
                        {advancedParams.length === 1 ? 'parameter' : 'parameters'}
                        {' '}
                        added
                      </i>
                      <ul>
                        {
                          advancedParams.map((param, index) => (
                            <li>
                              {param.operator.toUpperCase()}
                              {' '}
                              <strong>
                                {param.field}
                              </strong>
                              {' = '}
                              <i>
                                {`"${param.value}"`}
                              </i>
                              <Button
                                color="pink-tuile"
                                icon="close-line"
                                title="Remove"
                                onClick={() => {
                                  setAdvancedParams(advancedParams.filter((_, i) => i !== index));
                                }}
                                size="sm"
                                variant="text"
                              />

                              {/*
                              TODO: Manage the display of booleans
                              {param.used && 'Used'}
                              {param.created && 'Created'}
                              {param.shared && 'Shared'} */}
                            </li>
                          ))
                        }
                      </ul>
                    </Col>
                  </Row>
                )
              }
            </Col>
          </Row>
        </div>
        <Row className="fr-m-5w" gutters>
          <Col className="text-right fr-mr-5w">
            <Button
              color="blue-ecume"
              disabled={searchInput.length === 0}
              icon="search-line"
              onClick={() => navigate(`/${pathname.split('/')[1]}/results?search=${searchInput}`)}
              title="Search"
            >
              Search
            </Button>
          </Col>
        </Row>

      </Container>
    </div>
  );
}
