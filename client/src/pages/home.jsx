import { Col, Container, Row, Title } from '@dataesr/dsfr-plus';
import { useState } from 'react';
import { FormattedMessage } from 'react-intl';

import DatasetsTile from '../components/tiles/datasets';
import MentionsTile from '../components/tiles/mentions';
import OpenalexTile from '../components/tiles/openalex';
import PublicationsTile from '../components/tiles/publications';
import Header from '../layout/header';

export default function Home() {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => setIsExpanded(!isExpanded);

  return (
    <>
      <Header isExpanded />
      <Container as="section" className="fr-my-4w fr-py-3w" style={{ backgroundColor: '#c7eeea' }}>
        <Row className="fr-mb-3w">
          <Title as="h3">
            <span className="fr-icon-arrow-right-s-fill" aria-hidden="true" />
            <FormattedMessage id="feedback-title" />
          </Title>
          <p className="fr-pl-3w">
            <FormattedMessage id="feedback-description-1" />
            {isExpanded && (
              <p className="fr-mt-1w">
                <FormattedMessage id="feedback-description-2" />
              </p>
            )}
            <button onClick={toggleExpand} type="button">
              {isExpanded ? 'Afficher moins' : 'En savoir plus'}
            </button>
          </p>
        </Row>
        <Row gutters className="fr-pl-3w">
          <Col sm={12} md={6}>
            <OpenalexTile />
          </Col>
          <Col sm={12} md={6}>
            <MentionsTile />
          </Col>
        </Row>
      </Container>
      <Container as="section" className="fr-my-4w fr-py-3w" style={{ backgroundColor: '#faedc4' }}>
        <Row>
          <Title as="h3">
            <span className="fr-icon-arrow-right-s-fill" aria-hidden="true" />
            <FormattedMessage id="corpus-title" />
          </Title>
        </Row>
        <Row gutters className=" fr-pl-3w">
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
