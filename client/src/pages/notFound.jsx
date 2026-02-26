import { Container, Row, Title } from '@dataesr/dsfr-plus';

import Header from '../layout/header';

export default function NotFound() {
  return (
    <>
      <Header isExpanded />
      <Container as="section" className="fr-mt-4w">
        <Row className="fr-mb-3w">
          <Title as="h3">
            404 - Page not found
          </Title>
        </Row>
      </Container>
    </>
  );
}
