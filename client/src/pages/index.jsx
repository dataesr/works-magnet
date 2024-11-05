import { Col, Container, Row } from '@dataesr/dsfr-plus';

import DatasetsTile from '../components/tiles/datasets';
import OpenalexTile from '../components/tiles/openalex';
import PublicationsTile from '../components/tiles/publications';

export default function Home() {
  return (
    <Container as="section" className="fr-mt-4w">
      <Row gutters className="fr-mb-16w">
        <Col>
          <OpenalexTile />
        </Col>
        <Col>
          <PublicationsTile />
        </Col>
        <Col>
          <DatasetsTile />
        </Col>
      </Row>
    </Container>
  );
}
