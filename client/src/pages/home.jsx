import { Col, Container, Row, Title } from '@dataesr/dsfr-plus';
import { FormattedMessage } from 'react-intl';

import DatasetsTile from '../components/tiles/datasets';
import MentionsTile from '../components/tiles/mentions';
import OpenalexTile from '../components/tiles/openalex';
import PublicationsTile from '../components/tiles/publications';
import Header from '../layout/header';

export default function Home() {
  return (
    <>
      <Header isExpanded />
      <Container as="section" className="fr-mt-4w">
        <Row className="fr-mb-3w">
          <Title as="h3">
            <FormattedMessage id="feedback-title" />
          </Title>
          <p>
            <FormattedMessage id="feedback-description-1" />
          </p>
          <p>
            <FormattedMessage id="feedback-description-2" />
          </p>
        </Row>
        <Row gutters className="fr-mb-8w">
          <Col sm={12} md={6}>
            <OpenalexTile />
          </Col>
          <Col sm={12} md={6}>
            <MentionsTile />
          </Col>
        </Row>
        <Row>
          <Title as="h3">
            <FormattedMessage id="corpus-title" />
          </Title>
        </Row>
        <Row gutters className="fr-mb-16w">
          <Col sm={12} md={6}>
            <PublicationsTile />
          </Col>
          <Col sm={12} md={6}>
            <DatasetsTile />
          </Col>
        </Row>
      </Container>
    </>
  );
}
