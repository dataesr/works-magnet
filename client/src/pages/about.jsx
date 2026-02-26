import { Container, Row, Title } from '@dataesr/dsfr-plus';
import { FormattedMessage } from 'react-intl';

import Header from '../layout/header';

export default function About() {
  return (
    <>
      <Header isExpanded />
      <Container as="section" className="fr-mt-4w">
        <Row className="fr-mb-3w">
          <Title as="h3">
            <FormattedMessage id="about-title" />
          </Title>
          <p>
            <FormattedMessage id="about-1" />
          </p>
          <p>
            <FormattedMessage id="about-2" />
          </p>
          <p>
            <FormattedMessage id="about-3" />
          </p>
        </Row>
      </Container>
    </>
  );
}
