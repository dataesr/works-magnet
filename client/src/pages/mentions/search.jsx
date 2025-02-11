import { Breadcrumb, Button, Col, Container, Link, Row, TextInput } from '@dataesr/dsfr-plus';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import Header from '../../layout/header';

const DEFAULT_SEARCH = '';

export default function MentionsSearch() {
  const [search, setSearch] = useState(DEFAULT_SEARCH);
  const { pathname } = useLocation();
  const navigate = useNavigate();

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
        <Row className="fr-m-5w">
          <Col>
            <TextInput
              hint='Example "Coq" or "Cern"'
              label="Search mentions"
              messageType=""
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if ([9, 13].includes(e.keyCode) && search) {
                  e.preventDefault();
                  navigate(`/${pathname.split('/')[1]}/results?search=${search}`);
                }
              }}
              type="text"
              value={search}
            />
          </Col>
          <Col xs="2">
            <Button
              className="fr-mt-7w"
              disabled={search.length === 0}
              icon="search-line"
              onClick={() => navigate(`/${pathname.split('/')[1]}/results?search=${search}`)}
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
