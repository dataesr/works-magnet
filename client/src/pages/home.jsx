import { Col, Container, Row } from '@dataesr/dsfr-plus';

import DatasetsTile from '../components/tiles/datasets';
import MentionsTile from '../components/tiles/mentions';
import OpenalexTile from '../components/tiles/openalex';
import PublicationsTile from '../components/tiles/publications';
import { isInProduction } from '../utils/helpers';

export default function Home() {
  return (
    <Container as="section" className="fr-mt-4w">
      <Row gutters className="fr-mb-16w">
        <Col sm={12} md={4}>
          <OpenalexTile />
        </Col>
        <Col sm={12} md={4}>
          <PublicationsTile />
        </Col>
        <Col sm={12} md={4}>
          <DatasetsTile />
        </Col>
        {!isInProduction() && (
          <Col sm={12} md={4}>
            <MentionsTile />
          </Col>
        )}
      </Row>
    </Container>
  );
}
