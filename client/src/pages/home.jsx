import { Col, Container, Row } from '@dataesr/dsfr-plus';
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
        <Row gutters className="fr-mb-8w">
          <p>
            <h3>
              <FormattedMessage id="feedback-title" />
            </h3>
            <div>
              <FormattedMessage id="feedback-description-1" />
              <br />
              <FormattedMessage id="feedback-description-2" />
            </div>
          </p>
          <Col sm={12} md={6}>
            <OpenalexTile />
          </Col>
          <Col sm={12} md={6}>
            <MentionsTile />
          </Col>
        </Row>
        <Row gutters className="fr-mb-16w">
          <h3>
            <FormattedMessage id="corpus-title" />
          </h3>
        </Row>
        <Row gutters>
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
