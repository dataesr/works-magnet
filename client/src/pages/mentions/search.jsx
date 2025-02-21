import { Breadcrumb, Button, Col, Container, Link, Row, Text, TextInput, Title, Toggle } from '@dataesr/dsfr-plus';
import { useEffect, useState } from 'react';
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
  const [searchInputAllFields, setSearchInputAllFields] = useState('');
  const [searchInputDoi, setSearchInputDoi] = useState('');
  const [searchInputMention, setSearchInputMention] = useState('');
  const [advancedQuery, setAdvancedQuery] = useState([]);
  const [esQuery, setEsQuery] = useState('');

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialSearch = searchParams.get('search') || DEFAULT_SEARCH;

  useState(() => {
    setSearchInput(initialSearch);
  }, []);

  const addToQuery = () => {
    if (field === 'all') {
      setAdvancedQuery([...advancedQuery, { field, operator, value: searchInputAllFields }]);
      setSearchInputAllFields('');
      document.getElementById('mentionAllFields').querySelector('input').focus();
    } else if (field === 'affiliation') {
      setAdvancedQuery([...advancedQuery, { field, operator, value: searchInputAffiliation }]);
      setSearchInputAffiliation('');
      document.getElementById('mentionAffiliation').querySelector('input').focus();
    } else if (field === 'author') {
      setAdvancedQuery([...advancedQuery, { field, operator, value: searchInputAuthor }]);
      setSearchInputAuthor('');
      document.getElementById('mentionAuthor').querySelector('input').focus();
    } else if (field === 'used') {
      setAdvancedQuery([...advancedQuery, { field, operator, value: used }]);
      setUsed(false);
      document.getElementById('used').querySelector('input').focus();
    } else if (field === 'created') {
      setAdvancedQuery([...advancedQuery, { field, operator, value: created }]);
      setCreated(false);
      document.getElementById('created').querySelector('input').focus();
    } else if (field === 'shared') {
      setAdvancedQuery([...advancedQuery, { field, operator, value: shared }]);
      setShared(false);
      document.getElementById('shared').querySelector('input').focus();
    } else if (field === 'mention') {
      setAdvancedQuery([...advancedQuery, { field, operator, value: searchInputMention }]);
      setSearchInputMention('');
      document.getElementById('mention').querySelector('input').focus();
    } else if (field === 'doi') {
      setAdvancedQuery([...advancedQuery, { field, operator, value: searchInputDoi }]);
      setSearchInputDoi('');
      document.getElementById('mentionDoi').querySelector('input').focus();
    } else if (field === 'mentionType') {
      setAdvancedQuery([...advancedQuery, { field, operator, value: type }]);
      setType('dataset');
      document.getElementById('mentionType').querySelector('select').focus();
    }
  };

  useEffect(() => {
    if (showAdvanced) {
      let esQueryTmp = '';
      advancedQuery.forEach((param, index) => {
        if (index > 0) {
          esQueryTmp = `(${esQueryTmp} ${param.operator.toUpperCase()} `;
        }
        if (param.field === 'all') {
          esQueryTmp += '*';
        } else if (param.field === 'mention') {
          esQueryTmp += 'context';
        } else if (param.field === 'doi') {
          esQueryTmp += 'doi';
        } else if (param.field === 'affiliation') {
          esQueryTmp += 'affiliations.*';
        } else if (param.field === 'author') {
          esQueryTmp += 'authors.*';
        } else if (param.field === 'used') {
          esQueryTmp += 'mention_context.used';
        } else if (param.field === 'created') {
          esQueryTmp += 'mention_context.created';
        } else if (param.field === 'shared') {
          esQueryTmp += 'mention_context.shared';
        } else if (param.field === 'mentionType') {
          esQueryTmp += 'type';
        }
        esQueryTmp += `:${param.value}`;
        if (index > 0) {
          esQueryTmp += ')';
        }
      });
      setEsQuery(esQueryTmp);
    } else {
      setEsQuery(searchInput);
    }
  }, [advancedQuery, searchInput, showAdvanced]);

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
          {!showAdvanced && (
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
          )}
          <Col className="text-right fr-mr-5w" md={3}>
            <Button
              className="fr-mt-7w"
              color="beige-gris-galet"
              title="Advanced search"
              variant="secondary"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              {showAdvanced ? 'Switch to simple search' : 'Switch to Advanced search'}
            </Button>
          </Col>
        </Row>

        <div
          className="fr-ml-5w"
          style={{
            maxHeight: showAdvanced ? '600px' : '0',
            overflow: 'hidden',
            transition: 'max-height 0.5s ease-in-out',
          }}
        >
          <Row className="fr-ml-1w fr-mr-5w" gutters>
            <Col>
              <Title as="h2" look="h6">
                Advanced search
              </Title>
              This advanced search replaces the search above.
              <br />
              You can add terms to refine an advanced search
              <Row gutters>
                <Col md={3}>
                  <select
                    className="fr-select fr-mt-1w"
                    onChange={(e) => setField(e.target.value)}
                    value={field}
                  >
                    <option value="all">All fields</option>
                    <option value="affiliation">Affiliation</option>
                    <option value="author">Author</option>
                    <option value="used">Charaterization - Used</option>
                    <option value="created">Charaterization - Created</option>
                    <option value="shared">Charaterization - Shared</option>
                    <option value="mention">Mention</option>
                    <option value="doi">DOI</option>
                    <option value="mentionType">Type of mention</option>
                  </select>
                </Col>
                <Col md={5}>
                  {
                    (field === 'all') && (
                      <div id="mentionAllFields">
                        <TextInput
                          message=""
                          onChange={(e) => setSearchInputAllFields(e.target.value)}
                          placeholder="Coq or Cern"
                          type="text"
                          value={searchInputAllFields}
                        />
                      </div>
                    )
                  }
                  {
                    (field === 'mentionType') && (
                      <div id="mentionType">
                        <select
                          className="fr-select fr-mt-1w"
                          onChange={(e) => setType(e.target.value)}
                          value={type}
                        >
                          <option value="dataset">Dataset</option>
                          <option value="software">Software</option>
                        </select>
                      </div>
                    )
                  }
                  {
                    (field === 'mention') && (
                      <div id="mention">
                        <TextInput
                          message=""
                          onChange={(e) => setSearchInputMention(e.target.value)}
                          placeholder="Coq"
                          type="text"
                          value={searchInputMention}
                        />
                      </div>
                    )
                  }
                  {
                    (field === 'doi') && (
                      <div id="mentionDoi">
                        <TextInput
                          message=""
                          onChange={(e) => setSearchInputDoi(e.target.value)}
                          placeholder="10.1109/5.771073"
                          type="text"
                          value={searchInputDoi}
                        />
                      </div>
                    )
                  }
                  {
                    (field === 'used') && (
                      <div id="used" style={{ display: 'flex', gap: '1rem' }}>
                        <Toggle
                          checked={used}
                          label="Used"
                          onChange={(e) => setUsed(e.target.checked)}
                        />
                      </div>
                    )
                  }
                  {
                    (field === 'shared') && (
                      <div id="shared" style={{ display: 'flex', gap: '1rem' }}>
                        <Toggle
                          checked={shared}
                          label="Shared"
                          onChange={(e) => setShared(e.target.checked)}
                        />
                      </div>
                    )
                  }
                  {
                    (field === 'created') && (
                      <div id="created" style={{ display: 'flex', gap: '1rem' }}>
                        <Toggle
                          checked={created}
                          label="Created"
                          onChange={(e) => setCreated(e.target.checked)}
                        />
                      </div>
                    )
                  }
                  {
                    (field === 'author') && (
                      <div id="mentionAuthor">
                        <TextInput
                          message=""
                          onChange={(e) => setSearchInputAuthor(e.target.value)}
                          placeholder="John Doe"
                          type="text"
                          value={searchInputAuthor}
                        />
                      </div>
                    )
                  }
                  {
                    (field === 'affiliation') && (
                      <div id="mentionAffiliation">
                        <TextInput
                          message=""
                          onChange={(e) => setSearchInputAffiliation(e.target.value)}
                          placeholder="Cern"
                          type="text"
                          value={searchInputAffiliation}
                        />
                      </div>
                    )
                  }
                </Col>
                {(advancedQuery.length > 0) && (
                  <Col md={2}>
                    <select
                      className="fr-select fr-mt-1w"
                      id="operator"
                      onChange={(e) => setOperator(e.target.value)}
                      value={operator}
                    >
                      <option value="and">AND</option>
                      <option value="or">OR</option>
                    </select>
                  </Col>
                )}
                <Col className="text-right fr-mr-5w" md={2} style={{ width: '100%' }}>
                  {
                    (field !== '') && (
                      <Button
                        className="fr-mt-1w"
                        color="beige-gris-galet"
                        onClick={() => addToQuery()}
                        style={{ width: '100%' }}
                        title="Add"
                      >
                        + Add
                      </Button>
                    )
                  }
                </Col>
              </Row>
            </Col>
          </Row>
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
        </div>
        <Row className="fr-m-5w" gutters>
          <Col offsetMd={10} className="text-right fr-mr-5w">
            <Button
              color="blue-ecume"
              disabled={esQuery.length === 0}
              icon="search-line"
              onClick={() => navigate(`/${pathname.split('/')[1]}/results?search=${esQuery}`)}
              style={{ width: '100%' }}
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
