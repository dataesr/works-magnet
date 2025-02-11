import { Breadcrumb, Button, Col, Container, Link, Row, TextInput } from '@dataesr/dsfr-plus';
import Header from '../../layout/header';

export default function MentionsSearch() {
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
              // message="message"
              messageType=""
              // onChange={(e) => setInput(e.target.value)}
              // onKeyDown={handleKeyDown}
              // placeholder={placeholder}
              // required={isRequired}
              type="text"
              // value={input}
            />
          </Col>
          <Col xs="2">
            <Button
              className="fr-mt-7w"
              icon="search-line"
              // onClick={() => removeAllAffiliations()}
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
